import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const url = new URL(req.url);
  const months = Number(url.searchParams.get("months") ?? "6");

  const matchStage: Record<string, unknown> = { status: "paid" };
  if (session.user.role !== "admin") matchStage.userId = session.user.id;

  const summary = await Payment.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$paymentMonth",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
    { $limit: months },
    { $project: { month: "$_id", total: 1, count: 1, _id: 0 } },
  ]);

  // Grand total
  const grandTotal = await Payment.aggregate([
    { $match: matchStage },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);

  return Response.json({
    monthly: summary.reverse(),
    grandTotal: grandTotal[0]?.total ?? 0,
    grandCount: grandTotal[0]?.count ?? 0,
  });
}
