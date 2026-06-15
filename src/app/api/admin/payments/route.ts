import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return null;
  return session;
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const userId = url.searchParams.get("userId");
  const month = url.searchParams.get("month");

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (userId) filter.userId = userId;
  if (month) filter.paymentMonth = month;

  const payments = await Payment.find(filter)
    .populate("userId", "username email")
    .sort({ createdAt: -1 })
    .lean();

  return Response.json(payments);
}
