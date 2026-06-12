import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { sendEmail } from "@/lib/mailer";

const CRON_SECRET = process.env.CRON_SECRET ?? "dev-cron-secret";

// Messages per language
const MSG = {
  en: (days: number) => `Your payment is due in ${days} day(s). Please make your payment to avoid overdue status.`,
  om: (days: number) => `Kaffaltiin kee guyyoota ${days} keessatti dhufa. Haala overdue ittisuuf kaffaltii kee raawwadhu.`,
};

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const now = new Date();
  const fiveDaysFromNow = new Date(now);
  fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

  // Find pending payments with nextPaymentDate exactly 5 days away (within the day)
  const startOfDay = new Date(fiveDaysFromNow);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(fiveDaysFromNow);
  endOfDay.setHours(23, 59, 59, 999);

  const dueSoon = await Payment.find({
    status: "pending",
    nextPaymentDate: { $gte: startOfDay, $lte: endOfDay },
  }).lean();

  // Also mark overdue payments
  await Payment.updateMany(
    { status: "pending", nextPaymentDate: { $lt: now } },
    { status: "overdue" }
  );

  let notified = 0;
  for (const payment of dueSoon) {
    const user = await User.findById(payment.userId).lean();
    if (!user) continue;

    const lang = user.languagePreference as "en" | "om";
    const daysLeft = 5;
    const message = MSG[lang](daysLeft);

    // Save in-app notification
    await Notification.create({
      userId: user._id,
      message,
      type: "payment_due",
    });

    // Send email if available
    if (user.email) {
      await sendEmail(
        user.email,
        lang === "om" ? "Beeksisa Kaffaltii" : "Payment Due Reminder",
        `<p>${message}</p>`
      );
    }
    notified++;
  }

  return Response.json({ ok: true, notified, overdueUpdated: true });
}
