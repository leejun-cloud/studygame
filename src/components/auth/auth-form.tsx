'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AuthForm() {
  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const next = url.searchParams.get('next') || '/teacher/dashboard';
      return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    }
    return '/auth/callback?next=/teacher/dashboard';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>교사 로그인</CardTitle>
        <CardDescription>
          퀴즈를 만들고 관리하려면 로그인 또는 회원가입하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            style: {
              button: {
                borderRadius: '8px',
                fontSize: '14px',
                padding: '10px 15px',
              },
              anchor: {
                color: '#3b82f6',
                textDecoration: 'none',
              },
              message: {
                color: '#ef4444',
                fontSize: '14px',
              },
            }
          }}
          providers={['google']}
          redirectTo={getRedirectUrl()}
          onlyThirdPartyProviders={false}
          magicLink={false}
          showLinks={true}
          localization={{
            variables: {
              sign_in: {
                email_label: '이메일 주소',
                password_label: '비밀번호',
                button_label: '로그인',
                link_text: '계정이 있으신가요? 로그인',
                loading_button_label: '로그인 중...',
              },
              sign_up: {
                email_label: '이메일 주소',
                password_label: '비밀번호',
                button_label: '회원가입',
                link_text: '계정이 없으신가요? 회원가입',
                loading_button_label: '가입 중...',
              },
              forgotten_password: {
                email_label: '이메일 주소',
                button_label: '비밀번호 재설정 링크 보내기',
                link_text: '비밀번호를 잊으셨나요?',
                loading_button_label: '전송 중...',
              },
            },
          }}
        />
      </CardContent>
    </Card>
  )
}