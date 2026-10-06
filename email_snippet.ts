export async function sendWriterReminder({
  to,
  name,
  target,
  completed
}: {
  to: string;
  name: string;
  target: number;
  completed: number;
}) {
  try {
    const isCompleted = completed >= target;
    const isBehind = completed < target;
    
    let message = '';
    if (isCompleted) {
      message = `Your weekly writing goal is already complete (${completed}/${target} days). You can continue writing if you'd like, but you're doing great!`;
    } else if (completed > 0) {
      message = `You've completed ${completed} of your ${target} required writing days this week. Keep up the good work!`;
    } else {
      message = `Today is one of your scheduled writing days. You have ${target} writing days targeted for this week.`;
    }

    await resend.emails.send({
      from: FROM,
      to: [to],
      subject: 'Writer Productivity Reminder - Elitech Hub',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#c3151c;">Writing Reminder \u270D\uFE0F</h2>
          <p>Hi ${name},</p>
          <p>${message}</p>
          <p>Click below to jump back into your Writer Panel and continue working on your articles.</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.elitechub.com'}/writer" style="display:inline-block;padding:10px 20px;background-color:#c3151c;color:#ffffff;text-decoration:none;border-radius:5px;margin-top:15px;font-weight:bold;">Go to Writer Panel</a>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send writer reminder:', error);
    return { success: false, error };
  }
}
