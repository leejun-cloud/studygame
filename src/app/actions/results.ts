"use server";

import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * 완료된 모든 퀴즈 세션 목록을 가져옵니다.
 */
export async function getFinishedSessions() {
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
 * 특정 세션의 상세 분석 데이터를 가져옵니다.
 * @param sessionId - 결과를 가져올 세션의 ID
 */
export async function getSessionResults(sessionId: string) {
  if (!sessionId) {
    return { error: "세션 ID가 필요합니다." };
  }

  const { data: sessionData, error: sessionError } = await supabaseAdmin
    .from("quiz_sessions")
    .select(`
      id,
      created_at,
      quiz:quizzes (
        id,
        title,
        questions
      )
    `)
    .eq("id", sessionId)
    .single();

  if (sessionError || !sessionData || !sessionData.quiz) {
    console.error("Error fetching session/quiz data:", sessionError);
    return { error: "세션 또는 퀴즈 정보를 불러오는 데 실패했습니다." };
  }

  const { data: participants, error: participantsError } = await supabaseAdmin
    .from("session_participants")
    .select("id, name, score")
    .eq("session_id", sessionId)
    .order("score", { ascending: false });

  if (participantsError) {
    return { error: "참가자 정보를 불러오는 데 실패했습니다." };
  }

  // Handle case with no participants
  if (!participants || participants.length === 0) {
    return {
      quiz: sessionData.quiz,
      participants: [],
      answers: [],
    };
  }

  const participantIds = participants.map(p => p.id);

  const { data: answers, error: answersError } = await supabaseAdmin
    .from("participant_answers")
    .select("question_index, selected_option_index, is_correct")
    .in("session_participant_id", participantIds);

  if (answersError) {
    return { error: "답변 정보를 불러오는 데 실패했습니다." };
  }

  return {
    quiz: sessionData.quiz,
    participants,
    answers: answers || [],
  };
}