"use client";

import { useState, useEffect } from "react";
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
import { Loader2, Edit, Trash2, PlusCircle, Save, XCircle, FileDown } from "lucide-react";
import { toast } from "sonner";
import { saveQuiz } from "@/app/actions/quiz";
import { generateQuizDocx } from "@/lib/docx-generator";

interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

interface QuizPreviewProps {
  quiz: { questions: QuizQuestion[] };
  title: string;
  onQuizSaved: (quizId: string, title: string) => void;
}

const emptyQuestion: QuizQuestion = {
  questionText: "",
  options: ["", "", "", ""],
  correctAnswerIndex: 0,
};

export function QuizPreview({ quiz, title, onQuizSaved }: QuizPreviewProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [editedQuiz, setEditedQuiz] = useState<{ questions: QuizQuestion[] }>(quiz);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    setEditedQuiz(quiz);
    setEditingIndex(null);
  }, [quiz]);

  const handleQuestionTextChange = (index: number, value: string) => {
    const newQuestions = [...editedQuiz.questions];
    newQuestions[index].questionText = value;
    setEditedQuiz({ ...editedQuiz, questions: newQuestions });
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...editedQuiz.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setEditedQuiz({ ...editedQuiz, questions: newQuestions });
  };

  const handleCorrectAnswerChange = (qIndex: number, oIndex: number) => {
    const newQuestions = [...editedQuiz.questions];
    newQuestions[qIndex].correctAnswerIndex = oIndex;
    setEditedQuiz({ ...editedQuiz, questions: newQuestions });
  };

  const handleAddQuestion = () => {
    setEditedQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, { ...emptyQuestion }],
    }));
    setEditingIndex(editedQuiz.questions.length);
  };

  const handleRemoveQuestion = (index: number) => {
    if (editedQuiz.questions.length <= 1) {
      toast.error("퀴즈에는 최소 1개의 질문이 필요합니다.");
      return;
    }
    setEditedQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const handleSaveQuestion = (index: number) => {
    const currentQ = editedQuiz.questions[index];
    if (!currentQ.questionText.trim()) {
      toast.error("질문 내용을 비워둘 수 없습니다.");
      return;
    }
    if (currentQ.options.some(o => !o.trim())) {
      toast.error("모든 선택지 내용을 비워둘 수 없습니다.");
      return;
    }
    setEditingIndex(null);
    toast.success("질문이 수정되었습니다.");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleSaveQuiz = async () => {
    if (editingIndex !== null) {
      toast.error("현재 편집 중인 질문을 먼저 저장하거나 취소해주세요.");
      return;
    }
    if (editedQuiz.questions.some(q => !q.questionText.trim() || q.options.some(o => !o.trim()))) {
      toast.error("모든 질문과 선택지 내용을 입력해야 합니다.");
      return;
    }
    if (editedQuiz.questions.length === 0) {
      toast.error("최소 1개 이상의 질문이 필요합니다.");
      return;
    }

    setIsSaving(true);

    const result = await saveQuiz({
      title: title || "제목 없는 퀴즈",
      questions: editedQuiz.questions,
    });

    setIsSaving(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.id) {
      toast.success("퀴즈가 성공적으로 저장되었습니다!");
      onQuizSaved(result.id, title);
    }
  };

  const handleDownload = async () => {
    if (editingIndex !== null) {
      toast.error("현재 편집 중인 질문을 먼저 저장하거나 취소해주세요.");
      return;
    }
    toast.info("Word 파일 생성을 시작합니다...");
    try {
        await generateQuizDocx({
            title: title || "제목 없는 퀴즈",
            questions: editedQuiz.questions,
        });
    } catch (error) {
        console.error("Error generating docx:", error);
        toast.error("파일 생성 중 오류가 발생했습니다.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || "생성된 퀴즈"}</CardTitle>
        <CardDescription>AI가 생성한 퀴즈입니다. 내용을 확인하고 필요하면 수정 후 저장하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {editedQuiz.questions.map((q, index) => (
          <div key={index} className="border-t pt-4 first:border-t-0 first:pt-0 relative">
            {editingIndex === index ? (
              <div className="space-y-4">
                <Label>질문 {index + 1}</Label>
                <Textarea
                  placeholder="질문 내용을 입력하세요."
                  value={q.questionText}
                  onChange={(e) => handleQuestionTextChange(index, e.target.value)}
                />
                <RadioGroup
                  value={String(q.correctAnswerIndex)}
                  onValueChange={(value) => handleCorrectAnswerChange(index, parseInt(value))}
                  className="space-y-2"
                >
                  {q.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <RadioGroupItem value={String(oIndex)} id={`q${index}-o${oIndex}`} />
                      <Input
                        placeholder={`선택지 ${oIndex + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, oIndex, e.target.value)}
                      />
                    </div>
                  ))}
                </RadioGroup>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    <XCircle className="mr-2 h-4 w-4" />
                    취소
                  </Button>
                  <Button size="sm" onClick={() => handleSaveQuestion(index)}>
                    <Save className="mr-2 h-4 w-4" />
                    저장
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="font-semibold">{index + 1}. {q.questionText}</p>
                <ul className="mt-2 space-y-1 list-none">
                  {q.options.map((option, i) => (
                    <li key={i} className={`pl-4 ${i === q.correctAnswerIndex ? 'font-bold text-green-600' : ''}`}>
                      {i + 1}. {option}
                    </li>
                  ))}
                </ul>
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingIndex(index)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">수정</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveQuestion(index)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">삭제</span>
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
        <Button variant="outline" onClick={handleAddQuestion} className="w-full" disabled={editingIndex !== null}>
          <PlusCircle className="mr-2 h-4 w-4" />
          질문 추가
        </Button>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleDownload} disabled={isSaving || editingIndex !== null}>
            <FileDown className="mr-2 h-4 w-4" />
            Word로 다운로드
        </Button>
        <Button onClick={handleSaveQuiz} disabled={isSaving || editingIndex !== null}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          퀴즈 저장하기
        </Button>
      </CardFooter>
    </Card>
  );
}