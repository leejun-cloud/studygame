import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 응답 객체를 먼저 생성합니다.
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 서버용 Supabase 클라이언트를 생성하고, 요청과 응답의 쿠키를 공유합니다.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // 브라우저에 쿠키를 설정하도록 응답 객체에 지시합니다.
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // 브라우저에서 쿠키를 삭제하도록 응답 객체에 지시합니다.
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 사용자의 세션을 갱신합니다. 이 과정에서 쿠키가 변경될 수 있습니다.
  await supabase.auth.getUser()

  // 변경된 쿠키가 포함된 응답을 반환합니다.
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}