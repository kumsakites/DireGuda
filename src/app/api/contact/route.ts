import { sendEmail } from "@/lib/mailer";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });

  const { name, email, phone, message } = parsed.data;
  const to = process.env.CONTACT_EMAIL ?? process.env.SMTP_USER ?? "";

  await sendEmail(
    to,
    `New message from ${name} — DireGuda`,
    `<p><strong>Name:</strong> ${name}</p>
     <p><strong>Email:</strong> ${email}</p>
     ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
     <p><strong>Message:</strong></p>
     <p>${message.replace(/\n/g, "<br/>")}</p>`
  );

  return Response.json({ ok: true });
}
