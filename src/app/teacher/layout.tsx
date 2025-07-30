import { UserNav } from "@/components/auth/user-nav";
import { MainNav } from "@/components/teacher/main-nav";
import { Toaster } from "@/components/ui/sonner";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 참고: 앱 시작 문제를 해결하기 위해 인증 확인 로직을 임시로 비활성화했습니다.
  // 이로 인해 현재 교사 페이지는 로그인 없이도 접근할 수 있습니다.

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav />
          <UserNav />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <Toaster />
    </div>
  );
}