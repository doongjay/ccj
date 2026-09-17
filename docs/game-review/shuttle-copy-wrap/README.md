# 지하철 줄바꿈·사진 상태 문구 검증

검증일: 2026-09-17. 기준 커밋: `cfb73d7`.

## 변경

- `game/src/scenes/SubwayRouteScene.ts`: 잘못된 출구 안내를 `셔틀버스는\n5번 출구 앞 이었던것 같은데...`로 고정. 타이핑 시작 시부터 두 줄로 배치된다.
- `game/src/ui/photoUpload.ts`: 포토부스·신부대기실·원판 사진의 전송 중/완료 안내를 제거. 저장 중·완료 시 빈 상태 영역도 숨긴다. 기존 사진 저장 및 실패 후 재시도는 유지한다.
- `game/e2e/cloud-photos.spec.ts`: 실제 사진 결과 UI에서 저장 중/완료 문구가 없는지, 실패 안내와 재시도가 작동하는지 검증한다. 요청 PNG·이름·사진 종류·저장 경로·재시도 횟수 검사 유지. 브라우저 로그를 JSON에 첨부한다.
- `game/e2e/cloud-live.spec.ts`: 사진 저장 완료 확인을 삭제된 문구 대신 저장 상태로 갱신했다. 이 테스트는 실행하지 않았다.
- `game/e2e/review-batch-b-guidance.spec.ts`, `game/e2e/review-silhouette-ux.spec.ts`, `game/e2e/review-touch-refinement.spec.ts`, `game/e2e/route-tried-disabled.spec.ts`: 새 지하철 문구에 맞춰 기대 문자열 갱신.

방명록 구현과 서버 저장 코드, 에셋은 변경하지 않았다. 실제 Supabase에 테스트 자료를 저장하지 않았다.

## 링크 설명 확인

`game/index.html`의 description/OG/Twitter 메타태그와 `weddingMetadata.ts`의 카카오 공유 설명에는 이미 `오후 2시` 직후 줄바꿈이 들어 있었다. 이번에는 변경하지 않고 다음 값을 재검증했다.

```text
2026년 11월 21일 오후 2시
라시따시어터 그랜드볼룸
```

원본 HTML을 파싱한 메타태그 값, 카카오 SDK에 전달되는 데이터, 웹 미리보기 모두 확인했다. `after/share-card-formats.png`는 프로젝트의 웹 미리보기 캡처이며 실제 카카오톡 대화방 캡처가 아니다. 실제 카카오톡/iPhone 카드의 표시와 캐시는 미검증이다.

## 실행 결과

명령의 작업 디렉터리는 `game/`이다.

| 명령 | 결과 | 기록 |
| --- | --- | --- |
| `npm run build` | 종료 0, TypeScript·e2e 타입 검사·프로덕션 빌드 통과 | `logs/build.json` |
| `npm run test:e2e -- --config=../docs/game-review/shuttle-copy-wrap/scripts/verify.config.ts` | 3 PASS | `logs/browser.json` |
| `npm run test:e2e -- --config=../docs/game-review/shuttle-copy-wrap/scripts/typing.config.ts` | 3 PASS | `logs/typing.json` |
| `npm run test:e2e -- --config=../docs/game-review/shuttle-copy-wrap/scripts/photos.config.ts` | 3 PASS | `logs/photos-02.json` |
| `npm run test:e2e -- --config=../docs/game-review/shuttle-copy-wrap/scripts/share.config.ts` | 6 PASS | `logs/share.json` |

현재 검증 대상은 총 **15개 테스트 PASS / 0 FAIL / 0 SKIP**. 전체 프로젝트 테스트 집계가 아니다. 사진 테스트의 앞선 3 PASS 실행도 `logs/photos.json`과 `runs/photos/`에 보존했다. 콘솔 기록 추가 후 `photos-02`로 다시 실행했으며 이전 결과를 덮어쓰지 않았다.

사진 테스트는 인증·Storage·DB 요청을 모두 브라우저에서 모의 응답한다. 첫 DB 쓰기의 503과 중복 업로드의 409는 의도한 실패/재시도 시나리오다. 이 두 응답 외 콘솔 오류와 pageerror는 0건이다. 방명록 테스트와 실제 클라우드 테스트는 실행하지 않았다. 기존 500 kB 번들 경고는 그대로이며 빌드는 성공했다. 에셋 변경이 없어 에셋 검사는 재실행하지 않았다.

## 실제 브라우저 확인

- Chromium, DPR 3, 지하철 320×568 / 393×852 / 430×932. 1·3·2·4번 출구 오답, 회색 비활성화, 키보드 이동, 5번 정답→로비, 새 여정 초기화 확인. 콘솔 오류 0건.
- 자연 속도 타이핑 도중 모든 문자의 위치를 최종 문구와 비교해 0.5 CSS px 이내임을 확인. 타이핑 중·완료 PNG를 직접 시각 확인했다.
- 사진 3종은 393×852에서 촬영하고 375 / 768 / 1280 폭에서 실패·성공 결과 캡처. 375 폭의 세 성공 결과를 직접 확인해 삭제 문구나 빈 안내 단락이 없는지 확인했다.
- 공유·청첩장 버튼은 320 / 393 / 430 폭에서 테스트. 메타태그와 공유 데이터의 날짜/장소 줄바꿈 일치, 복사·공유·실패 시 텍스트 선택 동작 유지.

대표 PNG 8개는 `after/shuttle-*`, `after/*-saved-375.png`, `after/share-card-formats.png`에 있다. 원본 전체 캡처와 실시간 영상은 `runs/`에 로컬 보존한다. `logs/source-fingerprint.json`에 검증한 변경 파일의 SHA-256을 기록했다. 기존 Batch 검수 자료는 보존했다.
