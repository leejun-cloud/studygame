import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 응답 객체를 먼저 생성합니다. 이 객체는 이후 모든 쿠키 수정의 기준이 됩니다.
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // 쿠키가 갱신될 때, 요청과 응답 양쪽의 쿠키를 모두 업데이트합니다.
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // 쿠키가 삭제될 때, 요청과 응답 양쪽의 쿠키를 모두 삭제합니다.
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 사용자의 세션을 가져옵니다. 이 과정에서 만료된 토큰은 자동으로 갱신됩니다.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 보호된 경로 처리: 로그인하지 않은 사용자가 /teacher 경로에 접근하면 로그인 페이지로 리디렉션합니다.
  if (!user && request.nextUrl.pathname.startsWith('/teacher')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // 로그인 페이지 처리: 이미 로그인한 사용자가 /login 경로에 접근하면 대시보드로 리디렉션합니다.
  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/teacher/dashboard', request.url))
  }

  // 모든 처리가 끝난 후, 쿠키 정보가 올바르게 담긴 응답을 반환합니다.
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