import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { passwordSchema } from "@/lib/password";
import { z } from "zod";

const schema = z.object({ token: z.string(), password: passwordSchema });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });

  await connectDB();
  const user = await User.findOne({
    resetToken: parsed.data.token,
    resetTokenExpiry: { $gt: new Date() },
  });
  if (!user) return Response.json({ error: "Invalid or expired link" }, { status: 400 });

  const hash = await bcrypt.hash(parsed.data.password, 12);
  await User.findByIdAndUpdate(user._id, {
    passwordHash: hash,
    mustChangePassword: false,
    resetToken: null,
    resetTokenExpiry: null,
  });

  return Response.json({ ok: true });
}
