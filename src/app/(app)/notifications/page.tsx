import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { getTranslations } from "next-intl/server";
import NotificationsClient from "./notifications-client";

export default async function NotificationsPage() {
  const session = await auth();
  let notifications: unknown[] = [];
  try {
    await connectDB();
    notifications = await Notification.find({ userId: session!.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  } catch { /* DB unavailable */ }

  const t = await getTranslations("notifications");

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <NotificationsClient initialNotifications={JSON.parse(JSON.stringify(notifications))} />
    </div>
  );
}
