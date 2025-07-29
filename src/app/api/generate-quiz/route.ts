import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import pdf from "pdf-parse";

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Gemini API 키가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const contentType = req.headers.get("content-type") || "";
  let context = "";
  let numQuestions = 5; // 기본값

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const numQuestionsStr = formData.get("numQuestions") as string | null;

      if (numQuestionsStr) {
        numQuestions = parseInt(numQuestionsStr, 10);
      }

      if (!file) {
        return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      if (file.type === "application/pdf") {
        const data = await pdf(buffer);
        context = data.text;
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const { value } = await mammoth.extractRawText({ buffer });
        context = value;
      } else if (file.type === "text/plain") {
        context = buffer.toString("utf-8");
      } else {
        return NextResponse.json({ error: "지원하지 않는 파일 형식입니다. PDF, DOCX, TXT 파일만 가능합니다." }, { status: 400 });
      }
    } else if (contentType.includes("application/json")) {
      const { context: textContext, numQuestions: nq } = await req.json();
      context = textContext;
      if (nq) {
        numQuestions = nq;
      }
    } else {
      return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
    }

    if (!context) {
      return NextResponse.json(
        { error: "퀴즈를 생성할 내용이 없습니다." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `
      당신은 퀴즈 생성 API입니다. 주어진 텍스트를 기반으로 ${numQuestions}개의 객관식 퀴즈를 생성하세요. 
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
  } catch (error: any)
{
    console.error("Error in generate-quiz API:", error);
    let errorMessage = "퀴즈 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    if (error.message?.includes("API key not valid")) {
      errorMessage = "Gemini API 키가 유효하지 않습니다. 올바른 키인지 확인해주세요.";
    } else if (error instanceof SyntaxError) {
      errorMessage = "AI가 유효하지 않은 형식의 응답을 반환했습니다. 다시 시도해주세요.";
    } else if (error.message?.includes("SAFETY")) {
        errorMessage = "콘텐츠 안전 문제로 인해 퀴즈를 생성할 수 없습니다. 다른 내용을 시도해주세요.";
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}