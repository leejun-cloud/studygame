"use server";

import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * 완료된 모든 퀴즈 세션 목록을 가져옵니다.
 */
export async function getFinishedSessions() {
  if (!supabaseAdmin) {
    return { error: "서버가 데이터베이스 접근을 위해 설정되지 않았습니다." };
  }

  const { data: sessions, error } = await supabaseAdmin
    .from("quiz_sessions")
    .select(`
      id,
      created_at,
      join_code,
      quiz:quizzes (title)
    `)
    .eq("status", "finished")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("완료된 세션 목록을 가져오는 중 오류 발생:", error);
    return { error: "완료된 세션 목록을 불러오는 데 실패했습니다." };
  }

  return { sessions };
}

/**
 * 특정 세션의 참가자 점수 결과를 가져옵니다.
 * @param sessionId - 결과를 가져올 세션의 ID
 */
export async function getSessionResults(sessionId: string) {
  if (!supabaseAdmin) {
    return { error: "서버가 데이터베이스 접근을 위해 설정되지 않았습니다." };
  }

  if (!sessionId) {
    return { error: "세션 ID가 필요합니다." };
  }

  const { data: participants, error } = await supabaseAdmin
    .from("session_participants")
    .select("id, name, score")
    .eq("session_id", sessionId)
    .order("score", { ascending: false });

  if (error) {
    console.error("세션 결과를 가져오는 중 오류 발생:", error);
    return { error: "세션 결과를 불러오는 데 실패했습니다." };
  }

  return { participants };
}