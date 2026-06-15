import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const amount = Number(formData.get("amount"));
  const note = (formData.get("note") as string) ?? "";
  const paymentMonth = (formData.get("paymentMonth") as string) ?? "";
  const file = formData.get("screenshot") as File | null;

  if (!amount || amount <= 0) return Response.json({ error: "Invalid amount" }, { status: 400 });
  if (!paymentMonth || !/^\d{4}-\d{2}$/.test(paymentMonth))
    return Response.json({ error: "Invalid paymentMonth (YYYY-MM)" }, { status: 400 });

  let screenshotUrl: string | undefined;
  if (file && file.size > 0) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const allowed = ["jpg", "jpeg", "png", "gif", "webp", "pdf"];
    if (!allowed.includes(ext)) return Response.json({ error: "Invalid file type" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return Response.json({ error: "File too large (max 5MB)" }, { status: 400 });

    const filename = `${session.user.id}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(process.cwd(), "public", "uploads", filename), buffer);
    screenshotUrl = `/uploads/${filename}`;
  }

  await connectDB();

  const payment = await Payment.create({
    userId: session.user.id,
    amount,
    paymentMonth,
    status: "submitted",
    datePaid: new Date(),
    screenshotUrl,
    userSubmitted: true,
    note,
  });

  // Notify all admins
  const admins = await User.find({ role: "admin" }).lean();
  const user = await User.findById(session.user.id).lean();
  const username = user?.username ?? "A user";
  await Promise.all(
    admins.map((admin) =>
      Notification.create({
        userId: admin._id,
        message: `${username} submitted a payment of ETB ${amount.toLocaleString()} for ${paymentMonth}. Awaiting approval.`,
        type: "payment_received",
      })
    )
  );

  return Response.json(payment, { status: 201 });
}
