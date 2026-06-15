import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import Notification from "@/models/Notification";
import { z } from "zod";
import { Types } from "mongoose";

const updateSchema = z.object({
  status: z.enum(["pending", "paid", "overdue", "submitted"]).optional(),
  amount: z.number().positive().optional(),
  paymentMonth: z.string().optional(),
  referenceNumber: z.string().optional(),
  nextPaymentDate: z.string().datetime().optional(),
  note: z.string().optional(),
  // Admin approval actions
  action: z.enum(["approve", "reject"]).optional(),
});

export async function PATCH(req: Request, ctx: RouteContext<'/api/payments/[id]'>) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin")
    return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  if (!Types.ObjectId.isValid(id)) return Response.json({ error: "Invalid ID" }, { status: 400 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  await connectDB();
  const { action, ...fields } = parsed.data;

  const existing = await Payment.findById(id).lean();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  let update: Record<string, unknown> = { ...fields };

  if (action === "approve") {
    update = { ...update, status: "paid", datePaid: existing.datePaid ?? new Date() };
    await Notification.create({
      userId: existing.userId,
      message: `Your payment of ETB ${existing.amount.toLocaleString()} for ${existing.paymentMonth} has been approved.`,
      type: "payment_received",
    });
  } else if (action === "reject") {
    update = { ...update, status: "pending" };
    await Notification.create({
      userId: existing.userId,
      message: `Your payment submission for ${existing.paymentMonth} was rejected. Please resubmit or contact admin.`,
      type: "general",
    });
  }

  const payment = await Payment.findByIdAndUpdate(id, update, { new: true }).lean();
  return Response.json(payment);
}

export async function DELETE(_req: Request, ctx: RouteContext<'/api/payments/[id]'>) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin")
    return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  if (!Types.ObjectId.isValid(id)) return Response.json({ error: "Invalid ID" }, { status: 400 });

  await connectDB();
  await Payment.findByIdAndDelete(id);
  return Response.json({ ok: true });
}
