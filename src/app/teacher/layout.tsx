import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/sonner";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Toaster />
    </div>
  );
}