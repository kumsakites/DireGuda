import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { passwordSchema } from "@/lib/password";
import { NextRequest } from "next/server";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

// Simple in-memory rate limit: max 5 attempts per user per 15 min
const attempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = attempts.get(userId);
  if (!entry || now > entry.resetAt) {
    attempts.set(userId, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (!checkRateLimit(session.user.id)) {
    return Response.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { currentPassword, newPassword } = parsed.data;

  if (currentPassword === newPassword) {
    return Response.json({ error: "New password must differ from current password." }, { status: 400 });
  }

  await connectDB();
  const user = await User.findById(session.user.id).select("passwordHash").lean();
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return Response.json({ error: "Current password is incorrect." }, { status: 400 });

  const hash = await bcrypt.hash(newPassword, 12);
  await User.findByIdAndUpdate(session.user.id, { passwordHash: hash });

  return Response.json({ ok: true });
}
