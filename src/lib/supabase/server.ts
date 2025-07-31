import { createClient } from '@supabase/supabase-js'

// 참고: supabaseAdmin은 SERVICE_ROLE_KEY를 사용하므로 반드시 안전한 서버 측 환경에서만 사용해야 합니다.
// 이 키를 절대로 클라이언트에 노출해서는 안 됩니다.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  // 앱 충돌을 방지하기 위해 서비스 키가 없는 경우 빈 문자열을 전달합니다.
  // 이 경우 클라이언트는 익명 사용자로 작동하며, 권한이 필요한 작업은 실패하지만 앱 자체는 실행됩니다.
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)