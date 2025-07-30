import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/teacher/dashboard'
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  console.log('=== AUTH CALLBACK DEBUG ===');
  console.log('URL:', request.url);
  console.log('Code present:', !!code);
  console.log('Error:', error);
  console.log('Error description:', error_description);
  console.log('Next:', next);
  console.log('Origin:', origin);

  // 에러가 있는 경우 처리
  if (error) {
    console.error('OAuth error received:', error, error_description);
    const errorMessage = error_description || '로그인 중 오류가 발생했습니다.';
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMessage)}`);
  }

  if (code) {
    console.log('Processing authorization code...');
    
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
      console.log('Exchanging code for session...');
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Code exchange error:', exchangeError);
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(`인증 실패: ${exchangeError.message}`)}`);
      }

      if (data.session) {
        console.log('Session created successfully!');
        console.log('User ID:', data.session.user.id);
        console.log('User email:', data.session.user.email);
        console.log('Provider:', data.session.user.app_metadata?.provider);
        
        // 사용자 프로필 확인 및 생성
        try {
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
              console.error('Profile creation error:', insertError);
              // 프로필 생성 실패해도 로그인은 계속 진행
            } else {
              console.log('Profile created successfully');
            }
          } else if (profileError) {
            console.error('Profile fetch error:', profileError);
          } else {
            console.log('Profile already exists');
          }
        } catch (profileErr) {
          console.error('Profile handling exception:', profileErr);
        }

        console.log('Redirecting to:', `${origin}${next}`);
        return NextResponse.redirect(`${origin}${next}`)
      } else {
        console.error('No session in exchange response');
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('세션 생성에 실패했습니다.')}`);
      }
    } catch (error) {
      console.error('Callback processing exception:', error);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('인증 처리 중 예외가 발생했습니다.')}`);
    }
  }

  // 코드가 없는 경우
  console.log('No authorization code provided');
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('인증 코드가 제공되지 않았습니다.')}`);
}