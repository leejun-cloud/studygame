"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { submitQuestion } from "@/app/actions/collaborative";
import { MadeWithDyad } from "@/components/made-with-dyad";

const emptyQuestion = {
  questionText: "",
  options: ["", "", "", ""],
  correctAnswerIndex: 0,
};

export default function StudentQuestionSubmitPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;
  const studentName = searchParams.get("name") || "익명";

  const [question, setQuestion] = useState(emptyQuestion);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuestionChange = (field: string, value: any) => {
    setQuestion(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    setQuestion(prev => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.questionText.trim() || question.options.some(o => !o.trim())) {
      toast.error("질문과 모든 선택지를 입력해주세요.");
      return;
    }
    setIsSubmitting(true);
    const result = await submitQuestion(sessionId, studentName, question);
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("문제가 성공적으로 제출되었습니다! 계속해서 다른 문제를 만들 수 있습니다.");
      setQuestion(emptyQuestion);
    }
  };

  return (
    <>
      <Toaster />
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
        <main className="w-full max-w-2xl">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>문제 만들기</CardTitle>
                <CardDescription>
                  {studentName}님, 배운 내용을 바탕으로 퀴즈 문제를 만들어보세요!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="question-text">질문</Label>
                  <Textarea
                    id="question-text"
                    placeholder="질문 내용을 입력하세요."
                    value={question.questionText}
                    onChange={(e) => handleQuestionChange('questionText', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>선택지 (정답을 선택해주세요)</Label>
                  <RadioGroup
                    value={String(question.correctAnswerIndex)}
                    onValueChange={(value) => handleQuestionChange('correctAnswerIndex', parseInt(value))}
                    className="space-y-2"
                  >
                    {question.options.map((opt, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <RadioGroupItem value={String(index)} id={`option-${index}`} />
                        <Input
                          placeholder={`선택지 ${index + 1}`}
                          value={opt}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          required
                        />
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  문제 제출하기
                </Button>
              </CardFooter>
            </form>
          </Card>
        </main>
        <MadeWithDyad />
      </div>
    </>
  );
}