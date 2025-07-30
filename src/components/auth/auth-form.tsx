'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // URL에서 에러 파라미터 확인
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, 'Session:', session);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in:', session.user);
        toast.success('로그인 성공!');
        setLoading(true);
        setError(null);
        
        // 약간의 지연 후 리다이렉트
        setTimeout(() => {
          router.push('/teacher/dashboard');
          router.refresh();
        }, 1000);
      }
      
      if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setLoading(false);
      }
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed');
      }
    });

    // 현재 세션 확인
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session check error:', error);
          setError(`세션 확인 오류: ${error.message}`);
        } else if (session) {
          console.log('Existing session found:', session);
          router.push('/teacher/dashboard');
        }
      } catch (err) {
        console.error('Session check exception:', err);
        setError('세션 확인 중 예외가 발생했습니다.');
      }
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [router, searchParams]);

  // 수동 구글 로그인 테스트
  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    
    try {
      console.log('Starting Google OAuth...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        console.error('Google OAuth error:', error);
        setError(`구글 로그인 오류: ${error.message}`);
        setLoading(false);
      } else {
        console.log('Google OAuth initiated:', data);
      }
    } catch (err) {
      console.error('Google OAuth exception:', err);
      setError('구글 로그인 중 예외가 발생했습니다.');
      setLoading(false);
    }
  };

  // 리다이렉트 URL 생성
  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      return `${baseUrl}/auth/callback`;
    }
    return '';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>교사 로그인</CardTitle>
        <CardDescription>
          {loading ? '로그인 처리 중...' : '퀴즈를 만들고 관리하려면 로그인 또는 회원가입하세요.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 수동 구글 로그인 버튼 */}
            <Button 
              onClick={handleGoogleLogin} 
              className="w-full" 
              variant="outline"
              disabled={loading}
            >
              🔍 구글로 로그인 (테스트)
            </Button>
            
            {/* 기본 Auth UI */}
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}