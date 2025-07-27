"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Crown, BarChart2 } from "lucide-react";
import Link from "next/link";
import { getQuiz } from "@/app/actions/quiz";
import { startGame, showNextQuestion, showLeaderboard } from "@/app/actions/session";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

// 데이터 타입 정의
interface Participant { id: string; name: string; score: number; }
interface Session { id: string; join_code: string; status: string; current_question_index: number; quiz_id: string; }
interface Quiz { id: string; title: string; questions: any[]; }
interface Answer { session_participant_id: string; is_correct: boolean; }

interface PageProps { params: { sessionId: string; }; }

export default function TeacherSessionPage({ params }: PageProps) {
  const { sessionId } = params;
  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 초기 로드
  useEffect(() => {
    async function fetchInitialData() {
      const { data: sessionData, error: sessionError } = await supabase.from("quiz_sessions").select("*").eq("id", sessionId).single();
      if (sessionError || !sessionData) { setError("세션을 찾을 수 없습니다."); setLoading(false); return; }
      setSession(sessionData);

      const { data: participantsData, error: participantsError } = await supabase.from("session_participants").select("*").eq("session_id", sessionId);
      if (participantsError) { setError("참가자 정보를 불러오는 데 실패했습니다."); } else { setParticipants(participantsData || []); }

      const { quiz: quizData, error: quizError } = await getQuiz(sessionData.quiz_id);
      if (quizError || !quizData) { setError("퀴즈 정보를 불러오는 데 실패했습니다."); } else { setQuiz(quizData as Quiz); }
      
      setLoading(false);
    }
    fetchInitialData();
  }, [sessionId]);

  // 실시간 구독 설정
  useEffect(() => {
    const participantsChannel = supabase.channel(`session-participants-${sessionId}`)
      .on("postgres_changes", { event: '*', schema: 'public', table: 'session_participants', filter: `session_id=eq.${sessionId}` }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setParticipants((prev) => [...prev, payload.new as Participant]);
          }
          if (payload.eventType === 'UPDATE') {
            setParticipants((prev) => prev.map(p => p.id === payload.new.id ? payload.new as Participant : p));
          }
      }).subscribe();

    const sessionChannel = supabase.channel(`session-status-${sessionId}`)
      .on("postgres_changes", { event: 'UPDATE', schema: 'public', table: 'quiz_sessions', filter: `id=eq.${sessionId}` }, (payload) => {
        setSession(payload.new as Session);
      }).subscribe();
    
    const answersChannel = supabase.channel(`session-answers-${sessionId}`)
      .on("postgres_changes", { event: 'INSERT', schema: 'public', table: 'participant_answers' }, (payload) => {
          // This requires a join or another query to filter by session_id, so we'll fetch on demand instead.
      }).subscribe();

    return () => {
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(answersChannel);
    };
  }, [sessionId]);

  // 액션 핸들러
  const handleStartGame = async () => {
    const { error } = await startGame(sessionId);
    if (error) toast.error(error);
  };

  const handleShowLeaderboard = async () => {
    const { error } = await showLeaderboard(sessionId);
    if (error) toast.error(error);
  };

  const handleNextQuestion = async () => {
    const { error } = await showNextQuestion(sessionId);
    if (error) toast.error(error);
  };

  // 렌더링 로직
  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error || !session || !quiz) return <div className="flex h-screen items-center justify-center"><p>{error || "데이터를 불러올 수 없습니다."}</p></div>;

  const currentQuestion = quiz.questions[session.current_question_index];
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);

  const renderContent = () => {
    switch (session.status) {
      case 'waiting':
        return (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">퀴즈 로비</CardTitle>
              <CardDescription>학생들이 참여할 수 있도록 아래 코드를 공유하세요.</CardDescription>
              <div className="mx-auto my-4 rounded-lg border bg-background p-4">
                <p className="text-sm font-medium text-muted-foreground">게임 코드</p>
                <p className="text-5xl font-bold tracking-widest">{session.join_code}</p>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <h3 className="flex items-center text-lg font-semibold"><Users className="mr-2 h-5 w-5" />참가자 ({participants.length}명)</h3>
                <div className="mt-2 max-h-60 overflow-y-auto rounded-md border">
                  {participants.length > 0 ? <ul className="divide-y">{participants.map((p) => <li key={p.id} className="p-3">{p.name}</li>)}</ul> : <p className="p-4 text-center text-sm text-muted-foreground">아직 참가자가 없습니다.</p>}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border bg-background p-6">
                <p className="text-center text-muted-foreground">모든 학생이 참여하면 게임을 시작하세요.</p>
                <Button size="lg" disabled={participants.length === 0} onClick={handleStartGame}>게임 시작하기</Button>
              </div>
            </CardContent>
          </Card>
        );
      case 'active':
        return (
          <Card>
            <CardHeader>
              <CardTitle>{quiz.title}</CardTitle>
              <CardDescription>문제 {session.current_question_index + 1} / {quiz.questions.length}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <p className="text-2xl font-bold">{currentQuestion.questionText}</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {currentQuestion.options.map((opt: string, i: number) => (
                  <div key={i} className={`rounded-md border p-4 ${i === currentQuestion.correctAnswerIndex ? 'bg-green-100 border-green-400' : 'bg-muted/40'}`}>
                    {i + 1}. {opt}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">학생들이 답변 중입니다...</p>
                <Button onClick={handleShowLeaderboard}>리더보드 보기</Button>
            </CardFooter>
          </Card>
        );
      case 'leaderboard':
      case 'finished':
        return (
          <Card>
            <CardHeader className="items-center">
              <Crown className="h-10 w-10 text-yellow-400" />
              <CardTitle className="text-2xl">{session.status === 'finished' ? "최종 결과" : `문제 ${session.current_question_index + 1} 순위`}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {sortedParticipants.map((p, i) => (
                  <li key={p.id} className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg w-6 text-center">{i + 1}</span>
                      <span>{p.name}</span>
                    </div>
                    <span className="font-bold">{p.score}점</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="justify-end">
              {session.status === 'finished' ? (
                <Button asChild><Link href="/">홈으로 돌아가기</Link></Button>
              ) : (
                <Button onClick={handleNextQuestion}>다음 문제</Button>
              )}
            </CardFooter>
          </Card>
        );
      default:
        return <p>알 수 없는 게임 상태입니다.</p>;
    }
  };

  return (
    <>
      <Toaster />
      <div className="flex min-h-screen w-full flex-col items-center bg-muted/40 p-4 sm:p-8">
        <div className="w-full max-w-4xl">{renderContent()}</div>
      </div>
    </>
  );
}