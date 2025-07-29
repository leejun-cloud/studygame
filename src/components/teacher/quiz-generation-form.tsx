"use client";

import { useState, useRef } from "react";
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
import { Loader2, Paperclip, X } from "lucide-react";

interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

interface QuizGenerationFormProps {
  onQuizGenerated: (quiz: { questions: QuizQuestion[] }, title: string) => void;
}

export function QuizGenerationForm({ onQuizGenerated }: QuizGenerationFormProps) {
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState("5");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      onQuizGenerated(data, title || "제목 없는 퀴즈");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
}