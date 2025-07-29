import { getMyQuizzes } from "@/app/actions/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusCircle, Terminal } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { QuizActions } from "@/components/teacher/quiz-actions";

export default async function DashboardPage({ searchParams }: { searchParams?: { copied?: string } }) {
  const { quizzes, error } = await getMyQuizzes();

  if (error) {
    return <div className="container py-8">{error}</div>;
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">내 퀴즈</h1>
        <Link href="/teacher/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            새 퀴즈 만들기
          </Button>
        </Link>
      </div>
      {searchParams?.copied && (
        <Alert className="mb-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>성공!</AlertTitle>
          <AlertDescription>
            퀴즈가 내 목록으로 성공적으로 복사되었습니다.
          </AlertDescription>
        </Alert>
      )}
      {quizzes && quizzes.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="truncate">{quiz.title}</CardTitle>
                <CardDescription>
                  {format(new Date(quiz.created_at), "yyyy년 MM월 dd일")} 생성됨
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p>{Array.isArray(quiz.questions) ? quiz.questions.length : 0}개의 질문</p>
              </CardContent>
              <CardFooter className="w-full">
                <QuizActions quizId={quiz.id} />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">아직 만든 퀴즈가 없어요!</h2>
          <p className="text-muted-foreground mt-2 mb-6">
            새로운 퀴즈를 만들어 학생들과 함께 즐겨보세요.
          </p>
          <Link href="/teacher/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              첫 퀴즈 만들러 가기
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}