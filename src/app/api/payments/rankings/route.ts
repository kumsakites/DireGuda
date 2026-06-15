import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  // Aggregate total paid per user (only approved/paid)
  const rankings = await Payment.aggregate([
    { $match: { status: "paid" } },
    { $group: { _id: "$userId", totalPaid: { $sum: "$amount" }, paymentCount: { $sum: 1 } } },
    { $sort: { totalPaid: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 1,
        totalPaid: 1,
        paymentCount: 1,
        username: "$user.username",
      },
    },
  ]);

  const rankedList = rankings.map((r, i) => ({ ...r, rank: i + 1 }));

  // Admin sees full list; user sees only their own rank
  if (session.user.role === "admin") {
    return Response.json(rankedList);
  }

  const mine = rankedList.find((r) => r._id.toString() === session.user.id);
  return Response.json(mine ? [mine] : []);
}
