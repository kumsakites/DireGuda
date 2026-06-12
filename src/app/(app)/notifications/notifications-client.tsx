"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";

interface Notification {
  _id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsClient({ initialNotifications }: { initialNotifications: Notification[] }) {
  const t = useTranslations("notifications");
  const [items, setItems] = useState(initialNotifications);

  async function markAll() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setItems(items.map(n => ({ ...n, isRead: true })));
  }

  async function markOne(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setItems(items.map(n => n._id === id ? { ...n, isRead: true } : n));
  }

  const unread = items.filter(n => !n.isRead).length;

  return (
    <div className="space-y-3 max-w-2xl">
      {unread > 0 && (
        <button onClick={markAll}
          className="flex items-center gap-2 text-sm text-primary hover:underline">
          <CheckCheck size={16} /> {t("markAllRead")}
        </button>
      )}

      {items.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Bell size={40} className="mx-auto mb-3 opacity-30" />
          <p>{t("noNotifications")}</p>
        </div>
      )}

      <AnimatePresence>
        {items.map((n, i) => (
          <motion.div
            key={n._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => !n.isRead && markOne(n._id)}
            className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
              n.isRead ? "bg-card opacity-60" : "bg-card hover:bg-accent border-primary/30"
            }`}
          >
            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.isRead ? "bg-muted-foreground/30" : "bg-primary"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm">{n.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
