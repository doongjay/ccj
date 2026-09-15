# JJ ♥ HS

현서와 재준, 현재의 시작 — 라시따시어터 결혼식을 배경으로 한 픽셀 아트 게임형 청첩장입니다.

하객 미니미를 꾸미고, 자동차·지하철로 이동해 로비를 둘러본 뒤 예식과 식사를 즐깁니다. 모바일 청첩장에는 원본 사진 갤러리, 오시는 길, 메시지와 공유 기능이 있습니다.

## 실행

Node.js와 npm이 필요합니다.

```bash
cd game
npm ci
npm run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

접속: <http://127.0.0.1:5174/> · 청첩장 바로 보기: <http://127.0.0.1:5174/#invitation>

## 구성 · 검증

- `game/`: Phaser 4 · TypeScript · Vite, Playwright 테스트와 원본 에셋
- `docs/`: 기획, 에셋 출처, 검수 기록과 배포 안내
- `game/`에서 `npm run build`, `npm run test:e2e`, `npm run verify:assets` 실행
- 원본 사진 품질을 유지하며, 기존 에셋 용량 기준 초과 항목은 검수 기록에 명시합니다.
- 진행 상황·수첩·메시지는 현재 브라우저에 저장됩니다.

## 배포 · 공유

Vercel Hobby에서 Root Directory는 `game`, Framework는 `Vite`, 빌드는 `npm run build`, 결과 폴더는 `dist`로 설정합니다. [배포·도메인 연결 안내](docs/VERCEL_DEPLOYMENT.md)

`SITE_URL` 또는 Vercel 기본 도메인을 공유 주소로 사용합니다. 카카오 카드 공유는 `VITE_KAKAO_JAVASCRIPT_KEY`와 도메인 등록이 필요하며, 미설정 시 기기 공유창 또는 링크 복사로 전달합니다. 환경 변수 예시는 [game/.env.example](game/.env.example)을 참고하세요.
