"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, Copy, Flag } from "lucide-react";
import { toast } from "sonner";
import { updateQuestionStatus, finalizeCollabQuiz } from "@/app/actions/collaborative";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface Session {
  id: string;
  title: string;
  join_code: string;
  status: string;
}
interface SubmittedQuestion {
  id: string;
  student_name: string;
  question_data: {
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
  };
  status: 'pending' | 'approved' | 'rejected';
}

export default function CollabSessionModerationPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<SubmittedQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: sessionData, error: sessionError } = await supabase
        .from("collaborative_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
      
      if (sessionError || !sessionData) {
        toast.error("세션을 찾을 수 없습니다.");
        router.push("/teacher/collaborative");
        return;
      }
      setSession(sessionData);

      const { data: questionsData, error: questionsError } = await supabase
        .from("submitted_questions")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (questionsError) {
        toast.error("문제 목록을 불러오는 데 실패했습니다.");
      } else {
        setQuestions(questionsData);
      }
      setLoading(false);
    };

    fetchInitialData();

    const channel = supabase
      .channel(`collab-session:${sessionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submitted_questions", filter: `session_id=eq.${sessionId}` },
        (payload: RealtimePostgresChangesPayload<SubmittedQuestion>) => {
            if (payload.eventType === 'INSERT') {
                setQuestions(prev => [...prev, payload.new]);
                toast.info(`${payload.new.student_name}님이 새 문제를 제출했습니다!`);
            }
            if (payload.eventType === 'UPDATE') {
                setQuestions(prev => prev.map(q => q.id === payload.new.id ? payload.new : q));
            }
        }
      ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, router]);

  const handleStatusUpdate = async (questionId: string, status: 'approved' | 'rejected') => {
    const originalQuestions = [...questions];
    const newQuestions = questions.map(q => q.id === questionId ? {...q, status} : q);
    setQuestions(newQuestions);

    const result = await updateQuestionStatus(questionId, status);
    if (result.error) {
        toast.error(result.error);
        setQuestions(originalQuestions);
    } else {
        toast.success(`문제가 ${status === 'approved' ? '승인' : '반려'}되었습니다.`);
    }
  };

  const handleFinalize = async () => {
    const approvedCount = questions.filter(q => q.status === 'approved').length;
    if (approvedCount === 0) {
        toast.error("승인된 문제가 없어 퀴즈를 생성할 수 없습니다.");
        return;
    }
    if (!window.confirm(`${approvedCount}개의 문제로 최종 퀴즈를 생성하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
        return;
    }
    setLoading(true);
    const result = await finalizeCollabQuiz(sessionId);
    if (result?.error) {
        toast.error(result.error);
        setLoading(false);
    } else {
        toast.success("퀴즈가 성공적으로 생성되었습니다! 대시보드로 이동합니다.");
    }
  };
  
  const copyJoinCode = () => {
    if (!session) return;
    navigator.clipboard.writeText(session.join_code);
    toast.success("참여 코드가 복사되었습니다!");
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!session) return null;

  const pendingQuestions = questions.filter(q => q.status === 'pending');
  const approvedQuestions = questions.filter(q => q.status === 'approved');
  const rejectedQuestions = questions.filter(q => q.status === 'rejected');

  return (
    <div className="container py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{session.title}</CardTitle>
          <CardDescription>학생들이 제출한 문제를 검토하고 최종 퀴즈를 생성하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
            <p className="text-lg font-bold">참여 코드:</p>
            <p className="text-3xl font-bold tracking-widest text-primary">{session.join_code}</p>
            <Button size="icon" variant="outline" onClick={copyJoinCode}><Copy className="h-4 w-4" /></Button>
          </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleFinalize} disabled={loading || session.status === 'closed'} size="lg">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Flag className="mr-2 h-4 w-4" />
                {approvedQuestions.length}개 문제로 퀴즈 생성 및 종료
            </Button>
        </CardFooter>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold">검토 대기중인 문제 ({pendingQuestions.length})</h2>
            {pendingQuestions.length > 0 ? pendingQuestions.map(q => (
                <Card key={q.id}>
                    <CardHeader>
                        <CardTitle className="text-lg">{q.question_data.questionText}</CardTitle>
                        <CardDescription>제출자: {q.student_name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-1">
                            {q.question_data.options.map((opt, i) => (
                                <li key={i} className={i === q.question_data.correctAnswerIndex ? 'font-bold text-green-600' : ''}>
                                    {opt}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(q.id, 'rejected')}><X className="mr-2 h-4 w-4"/>반려</Button>
                        <Button size="sm" onClick={() => handleStatusUpdate(q.id, 'approved')}><Check className="mr-2 h-4 w-4"/>승인</Button>
                    </CardFooter>
                </Card>
            )) : <p className="text-muted-foreground">아직 검토 대기중인 문제가 없습니다.</p>}
        </div>
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold mb-4">승인된 문제 ({approvedQuestions.length})</h2>
                <div className="space-y-2">
                    {approvedQuestions.map(q => <p key={q.id} className="text-sm p-2 bg-green-50 rounded">✅ {q.question_data.questionText}</p>)}
                </div>
            </div>
            <div>
                <h2 className="text-2xl font-bold mb-4">반려된 문제 ({rejectedQuestions.length})</h2>
                <div className="space-y-2">
                    {rejectedQuestions.map(q => <p key={q.id} className="text-sm p-2 bg-red-50 rounded">❌ {q.question_data.questionText}</p>)}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}