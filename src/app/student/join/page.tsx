"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad";

export default function JoinQuizPage() {
  const [quizId, setQuizId] = useState("");
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (quizId.trim()) {
      router.push(`/student/quiz/${quizId.trim()}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center bg-muted/40 p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>홈으로 돌아가기</span>
            </Link>
          </div>
          <Card>
            <form onSubmit={handleJoin}>
              <CardHeader>
                <CardTitle>퀴즈 참여하기</CardTitle>
                <CardDescription>
                  선생님께 받은 퀴즈 ID를 입력해주세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <Label htmlFor="quiz-id">퀴즈 ID</Label>
                  <Input
                    id="quiz-id"
                    placeholder="퀴즈 ID를 여기에 붙여넣으세요"
                    value={quizId}
                    onChange={(e) => setQuizId(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={!quizId.trim()}>
                  퀴즈 참여
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      <MadeWithDyad />
    </div>
  );
}