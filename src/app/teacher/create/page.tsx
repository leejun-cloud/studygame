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
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateQuizPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>홈으로 돌아가기</span>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>퀴즈 만들기</CardTitle>
            <CardDescription>
              퀴즈의 제목을 입력하고, 질문을 생성할 내용을 붙여넣으세요. AI가 자동으로 퀴즈를 만들어 드립니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="title">퀴즈 제목</Label>
                <Input id="title" placeholder="예: 중간고사 대비 수학 퀴즈" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="context">퀴즈 내용</Label>
                <Textarea
                  id="context"
                  placeholder="여기에 교과서 내용, 강의 노트, 또는 관련 자료를 붙여넣으세요..."
                  className="min-h-[200px]"
                />
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button>AI로 퀴즈 생성하기</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}