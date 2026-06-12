import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import { z } from "zod";

const createSchema = z.object({
  userId: z.string(),
  amount: z.number().positive(),
  paymentMonth: z.string().regex(/^\d{4}-\d{2}$/),
  status: z.enum(["pending", "paid", "overdue"]).optional(),
  referenceNumber: z.string().optional(),
  nextPaymentDate: z.string().datetime().optional(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const url = new URL(req.url);
  const month = url.searchParams.get("month");
  const userId = session.user.role === "admin"
    ? url.searchParams.get("userId") || undefined
    : session.user.id;

  const filter: Record<string, unknown> = {};
  if (userId) filter.userId = userId;
  if (month) filter.paymentMonth = month;

  const payments = await Payment.find(filter)
    .populate("userId", "username email")
    .sort({ createdAt: -1 })
    .lean();
  return Response.json(payments);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin")
    return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  await connectDB();
  const payment = await Payment.create(parsed.data);
  return Response.json(payment, { status: 201 });
}
