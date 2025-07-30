import { createClient } from '@supabase/supabase-js'

// 참고: supabaseAdmin은 SERVICE_ROLE_KEY를 사용하므로 반드시 안전한 서버 측 환경에서만 사용해야 합니다.
// 이 키를 절대로 클라이언트에 노출해서는 안 됩니다.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)