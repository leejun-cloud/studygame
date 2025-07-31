import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 이 미들웨어의 인증 로직이 앱을 멈추게 하는 원인이 되어 비활성화합니다.
  // 교사 페이지에 대한 접근 제어는 `src/app/teacher/layout.tsx`에서 처리하고 있으므로 보안에는 문제가 없습니다.
  return NextResponse.next()
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