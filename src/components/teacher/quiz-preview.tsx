"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveQuiz } from "@/app/actions/quiz";

interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

interface QuizPreviewProps {
  quiz: { questions: QuizQuestion[] };
  title: string;
  onQuizSaved: (quizId: string) => void;
}

export function QuizPreview({ quiz, title, onQuizSaved }: QuizPreviewProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveQuiz = async () => {
    if (!quiz) return;
    setIsSaving(true);

    const result = await saveQuiz({
      title: title || "제목 없는 퀴즈",
      questions: quiz.questions,
    });

    setIsSaving(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.id) {
      toast.success("퀴즈가 성공적으로 저장되었습니다!");
      onQuizSaved(result.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || "생성된 퀴즈"}</CardTitle>
        <CardDescription>AI가 생성한 퀴즈입니다. 내용을 확인하고 저장하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {quiz.questions.map((q, index) => (
          <div key={index} className="border-t pt-4 first:border-t-0 first:pt-0">
            <p className="font-semibold">{index + 1}. {q.questionText}</p>
            <ul className="mt-2 space-y-1 list-none">
              {q.options.map((option, i) => (
                <li key={i} className={`pl-4 ${i === q.correctAnswerIndex ? 'font-bold text-green-600' : ''}`}>
                  {i + 1}. {option}
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
  );
}