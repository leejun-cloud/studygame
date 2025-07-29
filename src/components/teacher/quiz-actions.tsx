"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createQuizSession } from "@/app/actions/session";
import { toast } from "sonner";
import { Loader2, Play } from "lucide-react";

interface QuizActionsProps {
  quizId: string;
}

export function QuizActions({ quizId }: QuizActionsProps) {
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();

  const handleStartLiveQuiz = async () => {
    setIsStarting(true);
    const result = await createQuizSession(quizId);
    if (result.error) {
      toast.error(result.error);
      setIsStarting(false);
    } else if (result.session) {
      router.push(`/teacher/session/${result.session.id}`);
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleStartLiveQuiz} disabled={isStarting} size="sm">
        {isStarting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Play className="mr-2 h-4 w-4" />
        )}
        실시간 시작
      </Button>
    </div>
  );
}