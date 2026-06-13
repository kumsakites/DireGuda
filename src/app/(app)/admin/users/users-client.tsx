"use client";
import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, KeyRound, X, Eye, EyeOff, Search, Users } from "lucide-react";

interface User {
  _id: string;
  username: string;
  email?: string;
  phone?: string;
  role: string;
  languagePreference: string;
  mustChangePassword: boolean;
}

interface Props { initialUsers: User[] }

const emptyForm = { username: "", email: "", phone: "", role: "user", languagePreference: "en", password: "" };

export default function AdminUsersClient({ initialUsers }: Props) {
  const t = useTranslations("admin");
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return users;
    return users.filter(u =>
      u.username.toLowerCase().includes(q) ||
      (u.email ?? "").toLowerCase().includes(q) ||
      (u.phone ?? "").includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.languagePreference.toLowerCase().includes(q) ||
      (u.mustChangePassword ? "must change" : "active").includes(q)
    );
  }, [users, query]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }
  function openAdd() { setEditing(null); setForm(emptyForm); setShowForm(true); }
  function openEdit(u: User) {
    setEditing(u);
    setForm({ username: u.username, email: u.email ?? "", phone: u.phone ?? "", role: u.role, languagePreference: u.languagePreference, password: "" });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = editing ? `/api/admin/users/${editing._id}` : "/api/admin/users";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!res.ok) { showToast("Error: " + (await res.json().then(d => d.error).catch(() => res.statusText))); return; }
    const data = await res.json();
    if (editing) {
      setUsers(users.map(u => u._id === data._id ? data : u));
      showToast(t("userUpdated"));
    } else {
      setUsers([...users, data]);
      showToast(t("userAdded"));
    }
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) { setUsers(users.filter(u => u._id !== id)); showToast(t("userDeleted")); }
  }

  async function handleReset(id: string) {
    await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resetPassword: true }) });
    showToast(t("resetPassword"));
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50 text-sm">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, email, phone, role, status…"
            className="w-full rounded-md border pl-9 pr-4 py-2 text-sm bg-background"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 shrink-0">
          <Plus size={16} /> {t("addUser")}
        </button>
      </div>

      {/* Result count */}
      {query && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{query}"
        </p>
      )}

      {/* User table */}
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              {[t("username"), t("email"), t("phone"), t("role"), t("language"), "Status"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No users match your search</td></tr>
            ) : filtered.map((u, i) => (
              <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="border-t hover:bg-accent/50 transition-colors">
                <td className="px-4 py-3 font-medium">{u.username}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200" : "bg-muted text-muted-foreground"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 uppercase text-xs">{u.languagePreference}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.mustChangePassword ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200" : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"}`}>
                    {u.mustChangePassword ? "Must change pw" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-accent" aria-label="Edit"><Pencil size={14} /></button>
                    <button onClick={() => handleReset(u._id)} className="p-1.5 rounded hover:bg-accent" aria-label="Reset password"><KeyRound size={14} /></button>
                    <button onClick={() => handleDelete(u._id)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive" aria-label="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-card rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-lg">{editing ? t("editUser") : t("addUser")}</h2>
                <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-accent"><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                {[
                  { name: "username", label: t("username"), required: !editing },
                  { name: "email", label: t("email") },
                  { name: "phone", label: t("phone") },
                ].map(({ name, label, required }) => (
                  <div key={name}>
                    <label className="text-sm font-medium block mb-1">{label}</label>
                    <input name={name} value={form[name as keyof typeof form]} onChange={e => setForm({ ...form, [name]: e.target.value })}
                      required={required} className="w-full rounded-md border px-3 py-2 text-sm bg-background" />
                  </div>
                ))}
                {!editing && (
                  <div>
                    <label className="text-sm font-medium block mb-1">Password <span className="text-muted-foreground font-normal">(optional — defaults to username)</span></label>
                    <div className="relative">
                      <input name="password" type={showPassword ? "text" : "password"} value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        placeholder="Leave blank to use username as password"
                        className="w-full rounded-md border px-3 py-2 pr-10 text-sm bg-background" />
                      <button type="button" onClick={() => setShowPassword(s => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium block mb-1">{t("role")}</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                    className="w-full rounded-md border px-3 py-2 text-sm bg-background">
                    <option value="user">{t("user")}</option>
                    <option value="admin">{t("admin")}</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">{t("language")}</label>
                  <select value={form.languagePreference} onChange={e => setForm({ ...form, languagePreference: e.target.value })}
                    className="w-full rounded-md border px-3 py-2 text-sm bg-background">
                    <option value="en">English</option>
                    <option value="om">Afaan Oromo</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium hover:bg-primary/90">
                    {editing ? t("editUser") : t("addUser")}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 border py-2 rounded-md text-sm">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
