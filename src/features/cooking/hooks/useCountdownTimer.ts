'use client';

import { useEffect, useRef, useState } from 'react';

export function useCountdownTimer(initialSeconds: number) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // Reset when initialSeconds changes (step navigation)
  useEffect(() => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setTimeLeft(initialSeconds);
  }, [initialSeconds]);

  const start = () => {
    if (timeLeft > 0) setIsRunning(true);
  };
  const pause = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setTimeLeft(initialSeconds);
  };

  return { timeLeft, isRunning, start, pause, reset };
}
