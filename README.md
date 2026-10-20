# 💣 지뢰찾기 (Minesweeper)

2022022004 천문우주학과 황채연

React + Vite로 만든 지뢰찾기 웹 게임입니다. 모든 플레이어의 게임 결과(승/패, 소요 시간)는 Supabase에 저장되고,
게임 리뷰를 작성할 수 있습니다. 회원가입/로그인 없이 바로 플레이합니다.

## 기술 스택
- Frontend: React 19, Vite
- DB: Supabase (Postgres, RLS로 익명 읽기/쓰기 허용)
- 배포: Vercel, 코드 관리: GitHub

## 실행 방법
```bash
npm install
cp .env.example .env   # Supabase URL / anon key 입력
npm run dev
```

## Supabase 설정
1. Supabase 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 실행 (scores, reviews 테이블 + RLS 정책)
3. Project Settings → API 에서 URL과 anon key를 `.env` 와 Vercel 환경변수에 입력
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 게임 방법
- 좌클릭: 칸 열기 / 우클릭(모바일은 길게 누르기): 깃발
- 숫자 칸 클릭: 주변 깃발 수가 맞으면 나머지 칸 한번에 열기
- 첫 클릭은 항상 안전합니다.
