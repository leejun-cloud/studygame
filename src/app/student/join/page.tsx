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
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export default function JoinQuizPage() {
  const [quizId, setQuizId] = useState("");
  const [quizLink, setQuizLink] = useState("");
  const [studentName, setStudentName] = useState("");
  const router = useRouter();

  const handleJoinWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (quizId.trim() && studentName.trim()) {
      router.push(
        `/student/quiz/${quizId.trim()}?name=${encodeURIComponent(
          studentName.trim()
        )}`
      );
    }
  };

  const handleJoinWithLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizLink.trim() || !studentName.trim()) return;

    try {
      const url = new URL(quizLink);
      const pathParts = url.pathname.split('/');
      // URL 경로에서 마지막 부분을 ID로 추출합니다. 예: /student/quiz/uuid
      const idFromLink = pathParts.pop() || pathParts.pop(); // 끝에 '/'가 있는 경우 처리

      if (idFromLink) {
        router.push(
          `/student/quiz/${idFromLink}?name=${encodeURIComponent(
            studentName.trim()
          )}`
        );
      } else {
        throw new Error("링크에서 퀴즈 ID를 찾을 수 없습니다.");
      }
    } catch (error) {
      toast.error("유효하지 않은 링크 형식입니다. 다시 확인해주세요.");
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
                <CardTitle>퀴즈 참여하기</CardTitle>
                <CardDescription>
                  이름을 입력하고, 참여할 방법을 선택해주세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 mb-6">
                  <Label htmlFor="student-name">이름</Label>
                  <Input
                    id="student-name"
                    placeholder="이름을 입력하세요"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                  />
                </div>
                <Tabs defaultValue="code" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="code">코드로 참여</TabsTrigger>
                    <TabsTrigger value="link">링크로 참여</TabsTrigger>
                    <TabsTrigger value="qr">QR코드</TabsTrigger>
                  </TabsList>
                  <TabsContent value="code">
                    <form onSubmit={handleJoinWithCode} className="mt-4 space-y-4">
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
                  <TabsContent value="link">
                    <form onSubmit={handleJoinWithLink} className="mt-4 space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="quiz-link">공유 링크</Label>
                        <Input
                          id="quiz-link"
                          placeholder="공유받은 링크를 여기에 붙여넣으세요"
                          value={quizLink}
                          onChange={(e) => setQuizLink(e.target.value)}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={!quizLink.trim() || !studentName.trim()}
                      >
                        퀴즈 참여
                      </Button>
                    </form>
                  </TabsContent>
                  <TabsContent value="qr">
                    <div className="mt-4 rounded-md border p-4 text-center text-sm text-muted-foreground">
                      <QrCode className="mx-auto mb-4 h-10 w-10" />
                      <p className="font-semibold">
                        QR코드가 있으신가요?
                      </p>
                      <p className="mt-2">
                        스마트폰 카메라로 QR 코드를 스캔하면 바로 퀴즈 화면으로
                        이동합니다.
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
    </>
  );
}