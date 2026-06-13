import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { languagePreference } = await req.json();
  const allowed = ["en", "om"];
  if (languagePreference && !allowed.includes(languagePreference))
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });

  await connectDB();
  await User.findByIdAndUpdate(session.user.id, { ...(languagePreference && { languagePreference }) });
  return NextResponse.json({ ok: true });
}
