"use client";
import { useState, useRef } from "react";
import { Camera, User, Eye, EyeOff, KeyRound } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  user: { username?: string; email?: string; phone?: string; role?: string; avatar?: string };
}

function PwInput({ id, label, value, onChange }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <div className="relative">
        <input id={id} type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)}
          required autoComplete="new-password"
          className="w-full rounded-md border px-3 py-2 pr-10 text-sm bg-background" />
        <button type="button" onClick={() => setShow(s => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Toggle visibility">
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

export default function ProfileClient({ user }: Props) {
  const [avatar, setAvatar] = useState(user.avatar ?? null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [pwOpen, setPwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return; }
    setPwLoading(true);
    const res = await fetch("/api/user/change-password-voluntary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    });
    const data = await res.json().catch(() => ({}));
    setPwLoading(false);
    if (res.ok) {
      setCurrentPw(""); setNewPw(""); setConfirmPw(""); setPwOpen(false);
      setToast("Password updated successfully!");
      setTimeout(() => setToast(""), 3000);
    } else {
      setPwError(data.error ?? "Failed to update password.");
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("avatar", file);
    const res = await fetch("/api/user/avatar", { method: "POST", body: fd });
    setUploading(false);
    if (res.ok) {
      const data = await res.json();
      setAvatar(data.avatar);
      setToast("Profile picture updated!");
      setTimeout(() => setToast(""), 3000);
    } else {
      const data = await res.json();
      setToast(data.error ?? "Upload failed");
      setTimeout(() => setToast(""), 3000);
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm text-center">
          {toast}
        </motion.div>
      )}

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-2 border-primary overflow-hidden bg-muted flex items-center justify-center">
            {avatar
              ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              : <User size={40} className="text-muted-foreground" />
            }
          </div>
          <button onClick={() => inputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 hover:bg-primary/90"
            aria-label="Upload photo">
            <Camera size={14} />
          </button>
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <button onClick={() => inputRef.current?.click()} disabled={uploading}
          className="text-sm text-primary hover:underline disabled:opacity-50">
          {uploading ? "Uploading…" : "Change profile picture"}
        </button>
        <p className="text-xs text-muted-foreground">Max 2MB · JPG, PNG, GIF, WebP</p>
      </div>

      {/* Info */}
      <div className="rounded-xl border divide-y">
        {[
          { label: "Username", value: user.username },
          { label: "Email", value: user.email ?? "—" },
          { label: "Phone", value: user.phone ?? "—" },
          { label: "Role", value: user.role ?? "user" },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between px-4 py-3 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium capitalize">{value}</span>
          </div>
        ))}
      </div>

      {/* Change Password */}
      <div className="rounded-xl border">
        <button type="button" onClick={() => { setPwOpen(o => !o); setPwError(""); }}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 rounded-xl">
          <span className="flex items-center gap-2"><KeyRound size={15} />Change Password</span>
          <span className="text-muted-foreground text-xs">{pwOpen ? "▲" : "▼"}</span>
        </button>

        {pwOpen && (
          <motion.form onSubmit={handlePasswordChange}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="px-4 pb-4 space-y-3 border-t">
            {pwError && <p className="text-xs text-destructive pt-2">{pwError}</p>}
            <div className="pt-3 space-y-3">
              <PwInput id="current-pw" label="Current Password" value={currentPw} onChange={setCurrentPw} />
              <PwInput id="new-pw" label="New Password" value={newPw} onChange={setNewPw} />
              <PwInput id="confirm-pw" label="Confirm New Password" value={confirmPw} onChange={setConfirmPw} />
            </div>
            <p className="text-xs text-muted-foreground">Min 8 chars · uppercase · number · special character</p>
            <button type="submit" disabled={pwLoading}
              className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {pwLoading ? "Updating…" : "Update Password"}
            </button>
          </motion.form>
        )}
      </div>
    </div>
  );
}
