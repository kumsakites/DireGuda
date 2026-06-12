import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ locale: z.enum(["en", "om"]) });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("locale", parsed.data.locale, { maxAge: 60 * 60 * 24 * 365, path: "/" });
  return res;
}
