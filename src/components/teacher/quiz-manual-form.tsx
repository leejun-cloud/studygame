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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { saveQuiz } from "@/app/actions/quiz";

interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

interface QuizManualFormProps {
  onQuizSaved: (quizId: string, title: string) => void;
}

const emptyQuestion: QuizQuestion = {
  questionText: "",
  options: ["", "", "", ""],
  correctAnswerIndex: 0,
};

export function QuizManualForm({ onQuizSaved }: QuizManualFormProps) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { ...emptyQuestion },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index].questionText = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (qIndex: number, oIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswerIndex = oIndex;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { ...emptyQuestion, options: ["", "", "", ""] }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
        toast.error("퀴즈에는 최소 1개의 질문이 필요합니다.");
        return;
    }
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("퀴즈 제목을 입력해주세요.");
      return;
    }
    if (questions.some(q => !q.questionText.trim() || q.options.some(o => !o.trim()))) {
      toast.error("모든 질문과 선택지를 입력해주세요.");
      return;
    }

    setIsSaving(true);
    const result = await saveQuiz({ title, questions });
    setIsSaving(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.id) {
      toast.success("퀴즈가 성공적으로 저장되었습니다!");
      onQuizSaved(result.id, title);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>퀴즈 직접 만들기</CardTitle>
        <CardDescription>
          퀴즈의 제목, 질문, 선택지를 직접 입력하여 퀴즈를 완성하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="quiz-title">퀴즈 제목</Label>
          <Input
            id="quiz-title"
            placeholder="예: 2024년 1학기 기말고사"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="space-y-4 rounded-lg border p-4 relative">
            <Label>질문 {qIndex + 1}</Label>
            <Textarea
              placeholder="질문 내용을 입력하세요."
              value={q.questionText}
              onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
            />
            <RadioGroup
              value={String(q.correctAnswerIndex)}
              onValueChange={(value) => handleCorrectAnswerChange(qIndex, parseInt(value))}
              className="space-y-2"
            >
              {q.options.map((opt, oIndex) => (
                <div key={oIndex} className="flex items-center gap-2">
                  <RadioGroupItem value={String(oIndex)} id={`q${qIndex}-o${oIndex}`} />
                  <Input
                    placeholder={`선택지 ${oIndex + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                  />
                </div>
              ))}
            </RadioGroup>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => removeQuestion(qIndex)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" onClick={addQuestion}>
          <PlusCircle className="mr-2 h-4 w-4" />
          질문 추가
        </Button>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          퀴즈 저장하기
        </Button>
      </CardFooter>
    </Card>
  );
}