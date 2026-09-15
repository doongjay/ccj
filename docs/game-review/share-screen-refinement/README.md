# 공유 문구 · 픽셀 하트 · 스크린 위치 — 2026-09-16

## 변경

- 공유 설명을 `2026년 11월 21일 오후 2시\n라시따시어터 그랜드볼룸`으로 통일. description/OG/Twitter 및 Kakao feed, 공유 미리보기 반영.
- 공유 썸네일을 더 굵고 또렷한 픽셀 스타일의 v3 PNG 두 장으로 교체. built-in image_gen 사용, 구도·이름·복장 유지. 2:1/1:1 파일은 각각 1774×887 / 1254×1254. 원래 v2 파일은 artwork/sources/share-pixel-v2에 그대로 보존. 프롬프트와 경로는 ARTWORK.md 참고.
- 화면의 JJ/HS 사이 하트는 7×6 도트 패턴으로 직접 렌더링: Phaser 사각형 + DOM SVG. 모두 #e9a0a7 단색이며 이모지 글꼴에 의존하지 않는다. 청첩장 상단/하단, 메인·웨딩홀·원판 스크린 적용.
- 브라우저 제목의 하트에는 text presentation selector U+FE0E 적용. 브라우저 탭 제목은 웹페이지에서 글자색을 지정할 수 없으므로 분홍색 도형은 화면 내부에만 적용.
- 원판 스크린의 문구 위치·크기·줄 간격을 메인 스크린과 같은 비율로 매핑. 기존 스크린 배경 픽셀, 카메라 프레임, 하객·인물, 나레이션/사진 버튼 위치 유지.

## 검증

`cd game`

- `npm run build`: 종료 0. 기존 번들 500 kB 초과 경고는 남아 있음.
- `npm run typecheck:e2e`: 종료 0.
- `npm run test:e2e -- --config=../docs/game-review/share-screen-refinement/scripts/verify.config.ts`: 7 PASS (공유 6 + 원판 393 1).
- `npm run test:e2e -- --config=../docs/game-review/share-screen-refinement/scripts/group-positions.config.ts`: 3 PASS (320/393/430).
- 원본 HTML과 DOM 메타 설명 개행 확인, 픽셀 PNG 크기 1774×887/1254×1254 확인, native/Kakao payload·복사·클립보드 거부 fallback 검증. 실제 메시지는 전송하지 않았으며 공유 API는 모의 검사. 실제 Kakao 앱의 줄바꿈/캐시는 미검증.
- 세 폭에서 메인→박수→원판→카운트다운→결과→식사→메인 복귀. 스크린의 문구 영역 외 변경 픽셀 0. 메인/원판 문구 상대 좌표 오차 0.004 미만. 하트 단색과 이모지 미사용 검사. 콘솔 오류 0.
- `runs/share-final/**/share-card-formats.png`, `invitation-navigation-*.png`, `runs/group-positions/**/{opening-reference,group-screen-uncovered}-*.png`를 직접 시각 확인. 320/393/430에서 사진 인물/프레임 가림 없음.
- 검증 브라우저는 Chromium. iPhone 실기기는 미검증이며, 이모지 대체 원인을 도형 렌더링으로 제거했다.

## 배포 전 남은 사항

방명록은 여전히 각 방문자 브라우저 localStorage에만 저장된다. 공용 DB 및 JSON/CSV 백업은 미연결. 기존 기록을 지우지 않았으며 Vercel 배포만으로 장기 보존이 제공되지 않는다. `docs/VERCEL_DEPLOYMENT.md` 참고.

다른 검수 폴더, 기존 ZIP, 원본 사진, 미니미 얼굴 아트 및 유도선 배경은 변경하지 않았다.

## 최종 공유 이미지 및 에셋 검사

- `npm run test:e2e -- --config=../docs/game-review/share-screen-refinement/scripts/share-final.config.ts`: v3 연결 후 6 PASS. 최종 공유 카드 PNG 직접 시각 확인.
- 화살표 변경까지 포함한 마지막 `npm run build`: 종료 0. 첫 화면용 에셋 합 3,093,352 bytes는 변하지 않음. 이 값은 네트워크 첫 화면 전체 bytes 재측정값과 다르다.
- `npm run verify:assets -- --report ../docs/game-review/share-screen-refinement/assets-final.json`: 종료 1. 빌드 완료 전에 검사해서 이전 dist와 새 카탈로그가 불일치했고, 새 보존 항목의 runtimeVariant를 URL 대신 파일 경로로 잘못 기입한 오류도 2건 있었다. 기록 보존.
- runtimeVariant를 실제 /assets URL로 수정하고 빌드 완료 후 독립 실행: `npm run verify:assets -- --report ../docs/game-review/share-screen-refinement/assets-final-02.json`, 종료 1. 115/115 파일 검사. 신규 에셋/누락/해시/출처 오류 0. 기존 원본 사진 23개 개별 용량 + 전체 용량, 24건의 한도 초과만 남아 있음. 검사 기준 변경 없음.
- 총 shipping bytes 259,823,609로 이전 260,173,242보다 349,633 bytes 감소. PNG는 생성 출력을 다시 압축하지 않고 복사했다.
- 에셋 명령은 game 작업 디렉터리에서 단독 실행했으며 셸 리디렉션을 사용하지 않았다. `logs/assets-final*.log`와 원본 JSON reporter 보존.
