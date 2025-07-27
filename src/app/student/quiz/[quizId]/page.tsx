"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { getQuiz } from "@/app/actions/quiz";

interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

interface QuizData {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

interface PageProps {
  params: {
    quizId: string;
  };
}

function QuizFlow({ quizId }: { quizId: string }) {
  const searchParams = useSearchParams();
  const studentName = searchParams.get("name");

  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      setError(null);
      const result = await getQuiz(quizId);
      if (result.error || !result.quiz) {
        setError(result.error || "퀴즈를 불러올 수 없습니다.");
      } else {
        // @ts-ignore
        setQuizData(result.quiz);
      }
      setLoading(false);
    };

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null || !quizData) return;

    if (selectedAnswer === quizData.questions[currentQuestionIndex].correctAnswerIndex) {
      setScore(score + 1);
    }

    setSelectedAnswer(null);

    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResult(true);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">퀴즈를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
        <Card>
          <CardHeader>
            <CardTitle>오류</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "퀴즈를 불러올 수 없습니다. 링크가 올바른지 확인해주세요."}</p>
          </CardContent>
           <CardFooter className="flex justify-center">
              <Link href="/">
                  <Button variant="outline">홈으로 돌아가기</Button>
              </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center bg-muted/40 p-4 sm:p-8">
        <div className="w-full max-w-2xl">
          <Card>
            {!showResult ? (
              <>
                <CardHeader>
                  <CardTitle>{quizData.title}</CardTitle>
                  <CardDescription>
                    문제 {currentQuestionIndex + 1} / {quizData.questions.length}
                    {studentName && ` | 응시자: ${studentName}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-lg font-semibold">
                      {quizData.questions[currentQuestionIndex].questionText}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {quizData.questions[currentQuestionIndex].options.map((option, index) => (
                      <Button
                        key={index}
                        variant={selectedAnswer === index ? "default" : "outline"}
                        className="h-auto min-h-[4rem] w-full justify-start whitespace-normal text-left"
                        onClick={() => handleAnswerSelect(index)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleNextQuestion} disabled={selectedAnswer === null}>
                    {currentQuestionIndex === quizData.questions.length - 1 ? "결과 보기" : "다음 문제"}
                  </Button>
                </CardFooter>
              </>
            ) : (
              <>
                <CardHeader className="items-center">
                  <CardTitle>{studentName ? `${studentName}님의 ` : ''}퀴즈 결과</CardTitle>
                  <CardDescription>수고하셨습니다!</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-4xl font-bold">
                    {score} / {quizData.questions.length}
                  </p>
                  <p className="mt-2 text-muted-foreground">문제를 맞혔습니다.</p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/">
                        <Button>홈으로 돌아가기</Button>
                    </Link>
                </CardFooter>
              </>
            )}
          </Card>
        </div>
      </main>
      <MadeWithDyad />
    </div>
  );
}

export default function StudentQuizPage({ params }: PageProps) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <QuizFlow quizId={params.quizId} />
    </Suspense>
  );
}