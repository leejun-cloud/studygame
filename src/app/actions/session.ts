"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { z } from "zod";
import { getQuiz } from "./quiz";

function generateJoinCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createQuizSession(quizId: string) {
  if (!quizId) {
    return { error: "퀴즈 ID가 필요합니다." };
  }

  const quizResult = await getQuiz(quizId);
  if (quizResult.error) {
    return { error: "존재하지 않는 퀴즈입니다." };
  }

  const joinCode = generateJoinCode();

  const { data, error } = await supabaseAdmin
    .from("quiz_sessions")
    .insert({
      quiz_id: quizId,
      join_code: joinCode,
    })
    .select()
    .single();

  if (error) {
    console.error("세션 생성 오류:", error);
    return { error: "퀴즈 세션을 생성할 수 없습니다." };
  }

  return { session: data };
}

export async function joinQuizSession(joinCode: string, studentName: string) {
    const codeSchema = z.string().min(1, "게임 코드를 입력해야 합니다.");
    const nameSchema = z.string().min(1, "이름을 입력해야 합니다.").max(50, "이름은 50자 이내여야 합니다.");

    const codeValidation = codeSchema.safeParse(joinCode.toUpperCase());
    if (!codeValidation.success) {
        return { error: "유효하지 않은 게임 코드입니다." };
    }

    const nameValidation = nameSchema.safeParse(studentName);
    if (!nameValidation.success) {
        return { error: "유효하지 않은 이름입니다." };
    }

    const validCode = codeValidation.data;
    const validName = nameValidation.data;

    const { data: session, error: sessionError } = await supabaseAdmin
        .from("quiz_sessions")
        .select("id, status")
        .eq("join_code", validCode)
        .single();

    if (sessionError || !session) {
        return { error: "해당 코드를 가진 퀴즈를 찾을 수 없습니다." };
    }

    if (session.status !== 'waiting') {
        return { error: "이미 시작되었거나 종료된 퀴즈입니다." };
    }

    const { data: participant, error: participantError } = await supabaseAdmin
        .from("session_participants")
        .insert({
            session_id: session.id,
            name: validName,
        })
        .select('id, session_id')
        .single();

    if (participantError) {
        console.error("참가자 생성 오류:", participantError);
        return { error: "퀴즈에 참여할 수 없습니다." };
    }

    return { participant };
}

export async function startGame(sessionId: string) {
  const { error } = await supabaseAdmin
    .from("quiz_sessions")
    .update({ 
      status: 'active', 
      current_question_index: 0,
      question_started_at: new Date().toISOString() 
    })
    .eq("id", sessionId);

  if (error) {
    console.error("게임 시작 오류:", error);
    return { error: "게임을 시작할 수 없습니다." };
  }
  return { success: true };
}

export async function showNextQuestion(sessionId: string) {
  const { data: session, error: sessionError } = await supabaseAdmin
    .from("quiz_sessions")
    .select("current_question_index, quiz_id")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    return { error: "세션을 찾을 수 없습니다." };
  }

  const { quiz } = await getQuiz(session.quiz_id);
  if (!quiz) {
    return { error: "퀴즈 데이터를 찾을 수 없습니다." };
  }

  const nextQuestionIndex = session.current_question_index + 1;
  
  if (nextQuestionIndex >= (quiz.questions as any[]).length) {
    // 퀴즈 종료
    const { error } = await supabaseAdmin
      .from("quiz_sessions")
      .update({ status: 'finished' })
      .eq("id", sessionId);
    if (error) return { error: "퀴즈 종료에 실패했습니다." };
    return { success: true, finished: true };
  } else {
    // 다음 문제로
    const { error } = await supabaseAdmin
      .from("quiz_sessions")
      .update({ 
        current_question_index: nextQuestionIndex,
        question_started_at: new Date().toISOString(),
        status: 'active' // 리더보드에서 다시 active로
      })
      .eq("id", sessionId);
    if (error) return { error: "다음 문제로 넘어갈 수 없습니다." };
    return { success: true, finished: false };
  }
}

export async function showLeaderboard(sessionId: string) {
    const { error } = await supabaseAdmin
        .from('quiz_sessions')
        .update({ status: 'leaderboard' })
        .eq('id', sessionId);

    if (error) {
        console.error('리더보드 표시 오류:', error);
        return { error: '리더보드를 표시할 수 없습니다.' };
    }
    return { success: true };
}


export async function submitAnswer(
  participantId: string,
  sessionId: string,
  questionIndex: number,
  selectedOptionIndex: number
) {
  const { data: session, error: sessionError } = await supabaseAdmin
    .from("quiz_sessions")
    .select("quiz_id, question_started_at")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) return { error: "세션을 찾을 수 없습니다." };

  const { quiz } = await getQuiz(session.quiz_id);
  if (!quiz) return { error: "퀴즈를 찾을 수 없습니다." };

  const question = (quiz.questions as any[])[questionIndex];
  const isCorrect = question.correctAnswerIndex === selectedOptionIndex;
  
  // 점수 계산 (정답: 1000점, 오답: 0점. 추후 시간 보너스 추가)
  const score = isCorrect ? 1000 : 0;

  const { error: answerError } = await supabaseAdmin
    .from("participant_answers")
    .insert({
      session_participant_id: participantId,
      question_index: questionIndex,
      selected_option_index: selectedOptionIndex,
      is_correct: isCorrect,
      score_awarded: score,
    });

  if (answerError) {
    // 이미 답변을 제출한 경우일 수 있음
    return { error: "답변을 제출할 수 없습니다." };
  }

  // 참가자 총점 업데이트
  if (isCorrect) {
    await supabaseAdmin.rpc('increment_score', {
        participant_id: participantId,
        increment_value: score
    });
  }

  return { success: true, isCorrect };
}