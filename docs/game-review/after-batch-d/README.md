# Batch D 통합 검수

2026-09-14. D-A01, C-P01, F16–F23 구현 및 최종 Chromium 검증을 완료했다. **F22는 실기기 검증이 남아 PARTIAL**이며 출시 전체 승인을 뜻하지 않는다. F24는 후보 선별 문서만 작성했고 실제 아트 재가공과 F25는 시작하지 않았다. 외부 배포·공유·전송은 하지 않았다.

## 항목별 판정과 수용 기준

정확한 파일별 목적은 [CHANGED_FILES.md](CHANGED_FILES.md), 이슈별 전체 파일 경로는 [issue-files.json](issue-files.json)에 있다. 앱·테스트 62개 텍스트 파일과 검수 상태를 추가한 루트 리뷰 문서 2개, 바이트 변경 없이 이동한 제작 원본 56개를 구분한다. [batch-d.patch](batch-d.patch)는 **Batch D 시작 직전 스냅샷** 기준이다. 이전 A/A1/B/C 미커밋 변경을 HEAD diff로 섞지 않았다.

| 항목 | 판정 | 구현과 확인한 수용 기준 | 주요 근거 |
|---|---|---|---|
| D-A01 | PASS | 공개·production 파일 전체와 실제 32개 runtime key, CSS/동적 사진 URL을 대조. 98개 등록/검사, 97개 이미지 decode, 알 수 없는 shipping 파일 0. 기존 40개 모두 개별 추적. 범위 축소 없이 정상 exit0, 대표 누락·중복·decode·sheet 오류는 실패. 양측 여정/후반 사진/뷔페/청첩장 및 cold cache 통과 | `asset-audit.md/json`, `assets-final.json`, `assets-negative-final.json`, `assets-negative-decoding.json`, 최종 reporter |
| F16 | PASS | 공통 release-inside 입력, drag-out/touchCancel/blur/장면 수명 정리, idle/hover/pressed/disabled와 명확한 키보드 focus. disabled 포인터·키보드 일치, Enter 길게 누르기의 새 모달 연속 실행 방지. 기존 접근성 이름·오류·44px 유지 | `f16-canceled.png`, `f16-disabled.png`, `f16-keyboard-focus.png`, input-motion 및 기존 A/B 키보드 완주 |
| F17 | PASS | 공통 reduced-motion 상태와 live 변경/정리. 세 사진 장면 정상·감소 모드 실제 완료. 감소 모드 fullscreen flash 0, REC tween 0, 정적 성공/서로 다른 반응 유지. 사진 유지 후 직접 복귀와 진행도 동일 | `f17-{normal,reduced}-motion.json`, `f17-reduced-{booth,bridal,group}.png`, 영상05/06, `resource-revisit.json` |
| F18 | PASS | versioned semantic checkpoint와 안전 경계, 사진 촬영 당시 메타데이터 지연 복구. 1장/2장 실제 픽셀·진행·외형 일치, 식사 먼저/나중·촬영/예식 중 reload·저장/생략/재시작·손상/거부/quota/구버전 검증. 방명록 보존. 320/393/430 이어하기 44px 및 간격 검사 | `checkpoint-photo-observations.json`, `f18-continue-*`, `f18-restored-notebook-*`, 오류 PNG, `normal-resume.json`, 영상04 |
| F19 | PASS | 주차 안내도 문맥, moving/parked 차량 동일 top-down·NEAREST 2배 아이콘. 기존 B3/타워/이마트 경로와 설명 보존. 잘못된 길 복귀 및320 표시·정상 로비 도착 | `f19-{b3,tower,emart}-*.png`, `parking-*.json`, 영상07/08 |
| F20 | PASS | 기존 음식 내용/비율을 유지한 수동3장 카드, 이전/다음·직접 식사 종료. 자동 넘김/필수 열람/신규 메뉴 없음. 320/393/430, 양쪽 식사 순서·운전자 문구·키보드·중복 식사 방지 | `f20-buffet-{320,393,430}.png`, venue/tap-pacing/현재 여정, 영상09 |
| F21 | PASS | 필수 장소 크림 명패/편의시설 딥그린 명패, 얇은 골드 테두리. 이름·위치·물리 hit/floor 경로 유지. 8개 라벨 실제 bounds/14px/겹침·필수 장소 접근 및 정보형 수첩 회귀 확인 | `frame-geometry.json`, `frame-layout-*.json`, `f21-f22-lobby-*`, production PNG |
| F22 | PARTIAL | 크림 외부 프레임과 canvas margin containment로 불필요한 body scroll 해결. 720×1280 FIT/원본 배경 유지. 다섯 viewport, 높이 변경·회전·기존 가로 대안·필수 조작·입력 표시 자동 검증 PASS. **실제 iPhone/Android safe area, 주소창, OS 키보드는 미검증** | `frame-layout-*.json`, `production-final-reconciliation.json`, `production-f21-f22-lobby-*`, A F06 회귀 |
| F23 | PASS | 현재 외형의 4방향×2걸음 atlas를 필요한 profile에만 생성·재사용. 거리 cadence와 도착 idle, 얼굴·발 pivot 유지, 실제 경로 재지정·장애물 우회, 10/50/250ms 동일 이동 검사. 90개 외형 조합 검증, 군중/사진 기존 pose 보존 | `animation-profile-audit.json`, 남/여 의상 pose PNG, `walking-observations.json`, 영상03 |
| C-P01 | PASS | 기존 complete bent-arm 포즈에 작은 손 모음/벌림, 주체 가까운 꼬리 말풍선. 기존 하트/고마워·커플 위치 유지, 약1.25초 정상 반응 후 단체사진1회. 양측·키보드·포인터·감소·반복·청첩장 pause 별도 검증 | `normal-applause.json`, `normal-cheer.json`, `cp01-*.png`, 영상01/02 및 별도10 |

F23은 **4방향×2걸음 = 8프레임**이며 8개의 방향을 새로 만든 것은 아니다. 박수는 기존의 bent-arm/seated 의상 전체를 사용한다. 서 있는 다리가 그대로라는 주장을 하지 않는다. 초기 합성의 의상 허리 잘림은 시각적으로 탈락시켰으며 해당 PNG와 실패 기록도 보존했다.

## 최종 테스트와 별도 에셋 검사

최종 source fingerprint: `1402719dd9a38740f9b3955698e0ca61dd028dbfb2467650529ac2f33bf1858e` (304개 파일). commit `a2a31405940560e169c819ee0f2677f073ccba40` 위의 보존된 dirty working tree다. Node23.11.0, npm10.9.2, Playwright1.62.1, Chromium151.0.7922.34, Vite8.2.1. WebKit/Firefox/실제 폰은 미실행이다.

| 최종 실행 | PASS | SKIP | FAIL | 자동 retry | 기록 |
|---|---:|---:|---:|---:|---|
| dev 전체, chromium | 112 | 3 | 0 | 0 | `logs/regression-final.json/log`, `dev-final-reconciliation.json` |
| production, chromium-production | 32 | 0 | 0 | 0 | `logs/production-final.json/log`, `production-final-reconciliation.json` |
| 별도 5174 첫 화면·정상 사진 복구 | 2 | 0 | 0 | 0 | `logs/local-server.json/log` |
| 별도320 이어하기 실제 입력 | 1 | 0 | 0 | 0 | `logs/resume-layout-03.json/log` |

main dev+production은 **147 project cases = 144 PASS /3 SKIP /0 FAIL**, 서로 다른 논리 테스트 **116개**다. 별도 smoke/320 검사와 아래 Node fixture를 main 수에 합치지 않았다. raw JSON의 모든 개별 결과와 요약이 일치한다([TEST_SUMMARY.json](TEST_SUMMARY.json)). SKIP3개는 dev에서 production 전송량/복구를 판정하지 않기 위한 것으로, 같은 이름의 production 실행은 모두 PASS다. 테스트명·프로젝트·사유·대응 결과는 REVIEW_NOTES와 TEST_SUMMARY에 있다.

정상 shipping `npm run verify:assets -- --report ../docs/game-review/after-batch-d/assets-final.json`: **exit0, 98/98, errors0** (`logs/assets-final.log`). 별도 `node --test scripts/verify-shipping-assets.test.mjs`: **5 PASS, exit0**. 다섯 fixture의 내부 검사기는 의도된 오류에 각각 exit1이었다. 실제 public/dist 복사본의 손상 PNG 및 잘못된 legacy sheet 계약도 각각 실패함을 브라우저 검사로 확인했다. 테스트 집계와 shipping 판정을 섞지 않았다.

최종 명령은 `game/`에서 실행했다:

```sh
npm run build
npm run verify:assets -- --report ../docs/game-review/after-batch-d/assets-final.json
node --test scripts/verify-shipping-assets.test.mjs
npm run test:e2e -- --config=playwright.review.config.ts --workers=3 --output=../docs/game-review/after-batch-d/runs/regression-03
npm run test:e2e -- --config=playwright.review-production.config.ts --workers=2
npm run test:e2e -- --config=../docs/game-review/after-batch-d/verification-scripts/local-server.config.ts
```

build/TS/e2e typecheck exit0은 `logs/build-final-04.log`. Vite의 기존 큰 bundle 경고는 숨기지 않았다. 이전 `regression-01`의109 PASS/3 FAIL/3 SKIP와 `regression-02`의112 PASS/3 SKIP는 **최종 수에 합산하지 않는다**. 실제 Player 수명 오류와320 겹침, QA observer/collection/서버 수명 실패 및 수정 이유를 REVIEW_NOTES에 적었다. `unit-run-history.json`은27개 별도 reporter 실행과 모든 오류/시도를 보존한다. 일부 초기 CLI stdout 미회수 한계도 명시했다.

## 성능·저장·자원

실제 production cold-cache CDP `Network.loadingFinished.encodedDataLength` 합산이다. HTML/JS/CSS/응답 헤더를 포함하며 manifest 부분합으로 대체하지 않았다. 원 요청별 기록과 C 원본 경로/해시는 `regressions/performance-*.json`, `PERFORMANCE_COMPARISON.json`에 있다.

| 지점 | D 전체 bytes | C 대비 | D 게임 에셋 bytes | C 대비 |
|---|---:|---:|---:|---:|
| 첫 화면 양 경로 | 3,513,647 | +4,336 | 3,094,744 | 0 |
| 자차 첫 로비 누적 | 12,673,227 | +4,336 | 12,254,324 | 0 |
| 지하철 첫 로비 누적 | 12,387,062 | +4,336 | 11,968,159 | 0 |

첫 화면5,000,000 bytes 이하 PASS. 로컬 무제한 네트워크의 opening 관측761/733ms는 실사용 통신망 지연 보증이 아니다. 첫 화면 후반 자산·첫 로비 미선택 경로 자산 요청0, 정상 두 여정 errors/failed requests0. 로딩 복구의 의도된 실패 요청1건은 `regressions/load-recovery.json`으로 따로 남겼다.

checkpoint는 사진1장545 bytes,2장635 bytes이며 base64 사진을 저장하지 않는다. 최종 production 재구성 시간122/263ms는 `checkpoint-photo-observations.json`에 기록되어 있다. 실제 같은 profile의 재방문/재시작 뒤 decoded pixel accounting은 두 번 모두128,058,432 bytes, native preference listener2, 세션 사진0/overlay0로 같았다(`resource-revisit.json`). 정당한 최초 lazy allocation과 이미 해제된 Text UUID를 구분했으며 전체 브라우저 메모리 안전성 인증은 아니다.

## 보존·화면·영상

기존 미등록40개는23개 단계 로더 master+1개 CSS 단체사진 master가24개 무손실 최적화 파생본으로 연결되고,16개는 직접/간접 참조와 빌드 복사를 조사해 비배포 제작 자료로 보존했다. 미사용이라는 추정만으로 일괄 삭제하지 않았다. 총56개 제작 master를 `game/artwork/sources/`로 바이트 그대로 옮겼다. 원래 이미지/폰트154개 및 기존 A/A1/B/C 증빙962개가 변경되지 않았음을 해시로 대조했다. 출처의 실제 기록과 한계, 유한 예산의 근거는 `asset-audit.md/json`에 있다.

[VISUAL_VERIFICATION.md](VISUAL_VERIFICATION.md)는 실제 최종 Chromium viewport PNG와 영상 프레임을 보고 내린 판정이다. 기존 C의 같은 로비 상태와 비교했다. 원본 PNG를 유지하고 큰 full-page 캡처를 viewport로 오해하지 않았다. F18 320px 수정 전 PNG는 **BEFORE 진단 자료**로 구분한다.

정상 속도 영상10개는 `videos/`에 있다. [VIDEO_NOTES.md](VIDEO_NOTES.md)와 `videos/INDEX.json`에 원본 경로/해시/길이/해상도/명령이 있다. 7개는 바이트 동일 원본 복사, 정상 박수·환호와 별도 pause3개는 연속 구간 stream-copy만 했다. 모든 packet 데이터와 시간 간격 동일성을 검증했다. 배속·보간·중간 구간 삭제·재인코딩을 하지 않았다. 사진 결과5.5초와 직접 복귀를 유지했다.

## 남은 확인과 범위 제외

- F22 실제 iPhone/Android safe area·주소창·소프트 키보드, 미설치 WebKit/Firefox 검증은 남아 있다. 자동 Chromium의 viewport/입력 검사로 대체 통과시키지 않는다.
- F24는 [F24_ART_TRIAGE.md](F24_ART_TRIAGE.md)에 재가공 후보0개와 화면별 근거만 적었다. F24 실제 아트 수정/F25는 미실행이다.
- 패키지에서 제외한 full-run 영상/대형 trace/중복 기록의 경로·크기·해시·이유는 `EXCLUDED_FILES.json`에 있다. 원본은 삭제하지 않았다. 실패 전체 reporter/context 및 trace event/network/stack core는 포함했고 core만으로 완전한 Trace Viewer 재생이 안 된다는 한계도 표시했다.
- `ZIP_MANIFEST.json`의 파일별 bytes/SHA-256과 ZIP CRC를 검증한다. 외부 `package-verification.json`에 ZIP 자체의 크기·해시·검사 결과를 남긴다. 과거 배치 ZIP·dependencies·빌드 전체·폰트 바이너리·환경파일은 넣지 않는다.

## 직접 플레이

**http://127.0.0.1:5174/** 에 최종 수정본의 개발 서버를 실행해 두었다. `package.json`의 실제 script는 `"dev": "vite"`다. 포트가 비어 있음을 확인한 뒤 실행했으며 PID14340의 cwd는 `/Users/user/wedding/ccj/game`이다. 서버가 제공하는 Player/Intro 소스의 SHA-256을 freeze와 비교하고 첫 화면·console·요청 실패0을 실제 Chromium에서 확인했다(`local-server.json`). 사용자 브라우저 연결 도구는 이용 가능한 브라우저가 없었으므로 기존 브라우저 탭을 열었다고 주장하지 않는다. 첫 화면은 Playwright 실제 Chromium에서 검증했다.

다시 실행할 때:

```sh
cd /Users/user/wedding/ccj/game
npm run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

이미 실행 중인 이 서버에 접속하면 된다. 다른 프로젝트의 프로세스를 종료하지 않았다.
