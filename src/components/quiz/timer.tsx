"use client";

import { useEffect, useState, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";

interface TimerProps {
  startTime: string | null;
  duration: number; // in seconds
  onTimeUp: () => void;
  isPaused?: boolean;
}

export function QuizTimer({ startTime, duration, onTimeUp, isPaused = false }: TimerProps) {
  const [remaining, setRemaining] = useState(duration);

  const endTime = useMemo(() => {
    if (!startTime) return null;
    return new Date(startTime).getTime() + duration * 1000;
  }, [startTime, duration]);

  useEffect(() => {
    if (!endTime || isPaused) {
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const timeLeft = Math.round((endTime - now) / 1000);

      if (timeLeft <= 0) {
        setRemaining(0);
        clearInterval(interval);
        onTimeUp();
      } else {
        setRemaining(timeLeft);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [endTime, onTimeUp, isPaused]);

  const progressValue = (remaining / duration) * 100;

  return (
    <div className="w-full px-6 pb-4">
      <div className="flex items-center gap-4 w-full">
        <Clock className="h-6 w-6 text-muted-foreground" />
        <div className="w-full">
          <Progress value={progressValue} className="h-3" />
        </div>
        <span className="text-lg font-semibold w-12 text-right">{remaining}s</span>
      </div>
    </div>
  );
}