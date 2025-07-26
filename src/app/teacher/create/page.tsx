"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export default function CreateQuizPage() {
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quiz, setQuiz] = useState<{ questions: QuizQuestion[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!context) {
      setError("퀴즈를 생성할 내용을 입력해주세요.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setQuiz(null);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "알 수 없는 오류가 발생했습니다.");
      }

      setQuiz(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-muted/40 p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>홈으로 돌아가기</span>
          </Link>
        </div>
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>퀴즈 만들기</CardTitle>
              <CardDescription>
                퀴즈의 제목을 입력하고, 질문을 생성할 내용을 붙여넣거나 파일을 업로드하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="title">퀴즈 제목</Label>
                <Input
                  id="title"
                  placeholder="예: 중간고사 대비 수학 퀴즈"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="context">퀴즈 내용</Label>
                <Textarea
                  id="context"
                  placeholder="여기에 교과서 내용, 강의 노트, 또는 관련 자료를 붙여넣으세요..."
                  className="min-h-[200px]"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file">파일 업로드 (PDF, PPT, Word 등)</Label>
                <Input id="file" type="file" disabled={isLoading} />
                <p className="text-xs text-muted-foreground">파일 분석 기능은 현재 개발 중입니다. 우선 퀴즈 내용을 직접 붙여넣어 사용해주세요.</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-end gap-4">
              {error && <p className="text-sm text-red-500 self-start px-1">{error}</p>}
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "퀴즈 생성 중..." : "AI로 퀴즈 생성하기"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {quiz && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{title || "생성된 퀴즈"}</CardTitle>
              <CardDescription>AI가 생성한 퀴즈입니다. 내용을 확인하고 저장하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {quiz.questions.map((q, index) => (
                <div key={index} className="border-t pt-4">
                  <p className="font-semibold">{index + 1}. {q.questionText}</p>
                  <ul className="mt-2 space-y-1 list-inside">
                    {q.options.map((option, i) => (
                      <li key={i} className={`${i === q.correctAnswerIndex ? 'font-bold text-green-600' : ''}`}>
                        - {option}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
             <CardFooter className="flex justify-end">
                <Button>퀴즈 저장하기</Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}