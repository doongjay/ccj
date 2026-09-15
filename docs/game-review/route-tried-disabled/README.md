# 유도선·지하철 선택 이력 비활성 표시

이미 선택해 돌아온 경로는 원래 버튼 이름을 유지한 회색 비활성 버튼으로 표시한다. ‘확인함’ 문구를 붙이지 않는다. 기존 유도선 배경·차량 경로·지하철 문구·배치와 정답 경로는 유지했다.

## 변경 파일

- `game/src/ui/StoryDialog.ts`: `tried` 선택지는 글자 표시가 완료되고 입력 보호 시간이 지나도 native `disabled` 유지. 비활성 이벤트 방어와 접근성 설명 적용.
- `game/src/style.css`: ‘확인함’ 가상 요소 제거. 기존 픽셀 테두리를 유지하면서 배경·테두리·표식을 회색으로 표시.
- `game/src/scenes/SubwayRouteScene.ts`: 선택한 출구를 개별 기록하고, 다시 선택지가 뜨면 해당 항목 비활성화. 새 장면 시작 시 기록 초기화.
- `game/e2e/route-tried-disabled.spec.ts`: 320/393/430 폭에서 자동차 오답, 지하철 1→3→2→4번 선택 누적, native touch 재선택 차단, 키보드 건너뛰기, 정답 진행, 새 여정 초기화 검사.
- `game/e2e/review-batch-b-guidance.spec.ts`: 두 경로에서 눌러본 항목의 비활성을 명시적으로 검사.
- `game/e2e/story-choice-layout.spec.ts`: 이미 선택한 항목은 비활성임을 검사하고 남은 선택지를 사용해 기존 위치 고정·단일 실행 검사를 유지.

이번 변경만의 diff와 변경 전후 파일은 `this-change.diff`, `source-before/`, `source-after/`에 있다. `source-fingerprint.json`은 직전 예식장 수정 완료본과 비교한 파일 목록과 SHA-256이다.

## 브라우저 증빙

- 수정 전: `before/regressions/f07-car-wrong-retry-393.png`, `before/regressions/f07-subway-wrong-retry-393.png`.
- 수정 후: `after/car-tried-1-{320,393,430}.png`, `after/subway-tried-{1,2,3,4}-{320,393,430}.png`.
- [유도선 393](after/car-tried-1-393.png)
- [지하철 320, 세 출구 선택 후](after/subway-tried-3-320.png)
- [지하철 393, 네 출구 선택 후](after/subway-tried-4-393.png)
- [지하철 430, 네 출구 선택 후](after/subway-tried-4-430.png)

Chromium 실제 화면에서 회색 상태, 남아 있는 선택지의 크림/금색 구분, 문구 유지, 겹침과 말풍선 위치를 확인했다. 320×568, 393×852, 430×932를 검사했다. 새 검사의 선택·재선택 시도는 실제 touchscreen 입력이다. WebM 영상과 버튼별 상태·좌표·콘솔 결과는 `runs/after/` 및 `logs/after.json`에 기록했다.

## 실행 기록

아래 명령의 작업 디렉터리는 모두 `game/`이다.

```sh
npm run test:e2e -- --config=../docs/game-review/route-tried-disabled/scripts/before.config.ts
npm run test:e2e -- --config=../docs/game-review/route-tried-disabled/scripts/after.config.ts
npm run build
```

수정 전 검사는 2건 통과했다. 최종 검사는 **19 PASS / 0 FAIL / 0 SKIP**이며 수집한 브라우저 콘솔·런타임 오류도 0이다. 개별 결과와 집계는 `logs/after.json`에 있다. 최종 검사에는 새 6건 외에 세 색 실제 차량 주행, 자동차·지하철 오답 후 복귀, 아홉 말풍선 배치, 실제 선택 장면 열 곳, 신랑측·신부측 전체 진행을 포함했다.

빌드와 소스/E2E 타입 검사는 통과했다. 기존 Vite 500 kB 청크 경고는 유지했으며 기준을 변경하지 않았다. 에셋 파일과 배포 에셋 목록에는 변경이 없어 이번 작업에서 에셋 검사를 재실행하지 않았다.

기존 검수 자료와 ZIP은 보존했다. 얼굴·미니미·예식장 말풍선·촬영 연출은 직전 완료본을 유지했다. 개발 서버는 <http://127.0.0.1:5174/>에서 실행 중이다.
