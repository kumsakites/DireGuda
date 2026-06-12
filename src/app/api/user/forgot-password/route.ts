import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendEmail } from "@/lib/mailer";
import crypto from "crypto";

export async function POST(req: Request) {
  const { username } = await req.json();
  if (!username) return Response.json({ error: "Username required" }, { status: 400 });

  await connectDB();
  const user = await User.findOne({ username });

  // Always return success to prevent username enumeration
  if (!user?.email) return Response.json({ ok: true });

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await User.findByIdAndUpdate(user._id, { resetToken: token, resetTokenExpiry: expiry });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  await sendEmail(
    user.email,
    "Password Reset",
    `<p>Click the link below to reset your password (expires in 1 hour):</p>
     <a href="${appUrl}/reset-password?token=${token}">${appUrl}/reset-password?token=${token}</a>`
  );

  return Response.json({ ok: true });
}
