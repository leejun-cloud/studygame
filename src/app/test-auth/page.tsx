'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function TestAuthPage() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // 현재 사용자 확인
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, session)
      setUser(session?.user || null)
      setMessage(`Event: ${event}`)
    })

    return () => subscription.unsubscribe()
  }, [])

  const testEmailLogin = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Login successful!')
      }
    } catch (err) {
      setMessage(`Exception: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const testEmailSignup = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Signup successful! Check your email.')
      }
    } catch (err) {
      setMessage(`Exception: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const testGoogleLogin = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Google OAuth initiated')
      }
    } catch (err) {
      setMessage(`Exception: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setMessage('Logged out')
  }

  return (
    <div className="container mx-auto p-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>인증 테스트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <div>
              <p>로그인됨: {user.email}</p>
              <Button onClick={logout}>로그아웃</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={testEmailLogin} disabled={loading}>
                  로그인
                </Button>
                <Button onClick={testEmailSignup} disabled={loading}>
                  회원가입
                </Button>
              </div>
              
              <Button onClick={testGoogleLogin} disabled={loading} className="w-full">
                구글 로그인
              </Button>
            </div>
          )}
          
          {message && (
            <div className="p-2 bg-gray-100 rounded text-sm">
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}