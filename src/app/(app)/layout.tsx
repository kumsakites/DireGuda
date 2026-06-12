import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import Nav from "@/components/nav";

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
    <div className="flex min-h-screen">
      <Nav role={session.user.role} unreadCount={unreadCount} />
      <main className="flex-1 flex flex-col overflow-auto">
        {children}
      </main>
    </div>
  );
}
