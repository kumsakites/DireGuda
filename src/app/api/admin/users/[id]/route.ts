import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Types } from "mongoose";

const updateSchema = z.object({
  username: z.string().min(2).max(50).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  role: z.enum(["admin", "user"]).optional(),
  languagePreference: z.enum(["en", "om"]).optional(),
  resetPassword: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return null;
  return session;
}

export async function PATCH(req: Request, ctx: RouteContext<'/api/admin/users/[id]'>) {
  if (!(await requireAdmin())) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  if (!Types.ObjectId.isValid(id)) return Response.json({ error: "Invalid ID" }, { status: 400 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  await connectDB();
  const { resetPassword, ...fields } = parsed.data;
  const update: Record<string, unknown> = { ...fields };

  if (resetPassword) {
    const user = await User.findById(id).lean();
    if (!user) return Response.json({ error: "Not found" }, { status: 404 });
    update.passwordHash = await bcrypt.hash(user.username, 12);
    update.mustChangePassword = true;
  }

  const updated = await User.findByIdAndUpdate(id, update, { new: true }).select("-passwordHash").lean();
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(updated);
}

export async function DELETE(_req: Request, ctx: RouteContext<'/api/admin/users/[id]'>) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  if (!Types.ObjectId.isValid(id)) return Response.json({ error: "Invalid ID" }, { status: 400 });
  if (id === session.user.id) return Response.json({ error: "Cannot delete self" }, { status: 400 });

  await connectDB();
  await User.findByIdAndDelete(id);
  return Response.json({ ok: true });
}
