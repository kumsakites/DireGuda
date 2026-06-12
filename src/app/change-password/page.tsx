"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { useSession } from "next-auth/react";
import { passwordSchema } from "@/lib/password";

function PasswordInput({ name, placeholder, value, onChange }: {
  name: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input name={name} type={show ? "text" : "password"} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)} required
        className="w-full rounded-md border px-3 py-2 pr-10 text-sm bg-background" />
      <button type="button" onClick={() => setShow(s => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export default function ChangePasswordPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { update } = useSession();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const mismatch = confirm.length > 0 && password !== confirm;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (mismatch) { setError(t("passwordMismatch")); return; }

    const check = passwordSchema.safeParse(password);
    if (!check.success) { setError(check.error.issues[0].message); return; }

    const res = await fetch("/api/user/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      await update({ mustChangePassword: false });
      router.push("/dashboard");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(`Failed (${res.status}): ${JSON.stringify(data)}`);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-xl border p-8 shadow-lg bg-card">
        <h1 className="text-xl font-bold text-center">{t("changePassword")}</h1>
        <p className="text-xs text-muted-foreground">{t("passwordHint")}</p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <PasswordInput name="password" placeholder={t("newPassword")} value={password} onChange={setPassword} />
        <div className="space-y-1">
          <PasswordInput name="confirm" placeholder={t("confirmPassword")} value={confirm} onChange={setConfirm} />
          {mismatch && <p className="text-xs text-destructive">{t("passwordMismatch")}</p>}
        </div>
        <button type="submit" className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium">
          {t("save")}
        </button>
      </form>
    </main>
  );
}
