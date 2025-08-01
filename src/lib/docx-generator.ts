import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

export const generateQuizDocx = async (quiz: Quiz) => {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: quiz.title,
            heading: HeadingLevel.TITLE,
            alignment: "center",
          }),
          new Paragraph({ text: "", spacing: { after: 400 } }),
          ...quiz.questions.flatMap((question, index) => {
            const questionNumber = index + 1;
            return [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${questionNumber}. ${question.questionText}`,
                    bold: true,
                  }),
                ],
                spacing: { after: 200 },
              }),
              ...question.options.map((option, oIndex) => {
                return new Paragraph({
                  children: [
                    new TextRun({
                      text: `  ${String.fromCharCode(9312 + oIndex)} ${option}`, // ①, ②, ③, ④
                    }),
                  ],
                  indent: { left: 400 },
                  spacing: { after: 100 },
                });
              }),
              new Paragraph({ text: "", spacing: { after: 400 } }),
            ];
          }),
          new Paragraph({ text: "\n\n--- 정답 ---", pageBreakBefore: true, heading: HeadingLevel.HEADING_1 }),
          ...quiz.questions.map((question, index) => {
            return new Paragraph({
                text: `${index + 1}번: ${String.fromCharCode(9312 + question.correctAnswerIndex)}`,
            });
          })
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${quiz.title.replace(/ /g, "_") || "quiz"}.docx`);
};