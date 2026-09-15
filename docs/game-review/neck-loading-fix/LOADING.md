# 장면 전환 로딩 정책

기존에도 이미 준비된 texture는 재사용했다. 문제는 아직 준비되지 않은 에셋이 하나라도 있으면 공통 `ensureStages()`가 즉시 같은 전체 화면 모달을 만들었다는 점이다. CSS로 모달을 가린 것이 아니라 호출 시점과 표시 정책을 분리했다.

| 전환 | 기존 미확보 시 | 수정 후 분류 | 준비 시점 / 예외 |
|---|---|---|---|
| 앱 시작 → intro | 전체 로딩 | 1. boot loading | opening 배경·공통 UI·폰트 준비. 한 앱 진입당 큰 화면 1회 |
| intro → setup | 전체 로딩 | 2. hidden background prefetch | intro 진입 1.2초 후 setup 미리 준비. 매우 빠른 입력/느린 연결이면 3번 표시 |
| 성별 선택 | 전체 로딩 | 3. inline non-blocking loading | 선택 성별의 파츠만 확보. 같은 성별 재선택은 texture/cache 재사용 |
| setup → route | 전체 로딩 | 2. hidden background prefetch | 교통수단을 고른 즉시 해당 경로만 준비. 선택하지 않은 경로는 다운로드하지 않음 |
| route → lobby | 전체 로딩 | 2. hidden background prefetch | 기존 경로 장면의 lobby prefetch 유지 |
| lobby → 축의대/포토부스/정원/신부대기실 | 전체 로딩 | 2. hidden background prefetch | 로비 준비 800ms 후 각 방의 에셋 준비. 이미 확보한 방을 재방문할 때 표시 없음 |
| lobby 수첩·ATM·드링크·입장 제한 | 해당 없음 | 로딩 없음 | UI만 표시. 수첩은 즉시 열고 저장 사진 복원 결과를 안쪽에 추가 |
| lobby → hall | 전체 로딩 | 2. hidden background prefetch | 필수 방문을 하나 이상 마친 뒤 hall/양쪽 하객 에셋 준비. 첫 로비 시점의 지연 에셋 검사 유지 |
| hall reaction → group photo | 같은 hall 에셋 | 로딩 없음 | 같은 장면에서 이미 준비된 사진 무대와 플레이어 사용 |
| group photo → meal | 전체 로딩 | 2. hidden background prefetch | hall 진입 시 dinner 에셋 미리 준비 |
| group photo/meal → ending | opening 재사용 | 로딩 없음 | opening texture를 재사용 |
| 이어하기 / 청첩장 직접 진입 | 미확보 시 전체 로딩 | boot + 필요 시 3번 | 새 페이지 시작은 새 boot. 저장 장면/아바타를 아직 받지 못했으면 작은 상태 표시 |

일반 전환이 300ms 안에 준비되면 로딩 UI를 DOM에 추가하지 않는다. 그보다 오래 걸리면 기존 장면을 유지한 채 작은 진행 상태를 표시한다. 요청은 key별로 중복 방지하며 decode가 끝난 texture를 다시 요청하지 않는다. 네트워크 실패는 작은 오류 상태와 포커스 가능한 `다시 불러오기` 버튼을 보여준다. 클릭 또는 Enter로 같은 전환을 재시도한다.

4번 blocking loading은 BootScene의 초기 준비 외에는 사용하지 않는다. 다만 필요한 이미지가 아직 없을 때 대상 장면으로 들어가는 동작 자체는 완료될 때까지 기다린다. 화면 전체나 배경 입력을 모달로 덮는다는 의미의 blocking UI와 이 데이터 준비 대기는 구분한다.

실제 자동차/지하철 전 구간의 DOM 로딩 기록은 `after/ux/loading-car.json`, `loading-subway.json`이다. 대응 원본 영상의 최종 경로는 `VIDEO_INDEX.json`에 연결한다. 각 관찰 JSON의 `video`는 context 종료 전에 기록한 임시 경로이므로 Playwright reporter의 최종 첨부 경로를 사용했다.

## 실제 정상 여정의 관찰 결과

| 구간 | 자동차 여정 | 지하철 여정 |
|---|---|---|
| 앱 시작 | 큰 boot 화면 1회 | 큰 boot 화면 1회 |
| intro → setup | 로딩 UI 없음 | 로딩 UI 없음 |
| setup → route | 로딩 UI 없음 | 로딩 UI 없음 |
| route → lobby | 로딩 UI 없음 | 로딩 UI 없음 |
| 수첩·축의대·포토부스·정원·신부대기실 | 로딩 UI 없음 | 로딩 UI 없음 |
| lobby → hall | 로딩 UI 없음 | 로딩 UI 없음 |
| hall reaction → group photo | 로딩 UI 없음 | 로딩 UI 없음 |
| group photo → meal → ending | 로딩 UI 없음 | 로딩 UI 없음 |

두 실제 여정의 MutationObserver 기록 각각 boot 1회 / inline 0회 / boot 이후 큰 모달 0회다. 300ms가 넘는 자원 대기에는 inline 표시가 허용된다. 네트워크 실패 후 재시도는 별도 production 복구 테스트로 검사한다. 정상 로컬 여정에 표시가 없었다는 결과를 모든 네트워크에서 대기가 없다는 의미로 해석하지 않는다.

## 첫 화면 재측정

production preview 5199, Chromium, 393×852, 새 cold cache, 제한 없는 로컬 연결에서 CDP `Network.loadingFinished.encodedDataLength`를 합산했다. HTML/JS/CSS/폰트/이미지의 응답 헤더를 포함한다.

| 값 | 자동차 실행 | 지하철 실행 |
|---|---:|---:|
| 첫 화면 전체 전송 | 3,514,909 bytes | 3,514,909 bytes |
| 첫 화면 에셋 전송 | 3,094,744 bytes | 3,094,744 bytes |
| 관찰 완료 시간 | 794 ms | 818 ms |
| 5,000,000 bytes 이하 | 통과 | 통과 |

직전 minimi-fix 빌드 3,513,993 bytes보다 코드 포함 전체는 916 bytes(+0.0261%) 증가했으며 첫 화면 에셋은 동일하다. D/C를 기준으로 삼는 기존 reporter 필드는 그대로 보존하고, 직전 빌드 대비 수치는 `TEST_RESULTS.json`에 따로 기록했다. 직전 로컬 관찰 686/695ms와 이번 단일 관찰 794/818ms는 부하 조건을 통제한 반복 성능 실험이 아니므로 속도 개선을 주장하지 않는다. 첫 화면 목표와 지연 에셋 분리 기준은 통과했다. 원본 측정은 `regressions/regressions/performance-car.json`, `performance-subway.json`이다.
