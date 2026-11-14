# 잔값 (jangap.com)

커피 한 잔에 드는 비용을 계산하고 비교하는 도구 사이트. Astro 정적 사이트, Vercel 배포.

## 구조
- `src/layouts/Base.astro` 공통 머리말·헤더·푸터 (제목 규칙: `페이지 제목 | 잔값`)
- `src/styles/global.css` 디자인 토큰과 공통 컴포넌트 (문장형 계산기, 결과 행, 인사이트 박스, 표, 견적 띠)
- `src/pages/` 페이지
  - `index.astro` 홈 (도구 목록)
  - `office-coffee-cost.astro` 사무실 커피머신 렌탈 비용 계산기
  - `coffee-beans-1kg.astro` 원두 1kg 몇 잔? 며칠 가는지 계산기
  - `about.astro` 소개, 제휴 고지
  - `privacy.astro` 개인정보처리방침
- `public/fonts/` Pretendard Regular/Bold (상용 한글 2,350자 + 영문 서브셋)

## 오픈 전에 채울 것
- `about.astro`, `privacy.astro`의 `[... 입력 예정]` 자리: 문의 이메일, 보호책임자 이름, 시행일, 양식 서비스
- 사무실 계산기 견적 폼 접수처 연결 (지금은 제출해도 전송되지 않음)

## 로컬에서 보기
```
npm install
npm run dev
```
