'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function DebugAuth() {
  const [session, setSession] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`[AUTH DEBUG] ${message}`)
  }

  useEffect(() => {
    const checkAuth = async () => {
      addLog('인증 상태 확인 시작')
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          addLog(`세션 가져오기 오류: ${error.message}`)
        } else {
          addLog(`현재 세션: ${session ? '있음' : '없음'}`)
          setSession(session)
          setUser(session?.user || null)
        }
      } catch (err) {
        addLog(`예외 발생: ${err}`)
      }
      
      setLoading(false)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addLog(`인증 상태 변경: ${event}`)
      if (session) {
        addLog(`사용자: ${session.user.email}`)
        addLog(`제공자: ${session.user.app_metadata.provider}`)
      }
      setSession(session)
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const testGoogleLogin = async () => {
    addLog('구글 로그인 테스트 시작')
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        addLog(`구글 로그인 오류: ${error.message}`)
      } else {
        addLog('구글 로그인 요청 성공')
      }
    } catch (err) {
      addLog(`구글 로그인 예외: ${err}`)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  if (loading) {
    return <div>인증 상태 확인 중...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>인증 디버그 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Badge variant={session ? 'default' : 'secondary'}>
              {session ? '로그인됨' : '로그인 안됨'}
            </Badge>
          </div>
          
          {user && (
            <div className="space-y-2">
              <p><strong>이메일:</strong> {user.email}</p>
              <p><strong>제공자:</strong> {user.app_metadata?.provider}</p>
              <p><strong>사용자 ID:</strong> {user.id}</p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button onClick={testGoogleLogin} variant="outline">
              구글 로그인 테스트
            </Button>
            <Button onClick={clearLogs} variant="outline">
              로그 지우기
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>디버그 로그</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-md max-h-60 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">로그가 없습니다.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-sm font-mono">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}