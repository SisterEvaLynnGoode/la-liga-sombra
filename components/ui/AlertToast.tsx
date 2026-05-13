"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface Alert { id: string; message: string; sentAt: string }

interface Props { classId: string }

export default function AlertToast({ classId }: Props) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const dismissedRef = useRef(new Set<string>());

  const dismiss = useCallback((id: string) => {
    dismissedRef.current.add(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  useEffect(() => {
    if (!classId) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`class-alerts-${classId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "class_alerts", filter: `class_id=eq.${classId}` },
        (payload) => {
          const row = payload.new as { id: string; message: string; sent_at: string };
          if (dismissedRef.current.has(row.id)) return;
          const alert: Alert = { id: row.id, message: row.message, sentAt: row.sent_at };
          setAlerts((prev) => [alert, ...prev].slice(0, 3));
          // Auto-dismiss after 10 seconds
          setTimeout(() => dismiss(row.id), 10_000);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [classId, dismiss]);

  if (!alerts.length) return null;

  return (
    <div className="fixed top-14 right-4 z-50 flex flex-col gap-2 max-w-xs w-full pointer-events-none" aria-live="polite" aria-label="Class announcements">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="pointer-events-auto border border-[rgba(201,147,58,0.4)] bg-[#1a1614] shadow-lg px-4 py-3 flex items-start gap-3"
          style={{ animation: "fadeUp 0.3s ease both" }}
        >
          <span className="text-lg shrink-0">📢</span>
          <div className="flex-1 min-w-0">
            <p className="font-typewriter text-[9px] tracking-[0.3em] uppercase text-[#8b7355] mb-0.5">
              Mensaje del Maestro
            </p>
            <p className="font-typewriter text-sm text-[#f5e6c8] leading-snug">{alert.message}</p>
          </div>
          <button
            onClick={() => dismiss(alert.id)}
            className="shrink-0 font-typewriter text-xs text-[#4a3a2a] hover:text-[#8b7355] transition-colors mt-0.5"
            aria-label="Dismiss alert"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
