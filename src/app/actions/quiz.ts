"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { z } from "zod";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Zod를 사용한 데이터 유효성 검사 스키마
const quizQuestionSchema = z.object({
  questionText: z.string(),
  options: z.array(z.string()),
  correctAnswerIndex: z.number(),
});

const quizSchema = z.object({
  title: z.string().min(1, "제목은 필수입니다."),
  questions: z.array(quizQuestionSchema).min(1, "최소 1개 이상의 질문이 필요합니다."),
});

/**
 * 퀴즈를 데이터베이스에 저장하는 함수
 * @param data - 퀴즈 제목과 질문 목록
 * @returns 저장된 퀴즈의 ID 또는 오류 메시지
 */
export async function saveQuiz(data: z.infer<typeof quizSchema>) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const validation = quizSchema.safeParse(data);
  if (!validation.success) {
    return { error: "유효하지 않은 퀴즈 데이터입니다." };
  }

  const { title, questions } = validation.data;

  const { data: quizData, error } = await supabaseAdmin
    .from("quizzes")
    .insert([{ title, questions, user_id: user.id }])
    .select("id")
    .single();

  if (error) {
    console.error("퀴즈 저장 오류:", error);
    return { error: "데이터베이스에 퀴즈를 저장할 수 없습니다." };
  }

  return { id: quizData.id };
}

/**
 * ID를 사용해 데이터베이스에서 특정 퀴즈를 불러오는 함수
 * @param quizId - 불러올 퀴즈의 ID
 * @returns 퀴즈 데이터 또는 오류 메시지
 */
export async function getQuiz(quizId: string) {
  if (!quizId) {
    return { error: "퀴즈 ID가 필요합니다." };
  }

  const { data, error } = await supabaseAdmin
    .from("quizzes")
    .select("id, title, questions")
    .eq("id", quizId)
    .single();

  if (error || !data) {
    console.error("퀴즈 불러오기 오류:", error);
    return { error: "퀴즈를 찾을 수 없습니다." };
  }

  return { quiz: data };
}

/**
 * 로그인한 사용자의 모든 퀴즈를 불러오는 함수
 * @returns 퀴즈 목록 또는 오류 메시지
 */
export async function getMyQuizzes() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  /*
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }
  */

  const { data, error } = await supabase
    .from("quizzes")
    .select("id, title, created_at, questions")
    // .eq("user_id", user.id) // Temporarily remove user filter
    .order("created_at", { ascending: false });

  if (error) {
    console.error("내 퀴즈 불러오기 오류:", error);
    return { error: "퀴즈를 불러오는 데 실패했습니다." };
  }

  return { quizzes: data };
}