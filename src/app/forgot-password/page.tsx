"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/user/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-xl border p-8 shadow-lg bg-card space-y-4">
        <h1 className="text-xl font-bold text-center">Forgot Password</h1>
        {sent ? (
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              If your account has an email on file, a reset link has been sent.
            </p>
            <Link href="/login" className="text-sm text-primary hover:underline">Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">Enter your username and we'll send a reset link to your email.</p>
            <div>
              <label className="text-sm font-medium block mb-1">Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} required
                className="w-full rounded-md border px-3 py-2 text-sm bg-background" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
            <p className="text-center text-sm">
              <Link href="/login" className="text-primary hover:underline">Back to login</Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
