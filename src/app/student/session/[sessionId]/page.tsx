"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface PageProps {
  params: {
    sessionId: string;
  };
}

function StudentSessionFlow({ sessionId }: { sessionId: string }) {
  const searchParams = useSearchParams();
  const studentName = searchParams.get("name");
  const [status, setStatus] = useState("loading"); // loading, waiting, active, finished
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`session-updates-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "quiz_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          // 다음 단계에서 이 payload를 사용하여 게임 상태를 변경합니다.
          const newStatus = payload.new.status;
          if (newStatus) {
            setStatus(newStatus);
          }
        }
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data, error } = await supabase
            .from('quiz_sessions')
            .select('status')
            .eq('id', sessionId)
            .single();
          
          if (error || !data) {
            setError("세션을 찾을 수 없습니다.");
            setStatus("error");
          } else {
            setStatus(data.status);
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-muted-foreground">퀴즈에 연결하는 중...</p>
      </div>
    );
  }
  
  if (status === "error") {
    return <p className="text-red-500">{error}</p>;
  }

  if (status === "waiting") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">퀴즈 대기실</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg">
            환영합니다, <span className="font-bold">{studentName}</span>님!
          </p>
          <p className="mt-4 text-muted-foreground">
            선생님이 퀴즈를 시작할 때까지 잠시만 기다려주세요.
          </p>
          <Loader2 className="mx-auto mt-6 h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // 다음 단계에서 구현될 게임 진행 화면
  return (
     <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">퀴즈 시작!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mt-4 text-muted-foreground">
            게임 로직은 다음 단계에서 구현됩니다.
          </p>
        </CardContent>
      </Card>
  );
}

export default function StudentSessionPage({ params }: PageProps) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
        <StudentSessionFlow sessionId={params.sessionId} />
      </Suspense>
    </div>
  );
}