import { AuthForm } from '@/components/auth/auth-form'
import { MadeWithDyad } from '@/components/made-with-dyad'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string }
}) {
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
        <div className="w-full max-w-md space-y-4">
          {searchParams?.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {decodeURIComponent(searchParams.error)}
              </AlertDescription>
            </Alert>
          )}
          <AuthForm />
        </div>
      </main>
      <MadeWithDyad />
    </div>
  )
}