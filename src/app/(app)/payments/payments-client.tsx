"use client";
import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Upload, Trophy, CheckCircle } from "lucide-react";

interface Payment {
  _id: string;
  amount: number;
  status: "pending" | "paid" | "overdue" | "submitted";
  paymentMonth: string;
  datePaid?: string;
  referenceNumber?: string;
  screenshotUrl?: string;
  userSubmitted?: boolean;
  note?: string;
}

interface RankEntry { rank: number; totalPaid: number; paymentCount: number; username: string }

const statusColors = {
  paid: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
  overdue: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  submitted: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
};

const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export default function PaymentsClient({
  payments: initial,
  rank,
  isAdmin,
}: {
  payments: Payment[];
  rank?: RankEntry | null;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [payments, setPayments] = useState(initial);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMonth, setPaymentMonth] = useState(currentMonth());
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return payments;
    return payments.filter(
      (p) =>
        p.paymentMonth.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q) ||
        (p.referenceNumber ?? "").toLowerCase().includes(q) ||
        String(p.amount).includes(q)
    );
  }, [payments, query]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f && f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) { showToast("Enter a valid amount"); return; }
    setSubmitting(true);

    const fd = new FormData();
    fd.append("amount", amount);
    fd.append("paymentMonth", paymentMonth);
    fd.append("note", note);
    if (file) fd.append("screenshot", file);

    const res = await fetch("/api/payments/submit", { method: "POST", body: fd });
    setSubmitting(false);

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      showToast(d.error ?? "Submission failed");
      return;
    }
    const created = await res.json();
    setPayments((prev) => [created, ...prev]);
    setShowForm(false);
    setAmount("");
    setNote("");
    setFile(null);
    setPreview(null);
    showToast("Payment submitted! Awaiting admin approval.");
    router.refresh();
  }

  const pending = payments.filter((p) => p.status === "pending" || p.status === "overdue");

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50 text-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rank card */}
      {rank && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-primary/30 bg-primary/5 p-5 flex items-center gap-4"
        >
          <Trophy size={32} className="text-yellow-500 shrink-0" />
          <div>
            <p className="font-semibold text-lg">Your Rank: #{rank.rank}</p>
            <p className="text-sm text-muted-foreground">
              Total paid: ETB {rank.totalPaid.toLocaleString()} across {rank.paymentCount} payment
              {rank.paymentCount !== 1 ? "s" : ""}
            </p>
          </div>
        </motion.div>
      )}

      {/* Outstanding banner */}
      {pending.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-yellow-300 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 p-5 flex items-center justify-between gap-4"
        >
          <div>
            <p className="font-semibold text-yellow-800 dark:text-yellow-200">
              {pending.length} outstanding payment{pending.length > 1 ? "s" : ""}
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-0.5">
              Total due: ETB {pending.reduce((s, p) => s + p.amount, 0).toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="shrink-0 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
          >
            Submit Payment
          </button>
        </motion.div>
      )}

      {/* Submit Payment button */}
      <div className="flex justify-end">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90"
          >
            <Upload size={16} /> Submit Payment
          </button>
        </div>

      {/* Submit Payment Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card rounded-xl shadow-xl w-full max-w-md p-6 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-lg">Submit Payment</h2>
                <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-accent">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Amount (ETB) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    placeholder="Enter amount you paid"
                    className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Payment Month *</label>
                  <input
                    type="month"
                    value={paymentMonth}
                    onChange={(e) => setPaymentMonth(e.target.value)}
                    required
                    className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Screenshot / Receipt
                    <span className="text-muted-foreground font-normal ml-1">(optional, max 5MB)</span>
                  </label>
                  <div
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-accent/30 transition-colors"
                    onClick={() => fileRef.current?.click()}
                  >
                    {preview ? (
                      <img src={preview} alt="preview" className="max-h-32 mx-auto rounded" />
                    ) : file ? (
                      <p className="text-sm text-muted-foreground">{file.name}</p>
                    ) : (
                      <div className="space-y-1">
                        <Upload size={24} className="mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload screenshot</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {file && (
                    <button
                      type="button"
                      onClick={() => { setFile(null); setPreview(null); }}
                      className="text-xs text-muted-foreground mt-1 hover:text-foreground"
                    >
                      Remove file
                    </button>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Note (optional)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    placeholder="Any additional details…"
                    className="w-full rounded-md border px-3 py-2 text-sm bg-background resize-none"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {submitting ? "Submitting…" : <><CheckCircle size={15} /> Submit</>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 border py-2 rounded-md text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by month, status, amount…"
          className="w-full rounded-md border pl-9 pr-8 py-2 text-sm bg-background"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>

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
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-muted-foreground">
                    No payments found
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <motion.tr
                    key={p._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-t hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-4 py-3">{p.paymentMonth}</td>
                    <td className="px-4 py-3 font-medium">ETB {p.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[p.status]}`}
                      >
                        {p.status === "submitted" ? "Awaiting Approval" : p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.datePaid ? new Date(p.datePaid).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {p.screenshotUrl ? (
                        <a
                          href={p.screenshotUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary text-xs underline"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
