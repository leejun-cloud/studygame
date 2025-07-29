import { createClient, SupabaseClient } from '@supabase/supabase-js'

// 이 함수는 클라이언트를 생성하거나, 환경 변수가 없으면 null을 반환합니다.
function createSupabaseAdminClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    // 이 경고는 서버 로그에 표시됩니다.
    console.warn("경고: Supabase URL 또는 Service Role Key가 설정되지 않았습니다. Supabase 관리자 클라이언트에 의존하는 기능은 작동하지 않습니다.");
    return null;
  }

  return createClient(supabaseUrl, serviceKey);
}

// 참고: supabaseAdmin은 SERVICE_ROLE_KEY를 사용하므로 반드시 안전한 서버 측 환경에서만 사용해야 합니다.
// 이 키를 절대로 클라이언트에 노출해서는 안 됩니다.
export const supabaseAdmin = createSupabaseAdminClient();