import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import User, { IUser } from "@/models/User";
import { getTranslations } from "next-intl/server";
import AdminUsersClient from "./users-client";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/dashboard");

  let users: unknown[] = [];
  try {
    await connectDB();
    users = await User.find({}, "-passwordHash").lean();
  } catch { /* DB unavailable */ }
  const t = await getTranslations("admin");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <AdminUsersClient initialUsers={JSON.parse(JSON.stringify(users))} />
    </div>
  );
}
