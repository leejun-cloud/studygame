"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { z } from "zod";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Zod를 사용한 데이터 유효성 검사 스키마
const quizQuestionSchema = z.object({
  questionText: z.string().min(1, "질문 내용은 비워둘 수 없습니다."),
  options: z.array(z.string().min(1, "선택지 내용은 비워둘 수 없습니다.")),
  correctAnswerIndex: z.number(),
});

export const quizSchema = z.object({
  title: z.string().min(1, "제목은 필수입니다."),
  questions: z.array(quizQuestionSchema).min(1, "최소 1개 이상의 질문이 필요합니다."),
});

/**
 * 퀴즈를 데이터베이스에 저장하는 함수
 * @param data - 퀴즈 제목과 질문 목록
 * @returns 저장된 퀴즈의 ID 또는 오류 메시지
 */
export async function saveQuiz(data: z.infer<typeof quizSchema>) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete(name, options);
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const validation = quizSchema.safeParse(data);
  if (!validation.success) {
    return { error: "유효하지 않은 퀴즈 데이터입니다." };
  }

  const { title, questions } = validation.data;

  const { data: quizData, error } = await supabaseAdmin
    .from("quizzes")
    .insert([{ title, questions, user_id: user?.id }])
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
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete(name, options);
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("quizzes")
    .select("id, title, created_at, questions")
    .order("created_at", { ascending: false });

  // 로그인한 경우, 해당 사용자의 퀴즈만 필터링합니다.
  // 로그인하지 않은 경우, 모든 퀴즈를 보여줍니다.
  if (user) {
    query = query.eq("user_id", user.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("내 퀴즈 불러오기 오류:", error);
    return { error: "퀴즈를 불러오는 데 실패했습니다." };
  }

  return { quizzes: data };
}

/**
 * 다른 사용자의 퀴즈를 현재 로그인한 사용자의 계정으로 복사합니다.
 * @param formData - 복사할 퀴즈의 ID가 포함된 폼 데이터
 */
export async function copyQuiz(formData: FormData) {
  const quizId = formData.get("quizId") as string;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete(name, options);
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect(`/login?redirect=/quiz/${quizId}`);
  }

  const { data: originalQuiz, error: fetchError } = await supabaseAdmin
    .from("quizzes")
    .select("title, questions, user_id")
    .eq("id", quizId)
    .single();

  if (fetchError || !originalQuiz) {
    return redirect(`/quiz/${quizId}?error=${encodeURIComponent("원본 퀴즈를 찾을 수 없습니다.")}`);
  }

  if (originalQuiz.user_id === user.id) {
    return redirect(`/quiz/${quizId}?error=${encodeURIComponent("자신이 만든 퀴즈는 복사할 수 없습니다.")}`);
  }

  const { error: insertError } = await supabaseAdmin
    .from("quizzes")
    .insert({
      title: `${originalQuiz.title} (복사본)`,
      questions: originalQuiz.questions,
      user_id: user.id,
    });

  if (insertError) {
    console.error("퀴즈 복사 오류:", insertError);
    return redirect(`/quiz/${quizId}?error=${encodeURIComponent("퀴즈를 복사하는 데 실패했습니다.")}`);
  }

  redirect('/teacher/dashboard?copied=true');
}