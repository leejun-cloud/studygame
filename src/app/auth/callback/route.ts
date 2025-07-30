import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/teacher/dashboard'
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  console.log('Callback received:', { code: !!code, error, error_description, next });

  // 에러가 있는 경우 처리
  if (error) {
    console.error('OAuth error:', error, error_description);
    const errorMessage = error_description || '로그인 중 오류가 발생했습니다.';
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMessage)}`);
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('인증 코드 교환에 실패했습니다. 다시 시도해주세요.')}`)
      }

      if (data.session) {
        console.log('Session created successfully:', data.session.user.email);
        
        // 사용자 프로필 확인 및 생성
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // 프로필이 없으면 생성
          console.log('Creating user profile...');
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.session.user.id,
              full_name: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0],
              avatar_url: data.session.user.user_metadata?.avatar_url,
            });

          if (insertError) {
            console.error('Error creating profile:', insertError);
          }
        }

        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch (error) {
      console.error('Unexpected error in callback:', error);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('예상치 못한 오류가 발생했습니다.')}`)
    }
  }

  // 코드가 없는 경우
  console.log('No code provided in callback');
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('인증 코드가 제공되지 않았습니다.')}`)
}