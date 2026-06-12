export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const cron = await import("node-cron");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const secret = process.env.CRON_SECRET ?? "dev-cron-secret";

    // Run daily at 08:00
    cron.default.schedule("0 8 * * *", async () => {
      try {
        const res = await fetch(`${appUrl}/api/cron/payment-reminders`, {
          headers: { authorization: `Bearer ${secret}` },
        });
        const data = await res.json();
        console.log("[CRON] payment-reminders:", data);
      } catch (err) {
        console.error("[CRON] Failed:", err);
      }
    });

    console.log("[CRON] payment-reminders scheduled (daily 08:00)");
  }
}
