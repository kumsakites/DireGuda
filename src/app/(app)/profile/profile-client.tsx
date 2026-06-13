"use client";
import { useState, useRef } from "react";
import { Camera, User, Eye, EyeOff, KeyRound, Settings, Globe, Bell, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  user: {
    username?: string;
    email?: string;
    phone?: string;
    role?: string;
    avatar?: string;
    languagePreference?: string;
  };
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
          className="absolute right-2 inset-y-0 my-auto h-fit text-muted-foreground hover:text-foreground"
          aria-label="Toggle visibility">
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children, defaultOpen = false }: {
  title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50">
        <span className="flex items-center gap-2"><Icon size={15} />{title}</span>
        {open ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
      </button>
      {open && (
        <div className="border-t px-4 py-4 space-y-4">{children}</div>
      )}
    </div>
  );
}

export default function ProfileClient({ user }: Props) {
  const [avatar, setAvatar] = useState(user.avatar ?? null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type?: "error" | "success" }>({ msg: "" });
  const inputRef = useRef<HTMLInputElement>(null);

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // Settings
  const [language, setLanguage] = useState(user.languagePreference ?? "en");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);

  function notify(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "" }), 3000);
  }

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
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      notify("Password updated successfully!");
    } else {
      setPwError(data.error ?? "Failed to update password.");
    }
  }

  async function handleSettingsSave() {
    setSettingsLoading(true);
    const res = await fetch("/api/user/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ languagePreference: language, emailNotifications: emailNotifs }),
    });
    setSettingsLoading(false);
    if (res.ok) {
      notify("Settings saved!");
    } else {
      notify("Failed to save settings.", "error");
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
    const data = await res.json();
    if (res.ok) {
      setAvatar(data.avatar);
      notify("Profile picture updated!");
    } else {
      notify(data.error ?? "Upload failed", "error");
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast.msg && (
        <div className={`px-4 py-2 rounded-lg text-sm text-center ${toast.type === "error" ? "bg-destructive text-white" : "bg-primary text-primary-foreground"}`}>
          {toast.msg}
        </div>
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
          <div key={label} className="flex justify-between gap-4 px-4 py-3 text-sm min-w-0">
            <span className="text-muted-foreground shrink-0">{label}</span>
            <span className="font-medium capitalize truncate text-right">{value}</span>
          </div>
        ))}
      </div>

      {/* Change Password */}
      <Section title="Change Password" icon={KeyRound}>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          {pwError && <p className="text-xs text-destructive">{pwError}</p>}
          <PwInput id="current-pw" label="Current Password" value={currentPw} onChange={setCurrentPw} />
          <PwInput id="new-pw" label="New Password" value={newPw} onChange={setNewPw} />
          <PwInput id="confirm-pw" label="Confirm New Password" value={confirmPw} onChange={setConfirmPw} />
          <p className="text-xs text-muted-foreground">Min 8 chars · uppercase · number · special character</p>
          <button type="submit" disabled={pwLoading}
            className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            {pwLoading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </Section>

      {/* Account Settings */}
      <Section title="Account Settings" icon={Settings} defaultOpen>
        <div className="space-y-4">
          {/* Language */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Globe size={15} className="text-muted-foreground" />
              <span>Language</span>
            </div>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="rounded-md border px-3 py-1.5 text-sm bg-background">
              <option value="en">English</option>
              <option value="om">Afaan Oromo</option>
            </select>
          </div>

          {/* Email notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Bell size={15} className="text-muted-foreground" />
              <span>Email Notifications</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={emailNotifs}
              onClick={() => setEmailNotifs(v => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailNotifs ? "bg-primary" : "bg-muted"}`}>
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${emailNotifs ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSettingsSave}
            disabled={settingsLoading}
            className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            {settingsLoading ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </Section>
    </div>
  );
}
