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
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `
      당신은 전문 퀴즈 출제자입니다. 다음 텍스트를 기반으로 객관식 퀴즈를 생성해 주세요.
      - 퀴즈는 총 5문제여야 합니다.
      - 각 질문에는 4개의 선택지가 있고, 그중 하나만 정답이어야 합니다.
      - 학생들의 학습을 돕기 위해 명확하고 간결하게 질문을 만들어주세요.
      - 응답은 반드시 다음 JSON 스키마를 따르는 JSON 객체여야 하며, 다른 설명은 포함하지 마세요:
      {
        "questions": [
          {
            "questionText": "질문 내용",
            "options": ["선택지 1", "선택지 2", "선택지 3", "선택지 4"],
            "correctAnswerIndex": 0
          }
        ]
      }

      ---
      퀴즈 생성용 텍스트:
      ${context}
      ---
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
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}