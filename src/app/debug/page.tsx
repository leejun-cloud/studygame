import { DebugAuth } from '@/components/auth/debug-auth'
import { MadeWithDyad } from '@/components/made-with-dyad'

export default function DebugPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center bg-muted/40 p-4 sm:p-8">
        <div className="w-full max-w-2xl">
          <h1 className="text-2xl font-bold mb-6">인증 디버그</h1>
          <DebugAuth />
        </div>
      </main>
      <MadeWithDyad />
    </div>
  )
}