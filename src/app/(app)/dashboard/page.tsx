import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import User from "@/models/User";
import { getTranslations } from "next-intl/server";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const session = await auth();
  const { month } = await searchParams;

  const currentMonth = month ?? new Date().toISOString().slice(0, 7);
  let payments: unknown[] = [];
  let users: unknown[] = [];
  try {
    await connectDB();
    const filter: Record<string, unknown> = {};
    if (session?.user.role !== "admin") filter.userId = session?.user.id;
    filter.paymentMonth = currentMonth;
    payments = await Payment.find(filter)
      .populate("userId", "username email")
      .sort({ createdAt: -1 })
      .lean();
    if (session?.user.role === "admin") {
      users = await User.find({}, "_id username").lean();
    }
  } catch { /* DB unavailable */ }

  const t = await getTranslations("dashboard");

  const stats = {
    paid: payments.filter(p => p.status === "paid").length,
    pending: payments.filter(p => p.status === "pending").length,
    overdue: payments.filter(p => p.status === "overdue").length,
    total: payments.reduce((s, p) => s + p.amount, 0),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </div>
      <DashboardClient
        payments={JSON.parse(JSON.stringify(payments))}
        stats={stats}
        currentMonth={currentMonth}
        isAdmin={session?.user.role === "admin"}
        users={JSON.parse(JSON.stringify(users))}
      />
    </div>
  );
}
