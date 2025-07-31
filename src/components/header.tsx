"use client";

import { MainNav } from "@/components/teacher/main-nav";
import { UserNav } from "@/components/auth/user-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <MainNav />
        <UserNav />
      </div>
    </header>
  );
}