import { getMyCollabSessions } from "@/app/actions/collaborative";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Users, Check, Clock } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function CollabSessionsPage() {
  const { sessions, error } = await getMyCollabSessions();

  if (error) {
    return <div className="container py-8">{error}</div>;
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">학생 참여형 퀴즈</h1>
        <Link href="/teacher/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            새 퀴즈 만들기
          </Button>
        </Link>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
            <CardTitle>새로운 협업 퀴즈 시작하기</CardTitle>
            <CardDescription>학생들이 직접 문제를 만드는 새로운 방식의 퀴즈를 시작해보세요. 주제를 정하고 세션을 만들면, 학생들이 참여하여 문제를 제출합니다.</CardDescription>
        </CardHeader>
        <CardFooter>
            <Link href="/teacher/create?mode=collaborative">
                <Button size="lg">
                    <Users className="mr-2 h-5 w-5" />
                    학생들과 함께 퀴즈 만들기
                </Button>
            </Link>
        </CardFooter>
      </Card>

      <h2 className="text-2xl font-bold mb-4">진행중인 세션</h2>
      {sessions && sessions.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Card key={session.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="truncate">{session.title}</CardTitle>
                <CardDescription>
                  {format(new Date(session.created_at), "yyyy년 MM월 dd일")} 생성됨
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <div className="flex items-center gap-2">
                    <Badge variant={session.status === 'open' ? 'default' : 'secondary'}>
                        {session.status === 'open' ? '진행중' : '마감됨'}
                    </Badge>
                    <Badge variant="outline">참여코드: {session.join_code}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                    {/* @ts-ignore */}
                    제출된 문제: {session.submitted_questions[0]?.count || 0}개
                </p>
              </CardContent>
              <CardFooter>
                <Link href={`/teacher/collaborative/${session.id}`} className="w-full">
                  <Button className="w-full" variant="outline">
                    세션 관리하기
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">아직 만든 세션이 없어요!</h2>
          <p className="text-muted-foreground mt-2 mb-6">
            학생들과 함께 만드는 퀴즈 세션을 시작해보세요.
          </p>
        </div>
      )}
    </div>
  );
}