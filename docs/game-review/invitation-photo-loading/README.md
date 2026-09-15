# 청첩장 사진 준비 · 2026-09-16

사용자는 처음에는 원본 화질 유지를 요청했고, 이후 사진 로딩 지연을 지적하며 자신의 Heumcard 청첩장 정도의 표시 화질을 허용했다. 원본과 포토테이블은 변경하지 않고 청첩장의 표시용 파일만 분리했다. 방명록은 사용자가 검증한 원격 패치를 유지하며 추가 수정·검증하지 않는다.

## 표시 사진

- 사용자 지정 사진 순서 유지. 갤러리 23장 및 표지·달력·카운트다운 3장.
- 원본 총 173,589,471 bytes → 표시용 총 4,254,166 bytes (약 97.5% 감소). 다른 안내 사진/JS/게임 에셋은 이 숫자에 포함하지 않는다.
- 긴 쪽 최대 1920px, WebP quality 92, 비율·ICC 프로파일 유지. 이미지 확대·잘라내기·인물 보정 없음. 3번째 갤러리 썸네일의 기존 왼쪽 기준 cover crop 유지.
- `game/scripts/prepare-invitation-photos.py`로 재생성. 원본 26개 SHA-256 전후 일치. `photo-variants.json`에 파일별 크기·해상도·해시 기록.
- 기준 링크: https://www.heumcard.com/cards/now-2026-11-21 . 해당 HTML에서 식별한 첫 갤러리 이미지 2개를 직접 내려받아 확인: 1253×1920 / 1920×1280, 1,762,581 / 1,769,276 bytes. 비교 PNG 2장과 표시용 전체 26장 contact sheet를 직접 시각 확인했다.
- 기준 사이트의 브라우저 자동 캡처는 이미지 locator가 실제 DOM과 맞지 않아 2회 실패했다. 실패 JSON/trace 보존. 사이트 자동 검증 통과로 보고하지 않는다. 위 해상도·용량은 실제 내려받은 이미지 파일에서 측정했다.

## 로딩 정책

- 게임 첫 화면: 청첩장 사진 요청 없음. 초기 부팅에 169MB 원본 또는 새 사진 묶음을 추가하지 않는다.
- 출발/이어하기/처음부터: 1.5초 후 표시용 사진을 낮은 우선순위로 한 장씩 미리 받는다. 현재 게임 장면 로딩 중이거나 탭이 숨겨진 동안 새 사진 요청을 기다린다.
- 청첩장 직접 열기/게임에서 열기: 전체 33개 이미지가 decode 완료된 뒤 본문을 한 번에 표시한다. 준비가 250ms 이상 걸릴 때만 진행 표시. 브라우저가 미리 받은 사진을 재사용한다.
- 실패: 부분 사진이 섞인 본문을 공개하지 않고 재시도 버튼 표시. 실패한 이미지만 다시 시도. 키보드 초점 유지.
- 원본을 삭제하거나 재압축하지 않았다. 기존 shipping 용량 한도 초과는 원본이 public에도 보존되어 남아 있다. 검사 기준을 낮추지 않는다.

## 검증 기록

`scripts/verify.config.ts` 첫 실행은 새 테스트의 JSON import attribute 누락으로 실행 전 종료. 수정 후 5 PASS / 1 FAIL: 재시도 성공 뒤 초점 복귀가 실패했다. 로더에서 버튼을 숨기기 전에 초점 위치를 기록하도록 수정했다. 실패 로그·JSON·trace·영상은 보존했다.

최종 브라우저 결과는 `logs/final.json`, production 결과는 `logs/production.json`, 첫 화면 실측은 `first-screen-performance.json`, 제한 네트워크 실측은 `invitation-performance.json`에 기록한다. 전체 방명록·클라우드 테스트는 실행 범위에 포함하지 않는다.

## 최종 결과

- `npm run build`: 종료 0. 새 테스트의 이미지 타입 단언 누락으로 중간 1회 typecheck 실패 후 수정. 기존 번들 500 kB 경고 기준 유지.
- `npm run test:e2e -- --config=../docs/game-review/invitation-photo-loading/scripts/final.config.ts`: 22 PASS. 사진 로딩 6, 공유 6, 원판 스크린 3, 미니미 외형·화살표 7. 새 방명록 메시지 작성이나 서버 검증은 하지 않음.
- `npm run test:e2e -- --config=../docs/game-review/invitation-photo-loading/scripts/production.config.ts`: 2 PASS. 배포 빌드 첫 게임 화면 실측 전송량 3,543,034 bytes로 5 MB 이하. 이때 청첩장 표시용 사진 요청 0.
- 직접 청첩장: 로컬 production preview, cold cache, Chromium 393×852, 모의 20 Mbps/40 ms에서 준비까지 약 8.40초, 전체 전송량 18,670,624 bytes. 이는 게임 엔진·미니미·안내 등 모두 포함하며 표시용 사진 4.25 MB와 구분한다. 실제 iPhone/운영망 시간 보장은 아니다.
- 게임 중 표시용 26장 미리 받기 완료 후 청첩장에서는 이미지 본문 재전송 없이 브라우저 캐시 재사용을 확인했다. 제한 네트워크에서는 직접 진입 시 준비 시간이 여전히 필요하며 그동안 부분 이미지 대신 진행 상태를 표시한다.
- 320×568 / 393×852 / 430×932, DPR 3: 전체 사진 준비 전 본문 미표시, 준비 뒤 33개 IMG complete·naturalWidth 확인. 갤러리·확대·3번째 crop·화살표·공유·게임 사진 흐름 유지, 정상 시 콘솔 오류 0. 오류 주입 재시도와 키보드 초점 복귀 통과.
- `npm run verify:assets -- --report ../docs/game-review/invitation-photo-loading/assets-final.json`: 종료 1. 141개 파일 등록/검사, 신규 누락·해시·출처·빌드 불일치 0. 원본 사진 23개 개별 용량 및 전체 용량 기준 초과 총 24건은 남아 있다. 전체 shipping 264,077,775 bytes. 원본을 삭제하거나 검사 기준을 낮추지 않았다. 메타데이터 오류가 있으면 이 검사의 decode 단계는 실행되지 않으므로 decoded=0이다. 표시용 26장 decode는 별도 실제 브라우저에서 확인했다.
- 기존 검수 폴더와 ZIP은 보존. 원본 갤러리·포토테이블·얼굴 아트·원격 방명록 구현은 변경하지 않았다.

AFTER 캡처: `after/invitation-ready-{320,393,430}.png`, `after/gallery-ready-{320,393,430}.png`. 확대 화면과 정상 속도 영상은 로컬 `runs/browser/` 및 `runs/production/`에 보존했다. 공유 픽셀 이미지·프롬프트 기록은 `../share-screen-refinement/ARTWORK.md`에 있다.
