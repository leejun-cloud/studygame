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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ArrowLeft, QrCode } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad";

export default function JoinQuizPage() {
  const [quizId, setQuizId] = useState("");
  const [studentName, setStudentName] = useState("");
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (quizId.trim() && studentName.trim()) {
      router.push(
        `/student/quiz/${quizId.trim()}?name=${encodeURIComponent(
          studentName.trim()
        )}`
      );
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
            <CardHeader>
              <CardTitle>퀴즈 참여하기</CardTitle>
              <CardDescription>참여할 방법을 선택해주세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="code" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="code">코드로 참여</TabsTrigger>
                  <TabsTrigger value="link-qr">링크 / QR코드</TabsTrigger>
                </TabsList>
                <TabsContent value="code">
                  <form onSubmit={handleJoin} className="mt-4 space-y-4">
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
                      <Label htmlFor="quiz-id">퀴즈 코드</Label>
                      <Input
                        id="quiz-id"
                        placeholder="퀴즈 코드를 여기에 붙여넣으세요"
                        value={quizId}
                        onChange={(e) => setQuizId(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!quizId.trim() || !studentName.trim()}
                    >
                      퀴즈 참여
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="link-qr">
                  <div className="mt-4 rounded-md border p-4 text-center text-sm text-muted-foreground">
                    <QrCode className="mx-auto mb-4 h-10 w-10" />
                    <p className="font-semibold">
                      링크나 QR코드가 있으신가요?
                    </p>
                    <p className="mt-2">
                      선생님께 받은 링크를 브라우저에서 직접 열거나, 스마트폰
                      카메라로 QR 코드를 스캔하면 바로 퀴즈 화면으로 이동합니다.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <MadeWithDyad />
    </div>
  );
}