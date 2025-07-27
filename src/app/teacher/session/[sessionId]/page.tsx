"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Users } from "lucide-react";
import Link from "next/link";

interface Participant {
  id: string;
  name: string;
  score: number;
}

interface Session {
  id: string;
  join_code: string;
  status: string;
}

interface PageProps {
  params: {
    sessionId: string;
  };
}

export default function TeacherSessionPage({ params }: PageProps) {
  const { sessionId } = params;
  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSession() {
      const { data, error } = await supabase
        .from("quiz_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error || !data) {
        setError("세션을 찾을 수 없습니다.");
        setLoading(false);
        return;
      }
      setSession(data);

      const { data: initialParticipants, error: participantsError } =
        await supabase
          .from("session_participants")
          .select("*")
          .eq("session_id", sessionId);

      if (participantsError) {
        setError("참가자 정보를 불러오는 데 실패했습니다.");
      } else {
        setParticipants(initialParticipants || []);
      }
      setLoading(false);
    }

    fetchSession();

    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "session_participants",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setParticipants((prev) => [...prev, payload.new as Participant]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-4">
        <Card>
          <CardHeader>
            <CardTitle>오류</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-muted/40 p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">퀴즈 로비</CardTitle>
            <CardDescription>학생들이 참여할 수 있도록 아래 코드를 공유하세요.</CardDescription>
            <div className="mx-auto my-4 rounded-lg border bg-background p-4">
              <p className="text-sm font-medium text-muted-foreground">게임 코드</p>
              <p className="text-5xl font-bold tracking-widest">{session.join_code}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="flex items-center text-lg font-semibold">
                  <Users className="mr-2 h-5 w-5" />
                  참가자 ({participants.length}명)
                </h3>
                <div className="max-h-60 overflow-y-auto rounded-md border">
                  {participants.length > 0 ? (
                    <ul className="divide-y">
                      {participants.map((p) => (
                        <li key={p.id} className="p-3">
                          {p.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="p-4 text-center text-sm text-muted-foreground">
                      아직 참가자가 없습니다.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border bg-background p-6">
                <p className="text-center text-muted-foreground">
                  모든 학생이 참여하면 게임을 시작하세요.
                </p>
                <Button size="lg" disabled={participants.length === 0}>
                  게임 시작하기
                </Button>
                <p className="text-xs text-muted-foreground">
                  (게임 시작 기능은 다음 단계에서 구현됩니다.)
                </p>
              </div>
            </div>
          </CardContent>
           <CardFooter>
            <Button variant="link" asChild>
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}