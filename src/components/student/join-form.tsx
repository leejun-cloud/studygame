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
import { ArrowLeft, Gamepad2, Users, Zap } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { joinQuizSession } from "@/app/actions/session";

export function JoinForm() {
  const [gameCode, setGameCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoinWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameCode.trim() || !studentName.trim()) return;
    setIsLoading(true);

    const result = await joinQuizSession(
      gameCode.trim(),
      studentName.trim()
    );

    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
    } else if (result.participant) {
      const validName = studentName.trim();
      toast.success("게임에 참여했습니다! 🎉");
      router.push(
        `/student/session/${result.participant.session_id}?name=${encodeURIComponent(
          validName
        )}&participantId=${result.participant.id}`
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Toaster />
      <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>홈으로 돌아가기</span>
            </Link>
          </div>
          
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                  <Gamepad2 className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl font-bold mb-2">
                퀴즈 게임 참여하기! 🎮
              </CardTitle>
              <CardDescription className="text-center text-white/90 text-lg">
                선생님께 받은 게임 코드로 재미있는 퀴즈에 참여해보세요!
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8">
              <form onSubmit={handleJoinWithCode} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="student-name" className="text-lg font-medium flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    이름
                  </Label>
                  <Input
                    id="student-name"
                    placeholder="이름을 입력하세요"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 text-lg border-2 focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="game-code" className="text-lg font-medium flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    게임 코드
                  </Label>
                  <Input
                    id="game-code"
                    placeholder="예: AB12CD"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                    required
                    maxLength={6}
                    className="h-12 text-lg font-bold text-center tracking-widest border-2 focus:border-purple-500 transition-colors uppercase"
                    disabled={isLoading}
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  disabled={!gameCode.trim() || !studentName.trim() || isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      게임 참여 중...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="h-5 w-5" />
                      게임 시작하기! 🚀
                    </div>
                  )}
                </Button>
              </form>
              
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 text-center">
                  💡 <strong>팁:</strong> 게임 코드는 선생님이 화면에 보여주는 6자리 코드예요!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <MadeWithDyad />
    </div>
  );
}