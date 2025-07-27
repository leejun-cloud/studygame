"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createQuizSession } from "@/app/actions/session";

interface QuizShareCardProps {
  quizId: string;
  title: string;
}

export function QuizShareCard({ quizId, title }: QuizShareCardProps) {
  const shareUrl = `${window.location.origin}/student/quiz/${quizId}`;
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("링크가 클립보드에 복사되었습니다!");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(quizId);
    toast.success("퀴즈 코드가 클립보드에 복사되었습니다!");
  };

  const handleStartLiveQuiz = async () => {
    setIsStarting(true);
    const result = await createQuizSession(quizId);
    if (result.error) {
      toast.error(result.error);
      setIsStarting(false);
    } else if (result.session) {
      router.push(`/teacher/session/${result.session.id}`);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>퀴즈 공유 및 시작</CardTitle>
        <CardDescription>
          학생들에게 코드를 공유하여 개별적으로 풀게 하거나, 실시간 퀴즈를 시작하여 함께 풀어보세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-4 rounded-lg border p-4">
            <h3 className="font-semibold">1. 혼자 풀기 (기존 방식)</h3>
            <p className="text-sm text-muted-foreground">학생들이 원할 때 각자 퀴즈를 풀 수 있습니다.</p>
            <div className="grid gap-2">
              <Label htmlFor="quiz-code">퀴즈 코드</Label>
              <div className="flex items-center gap-2">
                <Input id="quiz-code" value={quizId} readOnly />
                <Button size="icon" variant="outline" onClick={handleCopyCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="share-link">공유 링크</Label>
              <div className="flex items-center gap-2">
                <Input id="share-link" value={shareUrl} readOnly />
                <Button size="icon" variant="outline" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4 rounded-lg border p-6">
                <Label className="text-sm">QR 코드로 참여하기</Label>
                <div className="bg-white p-2 rounded-md">
                    <QRCodeSVG value={shareUrl} size={128} />
                </div>
            </div>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <div className="w-full">
            <h3 className="font-semibold">2. 실시간 퀴즈 (새 기능)</h3>
            <p className="text-sm text-muted-foreground mb-4">모든 학생들과 함께 실시간으로 퀴즈 게임을 진행합니다.</p>
            <Button onClick={handleStartLiveQuiz} disabled={isStarting} size="lg" className="w-full">
              {isStarting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              실시간 퀴즈 시작하기
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}