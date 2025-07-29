'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function AuthForm() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // 'SIGNED_IN' 이벤트가 발생하면, 즉시 대시보드로 리디렉션합니다.
      if (event === 'SIGNED_IN') {
        router.push('/teacher/dashboard');
        // 페이지를 새로고침하여 서버 컴포넌트들이 새로운 로그인 상태를 인지하도록 합니다.
        router.refresh();
      }
    });

    // 컴포넌트가 언마운트될 때 리스너를 정리합니다.
    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // OAuth나 매직링크를 위한 리디렉션 URL을 제공합니다.
  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth/callback`;
    }
    return '';
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>교사 로그인</CardTitle>
        <CardDescription>퀴즈를 만들고 관리하려면 로그인 또는 회원가입하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          redirectTo={getRedirectUrl()}
          localization={{
            variables: {
              sign_in: {
                email_label: '이메일 주소',
                password_label: '비밀번호',
                button_label: '로그인',
                link_text: '계정이 있으신가요? 로그인',
              },
              sign_up: {
                email_label: '이메일 주소',
                password_label: '비밀번호',
                button_label: '회원가입',
                link_text: '계정이 없으신가요? 회원가입',
              },
              forgotten_password: {
                email_label: '이메일 주소',
                button_label: '비밀번호 재설정 링크 보내기',
                link_text: '비밀번호를 잊으셨나요?',
              }
            },
          }}
        />
      </CardContent>
    </Card>
  )
}