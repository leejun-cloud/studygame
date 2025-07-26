import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { context } = await req.json();

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Gemini API key not configured" },
      { status: 500 }
    );
  }

  if (!context) {
    return NextResponse.json(
      { error: "Context is required" },
      { status: 400 }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      당신은 전문 퀴즈 출제자입니다. 다음 텍스트를 기반으로 객관식 퀴즈를 생성해 주세요.
      - 퀴즈는 총 5문제여야 합니다.
      - 각 질문에는 4개의 선택지가 있고, 그중 하나만 정답이어야 합니다.
      - 학생들의 학습을 돕기 위해 명확하고 간결하게 질문을 만들어주세요.
      - 응답은 반드시 다음 JSON 형식이어야 하며, 다른 설명은 포함하지 마세요:
      {
        "questions": [
          {
            "questionText": "여기에 질문 내용을 입력하세요.",
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
    const text = response.text();
    
    // Clean the response to ensure it's valid JSON
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const quizData = JSON.parse(jsonString);

    return NextResponse.json(quizData);
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}