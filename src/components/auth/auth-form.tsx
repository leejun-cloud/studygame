'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

export function AuthForm() {
  const [redirectUrl, setRedirectUrl] = useState<string>('');

  useEffect(() => {
    // This code now runs only on the client, where `window` is available.
    setRedirectUrl(`${window.location.origin}/auth/callback`);
  }, []);

  // Render a loading state until the redirect URL is ready on the client.
  if (!redirectUrl) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>교사 로그인</CardTitle>
          <CardDescription>로그인 양식을 불러오는 중입니다...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
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
          redirectTo={redirectUrl}
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