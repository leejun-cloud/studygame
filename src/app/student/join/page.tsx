"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { joinQuizSession } from "@/app/actions/session";

export default function JoinQuizPage() {
  const [gameCode, setGameCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const router = useRouter();

  const handleJoinWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameCode.trim() || !studentName.trim()) return;

    const result = await joinQuizSession(
      gameCode.trim(),
      studentName.trim()
    );

    if (result.error) {
      toast.error(result.error);
    } else if (result.participant) {
      router.push(
        `/student/session/${result.participant.session_id}?name=${encodeURIComponent(
          studentName.trim()
        )}`
      );
    }
  };

  return (
    <>
      <Toaster />
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
              <CardHeader>
                <CardTitle>실시간 퀴즈 참여</CardTitle>
                <CardDescription>
                  이름과 선생님께 받은 게임 코드를 입력해주세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinWithCode} className="space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="student-name">이름</Label>
                    <Input
                      id="student-name"
                      placeholder="이름을 입력하세요"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="game-code">게임 코드</Label>
                    <Input
                      id="game-code"
                      placeholder="예: AB12CD"
                      value={gameCode}
                      onChange={(e) => setGameCode(e.target.value)}
                      required
                      maxLength={6}
                      className="uppercase"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!gameCode.trim() || !studentName.trim()}
                  >
                    퀴즈 참여하기
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
        <MadeWithDyad />
      </div>
    </>
  );
}