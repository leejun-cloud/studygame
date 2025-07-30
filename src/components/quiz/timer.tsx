"use client";

import { useEffect, useState, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

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
    }, 100);

    return () => clearInterval(interval);
  }, [endTime, onTimeUp, isPaused]);

  const progressValue = (remaining / duration) * 100;
  const isUrgent = remaining <= 10;
  const isCritical = remaining <= 5;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-full transition-all duration-300",
            isCritical ? "bg-red-500 animate-pulse" : 
            isUrgent ? "bg-orange-500" : "bg-white/20"
          )}>
            {isCritical ? (
              <Zap className="h-5 w-5 text-white animate-bounce" />
            ) : (
              <Clock className="h-5 w-5 text-white" />
            )}
          </div>
          <span className="text-white font-medium">
            {isCritical ? "서둘러요!" : isUrgent ? "시간이 얼마 없어요!" : "시간"}
          </span>
        </div>
        <div className={cn(
          "text-2xl font-bold text-white transition-all duration-300",
          isCritical && "animate-pulse text-3xl",
          isUrgent && "text-yellow-200"
        )}>
          {remaining}초
        </div>
      </div>
      
      <div className="relative">
        <Progress 
          value={progressValue} 
          className={cn(
            "h-4 bg-white/20 transition-all duration-300",
            isCritical && "animate-pulse"
          )}
        />
        <div className={cn(
          "absolute inset-0 rounded-full transition-all duration-300",
          isCritical ? "bg-gradient-to-r from-red-400 to-red-600 animate-pulse" :
          isUrgent ? "bg-gradient-to-r from-orange-400 to-red-500" :
          "bg-gradient-to-r from-green-400 to-blue-500"
        )} 
        style={{ width: `${progressValue}%` }} 
        />
      </div>
      
      {isCritical && (
        <div className="text-center mt-2">
          <span className="text-white text-sm font-medium animate-bounce">
            ⚡ 빨리 선택하세요! ⚡
          </span>
        </div>
      )}
    </div>
  );
}