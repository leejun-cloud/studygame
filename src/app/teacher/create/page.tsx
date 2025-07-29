"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { QuizGenerationForm } from "@/components/teacher/quiz-generation-form";
import { QuizPreview } from "@/components/teacher/quiz-preview";
import { QuizShareCard } from "@/components/quiz-share-card";
import { Button } from "@/components/ui/button";

interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

interface GeneratedQuiz {
  questions: QuizQuestion[];
}

export default function CreateQuizPage() {
  const [step, setStep] = useState<"generate" | "preview" | "share">("generate");
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null);
  const [quizTitle, setQuizTitle] = useState<string>("");
  const [savedQuizId, setSavedQuizId] = useState<string | null>(null);

  const handleQuizGenerated = (quiz: GeneratedQuiz, title: string) => {
    setGeneratedQuiz(quiz);
    setQuizTitle(title);
    setStep("preview");
  };

  const handleQuizSaved = (quizId: string) => {
    setSavedQuizId(quizId);
    setStep("share");
  };

  const handleCreateAnotherQuiz = () => {
    setStep("generate");
    setGeneratedQuiz(null);
    setQuizTitle("");
    setSavedQuizId(null);
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

          {step === "generate" && (
            <QuizGenerationForm onQuizGenerated={handleQuizGenerated} />
          )}

          {step === "preview" && generatedQuiz && (
            <QuizPreview
              quiz={generatedQuiz}
              title={quizTitle}
              onQuizSaved={handleQuizSaved}
            />
          )}

          {step === "share" && savedQuizId && (
            <>
              <QuizShareCard quizId={savedQuizId} title={quizTitle || "생성된 퀴즈"} />
              <div className="mt-4 text-center">
                <Button variant="link" onClick={handleCreateAnotherQuiz}>
                  다른 퀴즈 만들기
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}