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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Paperclip, X } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import { QuizShareCard } from "@/components/quiz-share-card";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { saveQuiz } from "@/app/actions/quiz";

interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export default function CreateQuizPage() {
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState("5");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [quiz, setQuiz] = useState<{ questions: QuizQuestion[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedQuizId, setSavedQuizId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setContext("");
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !context) {
      setError("퀴즈를 생성할 내용이나 파일을 업로드해주세요.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setQuiz(null);
    setSavedQuizId(null);

    try {
      let response;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("numQuestions", numQuestions);
        response = await fetch("/api/generate-quiz", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("/api/generate-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ context, numQuestions: parseInt(numQuestions) }),
        });
      }

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

  const handleSaveQuiz = async () => {
    if (!quiz) return;
    setIsSaving(true);
    setSavedQuizId(null);

    const result = await saveQuiz({
      title: title || "제목 없는 퀴즈",
      questions: quiz.questions,
    });

    setIsSaving(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.id) {
      setSavedQuizId(result.id);
      toast.success("퀴즈가 성공적으로 저장되었습니다!");
    }
  };

  return (
    <>
      <Toaster />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <Label htmlFor="num-questions">문제 개수</Label>
                    <Select value={numQuestions} onValueChange={setNumQuestions}>
                      <SelectTrigger id="num-questions">
                        <SelectValue placeholder="문제 개수를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3개</SelectItem>
                        <SelectItem value="5">5개</SelectItem>
                        <SelectItem value="10">10개</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="context">퀴즈 내용</Label>
                  <Textarea
                    id="context"
                    placeholder="여기에 내용을 붙여넣거나, 아래에서 파일을 업로드하세요."
                    className="min-h-[200px]"
                    value={context}
                    onChange={(e) => {
                      setContext(e.target.value);
                      if (file) handleRemoveFile();
                    }}
                    disabled={!!file || isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="file">파일 업로드 (PDF, DOCX, TXT)</Label>
                  <Input
                    id="file"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={isLoading}
                    accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  />
                  {file && (
                    <div className="mt-2 flex items-center justify-between rounded-lg border bg-muted/50 p-2 text-sm">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Paperclip className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate" title={file.name}>{file.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={handleRemoveFile} disabled={isLoading}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-end gap-4">
                {error && <p className="text-sm text-red-500 self-start px-1">{error}</p>}
                <Button type="submit" disabled={isLoading || (!context && !file)}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "퀴즈 생성 중..." : "AI로 퀴즈 생성하기"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {quiz && !savedQuizId && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>{title || "생성된 퀴즈"}</CardTitle>
                <CardDescription>AI가 생성한 퀴즈입니다. 내용을 확인하고 저장하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {quiz.questions.map((q, index) => (
                  <div key={index} className="border-t pt-4 first:border-t-0 first:pt-0">
                    <p className="font-semibold">{index + 1}. {q.questionText}</p>
                    <ul className="mt-2 space-y-1 list-inside">
                      {q.options.map((option, i) => (
                        <li key={i} className={`pl-2 ${i === q.correctAnswerIndex ? 'font-bold text-green-600' : ''}`}>
                          - {option}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex justify-end">
                  <Button onClick={handleSaveQuiz} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    퀴즈 저장하기
                  </Button>
              </CardFooter>
            </Card>
          )}

          {savedQuizId && (
            <QuizShareCard quizId={savedQuizId} title={title || "생성된 퀴즈"} />
          )}
        </div>
      </div>
    </>
  );
}