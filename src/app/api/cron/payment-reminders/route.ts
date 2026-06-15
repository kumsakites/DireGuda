import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { sendEmail } from "@/lib/mailer";

const CRON_SECRET = process.env.CRON_SECRET ?? "dev-cron-secret";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth(); // 0-indexed
  const year = now.getFullYear();

  // Build current payment month string e.g. "2026-06"
  const padded = (n: number) => String(n).padStart(2, "0");
  // Reminder window: 24th of prev month → 5th of current month
  // On 24-31: remind about the upcoming month's payment
  // On 1-5: remind about the current month's payment
  // On 6+: notify admin of overdue users
  let reminderMonth: string;
  if (day >= 24) {
    // upcoming month
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    reminderMonth = `${nextYear}-${padded(nextMonth + 1)}`;
  } else {
    reminderMonth = `${year}-${padded(month + 1)}`;
  }

  let notified = 0;

  if (day >= 24 || day <= 5) {
    // Reminder phase: notify users who haven't paid for reminderMonth
    const users = await User.find({ role: "user" }).lean();

    for (const user of users) {
      // Check if user already has a paid/submitted payment for reminderMonth
      const paid = await Payment.findOne({
        userId: user._id,
        paymentMonth: reminderMonth,
        status: { $in: ["paid", "submitted"] },
      }).lean();
      if (paid) continue;

      const lang = (user.languagePreference as "en" | "om") ?? "en";
      const message =
        lang === "om"
          ? `Beeksisa: Kaffaltiin ji'a ${reminderMonth} dhiyaachaa jira. Maaloo kaffaluu hindagatiin.`
          : `Reminder: Your payment for ${reminderMonth} is due soon. Please make your payment before the 5th.`;

      // Avoid duplicate notifications — check last 24h
      const recent = await Notification.findOne({
        userId: user._id,
        type: "payment_due",
        message: { $regex: reminderMonth },
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }).lean();
      if (recent) continue;

      await Notification.create({ userId: user._id, message, type: "payment_due" });
      if (user.email) {
        await sendEmail(
          user.email,
          lang === "om" ? "Beeksisa Kaffaltii" : "Payment Reminder",
          `<p>${message}</p>`
        );
      }
      notified++;
    }
  }

  // Overdue phase: after the 6th, notify admin + user about missing payments
  let overdueNotified = 0;
  if (day >= 6) {
    const currentMonth = `${year}-${padded(month + 1)}`;
    const users = await User.find({ role: "user" }).lean();

    for (const user of users) {
      const paid = await Payment.findOne({
        userId: user._id,
        paymentMonth: currentMonth,
        status: { $in: ["paid", "submitted"] },
      }).lean();
      if (paid) continue;

      // Mark overdue or create an overdue record
      await Payment.updateOne(
        { userId: user._id, paymentMonth: currentMonth, status: { $in: ["pending"] } },
        { status: "overdue" }
      );

      const lang = (user.languagePreference as "en" | "om") ?? "en";

      // Notify user — once per day
      const userNotified = await Notification.findOne({
        userId: user._id,
        type: "payment_due",
        message: { $regex: `overdue.*${currentMonth}` },
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }).lean();
      if (!userNotified) {
        const userMsg =
          lang === "om"
            ? `Kaffaltiin kee ji'a ${currentMonth} yeroo darbeera. Maaloo yeroon kaffaluu yaali.`
            : `Your payment for ${currentMonth} is overdue. Please pay as soon as possible.`;
        await Notification.create({ userId: user._id, message: userMsg, type: "payment_due" });
        if (user.email)
          await sendEmail(user.email, "Payment Overdue", `<p>${userMsg}</p>`);
      }

      // Notify admins
      const admins = await User.find({ role: "admin" }).lean();
      for (const admin of admins) {
        const adminNotified = await Notification.findOne({
          userId: admin._id,
          message: { $regex: `${user.username}.*overdue.*${currentMonth}` },
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        }).lean();
        if (!adminNotified) {
          await Notification.create({
            userId: admin._id,
            message: `User ${user.username} has not paid for ${currentMonth} (overdue).`,
            type: "general",
          });
        }
      }
      overdueNotified++;
    }
  }

  // Deactivate users who have made zero paid payments and registered >= 12 months ago
  let deactivated = 0;
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const oldUsers = await User.find({
    role: "user",
    isActive: true,
    createdAt: { $lte: oneYearAgo },
  }).lean();

  for (const user of oldUsers) {
    const hasPaid = await Payment.exists({ userId: user._id, status: "paid" });
    if (hasPaid) continue;

    await User.findByIdAndUpdate(user._id, { isActive: false });

    const lang = (user.languagePreference as "en" | "om") ?? "en";
    const msg =
      lang === "om"
        ? "Herregni kee yeroo waggaa tokko keessatti kaffaltii tokkollee hin raawwatiin waan jiruuf dhaabbatamee jira."
        : "Your account has been deactivated because no payment was made within one year of registration. Please contact admin.";

    await Notification.create({ userId: user._id, message: msg, type: "general" });

    const admins = await User.find({ role: "admin" }).lean();
    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        message: `User ${user.username} has been deactivated — no payment made within 12 months of registration.`,
        type: "general",
      });
    }

    if (user.email) await sendEmail(user.email, "Account Deactivated", `<p>${msg}</p>`);
    deactivated++;
  }

  return Response.json({ ok: true, remindersNotified: notified, overdueNotified, deactivated });
}
