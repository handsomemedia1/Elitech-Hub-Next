import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { sendWriterReminder } from '@/lib/email';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  // 1. Vercel Cron Security Authentication
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: 'DB Error' }, { status: 500 });

  const { data: writers, error: writersErr } = await supabase
    .from('writers')
    .select(`
      id, email, name, status, active,
      writer_productivity_settings (
        weekly_target, preferred_days, reminder_time, timezone, last_reminder_sent_at
      )
    `)
    .eq('active', true)
    .eq('status', 'approved');

  if (writersErr || !writers) {
    return NextResponse.json({ error: 'Failed to fetch writers' }, { status: 500 });
  }

  let processed = 0;
  let sent = 0;
  let skipped = 0;
  let errors: string[] = [];

  // Concurrency control: Process in batches of 5 to scale safely within Vercel's limits
  const BATCH_SIZE = 5;
  for (let i = 0; i < writers.length; i += BATCH_SIZE) {
    const batch = writers.slice(i, i + BATCH_SIZE);
    
    await Promise.all(batch.map(async (w) => {
      processed++;
      const settings = w.writer_productivity_settings;
      
      // Writer Eligibility
      if (!settings || !Array.isArray(settings.preferred_days) || settings.preferred_days.length === 0 || !settings.reminder_time) {
        skipped++;
        return;
      }
      
      const tz = settings.timezone || 'UTC';
      const now = new Date();

      // 2. Bulletproof Timezone Extraction using Intl.DateTimeFormat
      let localDateStr, localTimeStr, localWeekday;
      try {
        localDateStr = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now); // MM/DD/YYYY
        localTimeStr = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(now); // HH:MM
        localWeekday = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long' }).format(now); // e.g. "Monday"
      } catch (e) {
        // Fallback to UTC if timezone is fundamentally invalid
        localDateStr = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
        localTimeStr = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
        localWeekday = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long' }).format(now);
      }

      // Check Preferred Day
      if (!settings.preferred_days.includes(localWeekday)) {
        skipped++;
        return;
      }

      // Time Comparison: 24-hour lexicographical comparison
      const formattedLocalTimeStr = localTimeStr === '24:00' ? '00:00:00' : `${localTimeStr}:00`; 
      if (formattedLocalTimeStr < settings.reminder_time) {
        skipped++;
        return; 
      }

      // 3. Crash-proof Claim Verification & Stale Claim Recovery
      const oldSentAt = settings.last_reminder_sent_at;
      if (oldSentAt) {
        const oldDate = new Date(oldSentAt);
        // Schema-safe claim marker: we shift the year by +100 to encode "this is an active claim"
        if (oldDate.getFullYear() > 2100) {
          const claimMadeAt = new Date(oldDate);
          claimMadeAt.setFullYear(claimMadeAt.getFullYear() - 100);
          const ageMs = now.getTime() - claimMadeAt.getTime();
          
          if (ageMs < 30 * 60 * 1000) { 
            // Claim is active (< 30 mins old). Another process is handling this.
            skipped++;
            return;
          }
          // If age >= 30 mins, it's a STALE claim (crash window occurred).
          // We safely drop through to reclaim it.
        } else {
          // It's a historically completed send. Compare dates in the writer's timezone.
          const lastSentDateStr = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(oldDate);
          if (lastSentDateStr === localDateStr) {
            skipped++;
            return; // Already sent successfully today
          }
        }
      }

      // 4. Atomic Claim (Compare-and-Swap)
      const claimDate = new Date(now);
      claimDate.setFullYear(claimDate.getFullYear() + 100);
      const claimToken = claimDate.toISOString();

      let query = supabase.from('writer_productivity_settings').update({ last_reminder_sent_at: claimToken }).eq('writer_id', w.id);
      if (oldSentAt) {
        query = query.eq('last_reminder_sent_at', oldSentAt);
      } else {
        query = query.is('last_reminder_sent_at', null);
      }

      const { data: updateData, error: updateErr } = await query.select('writer_id');
      if (updateErr || !updateData || updateData.length === 0) {
        // Lost the race condition. Another scheduler process successfully CAS'd.
        skipped++;
        return;
      }

      // 5. Process Email
      try {
        // Calculate start of week (Monday) for activity tracking safely
        let shiftedNow;
        try { shiftedNow = new Date(now.toLocaleString("en-US", { timeZone: tz })); } catch(e) { shiftedNow = new Date(now); }
        const day = shiftedNow.getDay();
        const diff = shiftedNow.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(shiftedNow.setDate(diff));
        startOfWeek.setHours(0,0,0,0);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const startOfWeekStr = `${startOfWeek.getFullYear()}-${pad(startOfWeek.getMonth()+1)}-${pad(startOfWeek.getDate())}`;

        const { count: completed } = await supabase
          .from('writer_activity_log')
          .select('*', { count: 'exact', head: true })
          .eq('writer_id', w.id)
          .gte('activity_date', startOfWeekStr);

        const emailRes = await sendWriterReminder({
          to: w.email,
          name: w.name,
          target: settings.weekly_target,
          completed: completed || 0
        });

        if (emailRes && emailRes.success === false) {
           throw new Error(emailRes.error?.message || 'Email API failure');
        }

        // 6. Commit Successful Send
        await supabase
          .from('writer_productivity_settings')
          .update({ last_reminder_sent_at: now.toISOString() })
          .eq('writer_id', w.id)
          .eq('last_reminder_sent_at', claimToken);
          
        sent++;
      } catch (err: any) {
        errors.push(`Failed to send to ${w.email}: ${err.message}`);
        
        // 7. Rollback Claim
        // Allows the next 10-minute scheduler tick to cleanly retry
        await supabase
          .from('writer_productivity_settings')
          .update({ last_reminder_sent_at: oldSentAt })
          .eq('writer_id', w.id)
          .eq('last_reminder_sent_at', claimToken);
      }
    }));
  }

  return NextResponse.json({ success: true, processed, sent, skipped, errors });
}
