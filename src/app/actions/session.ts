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