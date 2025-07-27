"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

interface QuizShareCardProps {
  quizId: string;
  title: string;
}

export function QuizShareCard({ quizId, title }: QuizShareCardProps) {
  const shareUrl = `${window.location.origin}/student/quiz/${quizId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("링크가 클립보드에 복사되었습니다!");
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>퀴즈 공유</CardTitle>
        <CardDescription>
          아래 링크나 QR 코드를 학생들에게 공유하여 퀴즈에 참여하게 하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <Label>퀴즈 제목</Label>
          <p className="text-lg font-semibold">{title}</p>
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
      </CardContent>
    </Card>
  );
}