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
import { toast } from "sonner";

interface QuizShareDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  quizId: string;
}

export function QuizShareDialog({ isOpen, onOpenChange, quizId }: QuizShareDialogProps) {
  const shareUrl = `${window.location.origin}/quiz/${quizId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("공유 링크가 클립보드에 복사되었습니다!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>퀴즈 공유하기</DialogTitle>
          <DialogDescription>
            다른 교사에게 이 링크를 보내 퀴즈를 공유하세요. 받은 사람은 자신의 계정으로 퀴즈를 복사할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          <Label htmlFor="share-link">공유 링크</Label>
          <div className="flex items-center gap-2">
            <Input id="share-link" value={shareUrl} readOnly />
            <Button size="icon" variant="outline" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}