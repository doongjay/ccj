# 미니미·로딩·추가 UX 수정 검수

완료된 A/A1/B/C/D 작업 위에 이번 요청만 추가한 검수 자료다. 이전 `after-batch-d-review.zip`, `minimi-fix-review.zip`과 원본 증빙은 보존한다. F24의 전체 아트 재가공과 F25는 수행하지 않는다.

## 변경 내용

| 요청 | 구현 및 확인 위치 |
|---|---|
| M01–M05 턱·목·카라 | 공통 12×2 갈색 띠 제거, 양쪽 목 외곽 연결, 원본 의상의 피부 절단 경계와 chroma 잔여물 정리. 실제 카라와 봉제 테두리 보존. `after/inspection/` |
| 전체 정면 조합 | 남성 54 + 여성 54 = 108개를 실제 합성기로 렌더링. 각 성별의 native 전체 시트와 목 4x 시트를 별도로 제공. `after/atlas/`, `after/inspection/` |
| 세 사용자 조합 | 같은 프로필·393×852 조건의 BEFORE/AFTER, 정수 4x 확대, 실제 로비/사진/동작 비교. `before/flows/`, `after/flows/`, `after/inspection/*before-after*` |
| 동작 일관성 | 13대표×19프레임 시트와 7개 실제 플레이 영상. 기존 idle 보존 테스트를 외형 품질의 정답으로 사용하지 않음. `after/motion/` |
| 로딩 | 큰 로딩 화면은 BootScene만 사용. 선택 경로·로비·방·홀·식사 에셋은 미리 로드하며 캐시된 경우 즉시 진행. 느린 응답만 300ms 후 작은 상태 표시. `LOADING.md` |
| 첫 수첩 클릭 | 즉시 수첩을 열고 저장 사진은 비동기로 채움. 이미 닫힌 패널에 늦은 결과를 붙이지 않음. 보고된 포토부스 이동은 재현되지 않았음을 명시. `REVIEW_NOTES.md` |
| 홀 촬영 버튼 | 카메라 프레임 아래로 배치. 320/393/430px의 실제 버튼 경계와 화면 캡처. `after/ux/hall-photo-button-*` |
| 뷔페 | 기존 음식6장 순차 등장 복원, 첫 터치로 사진 모두 표시, 다음 터치로 문장/진행. 음식 이동 화살표 없음. `after/ux/buffet-complete-*` |
| 자동차 유도선 | 하단 왼쪽 노랑 / 가운데 분홍 / 오른쪽 파랑. 노랑=이마트·지원 불가, 분홍=타워, 파랑=B3. 배경 선·선택 색상 표식·실제 차량 경로 일치. `after/ux/car-*` |
| 문구 | 메시지 영역은 “메시지”로 표기. 축의 계좌의 “마음 전하실 곳”은 유지. 반복적인 전체보기/터치 안내문은 제거하고 키보드 조작은 유지. |
| 선택 UI | 성별 버튼 52→78 CSS px, 남성 하늘색/여성 기존 분홍. 의상 페이지는 1–3 / 4–6. 여성5 회색 트위드, 남녀6 추가, 공통 둥근 안경. `after/ux/setup-*` |

## 빠르게 볼 자료

- `after/inspection/male-all-54-front-native.png`, `female-all-54-front-native.png`: 전체 정면.
- `after/inspection/male-all-54-neck-4x.png`, `female-all-54-neck-4x.png`: 전체 접합부.
- `after/inspection/01-*before-after*`, `02-*before-after*`, `03-*before-after*`: 사용자 세 조합 비교.
- `after/ux/car-lines-renderer-320.png`, `car-lines-renderer-393.png`, `car-lines-renderer-430.png`: 세 viewport에서 실제 렌더러의 native 720×1280 출력. DOM 버튼을 숨기거나 장면을 다시 그리지 않고 선 전체를 확인한다. 버튼이 포함된 실제 화면은 `car-choice-*`, 주행은 `car-driving-*`와 영상에 있다.
- `VIDEO_INDEX.json`: 원본 실제 속도 영상의 경로·해상도·길이·프레임률. 사진 결과 감상과 직접 복귀 구간을 유지한다.
- `TEST_RESULTS.json`: 최종 실행 요약과 개별 테스트 결과. 원본 JSON reporter와 실패·중단·재시도 로그도 포함한다.
- `assets-final.json`: 정상 shipping 전체 검사. 테스트 PASS/SKIP 집계와 별도다.
- `source-fingerprint.json`, `CHANGED_FILES.md`, `source-diff.patch`: 검증 소스의 정확한 버전과 변경 목록.
- `REVIEW_NOTES.md`: 원인, 재시도, 미재현 현상, 실기기 미검증 범위.

## 자료의 성격

시트는 실제 게임 합성기의 출력이며, 비교·확대는 원본 PNG를 배치하거나 nearest-neighbor 정수 4x로 확대했다. 사진 결과나 동작을 그림으로 꾸미지 않았다. 108정면 전수 시각 검수와 7조합 실제 플레이 검수는 서로 다른 범위다. 개발자용 테스트 fixture로 만든 홀 배치 검증과 실제 정상 여정의 홀·사진 영상도 구분한다.

영상은 Playwright가 실제 시간으로 기록한 원본 WebM이다. 배속·프레임 보간·실패 구간 삭제·재인코딩을 하지 않는다. 반복된 PASS 영상과 대용량 원본 trace ZIP은 검수 ZIP에서 제외할 수 있으나 원본 폴더에 보존한다. 실패·중단의 전체 API/네트워크 메타데이터/스택/소스 기록, 오류 화면·원본 영상은 ZIP에 포함한다. `trace-evidence/`의 시간 표시 스틸은 초당 1장과 마지막 8장을 추출한 것이며 원본 동영상이나 재생 가능한 전체 trace를 대체한다고 주장하지 않는다. 제외 경로·크기·대체 증빙은 `ZIP_EXCLUSIONS.json`에 기록한다.

## 로컬 실행

`game/package.json`의 `dev`는 `vite`다. `game/`에서 다음 명령으로 실행한다.

```sh
npm run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

주소: http://127.0.0.1:5174/ . 다른 프로젝트의 프로세스를 종료하거나 외부에 배포하지 않았다.
