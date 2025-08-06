"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import {
  startNextQuestion,
  finishQuizSession,
  showQuestionResult,
} from "@/app/actions/session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart, Loader2, Users, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { QuizTimer } from "@/components/quiz/timer";
import { BackgroundMusic } from "@/components/quiz/background-music";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis } from "recharts";
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
  join_code: string;
  status: "waiting" | "in_progress" | "question_result" | "finished";
  current_question_index: number;
  question_started_at: string | null;
}
interface Participant {
  id: string;
  name: string;
  score: number;
}
interface Answer {
  selected_option_index: number;
}

export default function QuizHostDashboard() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: sessionData, error: sessionError } = await supabase
        .from("quiz_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (sessionError || !sessionData) {
        toast.error("퀴즈 세션을 찾을 수 없습니다.");
        router.push("/");
        return;
      }
      setSession(sessionData);

      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", sessionData.quiz_id)
        .single();

      if (quizError || !quizData) {
        toast.error("퀴즈 정보를 불러오는 데 실패했습니다.");
        return;
      }
      setQuiz(quizData as Quiz);
      setLoading(false);
    };

    fetchInitialData();

    const sessionChannel = supabase
      .channel(`session:${sessionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "quiz_sessions", filter: `id=eq.${sessionId}` },
        (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => {
          setSession(payload.new as Session);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "session_participants", filter: `session_id=eq.${sessionId}` },
        (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => {
          setParticipants((prev) => [...prev, payload.new as Participant]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
    };
  }, [sessionId, router]);

  useEffect(() => {
    const fetchParticipantsAndAnswers = async () => {
      if (!session) return;

      const { data: participantsData } = await supabase
        .from("session_participants")
        .select("*")
        .eq("session_id", session.id);
      setParticipants(participantsData || []);

      if (session.status === "question_result" || session.status === "in_progress") {
        const { data: answersData } = await supabase
          .from("participant_answers")
          .select("selected_option_index")
          .in("session_participant_id", (participantsData || []).map((p: Participant) => p.id))
          .eq("question_index", session.current_question_index);
        setAnswers(answersData || []);
      } else {
        setAnswers([]);
      }
    };
    fetchParticipantsAndAnswers();
  }, [session, session?.status, session?.current_question_index]);

  const handleNext = async () => {
    if (!session || !quiz) return;
    const nextIndex = session.current_question_index + 1;
    if (nextIndex < quiz.questions.length) {
      await startNextQuestion(sessionId, nextIndex);
    }
  };

  const handleFinish = async () => {
    await finishQuizSession(sessionId);
  };

  const handleTimeUp = async () => {
    if (session?.status === "in_progress") {
      await showQuestionResult(sessionId);
    }
  };

  // 배경음악 재생 조건
  const shouldPlayMusic = session?.status === 'in_progress' || session?.status === 'question_result';

  if (loading || !session || !quiz) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currentQuestion = quiz.questions[session.current_question_index];
  const isLastQuestion = session.current_question_index >= quiz.questions.length - 1;
  const canStartNext = session.status === "waiting" || session.status === "question_result";

  const answerCounts = currentQuestion?.options.map((_, index) => ({
    option: `선택 ${index + 1}`,
    count: answers.filter(a => a.selected_option_index === index).length,
  }));

  return (
    <>
      {/* 배경음악 */}
      <BackgroundMusic isPlaying={shouldPlayMusic} volume={0.15} />
      
      <div className="flex h-screen bg-muted/40">
        <div className="flex-1 flex flex-col p-4 sm:p-8">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle>{quiz.title} 🎵</CardTitle>
              <CardDescription>
                {session.status === "waiting" && "학생들이 참여하기를 기다리는 중입니다."}
                {session.status === "in_progress" && `문제 ${session.current_question_index + 1} 진행 중`}
                {session.status === "question_result" && `문제 ${session.current_question_index + 1} 결과`}
                {session.status === "finished" && "퀴즈가 종료되었습니다."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              {session.status === "waiting" && (
                <div className="text-center">
                  <p className="text-lg">참여 코드</p>
                  <p className="text-6xl font-bold tracking-widest my-4">{session.join_code}</p>
                  <p className="text-muted-foreground">학생들에게 이 코드를 공유해주세요.</p>
                </div>
              )}
              {(session.status === "in_progress" || session.status === "question_result") && currentQuestion && (
                <div className="w-full max-w-2xl text-center">
                  <h2 className="text-2xl font-bold mb-6">{currentQuestion.questionText}</h2>
                  {session.status === "in_progress" && (
                    <p className="text-muted-foreground">{answers.length} / {participants.length} 명 답변 완료</p>
                  )}
                  {session.status === "question_result" && (
                    <div className="w-full">
                      <ChartContainer config={{}} className="mx-auto aspect-video max-h-[250px]">
                        <RechartsBarChart data={answerCounts} layout="vertical">
                          <XAxis type="number" hide />
                          <YAxis dataKey="option" type="category" tickLine={false} axisLine={false} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="var(--color-primary)" radius={4} />
                        </RechartsBarChart>
                      </ChartContainer>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        {currentQuestion.options.map((opt, i) => (
                          <div key={i} className={`p-2 rounded-md flex items-center gap-2 ${i === currentQuestion.correctAnswerIndex ? 'bg-green-100' : 'bg-red-100'}`}>
                            {i === currentQuestion.correctAnswerIndex ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {session.status === "finished" && (
                <div className="text-center">
                  <h2 className="text-3xl font-bold">퀴즈 종료! 🎉</h2>
                  <p className="text-muted-foreground mt-2">최종 점수는 결과 페이지에서 확인하세요.</p>
                  <Button onClick={() => router.push('/teacher/results')} className="mt-6">결과 페이지로 이동</Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col items-center gap-4">
              {session.status === "in_progress" && session.question_started_at && (
                <QuizTimer
                  startTime={session.question_started_at}
                  duration={30}
                  onTimeUp={handleTimeUp}
                />
              )}
              <div className="flex justify-end w-full gap-4">
                {isLastQuestion ? (
                  <Button onClick={handleFinish} disabled={session.status !== "question_result"}>퀴즈 종료</Button>
                ) : (
                  <Button onClick={handleNext} disabled={!canStartNext}>
                    {session.status === "waiting" ? "퀴즈 시작" : "다음 문제"}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
        <div className="w-64 bg-white border-l p-4 hidden md:block">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Users className="h-5 w-5" />
            참가자 ({participants.length})
          </h3>
          <ul className="space-y-2">
            {participants.map((p) => (
              <li key={p.id} className="text-sm">{p.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}