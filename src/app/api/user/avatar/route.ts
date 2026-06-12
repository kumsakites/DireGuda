import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("avatar") as File | null;
  if (!file) return Response.json({ error: "No file" }, { status: 400 });

  if (!file.type.startsWith("image/")) return Response.json({ error: "Must be an image" }, { status: 400 });
  if (file.size > 2 * 1024 * 1024) return Response.json({ error: "Max 2MB" }, { status: 400 });

  // Convert to base64 data URL (no external storage needed)
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  await connectDB();
  await User.findByIdAndUpdate(session.user.id, { avatar: dataUrl });

  return Response.json({ avatar: dataUrl });
}
