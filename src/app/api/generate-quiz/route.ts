import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { context } = await req.json();

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Gemini API 키가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  if (!context) {
    return NextResponse.json(
      { error: "퀴즈를 생성할 내용이 필요합니다." },
      { status: 400 }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // 더 새롭고 안정적인 모델로 변경
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // AI에게 더 명확한 지시를 내리는 프롬프트로 수정
    const prompt = `
      당신은 퀴즈 생성 API입니다. 주어진 텍스트를 기반으로 5개의 객관식 퀴즈를 생성하세요. 
      각 질문에는 4개의 선택지가 있어야 하며, 정답은 하나뿐입니다.
      응답은 반드시 유효한 JSON 객체 하나여야 하며, 다른 설명이나 마크다운 서식을 포함해서는 안 됩니다.
      JSON 객체는 다음 스키마를 따라야 합니다:
      {
        "questions": [
          {
            "questionText": "질문 문자열",
            "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
            "correctAnswerIndex": 0
          }
        ]
      }

      퀴즈 생성용 텍스트:
      """
      ${context}
      """
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonString = response.text();
    
    const quizData = JSON.parse(jsonString);

    return NextResponse.json(quizData);
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    let errorMessage = "퀴즈 생성 중 AI 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    if (error.message?.includes("API key not valid")) {
      errorMessage = "Gemini API 키가 유효하지 않습니다. 올바른 키인지 확인해주세요.";
    } else if (error.message?.includes("SAFETY")) {
      errorMessage = "콘텐츠 안전 문제로 인해 퀴즈를 생성할 수 없습니다. 다른 내용을 시도해주세요.";
    } else if (error instanceof SyntaxError) {
      errorMessage = "AI가 유효하지 않은 형식의 응답을 반환했습니다. 다시 시도해주세요.";
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}