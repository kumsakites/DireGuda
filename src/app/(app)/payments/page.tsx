import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import PaymentsClient from "./payments-client";
import PageHeader from "@/components/page-header";

export default async function PaymentsPage() {
  const session = await auth();
  const isAdmin = session?.user.role === "admin";

  let payments: unknown[] = [];
  let rank = null;
  try {
    await connectDB();
    const filter: Record<string, unknown> = {};
    if (!isAdmin) filter.userId = session?.user.id;
    payments = await Payment.find(filter).sort({ createdAt: -1 }).lean();

    if (!isAdmin && session?.user.id) {
      // Compute user rank
      const rankings = await Payment.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: "$userId", totalPaid: { $sum: "$amount" }, paymentCount: { $sum: 1 } } },
        { $sort: { totalPaid: -1 } },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },
        { $project: { _id: 1, totalPaid: 1, paymentCount: 1, username: "$user.username" } },
      ]);
      const idx = rankings.findIndex((r) => r._id.toString() === session.user.id);
      if (idx >= 0) rank = { ...rankings[idx], rank: idx + 1 };
    }
  } catch { /* DB unavailable */ }

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="View your payment history and submit new payments" />
      <PaymentsClient
        payments={JSON.parse(JSON.stringify(payments))}
        rank={rank ? JSON.parse(JSON.stringify(rank)) : null}
        isAdmin={isAdmin}
      />
    </div>
  );
}
