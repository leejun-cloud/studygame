"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookMarked } from "lucide-react";

export function MainNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link href="/teacher/dashboard" className="mr-6 flex items-center space-x-2">
        <BookMarked className="h-6 w-6" />
        <span className="font-bold">AI Quiz</span>
      </Link>
      <Link
        href="/teacher/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/teacher/dashboard" ? "text-primary" : "text-muted-foreground"
        )}
      >
        내 퀴즈
      </Link>
      <Link
        href="/teacher/create"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/teacher/create" ? "text-primary" : "text-muted-foreground"
        )}
      >
        퀴즈 만들기
      </Link>
      <Link
        href="/teacher/collaborative"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.startsWith("/teacher/collaborative") ? "text-primary" : "text-muted-foreground"
        )}
      >
        협업 퀴즈
      </Link>
      <Link
        href="/teacher/results"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/teacher/results" ? "text-primary" : "text-muted-foreground"
        )}
      >
        결과 보기
      </Link>
      <Link
        href="/teacher/profile"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/teacher/profile" ? "text-primary" : "text-muted-foreground"
        )}
      >
        프로필
      </Link>
    </nav>
  );
}