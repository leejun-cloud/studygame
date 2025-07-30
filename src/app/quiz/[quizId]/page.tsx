import { getQuiz, copyQuiz } from "@/app/actions/quiz";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Home, Terminal } from "lucide-react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { MadeWithDyad } from "@/components/made-with-dyad";

interface Question {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export default async function PublicQuizPage({
  params,
  searchParams,
}: {
  params: { quizId: string };
  searchParams?: { error?: string };
}) {
  const { quiz, error: quizError } = await getQuiz(params.quizId);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookies().get(name)?.value } }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (quizError || !quiz) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card>
          <CardHeader>
            <CardTitle>오류</CardTitle>
          </CardHeader>
          <CardContent>
            <p>퀴즈를 찾을 수 없습니다. 링크가 올바른지 확인해주세요.</p>
          </CardContent>
          <CardFooter>
            <Link href="/">
              <Button variant="outline">홈으로 돌아가기</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 flex flex-col items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>{quiz.title}</CardTitle>
            <CardDescription>
              {quiz.questions.length}개의 질문이 포함된 퀴즈입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {searchParams?.error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>오류</AlertTitle>
                <AlertDescription>{searchParams.error}</AlertDescription>
              </Alert>
            )}
            {(quiz.questions as Question[]).map((q: Question, index: number) => (
              <div key={index} className="border-t pt-3 first:border-t-0 first:pt-0">
                <p className="font-semibold">
                  {index + 1}. {q.questionText}
                </p>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Link href="/">
              <Button variant="outline">
                <Home className="mr-2 h-4 w-4" />
                홈
              </Button>
            </Link>
            {user ? (
              <form action={copyQuiz}>
                <input type="hidden" name="quizId" value={params.quizId} />
                <Button type="submit">
                  <Copy className="mr-2 h-4 w-4" />
                  내 퀴즈로 복사하기
                </Button>
              </form>
            ) : (
              <Link href={`/login?redirect=/quiz/${params.quizId}`}>
                <Button>로그인하고 퀴즈 복사하기</Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      </main>
      <MadeWithDyad />
    </div>
  );
}