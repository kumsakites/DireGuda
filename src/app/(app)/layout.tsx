import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import AppShell from "@/components/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.mustChangePassword) redirect("/change-password");

  let unreadCount = 0;
  try {
    await connectDB();
    unreadCount = await Notification.countDocuments({ userId: session.user.id, isRead: false });
  } catch { /* DB unavailable */ }

  return (
    <AppShell role={session.user.role} unreadCount={unreadCount}>
      {children}
    </AppShell>
  );
}
