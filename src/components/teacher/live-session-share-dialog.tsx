"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

interface LiveSessionShareDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  session: { id: string; join_code: string } | null;
  onNavigate: (sessionId: string) => void;
}

export function LiveSessionShareDialog({
  isOpen,
  onOpenChange,
  session,
  onNavigate,
}: LiveSessionShareDialogProps) {
  if (!session) return null;

  const joinUrl = `${window.location.origin}/student/join`;

  const handleCopy = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>실시간 퀴즈 공유</DialogTitle>
          <DialogDescription>
            학생들에게 아래 코드를 공유하여 퀴즈에 참여하게 하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="join-code" className="text-center text-lg">
              참여 코드
            </Label>
            <div
              className="text-4xl font-bold tracking-widest text-center p-4 bg-muted rounded-md"
              id="join-code"
            >
              {session.join_code}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleCopy(session.join_code, "참여 코드가 복사되었습니다!")}
            >
              <Copy className="mr-2 h-4 w-4" />
              코드 복사
            </Button>
          </div>
          <div className="flex flex-col items-center gap-4 rounded-lg border p-4">
            <Label className="text-sm">QR 코드로 참여 페이지 접속</Label>
            <div className="bg-white p-2 rounded-md">
              <QRCodeSVG value={joinUrl} size={128} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="share-link">참여 페이지 링크</Label>
            <div className="flex items-center gap-2">
              <Input id="share-link" value={joinUrl} readOnly />
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleCopy(joinUrl, "참여 링크가 복사되었습니다!")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-between gap-2 flex-col-reverse sm:flex-row">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
          <Button type="button" onClick={() => onNavigate(session.id)}>
            호스트 화면으로 이동
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}