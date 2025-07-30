"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { joinQuizSession } from "./session";

/**
 * 새로운 협업 퀴즈 세션을 생성합니다.
 */
export async function createCollabSession(title: string) {
  // NOTE: Temporarily removed user check for development
  // const cookieStore = await cookies();
  // const supabase = createServerClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  //   { cookies: { get: (name) => cookieStore.get(name)?.value } }
  // );
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) return { error: "로그인이 필요합니다." };

  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const { data, error } = await supabaseAdmin
    .from("collaborative_sessions")
    .insert({ title, user_id: null, join_code: joinCode }) // user_id is null
    .select()
    .single();

  if (error) {
    console.error("Error creating collab session:", error);
    return { error: "세션 생성에 실패했습니다." };
  }

  return { session: data };
}

/**
 * 로그인한 교사의 모든 협업 세션 목록을 가져옵니다.
 */
export async function getMyCollabSessions() {
    // NOTE: Temporarily removed user check for development
    // const cookieStore = await cookies();
    // const supabase = createServerClient(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    //   { cookies: { get: (name) => cookieStore.get(name)?.value } }
    // );
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) return { error: "로그인이 필요합니다." };

    const { data, error } = await supabaseAdmin
        .from("collaborative_sessions")
        .select("*, submitted_questions(count)")
        // .eq("user_id", user.id) // Temporarily removed filter
        .order("created_at", { ascending: false });

    if (error) {
        return { error: "세션 목록을 불러오는 데 실패했습니다." };
    }
    return { sessions: data };
}

/**
 * 학생이 제출한 질문을 저장합니다.
 */
export async function submitQuestion(sessionId: string, studentName: string, questionData: any) {
    if (!sessionId || !studentName || !questionData) {
        return { error: "필수 정보가 누락되었습니다." };
    }
    const { error } = await supabaseAdmin
        .from("submitted_questions")
        .insert({
            session_id: sessionId,
            student_name: studentName,
            question_data: questionData
        });
    
    if (error) {
        console.error("Error submitting question:", error);
        return { error: "질문 제출에 실패했습니다." };
    }
    return { success: true };
}

/**
 * 제출된 질문의 상태를 업데이트합니다. (승인/반려)
 */
export async function updateQuestionStatus(questionId: string, status: 'approved' | 'rejected') {
    const { error } = await supabaseAdmin
        .from("submitted_questions")
        .update({ status })
        .eq("id", questionId);

    if (error) {
        return { error: "상태 업데이트에 실패했습니다." };
    }
    return { success: true };
}

/**
 * 협업 세션을 종료하고 승인된 질문들로 새 퀴즈를 생성합니다.
 */
export async function finalizeCollabQuiz(sessionId: string) {
    const { data: approvedQuestions, error: questionsError } = await supabaseAdmin
        .from("submitted_questions")
        .select("question_data")
        .eq("session_id", sessionId)
        .eq("status", "approved");

    if (questionsError || !approvedQuestions || approvedQuestions.length === 0) {
        return { error: "승인된 질문이 없어 퀴즈를 생성할 수 없습니다." };
    }

    const { data: session, error: sessionError } = await supabaseAdmin
        .from("collaborative_sessions")
        .select("title, user_id")
        .eq("id", sessionId)
        .single();

    if (sessionError || !session) {
        return { error: "세션 정보를 찾을 수 없습니다." };
    }

    const newQuiz = {
        title: `${session.title} (학생 참여형)`,
        questions: approvedQuestions.map(q => q.question_data),
        user_id: session.user_id // This will be null for now
    };

    const { error: insertError } = await supabaseAdmin.from("quizzes").insert(newQuiz);
    if (insertError) {
        return { error: "퀴즈 저장에 실패했습니다." };
    }

    await supabaseAdmin.from("collaborative_sessions").update({ status: 'closed' }).eq("id", sessionId);

    redirect('/teacher/dashboard');
}

/**
 * 참여 코드를 확인하여 실시간 퀴즈 또는 협업 세션으로 라우팅합니다.
 */
export async function routeJoinCode(joinCode: string, studentName: string) {
    if (!joinCode || !studentName) return { error: "코드와 이름을 모두 입력해주세요." };

    const upperCaseCode = joinCode.toUpperCase();

    // 1. Check for live quiz session
    const { data: liveSession, error: liveError } = await supabaseAdmin
        .from("quiz_sessions")
        .select("id, status")
        .eq("join_code", upperCaseCode)
        .single();

    if (liveSession) {
        if (liveSession.status !== 'waiting') return { error: "이미 시작된 퀴즈입니다." };
        const result = await joinQuizSession(upperCaseCode, studentName);
        if (result.error) return result;
        return { type: 'live', data: result.participant };
    }

    // 2. Check for collaborative session
    const { data: collabSession, error: collabError } = await supabaseAdmin
        .from("collaborative_sessions")
        .select("id, status")
        .eq("join_code", upperCaseCode)
        .single();
    
    if (collabSession) {
        if (collabSession.status !== 'open') return { error: "이미 마감된 문제 만들기 세션입니다." };
        return { type: 'collab', data: { sessionId: collabSession.id } };
    }

    return { error: "유효하지 않은 코드입니다." };
}