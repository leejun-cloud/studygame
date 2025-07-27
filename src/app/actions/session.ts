"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { generate } from "random-words";

export async function createQuizSession(quizId: string) {
  const joinCode = (generate({ exactly: 2, join: "", formatter: (word) => word.toUpperCase() }) + Math.floor(1000 + Math.random() * 9000).toString());

  const { data, error } = await supabaseAdmin
    .from("quiz_sessions")
    .insert({
      quiz_id: quizId,
      join_code: joinCode,
      status: "waiting",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating quiz session:", error);
    return { error: "퀴즈 세션을 만드는 데 실패했습니다." };
  }
  return { data };
}

export async function joinQuizSession(joinCode: string, name: string) {
  const { data: session, error: sessionError } = await supabaseAdmin
    .from("quiz_sessions")
    .select("id, status")
    .eq("join_code", joinCode.toUpperCase())
    .single();

  if (sessionError || !session) {
    return { error: "유효하지 않은 게임 코드입니다." };
  }

  if (session.status !== "waiting") {
    return { error: "이미 시작된 퀴즈에는 참여할 수 없습니다." };
  }

  const { data: participant, error: participantError } = await supabaseAdmin
    .from("session_participants")
    .insert({
      session_id: session.id,
      name: name,
    })
    .select()
    .single();

  if (participantError) {
    console.error("Error joining session:", participantError);
    return { error: "세션에 참여하는 중 오류가 발생했습니다." };
  }

  return { participant };
}

export async function startNextQuestion(sessionId: string, questionIndex: number) {
  const { data, error } = await supabaseAdmin
    .from("quiz_sessions")
    .update({
      current_question_index: questionIndex,
      status: "in_progress",
      question_started_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    console.error("Error starting next question:", error);
    return { error: "다음 질문을 시작하는 데 실패했습니다." };
  }
  return { data };
}

export async function showQuestionResult(sessionId: string) {
  const { data, error } = await supabaseAdmin
    .from("quiz_sessions")
    .update({ status: "question_result" })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    console.error("Error showing question result:", error);
    return { error: "질문 결과를 표시하는 데 실패했습니다." };
  }
  return { data };
}

export async function finishQuizSession(sessionId: string) {
  const { data, error } = await supabaseAdmin
    .from("quiz_sessions")
    .update({ status: "finished" })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    console.error("Error finishing quiz session:", error);
    return { error: "퀴즈를 종료하는 데 실패했습니다." };
  }
  return { data };
}

export async function submitAnswer(
  participantId: string,
  questionIndex: number,
  selectedOptionIndex: number,
  isCorrect: boolean,
  scoreAwarded: number
) {
  const { data, error } = await supabaseAdmin
    .from("participant_answers")
    .insert({
      session_participant_id: participantId,
      question_index: questionIndex,
      selected_option_index: selectedOptionIndex,
      is_correct: isCorrect,
      score_awarded: scoreAwarded,
    });

  if (error) {
    console.error("Error submitting answer:", error);
    return { error: "답변을 제출하는 데 실패했습니다." };
  }

  if (isCorrect) {
    const { error: rpcError } = await supabaseAdmin.rpc('increment_score', {
      participant_id: participantId,
      increment_value: scoreAwarded
    });
    if (rpcError) {
      console.error("Error incrementing score:", rpcError);
      return { error: "점수를 업데이트하는 데 실패했습니다." };
    }
  }

  return { data };
}