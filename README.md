# ccj

이재준 ♥ 김현서 결혼식 게임형 청첩장.

- `docs/` — 기획 문서 (introduction, scenario, map, design, plan)
- `game/` — 게임 코드 (Vite + TypeScript + Phaser 4)

## 빠른 시작

```bash
cd game
npm ci
npm run dev -- --host 127.0.0.1
```

프로덕션 빌드 확인:

```bash
cd game
npm run build
npm run preview -- --host 127.0.0.1
```

브라우저 E2E:

```bash
cd game
npm run test:e2e
```

## 배포

`game/dist/`를 정적 호스팅(Vercel, Netlify, Cloudflare Pages 등)에 올리는 구조입니다. 배포 전에는 `npm ci`, `npm run build`, `npm run test:e2e`, preview 수동 QA를 순서대로 통과시켜야 합니다.

카카오톡 공유 미리보기는 `game/index.html`의 OG/Twitter 메타 태그와 `game/public/assets/lacitta/share/og-lacitta-wedding.png`로 준비되어 있습니다. 실제 카카오 캐시/미리보기 노출은 배포된 공개 URL에서만 최종 확인할 수 있습니다.
