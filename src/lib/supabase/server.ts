import { SupabaseClient } from '@supabase/supabase-js'

// 앱 시작 충돌의 근본 원인을 해결하기 위해, 서버 측 데이터베이스 연결을 일시적으로 완전히 비활성화합니다.
// 이렇게 하면 앱이 먼저 정상적으로 시작될 수 있습니다.
export const supabaseAdmin: SupabaseClient | null = null;