import { z } from "zod";

export const quizQuestionSchema = z.object({
  questionText: z.string().min(1, "질문 내용은 비워둘 수 없습니다."),
  options: z.array(z.string().min(1, "선택지 내용은 비워둘 수 없습니다.")),
  correctAnswerIndex: z.number(),
});

export const quizSchema = z.object({
  title: z.string().min(1, "제목은 필수입니다."),
  questions: z.array(quizQuestionSchema).min(1, "최소 1개 이상의 질문이 필요합니다."),
});