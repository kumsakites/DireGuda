"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mismatch) return;
    setLoading(true);
    const res = await fetch("/api/user/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    if (res.ok) router.push("/login");
    else { const d = await res.json(); setError(d.error ?? "Failed"); }
  }

  if (!token) return <p className="text-sm text-destructive text-center">Invalid reset link.</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div>
        <label className="text-sm font-medium block mb-1">New Password</label>
        <div className="relative">
          <input type={showPw ? "text" : "password"} value={password}
            onChange={e => setPassword(e.target.value)} required
            className="w-full rounded-md border px-3 py-2 pr-10 text-sm bg-background" />
          <button type="button" onClick={() => setShowPw(s => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">Confirm Password</label>
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
          className="w-full rounded-md border px-3 py-2 text-sm bg-background" />
        {mismatch && <p className="text-xs text-destructive mt-1">Passwords don't match</p>}
      </div>
      <p className="text-xs text-muted-foreground">Min 8 chars, uppercase, number, special character</p>
      <button type="submit" disabled={loading || mismatch}
        className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
        {loading ? "Resetting…" : "Reset Password"}
      </button>
      <p className="text-center text-sm">
        <Link href="/login" className="text-primary hover:underline">Back to login</Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-xl border p-8 shadow-lg bg-card space-y-4">
        <h1 className="text-xl font-bold text-center">Reset Password</h1>
        <Suspense fallback={<p className="text-sm text-center text-muted-foreground">Loading…</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </main>
  );
}
