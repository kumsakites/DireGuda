"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Clock, AlertCircle, CheckCircle, Plus, X, Search } from "lucide-react";

interface Payment {
  _id: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  paymentMonth: string;
  datePaid?: string;
  referenceNumber?: string;
  userId: { username: string; email?: string } | string;
}

interface Stats { paid: number; pending: number; overdue: number; total: number }
interface UserOption { _id: string; username: string }

interface Props {
  payments: Payment[];
  stats: Stats;
  currentMonth: string;
  isAdmin: boolean;
  users?: UserOption[];
}

const statusColors = {
  paid: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
  overdue: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
};

export default function DashboardClient({ payments: initial, stats: initialStats, currentMonth, isAdmin, users = [] }: Props) {
  const t = useTranslations("dashboard");
  const pt = useTranslations("payments");
  const router = useRouter();
  const [month, setMonth] = useState(currentMonth);
  const [payments, setPayments] = useState(initial);
  const [stats, setStats] = useState(initialStats);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ userId: "", amount: "", paymentMonth: currentMonth, status: "pending", referenceNumber: "" });
  const [toast, setToast] = useState("");
  const [tableQuery, setTableQuery] = useState("");

  const filteredPayments = useMemo(() => {
    const q = tableQuery.toLowerCase().trim();
    if (!q) return payments;
    return payments.filter(p =>
      (typeof p.userId === "object" ? p.userId.username : p.userId ?? "").toLowerCase().includes(q) ||
      p.paymentMonth.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q) ||
      (p.referenceNumber ?? "").toLowerCase().includes(q) ||
      String(p.amount).includes(q)
    );
  }, [payments, tableQuery]);

  function handleMonthChange(m: string) {
    setMonth(m);
    router.push(`/dashboard?month=${m}`);
  }

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    });
    if (!res.ok) { setToast("Failed to add payment"); setTimeout(() => setToast(""), 3000); return; }
    setShowAdd(false);
    setToast("Payment added!");
    setTimeout(() => setToast(""), 3000);
    router.refresh();
  }

  const cards = [
    { label: t("totalPaid"), value: `ETB ${stats.total.toLocaleString()}`, icon: TrendingUp, color: "text-blue-500" },
    { label: t("totalPending"), value: stats.pending, icon: Clock, color: "text-yellow-500" },
    { label: t("overdue"), value: stats.overdue, icon: AlertCircle, color: "text-red-500" },
    { label: pt("paid"), value: stats.paid, icon: CheckCircle, color: "text-green-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50 text-sm">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin: Add Payment button */}
      {isAdmin && (
        <div className="flex justify-end">
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90">
            <Plus size={16} /> Add Payment
          </button>
        </div>
      )}

      {/* Add Payment Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-card rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-lg">Add Payment</h2>
                <button onClick={() => setShowAdd(false)} className="p-1 rounded hover:bg-accent"><X size={16} /></button>
              </div>
              <form onSubmit={handleAddPayment} className="space-y-3">
                <div>
                  <label className="text-sm font-medium block mb-1">User</label>
                  <select value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })} required
                    className="w-full rounded-md border px-3 py-2 text-sm bg-background">
                    <option value="">Select user…</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Amount (ETB)</label>
                  <input type="number" min="1" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required
                    className="w-full rounded-md border px-3 py-2 text-sm bg-background" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Payment Month</label>
                  <input type="month" value={form.paymentMonth} onChange={e => setForm({ ...form, paymentMonth: e.target.value })} required
                    className="w-full rounded-md border px-3 py-2 text-sm bg-background" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full rounded-md border px-3 py-2 text-sm bg-background">
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Reference (optional)</label>
                  <input value={form.referenceNumber} onChange={e => setForm({ ...form, referenceNumber: e.target.value })}
                    className="w-full rounded-md border px-3 py-2 text-sm bg-background" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium">Add</button>
                  <button type="button" onClick={() => setShowAdd(false)} className="flex-1 border py-2 rounded-md text-sm">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card border rounded-xl p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <card.icon size={20} className={card.color} />
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Stats cards */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground">{t("filterMonth")}</label>
        <input
          type="month"
          value={month}
          onChange={e => handleMonthChange(e.target.value)}
          className="rounded-md border px-3 py-1.5 text-sm bg-background"
        />
      </div>

      {/* Payments table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border overflow-hidden"
      >
        <div className="px-4 py-3 border-b bg-muted flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-semibold">{t("recentPayments")}</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={tableQuery}
              onChange={e => setTableQuery(e.target.value)}
              placeholder="Search payments…"
              className="rounded-md border pl-8 pr-8 py-1.5 text-sm bg-background w-52"
            />
            {tableQuery && (
              <button onClick={() => setTableQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={13} />
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                {isAdmin && <th className="text-left px-4 py-3 font-medium">User</th>}
                <th className="text-left px-4 py-3 font-medium">{pt("month")}</th>
                <th className="text-left px-4 py-3 font-medium">{pt("amount")}</th>
                <th className="text-left px-4 py-3 font-medium">{pt("status")}</th>
                <th className="text-left px-4 py-3 font-medium">{pt("reference")}</th>
                <th className="text-left px-4 py-3 font-medium">{pt("datePaid")}</th>
                {!isAdmin && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">
                  {tableQuery ? `No payments match "${tableQuery}"` : "—"}
                </td></tr>
              ) : filteredPayments.map((p, i) => (
                <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.04 }}
                  className="border-t hover:bg-accent/50 transition-colors">
                  {isAdmin && (
                    <td className="px-4 py-3">
                      {typeof p.userId === "object" ? p.userId.username : p.userId}
                    </td>
                  )}
                  <td className="px-4 py-3">{p.paymentMonth}</td>
                  <td className="px-4 py-3 font-medium">ETB {p.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[p.status]}`}>
                      {pt(p.status)}
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
                          onClick={() => alert("Payment integration coming soon. Please contact admin.")}
                          className={`px-3 py-1 rounded-md text-xs font-medium text-white ${p.status === "overdue" ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"}`}
                        >
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
      </motion.div>
    </div>
  );
}
