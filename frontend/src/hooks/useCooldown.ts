'use client';
import { useEffect, useState } from 'react';
/** Uses a deadline rather than interval counts so background tabs do not drift. */
export function useCooldown(initialSeconds = 0): {
  remaining: number;
  start: (seconds: number) => void;
} {
  const [deadline, setDeadline] = useState(0);
  const [remaining, setRemaining] = useState(initialSeconds);
  useEffect(() => {
    if (initialSeconds > 0) setDeadline(Date.now() + initialSeconds * 1000);
  }, [initialSeconds]);
  useEffect(() => {
    /** Updates the display using the actual current time. */
    const tick = (): void => setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [deadline]);
  return {
    remaining,
    start: (seconds) => {
      setDeadline(Date.now() + Math.max(0, seconds) * 1000);
      setRemaining(seconds);
    },
  };
}
