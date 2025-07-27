import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md w-full">
          <h1 className="text-4xl font-bold mb-4">
            실시간 AI 퀴즈 앱
          </h1>
          <p className="text-muted-foreground mb-12">
            AI와 함께하는 즐거운 퀴즈 시간! 퀴즈를 만들거나 참여해보세요.
          </p>
          <div className="grid grid-cols-1 gap-10 w-full">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">교사용</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/teacher/create" className="flex-1">
                  <Button size="lg" className="w-full">
                    퀴즈 만들기
                  </Button>
                </Link>
                <Link href="/teacher/results" className="flex-1">
                  <Button size="lg" variant="secondary" className="w-full">
                    결과 보기
                  </Button>
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">학생용</h2>
              <Link href="/student/join">
                <Button size="lg" variant="outline" className="w-full">
                  퀴즈 참여하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <MadeWithDyad />
    </div>
  );
}