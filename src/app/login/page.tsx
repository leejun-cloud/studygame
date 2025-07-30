import { AuthForm } from '@/components/auth/auth-form'
import { MadeWithDyad } from '@/components/made-with-dyad'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Toaster } from '@/components/ui/sonner'

export default async function LoginPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/teacher/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Toaster />
      <main className="flex flex-1 flex-col items-center justify-center bg-muted/40 p-4 sm:p-8">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </main>
      <MadeWithDyad />
    </div>
  )
}