"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createQuizSession } from "@/app/actions/session";
import { toast } from "sonner";
import { Loader2, Play, Share2 } from "lucide-react";
import { LiveSessionShareDialog } from "./live-session-share-dialog";
import { QuizShareDialog } from "./quiz-share-dialog";

interface QuizActionsProps {
  quizId: string;
}

interface SessionData {
  id: string;
  join_code: string;
}

export function QuizActions({ quizId }: QuizActionsProps) {
  const [isStarting, setIsStarting] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLiveShareOpen, setIsLiveShareOpen] = useState(false);
  const [isQuizShareOpen, setIsQuizShareOpen] = useState(false);
  const router = useRouter();

  const handleStartLiveQuiz = async () => {
    setIsStarting(true);
    const result = await createQuizSession(quizId);
    setIsStarting(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.session) {
      setSessionData(result.session);
      setIsLiveShareOpen(true);
    }
  };

  const handleNavigateToSession = (sessionId: string) => {
    setIsLiveShareOpen(false);
    router.push(`/teacher/session/${sessionId}`);
  };

  return (
    <>
      <div className="flex w-full justify-between items-center">
        <Button onClick={handleStartLiveQuiz} disabled={isStarting} size="sm">
          {isStarting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          실시간 시작
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setIsQuizShareOpen(true)}>
          <Share2 className="h-4 w-4" />
          <span className="sr-only">퀴즈 공유</span>
        </Button>
      </div>
      <LiveSessionShareDialog
        isOpen={isLiveShareOpen}
        onOpenChange={setIsLiveShareOpen}
        session={sessionData}
        onNavigate={handleNavigateToSession}
      />
      <QuizShareDialog
        isOpen={isQuizShareOpen}
        onOpenChange={setIsQuizShareOpen}
        quizId={quizId}
      />
    </>
  );
}