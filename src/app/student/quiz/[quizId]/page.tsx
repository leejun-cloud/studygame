"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

// 데이터베이스가 없으므로 임시 샘플 데이터 사용
const MOCK_QUIZ = {
  title: "샘플 퀴즈: 한국사",
  questions: [
    {
      questionText: "조선을 건국한 왕의 이름은 무엇인가요?",
      options: ["궁예", "왕건", "이성계", "세종대왕"],
      correctAnswerIndex: 2,
    },
    {
      questionText: "한글을 창제한 왕은 누구인가요?",
      options: ["태조", "광개토대왕", "장보고", "세종대왕"],
      correctAnswerIndex: 3,
    },
    {
      questionText: "임진왜란 당시 조선 수군을 이끈 장군은 누구인가요?",
      options: ["이순신", "권율", "김유신", "을지문덕"],
      correctAnswerIndex: 0,
    },
  ],
};

interface PageProps {
  params: {
    quizId: string;
  };
}

export default function StudentQuizPage({ params }: PageProps) {
  const { quizId } = params;
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState<typeof MOCK_QUIZ | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // 실제 앱에서는 quizId를 사용해 데이터베이스에서 퀴즈 데이터를 가져옵니다.
    // 지금은 샘플 데이터를 사용합니다.
    setLoading(true);
    setTimeout(() => {
      setQuizData(MOCK_QUIZ);
      setLoading(false);
    }, 500);
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

  if (!quizData) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
        <Card>
          <CardHeader>
            <CardTitle>오류</CardTitle>
          </CardHeader>
          <CardContent>
            <p>퀴즈를 불러올 수 없습니다. 링크가 올바른지 확인해주세요.</p>
          </CardContent>
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
                  <CardTitle>퀴즈 결과</CardTitle>
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