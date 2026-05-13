"use client";

import { useState, useEffect, useRef } from "react";

export function useGameTimer(autoStart = true) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  return {
    elapsed,
    start: () => setRunning(true),
    stop: () => setRunning(false),
    reset: () => { setElapsed(0); setRunning(false); },
  };
}
