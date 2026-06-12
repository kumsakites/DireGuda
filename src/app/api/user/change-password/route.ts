import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { passwordSchema } from "@/lib/password";

const schema = z.object({ password: passwordSchema });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid" }, { status: 400 });

  await connectDB();
  const hash = await bcrypt.hash(parsed.data.password, 12);
  await User.findByIdAndUpdate(session.user.id, {
    passwordHash: hash,
    mustChangePassword: false,
  });

  return Response.json({ ok: true });
}
