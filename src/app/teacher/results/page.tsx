"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Trophy } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getFinishedSessions, getSessionResults } from "@/app/actions/results";
import { format } from "date-fns/format";

// 데이터 타입 정의
interface Session {
  id: string;
  created_at: string;
  join_code: string;
  quiz: { title: string }[] | null;
}

interface Participant {
  id:string;
  name: string;
  score: number;
}

// 특정 세션의 상세 결과를 보여주는 컴포넌트
function SessionResultDetails({ sessionId }: { sessionId: string }) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      const result = await getSessionResults(sessionId);
      if (result.error) {
        setError(result.error);
      } else if (result.participants) {
        setParticipants(result.participants);
      }
      setLoading(false);
    }
    fetchResults();
  }, [sessionId]);

  if (loading) {
    return <div className="flex items-center justify-center p-4"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }

  if (error) {
    return <p className="p-4 text-sm text-red-500">{error}</p>;
  }

  if (participants.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground">참가자 정보가 없습니다.</p>;
  }

  return (
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
  );
}

// 결과 페이지 메인 컴포넌트
export default function ResultsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      setLoading(true);
      const result = await getFinishedSessions();
      if (result.error) {
        setError(result.error);
      } else if (result.sessions) {
        setSessions(result.sessions as Session[]);
      }
      setLoading(false);
    }
    fetchSessions();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-muted/40 p-4 sm:p-8">
      <div className="w-full max-w-3xl">
        <div className="mb-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>홈으로 돌아가기</span>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              퀴즈 결과 보기
            </CardTitle>
            <CardDescription>
              완료된 실시간 퀴즈 세션의 결과입니다. 세션을 선택하여 상세 점수를 확인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : sessions.length === 0 ? (
              <p className="text-center text-muted-foreground p-8">완료된 퀴즈 세션이 없습니다.</p>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {sessions.map((session) => (
                  <AccordionItem value={session.id} key={session.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex justify-between items-center w-full pr-4">
                        <div className="text-left">
                          <p className="font-semibold">{session.quiz?.[0]?.title || "제목 없는 퀴즈"}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(session.created_at), "yyyy년 MM월 dd일 HH:mm")}
                          </p>
                        </div>
                        <span className="text-sm text-muted-foreground">코드: {session.join_code}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <SessionResultDetails sessionId={session.id} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}