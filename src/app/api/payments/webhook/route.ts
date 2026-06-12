import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { z } from "zod";
import crypto from "crypto";

// Zod schema for PSP webhook payload
const webhookSchema = z.object({
  referenceNumber: z.string(),
  amount: z.number(),
  status: z.literal("success"),
  userId: z.string().optional(),
  paymentMonth: z.string().optional(),
  timestamp: z.string().optional(),
});

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-webhook-signature") ?? "";

  if (!verifySignature(rawBody, signature)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: unknown;
  try { body = JSON.parse(rawBody); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = webhookSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  await connectDB();
  const { referenceNumber, amount, userId, paymentMonth } = parsed.data;

  // Find and update matching pending payment
  const payment = await Payment.findOneAndUpdate(
    { referenceNumber, status: "pending" },
    { status: "paid", datePaid: new Date() },
    { new: true }
  );

  // If no match by reference, find by userId+month
  const finalPayment = payment ?? (userId && paymentMonth
    ? await Payment.findOneAndUpdate(
        { userId, paymentMonth, status: "pending" },
        { status: "paid", datePaid: new Date(), referenceNumber, amount },
        { new: true }
      )
    : null);

  if (!finalPayment) {
    return Response.json({ message: "No matching payment found" }, { status: 404 });
  }

  // Notify admin
  const admin = await User.findOne({ role: "admin" }).lean();
  if (admin) {
    await Notification.create({
      userId: admin._id,
      message: `Payment of ${amount} received. Ref: ${referenceNumber}`,
      type: "payment_received",
    });
  }

  // Notify the paying user
  await Notification.create({
    userId: finalPayment.userId,
    message: `Your payment of ${amount} has been received. Ref: ${referenceNumber}`,
    type: "payment_received",
  });

  return Response.json({ ok: true });
}
