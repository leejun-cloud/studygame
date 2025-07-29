"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createQuizSession } from "@/app/actions/session";
import { toast } from "sonner";
import { Loader2, Play } from "lucide-react";
import { LiveSessionShareDialog } from "./live-session-share-dialog";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const handleStartLiveQuiz = async () => {
    setIsStarting(true);
    const result = await createQuizSession(quizId);
    setIsStarting(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.session) {
      setSessionData(result.session);
      setIsDialogOpen(true);
    }
  };

  const handleNavigateToSession = (sessionId: string) => {
    setIsDialogOpen(false);
    router.push(`/teacher/session/${sessionId}`);
  };

  return (
    <>
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
      <LiveSessionShareDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        session={sessionData}
        onNavigate={handleNavigateToSession}
      />
    </>
  );
}