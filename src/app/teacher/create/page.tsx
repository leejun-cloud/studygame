"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Users, Wand2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { QuizGenerationForm } from "@/components/teacher/quiz-generation-form";
import { QuizPreview } from "@/components/teacher/quiz-preview";
import { QuizShareCard } from "@/components/quiz-share-card";
import { Button } from "@/components/ui/button";
import { QuizManualForm } from "@/components/teacher/quiz-manual-form";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createCollabSession } from "@/app/actions/collaborative";
import { toast } from "sonner";

interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

interface GeneratedQuiz {
  questions: QuizQuestion[];
}

function CollabQuizForm() {
    const [title, setTitle] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("퀴즈 주제를 입력해주세요.");
            return;
        }
        setIsLoading(true);
        const result = await createCollabSession(title);
        setIsLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else if (result.session) {
            toast.success("협업 세션이 생성되었습니다!");
            router.push(`/teacher/collaborative/${result.session.id}`);
        }
    };

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>학생들과 함께 퀴즈 만들기</CardTitle>
                    <CardDescription>
                        퀴즈 주제를 정하고 세션을 만들어 학생들을 초대하세요. 학생들이 직접 문제를 출제합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="collab-title">퀴즈 주제</Label>
                        <Input
                            id="collab-title"
                            placeholder="예: 조선시대 왕들의 업적"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
                        세션 만들고 시작하기
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}

export default function CreateQuizPage() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") || "ai";
  const [mode, setMode] = useState<"ai" | "manual" | "collaborative">(initialMode as any);
  
  const [step, setStep] = useState<"generate" | "preview" | "share">("generate");
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null);
  const [quizTitle, setQuizTitle] = useState<string>("");
  const [savedQuizId, setSavedQuizId] = useState<string | null>(null);

  const handleQuizGenerated = (quiz: GeneratedQuiz, title: string) => {
    setGeneratedQuiz(quiz);
    setQuizTitle(title);
    setStep("preview");
  };

  const handleQuizSaved = (quizId: string, title: string) => {
    setSavedQuizId(quizId);
    setQuizTitle(title);
    setStep("share");
  };

  const handleCreateAnotherQuiz = () => {
    setStep("generate");
    setGeneratedQuiz(null);
    setQuizTitle("");
    setSavedQuizId(null);
  };

  const renderContent = () => {
    if (step === "share" && savedQuizId) {
      return (
        <>
          <QuizShareCard quizId={savedQuizId} title={quizTitle} />
          <div className="mt-4 text-center">
            <Button variant="link" onClick={handleCreateAnotherQuiz}>
              다른 퀴즈 만들기
            </Button>
          </div>
        </>
      );
    }

    switch (mode) {
      case "ai":
        return (
          <>
            {step === "generate" && <QuizGenerationForm onQuizGenerated={handleQuizGenerated} />}
            {step === "preview" && generatedQuiz && (
              <QuizPreview
                quiz={generatedQuiz}
                title={quizTitle}
                onQuizSaved={(id) => handleQuizSaved(id, quizTitle)}
              />
            )}
          </>
        );
      case "manual":
        return <QuizManualForm onQuizSaved={handleQuizSaved} />;
      case "collaborative":
        return <CollabQuizForm />;
      default:
        return null;
    }
  };

  return (
    <>
      <Toaster />
      <div className="flex min-h-screen w-full flex-col items-center bg-muted/40 p-4 sm:p-8">
        <div className="w-full max-w-2xl">
          <div className="mb-4 flex justify-between items-center">
            <Link href="/teacher/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span>돌아가기</span>
            </Link>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
                <div className="flex justify-center gap-2">
                    <Button variant={mode === 'ai' ? 'default' : 'outline'} onClick={() => setMode('ai')}><Wand2 className="mr-2 h-4 w-4"/>AI로 만들기</Button>
                    <Button variant={mode === 'manual' ? 'default' : 'outline'} onClick={() => setMode('manual')}>직접 만들기</Button>
                    <Button variant={mode === 'collaborative' ? 'default' : 'outline'} onClick={() => setMode('collaborative')}><Users className="mr-2 h-4 w-4"/>학생들과 함께 만들기</Button>
                </div>
            </CardContent>
          </Card>

          {renderContent()}
        </div>
      </div>
    </>
  );
}