import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import User, { IUser } from "@/models/User";
import { getTranslations } from "next-intl/server";
import AdminUsersClient from "./users-client";
import PageHeader from "@/components/page-header";

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
    <div className="space-y-6">
      <PageHeader title={t("title")} description="Manage user accounts, roles, and permissions" />
      <AdminUsersClient initialUsers={JSON.parse(JSON.stringify(users))} />
    </div>
  );
}
