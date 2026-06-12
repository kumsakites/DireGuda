"use client";
import { motion } from "framer-motion";

interface Payment {
  _id: string;
  amount: number;
  status: "pending" | "paid" | "overdue";
  paymentMonth: string;
  datePaid?: string;
  referenceNumber?: string;
}

const statusColors = {
  paid: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
  overdue: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
};

export default function PaymentsClient({ payments, isAdmin }: { payments: Payment[]; isAdmin: boolean }) {
  const pending = payments.filter(p => p.status === "pending" || p.status === "overdue");

  return (
    <div className="space-y-6">
      {/* Pay Now banner for non-admins with outstanding payments */}
      {!isAdmin && pending.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-yellow-300 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-yellow-800 dark:text-yellow-200">
              You have {pending.length} outstanding payment{pending.length > 1 ? "s" : ""}
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-0.5">
              Total due: ETB {pending.reduce((s, p) => s + p.amount, 0).toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => alert("Payment integration coming soon. Please contact admin to arrange payment.")}
            className="shrink-0 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
            Pay Now
          </button>
        </motion.div>
      )}

      {/* Payments table */}
      <div className="rounded-xl border overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted font-semibold text-sm">Payment History</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Month</th>
                <th className="text-left px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Reference</th>
                <th className="text-left px-4 py-3 font-medium">Date Paid</th>
                {!isAdmin && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No payments found</td></tr>
              ) : payments.map((p, i) => (
                <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-t hover:bg-accent/50 transition-colors">
                  <td className="px-4 py-3">{p.paymentMonth}</td>
                  <td className="px-4 py-3 font-medium">ETB {p.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.referenceNumber ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.datePaid ? new Date(p.datePaid).toLocaleDateString() : "—"}
                  </td>
                  {!isAdmin && (
                    <td className="px-4 py-3">
                      {(p.status === "pending" || p.status === "overdue") && (
                        <button
                          onClick={() => alert("Payment integration coming soon.")}
                          className={`px-3 py-1 rounded-md text-xs font-medium text-white ${p.status === "overdue" ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"}`}>
                          Pay Now
                        </button>
                      )}
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
