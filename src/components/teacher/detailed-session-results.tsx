"use client";

import { useEffect, useState, useMemo } from "react";
import { getSessionResults } from "@/app/actions/results";
import { Loader2, Users, BarChart2, CheckCircle, Trophy } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Type definitions
interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}
interface Question {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}
interface Participant {
  id: string;
  name: string;
  score: number;
}
interface Answer {
  question_index: number;
  selected_option_index: number;
  is_correct: boolean;
}
interface ResultData {
  quiz: Quiz;
  participants: Participant[];
  answers: Answer[];
}

export function DetailedSessionResults({ sessionId }: { sessionId: string }) {
  const [results, setResults] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      const result = await getSessionResults(sessionId);
      if (result.error) {
        setError(result.error);
      } else {
        // @ts-ignore
        setResults(result);
      }
      setLoading(false);
    }
    fetchResults();
  }, [sessionId]);

  const analysis = useMemo(() => {
    if (!results) return null;
    const { quiz, participants, answers } = results;

    const totalParticipants = participants.length;
    if (totalParticipants === 0) return { averageScore: 0, questionAnalysis: [] };

    const totalScore = participants.reduce((sum, p) => sum + p.score, 0);
    const averageScore = totalScore / totalParticipants;

    const questionAnalysis = quiz.questions.map((q, qIndex) => {
      const answersForQuestion = answers.filter(a => a.question_index === qIndex);
      const correctAnswersCount = answersForQuestion.filter(a => a.is_correct).length;
      const correctRate = totalParticipants > 0 ? (correctAnswersCount / totalParticipants) * 100 : 0;

      const chartData = q.options.map((optionText, oIndex) => ({
        option: optionText,
        count: answersForQuestion.filter(a => a.selected_option_index === oIndex).length,
        isCorrect: q.correctAnswerIndex === oIndex,
      }));

      return {
        questionText: q.questionText,
        correctRate: correctRate.toFixed(1),
        chartData,
      };
    });

    return { averageScore: averageScore.toFixed(1), questionAnalysis };
  }, [results]);

  if (loading) {
    return <div className="flex items-center justify-center p-4"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }

  if (error) {
    return <p className="p-4 text-sm text-red-500">{error}</p>;
  }

  if (!results || !analysis) {
    return <p className="p-4 text-sm text-muted-foreground">결과 데이터가 없습니다.</p>;
  }

  const { quiz, participants } = results;

  return (
    <div className="space-y-6 p-2">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 참가자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participants.length} 명</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 점수</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.averageScore} 점</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>리더보드</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">순위</TableHead>
                <TableHead>이름</TableHead>
                <TableHead className="text-right">점수</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((p, index) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell className="text-right">{p.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>문제별 분석</CardTitle>
          <CardDescription>각 문제의 응답 분포 및 정답률입니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {analysis.questionAnalysis.map((qa, index) => (
            <div key={index} className="border-t pt-6">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold">{index + 1}. {qa.questionText}</h4>
                <Badge variant="secondary">정답률: {qa.correctRate}%</Badge>
              </div>
              <div className="mt-4 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={qa.chartData} layout="vertical" margin={{ left: 100 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="option" type="category" tickLine={false} axisLine={false} width={150} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                    <Bar dataKey="count" radius={[4, 4, 4, 4]}>
                      {qa.chartData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.isCorrect ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}