import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md w-full">
          <h1 className="text-4xl font-bold mb-4">
            실시간 AI 퀴즈 앱
          </h1>
          <p className="text-muted-foreground mb-8">
            AI와 함께하는 즐거운 퀴즈 시간! 퀴즈를 만들거나 참여해보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="w-full sm:w-auto">
              퀴즈 만들기 (교사용)
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              퀴즈 참여하기 (학생용)
            </Button>
          </div>
        </div>
      </main>
      <MadeWithDyad />
    </div>
  );
}