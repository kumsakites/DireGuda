import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  role: z.enum(["admin", "user"]).default("user"),
  languagePreference: z.enum(["en", "om"]).default("en"),
  password: z.string().min(4).optional().or(z.literal("")),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return Response.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  const users = await User.find({}, "-passwordHash").lean();
  return Response.json(users);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  await connectDB();
  const { username, email, phone, role, languagePreference, password } = parsed.data;

  const rawPassword = password || username;
  const passwordHash = await bcrypt.hash(rawPassword, 12);
  const mustChangePassword = !password; // force change if admin didn't set a password

  const user = await User.create({
    username,
    email: email || undefined,
    phone: phone || undefined,
    passwordHash,
    role,
    languagePreference,
    mustChangePassword,
  });

  const { passwordHash: _, ...safe } = user.toObject();
  return Response.json(safe, { status: 201 });
}
