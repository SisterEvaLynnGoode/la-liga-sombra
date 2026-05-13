"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface ClassDataState<T> {
  data: T | null;
  loading: boolean;
  lastUpdated: Date | null;
}

export function useClassData<T>(baseEndpoint: string, classId: string, extraQuery = "") {
  const [state, setState] = useState<ClassDataState<T>>({ data: null, loading: false, lastUpdated: null });
  const abortRef = useRef<AbortController | null>(null);

  const refetch = useCallback(async () => {
    if (!classId) { setState({ data: null, loading: false, lastUpdated: null }); return; }
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setState((s) => ({ ...s, loading: true }));
    try {
      const url = `${baseEndpoint}?classId=${encodeURIComponent(classId)}${extraQuery}`;
      const res = await fetch(url, { signal: abortRef.current.signal });
      if (res.ok) {
        const json = await res.json() as T;
        setState({ data: json, loading: false, lastUpdated: new Date() });
      } else {
        setState((s) => ({ ...s, loading: false }));
      }
    } catch (e: unknown) {
      if ((e as Error)?.name !== "AbortError") setState((s) => ({ ...s, loading: false }));
    }
  }, [baseEndpoint, classId, extraQuery]);

  useEffect(() => {
    refetch();
    const id = setInterval(refetch, 30_000);
    return () => { clearInterval(id); abortRef.current?.abort(); };
  }, [refetch]);

  return { ...state, refetch };
}

export function relativeTime(iso: string | null): string {
  if (!iso) return "Never";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function masteryColor(pct: number) {
  return pct >= 80 ? "#4ade80" : pct >= 50 ? "#fbbf24" : "#f87171";
}

export function fmtMinutes(seconds: number) {
  const m = Math.round(seconds / 60);
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

export function lastUpdatedText(date: Date | null) {
  if (!date) return "";
  const s = Math.round((Date.now() - date.getTime()) / 1000);
  if (s < 10) return "Updated just now";
  if (s < 60) return `Updated ${s}s ago`;
  return `Updated ${Math.floor(s / 60)}m ago`;
}
