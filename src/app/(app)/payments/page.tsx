import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import PaymentsClient from "./payments-client";

export default async function PaymentsPage() {
  const session = await auth();
  let payments: unknown[] = [];
  try {
    await connectDB();
    const filter: Record<string, unknown> = {};
    if (session?.user.role !== "admin") filter.userId = session?.user.id;
    payments = await Payment.find(filter).sort({ createdAt: -1 }).lean();
  } catch { /* DB unavailable */ }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Payments</h1>
      <PaymentsClient payments={JSON.parse(JSON.stringify(payments))} isAdmin={session?.user.role === "admin"} />
    </div>
  );
}
