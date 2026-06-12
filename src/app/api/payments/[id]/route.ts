import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import { z } from "zod";
import { Types } from "mongoose";

const updateSchema = z.object({
  status: z.enum(["pending", "paid", "overdue"]).optional(),
  amount: z.number().positive().optional(),
  paymentMonth: z.string().optional(),
  referenceNumber: z.string().optional(),
  nextPaymentDate: z.string().datetime().optional(),
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
  const payment = await Payment.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
  if (!payment) return Response.json({ error: "Not found" }, { status: 404 });
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
