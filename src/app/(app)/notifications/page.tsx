import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { getTranslations } from "next-intl/server";
import NotificationsClient from "./notifications-client";
import PageHeader from "@/components/page-header";

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
    <div className="space-y-4">
      <PageHeader title={t("title")} description="Stay updated with your latest activity" />
      <NotificationsClient initialNotifications={JSON.parse(JSON.stringify(notifications))} />
    </div>
  );
}
