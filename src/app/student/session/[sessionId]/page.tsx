"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { getQuiz } from "@/app/actions/quiz";
import { submitAnswer } from "@/app/actions/session";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

// 데이터 타입 정의
interface Session { status: string; current_question_index: number; quiz_id: string; }
interface Quiz { title: string; questions: any[]; }

function StudentSessionFlow({ sessionId }: { sessionId: string }) {
  const searchParams = useSearchParams();
  const studentName = searchParams.get("name");
  const participantId = searchParams.get("participantId");

  const [session, setSession] = useState<Session | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittedAnswer, setSubmittedAnswer] = useState<{ questionIndex: number; optionIndex: number; isCorrect?: boolean } | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    if (!participantId) { setError("참가자 정보가 없습니다."); setLoading(false); return; }
    async function fetchInitialData() {
      const { data: sessionData, error: sessionError } = await supabase.from("quiz_sessions").select("status, current_question_index, quiz_id").eq("id", sessionId).single();
      if (sessionError || !sessionData) { setError("세션을 찾을 수 없습니다."); setLoading(false); return; }
      setSession(sessionData);

      const { quiz: quizData, error: quizError } = await getQuiz(sessionData.quiz_id);
      if (quizError || !quizData) { setError("퀴즈 정보를 불러오는 데 실패했습니다."); } else { setQuiz(quizData as Quiz); }
      
      setLoading(false);
    }
    fetchInitialData();
  }, [sessionId, participantId]);

  // 실시간 구독
  useEffect(() => {
    const channel = supabase.channel(`session-updates-${sessionId}`)
      .on("postgres_changes", { event: 'UPDATE', schema: 'public', table: 'quiz_sessions', filter: `id=eq.${sessionId}` }, (payload) => {
        const newSession = payload.new as Session;
        setSession(newSession);
        // 새 문제가 시작되면 답변 상태 초기화
        if (newSession.status === 'active' && newSession.current_question_index !== submittedAnswer?.questionIndex) {
          setSubmittedAnswer(null);
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId, submittedAnswer]);

  const handleAnswerSubmit = async (optionIndex: number) => {
    if (!participantId || !session || submittedAnswer) return;
    
    const questionIndex = session.current_question_index;
    setSubmittedAnswer({ questionIndex, optionIndex });

    const result = await submitAnswer(participantId, sessionId, questionIndex, optionIndex);
    if (result.error) {
      toast.error(result.error);
      setSubmittedAnswer(null); // 실패 시 다시 시도 가능하도록
    } else {
      setSubmittedAnswer({ questionIndex, optionIndex, isCorrect: result.isCorrect });
    }
  };

  if (loading) return <Loader2 className="h-8 w-8 animate-spin" />;
  if (error || !session || !quiz) return <p className="text-red-500">{error || "데이터를 불러올 수 없습니다."}</p>;

  const currentQuestion = quiz.questions[session.current_question_index];

  const renderContent = () => {
    switch (session.status) {
      case 'waiting':
        return (
          <Card className="w-full max-w-md text-center">
            <CardHeader><CardTitle>퀴즈 대기실</CardTitle></CardHeader>
            <CardContent>
              <p className="text-lg">환영합니다, <span className="font-bold">{studentName}</span>님!</p>
              <p className="mt-4 text-muted-foreground">선생님이 퀴즈를 시작할 때까지 잠시만 기다려주세요.</p>
              <Loader2 className="mx-auto mt-6 h-6 w-6 animate-spin" />
            </CardContent>
          </Card>
        );
      case 'active':
        if (!currentQuestion) return <p>문제를 불러오는 중...</p>;
        if (submittedAnswer) {
          return (
            <Card className="w-full max-w-md text-center">
              <CardHeader>
                {submittedAnswer.isCorrect === true && <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />}
                {submittedAnswer.isCorrect === false && <XCircle className="mx-auto h-12 w-12 text-red-500" />}
                <CardTitle>{submittedAnswer.isCorrect === undefined ? "답변 제출 완료!" : (submittedAnswer.isCorrect ? "정답입니다!" : "오답입니다")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">다른 친구들이 답변할 때까지 기다려주세요.</p>
                <Loader2 className="mx-auto mt-6 h-6 w-6 animate-spin" />
              </CardContent>
            </Card>
          );
        }
        return (
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>{quiz.title}</CardTitle>
              <CardDescription>문제 {session.current_question_index + 1} / {quiz.questions.length}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-xl font-semibold">{currentQuestion.questionText}</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {currentQuestion.options.map((option: string, index: number) => (
                  <Button key={index} variant="outline" className="h-auto min-h-[4rem] w-full justify-start whitespace-normal text-left" onClick={() => handleAnswerSubmit(index)}>
                    {index + 1}. {option}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'leaderboard':
        return (
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <Trophy className="mx-auto h-12 w-12 text-yellow-400" />
                    <CardTitle>순위 발표</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">선생님이 순위를 공개하고 있습니다. 잠시만 기다려주세요!</p>
                    <Loader2 className="mx-auto mt-6 h-6 w-6 animate-spin" />
                </CardContent>
            </Card>
        );
      case 'finished':
        return (
          <Card className="w-full max-w-md text-center">
            <CardHeader><CardTitle>퀴즈 종료!</CardTitle></CardHeader>
            <CardContent>
              <p>수고하셨습니다! 최종 결과는 선생님 화면에서 확인해주세요.</p>
              <Button asChild className="mt-6"><Link href="/">홈으로 돌아가기</Link></Button>
            </CardContent>
          </Card>
        );
      default:
        return <p>알 수 없는 게임 상태입니다.</p>;
    }
  };

  return renderContent();
}

export default function StudentSessionPage({ params }: PageProps) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
      <Toaster />
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
        <StudentSessionFlow sessionId={params.sessionId} />
      </Suspense>
    </div>
  );
}