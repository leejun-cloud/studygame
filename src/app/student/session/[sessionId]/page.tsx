"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { submitAnswer } from "@/app/actions/session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, Trophy } from "lucide-react";
import { QuizTimer } from "@/components/quiz/timer";
import { cn } from "@/lib/utils";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

// Data types
interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}
interface Question {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}
interface Session {
  id: string;
  quiz_id: string;
  status: "waiting" | "in_progress" | "question_result" | "finished";
  current_question_index: number;
  question_started_at: string | null;
}

export default function StudentQuizPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = params.sessionId as string;
  const name = searchParams.get("name");
  const participantId = searchParams.get("participantId");

  const [session, setSession] = useState<Session | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    if (!participantId) {
      router.push("/student/join");
      return;
    }

    const fetchInitialData = async () => {
      const { data: sessionData, error: sessionError } = await supabase
        .from("quiz_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (sessionError || !sessionData) {
        router.push("/student/join");
        return;
      }
      setSession(sessionData);

      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("id, title, questions")
        .eq("id", sessionData.quiz_id)
        .single();

      if (quizError || !quizData) {
        return;
      }
      setQuiz(quizData as Quiz);
      setLoading(false);
    };

    fetchInitialData();

    const channel = supabase
      .channel(`session-student:${sessionId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "quiz_sessions", filter: `id=eq.${sessionId}` },
        (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => {
          const newSession = payload.new as Session;
          // Reset answer state for new question
          if (newSession.current_question_index !== session?.current_question_index) {
            setHasAnswered(false);
            setSelectedOption(null);
            setIsTimeUp(false);
          }
          setSession(newSession);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, participantId, router, session?.current_question_index]);

  const currentQuestion = useMemo(() => {
    if (!quiz || session?.current_question_index === -1) return null;
    return quiz.questions[session.current_question_index];
  }, [quiz, session?.current_question_index]);

  const handleTimeUp = () => {
    setIsTimeUp(true);
    if (!hasAnswered) {
      // If time is up and user hasn't answered, they can no longer answer.
      setHasAnswered(true); 
    }
  };

  const handleAnswer = async (optionIndex: number) => {
    if (hasAnswered || isTimeUp || !currentQuestion || !participantId || !session) return;

    setHasAnswered(true);
    setSelectedOption(optionIndex);

    const isCorrect = optionIndex === currentQuestion.correctAnswerIndex;
    // Simple scoring: 100 points for correct answer
    const score = isCorrect ? 100 : 0;

    await submitAnswer(
      participantId,
      session!.current_question_index,
      optionIndex,
      isCorrect,
      score
    );
  };

  if (loading || !session || !quiz) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const renderContent = () => {
    switch (session.status) {
      case "waiting":
        return (
          <Card>
            <CardHeader>
              <CardTitle>퀴즈 대기 중</CardTitle>
              <CardDescription>선생님이 퀴즈를 시작할 때까지 잠시만 기다려주세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{name}님, 환영합니다!</p>
              <Loader2 className="mx-auto mt-6 h-6 w-6 animate-spin" />
            </CardContent>
          </Card>
        );

      case "in_progress":
      case "question_result":
        if (!currentQuestion) {
          return <Loader2 className="h-8 w-8 animate-spin" />;
        }
        
        const isResultView = session.status === 'question_result';
        const isCorrect = selectedOption === currentQuestion.correctAnswerIndex;

        return (
          <Card className="w-full">
            {session.status === 'in_progress' && (
              <QuizTimer
                startTime={session.question_started_at}
                duration={30}
                onTimeUp={handleTimeUp}
                isPaused={hasAnswered}
              />
            )}
            <CardHeader>
              <CardTitle>문제 {session.current_question_index + 1}</CardTitle>
              <p className="text-xl font-semibold pt-4">{currentQuestion.questionText}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrectOption = currentQuestion.correctAnswerIndex === index;
                
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="lg"
                    className={cn(
                      "w-full justify-start h-auto py-4 text-left whitespace-normal",
                      isResultView && isCorrectOption && "bg-green-100 border-green-300 text-green-900 hover:bg-green-200",
                      isResultView && isSelected && !isCorrectOption && "bg-red-100 border-red-300 text-red-900 hover:bg-red-200",
                      isSelected && !isResultView && "bg-blue-100 border-blue-300"
                    )}
                    onClick={() => handleAnswer(index)}
                    disabled={hasAnswered || isTimeUp || isResultView}
                  >
                    {option}
                  </Button>
                );
              })}
              {isResultView && (
                <div className="mt-6 text-center p-4 rounded-lg bg-muted">
                  {selectedOption === null ? (
                    <p className="font-bold text-lg">시간 초과!</p>
                  ) : isCorrect ? (
                    <p className="font-bold text-lg text-green-600 flex items-center justify-center gap-2"><CheckCircle/> 정답입니다!</p>
                  ) : (
                    <p className="font-bold text-lg text-red-600 flex items-center justify-center gap-2"><XCircle/> 오답입니다.</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">다음 문제를 기다려주세요.</p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "finished":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Trophy className="text-yellow-500" />
                퀴즈 종료!
              </CardTitle>
              <CardDescription>수고하셨습니다. 최종 결과는 선생님이 공유해주실 거예요.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p>퀴즈가 모두 끝났습니다. 참여해주셔서 감사합니다!</p>
              <Button onClick={() => router.push('/')} className="mt-6">홈으로 돌아가기</Button>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-2xl">
        {renderContent()}
      </div>
    </div>
  );
}