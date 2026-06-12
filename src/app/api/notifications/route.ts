import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const url = new URL(req.url);
  const unreadOnly = url.searchParams.get("unread") === "true";

  const filter: Record<string, unknown> = { userId: session.user.id };
  if (unreadOnly) filter.isRead = false;

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  return Response.json(notifications);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await connectDB();

  if (body.markAll) {
    await Notification.updateMany({ userId: session.user.id }, { isRead: true });
  } else if (body.id) {
    await Notification.findOneAndUpdate({ _id: body.id, userId: session.user.id }, { isRead: true });
  }
  return Response.json({ ok: true });
}
