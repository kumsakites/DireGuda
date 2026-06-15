import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import User from "@/models/User";
import { getTranslations } from "next-intl/server";
import DashboardClient from "./dashboard-client";
import PageHeader from "@/components/page-header";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const session = await auth();
  const isAdmin = session?.user.role === "admin";
  const { month } = await searchParams;
  const currentMonth = month ?? new Date().toISOString().slice(0, 7);

  let payments: Array<{ status: string; amount: number; [key: string]: unknown }> = [];
  let users: unknown[] = [];
  let monthlySummary: Array<{ month: string; total: number; count: number }> = [];
  let rankings: unknown[] = [];
  let grandTotal = 0;

  try {
    await connectDB();
    const filter: Record<string, unknown> = { paymentMonth: currentMonth };
    if (!isAdmin) filter.userId = session?.user.id;

    payments = (await Payment.find(filter)
      .populate("userId", "username email")
      .sort({ createdAt: -1 })
      .lean()) as unknown as typeof payments;

    if (isAdmin) {
      users = await User.find({}, "_id username").lean();

      // Monthly summary (last 6 months)
      const summaryRaw = await Payment.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: "$paymentMonth", total: { $sum: "$amount" }, count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
        { $limit: 6 },
        { $project: { month: "$_id", total: 1, count: 1, _id: 0 } },
      ]);
      monthlySummary = summaryRaw.reverse();

      // Grand total
      const gt = await Payment.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      grandTotal = gt[0]?.total ?? 0;

      // Rankings
      rankings = await Payment.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: "$userId", totalPaid: { $sum: "$amount" }, paymentCount: { $sum: 1 } } },
        { $sort: { totalPaid: -1 } },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },
        { $project: { _id: 1, totalPaid: 1, paymentCount: 1, username: "$user.username" } },
      ]);
      rankings = (rankings as Record<string, unknown>[]).map((r, i) => ({ ...r, rank: i + 1 }));
    }
  } catch { /* DB unavailable */ }

  const t = await getTranslations("dashboard");
  const stats = {
    paid: payments.filter(p => p.status === "paid").length,
    pending: payments.filter(p => p.status === "pending").length,
    overdue: payments.filter(p => p.status === "overdue").length,
    total: payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={isAdmin ? "Overview of all payments, monthly revenue, and member rankings" : "Track your payment history and status"}
      />
      <DashboardClient
        payments={JSON.parse(JSON.stringify(payments))}
        stats={stats}
        currentMonth={currentMonth}
        isAdmin={isAdmin}
        users={JSON.parse(JSON.stringify(users))}
        monthlySummary={JSON.parse(JSON.stringify(monthlySummary))}
        rankings={JSON.parse(JSON.stringify(rankings))}
        grandTotal={grandTotal}
      />
    </div>
  );
}
