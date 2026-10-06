# External Reminder Scheduler Setup

Because Vercel Hobby does not support hourly CRON schedules, the writer productivity reminder system relies on an external HTTP scheduler.

## Endpoint Details
**URL:** `https://elitechub.com/api/cron/writer-reminders`
**Method:** `GET`
**Header:** `Authorization: Bearer <YOUR_CRON_SECRET>`

*(You can retrieve the `CRON_SECRET` from your Vercel Project Environment Variables)*

## Scheduler Configuration
You can use any external HTTP scheduler (e.g., cron-job.org, EasyCron, Make, Zapier, GitHub Actions, AWS EventBridge).

**Recommended Interval:** `Every 10 minutes`

## Architecture Notes
- The endpoint is **idempotent** and strictly protected against race conditions using a Database Compare-and-Swap (CAS) mechanism.
- The external scheduler is **only** responsible for triggering the endpoint. It does not need to know individual writer schedules, preferred days, or timezones. The Elitech Hub API handles all timezone evaluation, duplicate protection, and batch processing securely on its own backend. 
- If an email delivery fails via the Resend API, the system automatically reverts the database lock, allowing the next 10-minute scheduler tick to cleanly retry.
