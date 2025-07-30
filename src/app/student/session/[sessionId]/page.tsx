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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, XCircle, Trophy, Zap, Star, Target, Clock } from "lucide-react";
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
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

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
          setSession((prevSession) => {
            // Reset answer state for new question
            if (newSession.current_question_index !== prevSession?.current_question_index) {
              setHasAnswered(false);
              setSelectedOption(null);
              setIsTimeUp(false);
              setShowFeedback(false);
            }
            return newSession;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, participantId, router]);

  const currentQuestion = useMemo(() => {
    if (!quiz || session?.current_question_index === -1) return null;
    return quiz.questions[session.current_question_index];
  }, [quiz, session?.current_question_index]);

  const progress = useMemo(() => {
    if (!quiz || !session) return 0;
    return ((session.current_question_index + 1) / quiz.questions.length) * 100;
  }, [quiz, session]);

  const handleTimeUp = () => {
    setIsTimeUp(true);
    if (!hasAnswered) {
      setHasAnswered(true);
      setStreak(0);
    }
  };

  const handleAnswer = async (optionIndex: number) => {
    if (hasAnswered || isTimeUp || !currentQuestion || !participantId || !session) return;

    setHasAnswered(true);
    setSelectedOption(optionIndex);
    setShowFeedback(true);

    const isCorrect = optionIndex === currentQuestion.correctAnswerIndex;
    const points = isCorrect ? 100 : 0;

    if (isCorrect) {
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    await submitAnswer(
      participantId,
      session.current_question_index,
      optionIndex,
      isCorrect,
      points
    );
  };

  if (loading || !session || !quiz) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">게임 로딩 중...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (session.status) {
      case "waiting":
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  게임 대기실
                </CardTitle>
                <CardDescription className="text-base">
                  선생님이 게임을 시작할 때까지 잠시만 기다려주세요!
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 mb-6">
                  <p className="text-lg font-bold text-gray-800">{name}님, 환영합니다! 🎉</p>
                </div>
                <div className="flex justify-center">
                  <div className="animate-bounce">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">곧 재미있는 퀴즈가 시작됩니다!</p>
              </CardContent>
            </Card>
          </div>
        );

      case "in_progress":
      case "question_result":
        if (!currentQuestion) {
          return <Loader2 className="h-8 w-8 animate-spin" />;
        }
        
        const isResultView = session.status === 'question_result';
        const isCorrect = selectedOption === currentQuestion.correctAnswerIndex;

        return (
          <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-4">
            {/* 상단 게임 상태 바 */}
            <div className="max-w-4xl mx-auto mb-6">
              <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="text-sm font-bold px-3 py-1">
                      문제 {session.current_question_index + 1}/{quiz.questions.length}
                    </Badge>
                    <div className="flex items-center gap-2 text-yellow-600">
                      <Star className="h-5 w-5 fill-current" />
                      <span className="font-bold">{score}점</span>
                    </div>
                    {streak > 0 && (
                      <div className="flex items-center gap-2 text-orange-600">
                        <Zap className="h-5 w-5 fill-current" />
                        <span className="font-bold">{streak}연속</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">{name}</p>
                  </div>
                </div>
                <Progress value={progress} className="h-3 bg-gray-200" />
              </div>
            </div>

            {/* 메인 게임 카드 */}
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur overflow-hidden">
                {session.status === 'in_progress' && (
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4">
                    <QuizTimer
                      startTime={session.question_started_at}
                      duration={30}
                      onTimeUp={handleTimeUp}
                      isPaused={hasAnswered}
                    />
                  </div>
                )}
                
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold">{session.current_question_index + 1}</span>
                    </div>
                    <div>
                      <CardTitle className="text-sm opacity-90">질문</CardTitle>
                      <p className="text-2xl font-bold leading-tight">{currentQuestion.questionText}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = selectedOption === index;
                      const isCorrectOption = currentQuestion.correctAnswerIndex === index;
                      const optionColors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
                      const optionLabels = ['A', 'B', 'C', 'D'];
                      
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          size="lg"
                          className={cn(
                            "h-auto min-h-[80px] p-6 text-left justify-start relative overflow-hidden transition-all duration-300 transform hover:scale-105",
                            "border-2 bg-white shadow-lg",
                            !isResultView && !hasAnswered && "hover:shadow-xl hover:border-gray-400",
                            isSelected && !isResultView && "border-blue-500 bg-blue-50 shadow-xl scale-105",
                            isResultView && isCorrectOption && "border-green-500 bg-green-50 shadow-xl animate-pulse",
                            isResultView && isSelected && !isCorrectOption && "border-red-500 bg-red-50",
                            hasAnswered && !isResultView && "opacity-75"
                          )}
                          onClick={() => handleAnswer(index)}
                          disabled={hasAnswered || isTimeUp || isResultView}
                        >
                          <div className="flex items-center gap-4 w-full">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg",
                              optionColors[index],
                              isResultView && isCorrectOption && "animate-bounce"
                            )}>
                              {optionLabels[index]}
                            </div>
                            <span className="text-lg font-medium flex-1">{option}</span>
                            {isResultView && isCorrectOption && (
                              <CheckCircle className="h-6 w-6 text-green-600 animate-bounce" />
                            )}
                            {isResultView && isSelected && !isCorrectOption && (
                              <XCircle className="h-6 w-6 text-red-600" />
                            )}
                          </div>
                        </Button>
                      );
                    })}
                  </div>

                  {showFeedback && isResultView && (
                    <div className="mt-8 text-center">
                      <div className={cn(
                        "inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-xl font-bold shadow-lg",
                        selectedOption === null ? "bg-gray-100 text-gray-700" :
                        isCorrect ? "bg-green-100 text-green-700 animate-pulse" : "bg-red-100 text-red-700"
                      )}>
                        {selectedOption === null ? (
                          <>
                            <Clock className="h-6 w-6" />
                            시간 초과! ⏰
                          </>
                        ) : isCorrect ? (
                          <>
                            <CheckCircle className="h-6 w-6" />
                            정답입니다! 🎉 (+100점)
                          </>
                        ) : (
                          <>
                            <XCircle className="h-6 w-6" />
                            아쉬워요! 다음 문제 화이팅! 💪
                          </>
                        )}
                      </div>
                      <p className="text-gray-600 mt-4 text-lg">다음 문제를 준비하고 있어요...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "finished":
        return (
          <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/90 backdrop-blur">
              <CardHeader className="text-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-t-lg p-8">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Trophy className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold mb-2">게임 완료! 🎉</CardTitle>
                <CardDescription className="text-white/90 text-lg">
                  {name}님, 정말 수고하셨어요!
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center p-8">
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="h-8 w-8 text-yellow-500 fill-current" />
                    <span className="text-3xl font-bold text-gray-800">{score}점</span>
                  </div>
                  <p className="text-gray-600">최종 점수</p>
                </div>
                
                <div className="space-y-3 mb-8">
                  <p className="text-lg text-gray-700">퀴즈가 모두 끝났습니다!</p>
                  <p className="text-gray-600">선생님이 결과를 공유해주실 거예요 📊</p>
                </div>

                <Button 
                  onClick={() => router.push('/')} 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  홈으로 돌아가기 🏠
                </Button>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return renderContent();
}