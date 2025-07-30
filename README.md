# AI Quiz App

실시간 AI 퀴즈 애플리케이션입니다. 교사는 AI를 활용해 퀴즈를 생성하고, 학생들과 실시간으로 퀴즈를 진행할 수 있습니다.

## 주요 기능

- 🤖 AI 기반 퀴즈 자동 생성 (Google Gemini)
- 📝 수동 퀴즈 생성
- 🎮 실시간 퀴즈 게임
- 📊 실시간 결과 분석
- 👥 다중 참가자 지원
- 📱 반응형 디자인

## 기술 스택

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: Tailwind CSS, Shadcn/UI
- **Backend**: Supabase (Database, Auth, Realtime)
- **AI**: Google Gemini API
- **Deployment**: Vercel

## 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google Gemini AI API Key
GEMINI_API_KEY=your-gemini-api-key
```

## 로컬 개발

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

## Vercel 배포

1. Vercel에 프로젝트 연결
2. 환경 변수 설정 (위의 환경 변수들)
3. 자동 배포 완료

### Vercel 설정

- **Build Command**: `pnpm run build`
- **Install Command**: `pnpm install --no-frozen-lockfile`
- **Node.js Version**: 18.x

## 데이터베이스 스키마

Supabase에서 다음 테이블들이 자동으로 생성됩니다:

- `profiles`: 사용자 프로필
- `quizzes`: 퀴즈 데이터
- `quiz_sessions`: 실시간 퀴즈 세션
- `session_participants`: 세션 참가자
- `participant_answers`: 참가자 답변

## 라이선스

MIT License