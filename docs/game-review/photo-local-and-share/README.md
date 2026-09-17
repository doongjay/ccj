# 사진 저장 제거 · 공유 이미지 수정

## 반영 범위

- 게임 촬영물의 Supabase 업로드·사진 전송 상태를 제거했다. 촬영, 결과 감상, 직접 복귀, 로컬 수첩은 유지한다. 방명록 구현과 기존 서버 데이터는 변경하지 않는다.
- 공유 설명은 `2026년 11월 21일 오후 2시\n라시따시어터`다. 실제 청첩장 장소 안내의 그랜드볼룸은 유지한다.
- 신랑 포토테이블 첫 사진과 로비 첫 액자는 사용자가 다시 제공한 JPEG 원본을 사용한다. 재인코딩 없이 4,993,418 bytes, SHA-256 `5e8432da926dda230a010a9f06c0b0125deb334868496db243154e41f97887e3`다.
- 썸네일 위 이름/하트/작은 꽃 장식을 제거하고, 신부 왼쪽 `현서`, 신랑 오른쪽 `재준`을 검정 픽셀 화살표로 표시했다. 바깥 테두리 꽃과 기존 인물 그림은 유지한다.
- 사용자의 마지막 정정에 따라 게임 신랑·신부 얼굴은 변경하지 않는다. 미사용 얼굴 시안은 shipping에서 제외하고 로컬 `cancelled-couple-draft/`에 보관한다.

## 이미지 결과

Built-in image_gen을 사용했다. 최종 프롬프트는 [imagegen-prompts.json](imagegen-prompts.json)에 기록했다. CLI는 사용하지 않았다.

- `game/public/assets/invitation/share-pixel-wide-v4.png` — 일반 링크 미리보기, 1774×887.
- `game/public/assets/invitation/share-pixel-square-v4.png` — 카카오 공유, 1254×1254.
- 원본 결과는 `game/artwork/sources/share-pixel-v4/`에도 보관한다. 이전 v3 파일은 보존한다.

## 검증 기록

- `logs/cloud-01.json`: 1 PASS / 2 FAIL. 복귀 후 로비 준비 완료 전에 수첩을 클릭한 테스트 타이밍 실패. 실패 영상·trace·오류 문맥은 `runs/cloud-01/`에 보존했다.
- `logs/cloud-02.json`: 3 PASS. 로비 준비 완료를 기다린 후 재검증. Supabase 설정이 있는 환경에서 포토부스·신부대기실·원판 사진 촬영의 클라우드 요청 0건, 5.5초 이상 감상, 직접 복귀, 수첩 유지, 콘솔 오류 0건을 확인했다.
- `logs/local-01.json`: 16 PASS. 촬영 3건, 공유 6건, 하객별 포토테이블 7건. 실제 Chromium에서 320×568 / 393×852 / 430×932 화면을 촬영했다.
- `logs/production-01.json`: 1 FAIL. 취소 대상인 게임 얼굴 시안 URL을 기대했던 검사 실패. 런타임은 원래 얼굴을 유지하고 있었다. 정정된 요구사항에 맞춰 기존 얼굴 URL을 검증하는 재검사를 수행했다.
- `npm run build`: 종료 코드 0. TypeScript, E2E 타입 검사, Vite 배포 빌드 통과. 기존 500KB chunk 경고는 남아 있다.
- `logs/production-02.json`: 1 PASS. 캐시를 끈 Chromium CDP 실측 첫 화면 3,543,588 bytes < 5,000,000 bytes, 초기 포토테이블 요청 없음, 기존 게임 얼굴 파일 사용, 신랑 첫 사진 원본 SHA 일치, 콘솔 오류 0건. 상세 요청은 `first-screen-performance.json`.
- 최종 통과 집계는 cloud-02 3건 + local-01 16건 + production-02 1건 = 20건이다. 서로 다른 환경의 촬영 중복 사례를 포함한다. 전체 프로젝트 회귀 테스트를 실행했다는 뜻은 아니다.
- 실제 카카오 앱의 미리보기 표시나 캐시 갱신은 검증하지 않았다. 브라우저 미리보기, 메타데이터, 카카오 SDK 전달값을 확인했다.
- 방명록 저장 테스트와 실제 Supabase 쓰기는 사용자 지시에 따라 실행하지 않았다.

## 에셋 검사 기록

`game/`에서 `npm run verify:assets -- --report ../docs/game-review/photo-local-and-share/assets-final-01.json`을 셸 리디렉션 없이 독립 실행했다. 종료 코드 1. 원본 보고서를 보존했다.

첫 실행에서는 없는 증빙 README 3건, 취소 대상 얼굴 시안의 runtime URL 불일치 1건, 사진별 용량 초과 24건, shipping 전체 용량 초과 1건을 보고했다. README와 취소 시안 등록은 정리했다. 사용자가 요청한 원본 사진 품질을 위해 사진별/전체 용량 제한 오류는 숨기거나 기준을 완화하지 않는다. 최종 재검사에서 정확한 잔여 결과를 기록한다.


## 최종 에셋 검사 결과

- `assets-final-02.json`: 종료 코드 1. 빌드 완료 전 검사로 이전 dist의 취소 시안 1개가 미등록으로 잡혔다. 이전 결과를 보존하고 빌드 완료 후 재검사했다.
- `game/`에서 `npm run verify:assets -- --report ../docs/game-review/photo-local-and-share/assets-final-03.json` 독립 실행, 종료 코드 **1**.
- 등록·검사 144개, runtime key 38개. 누락/미등록/해시/런타임 URL 오류는 없다. 사진 개별 용량 초과 24건 + shipping 총량 초과 1건 = **25건 실패**다. 검사 결과는 PASS로 처리하지 않았다.
- 기존 `HEAD:docs/game-review/invitation-photo-loading/assets-final.json`에도 23개 사진 용량 초과 + shipping 총량 초과 = 24건이 기록되어 있다. 이번 교체 원본 `groom-01-v2.jpeg` 4,993,418 bytes가 추가로 개별 3MB 제한을 초과한다.
- shipping 총량 272,009,169 bytes는 첫 진입 다운로드와 구분한다. 첫 진입 실측은 위 3,543,588 bytes다.
- 검사기는 사전 용량 오류로 decode 단계에 진입하지 않아 `decoded: 0`이다. 전체 에셋 디코드 합격을 주장하지 않는다. 변경 이미지의 실제 브라우저 렌더링은 별도로 확인했다.

## 화면 확인

- `after/share-card-formats.png`: 일반/카카오 공유 비율, 좌우 이름, 검정 화살표, 상단 이름 장식 제거, 설명 2줄을 직접 확인했다.
- `after/photo-table-groom-1-393.png`, `after/lobby-frames-groom-4x.png`: 신랑 원본 교체와 첫 액자 반영을 확인했다.
- `after/group-local-393.png`, `after/bridal-local-320.png`, `after/booth-local-430.png`: 촬영 결과와 복귀 동작을 확인했다. 게임 얼굴은 기존 버전이다.
- 320×568 / 393×852 / 430×932에서 촬영 결과, 양측 포토테이블, 공유 UI를 테스트했다. 원본 run 영상과 실패 trace는 로컬 `runs/`에 보존한다.
- 방명록 관련 runtime 파일, 마이그레이션, 게임 얼굴 원본/런타임 에셋은 HEAD와 동일하다.
