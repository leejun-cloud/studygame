import { AuthForm } from '@/components/auth/auth-form'
import { MadeWithDyad } from '@/components/made-with-dyad'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center bg-muted/40 p-4 sm:p-8">
        <AuthForm />
      </main>
      <MadeWithDyad />
    </div>
  )
}