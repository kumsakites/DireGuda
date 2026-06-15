import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Payment from "@/models/Payment";
import { getTranslations } from "next-intl/server";
import AdminUsersClient from "./users-client";
import PageHeader from "@/components/page-header";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/dashboard");

  let users: unknown[] = [];
  let rankings: unknown[] = [];
  let monthlySummary: unknown[] = [];
  let userSummaries: unknown[] = [];

  try {
    await connectDB();
    users = await User.find({}, "-passwordHash").lean();

    // Per-user payment totals
    userSummaries = await Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: "$userId", totalPaid: { $sum: "$amount" }, paymentCount: { $sum: 1 } } },
      { $project: { userId: { $toString: "$_id" }, totalPaid: 1, paymentCount: 1, _id: 0 } },
    ]);

    // Rankings
    const raw = await Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: "$userId", totalPaid: { $sum: "$amount" }, paymentCount: { $sum: 1 } } },
      { $sort: { totalPaid: -1 } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { _id: 1, totalPaid: 1, paymentCount: 1, username: "$user.username" } },
    ]);
    rankings = raw.map((r: Record<string, unknown>, i: number) => ({ ...r, rank: i + 1 }));

    // Monthly summary (last 6)
    const summary = await Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: "$paymentMonth", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 6 },
      { $project: { month: "$_id", total: 1, count: 1, _id: 0 } },
    ]);
    monthlySummary = summary.reverse();
  } catch { /* DB unavailable */ }

  const t = await getTranslations("admin");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description="Manage user accounts, payment summaries, and rankings" />
      <AdminUsersClient
        initialUsers={JSON.parse(JSON.stringify(users))}
        rankings={JSON.parse(JSON.stringify(rankings))}
        monthlySummary={JSON.parse(JSON.stringify(monthlySummary))}
        userSummaries={JSON.parse(JSON.stringify(userSummaries))}
      />
    </div>
  );
}
