# 로딩 정책 유지 및 재측정

이번 추가 수정에서 `stageAssets.ts`의 준비·prefetch·캐시·재시도 전략은 바꾸지 않았다. 여성6의 atlas만 성별 선택 후 읽는 새 키로 연결했다. 기존 남성 atlas와 같은 stage 분리이며 opening에 의상을 추가하지 않았다.

| 전환 | 정책 | 이번 실제 자동차/지하철 여정에서 표시 |
|---|---|---|
| 앱 시작 → intro | boot loading | 큰 로딩 화면 각1회 |
| intro → setup | hidden background prefetch | 로딩 화면 없음 |
| setup → route | hidden background prefetch | 로딩 화면 없음 |
| route → lobby | hidden background prefetch | 로딩 화면 없음 |
| 로비 → 접수/포토부스/신부대기실/수첩/복귀 | hidden background prefetch 및 기존 에셋 재사용 | 로딩 화면 없음 |
| lobby → hall | hidden background prefetch | 로딩 화면 없음 |
| hall reaction → group photo | 준비된 hall 에셋 재사용 | 로딩 화면 없음 |
| group photo → meal → ending | hidden background prefetch, 기존 opening 재사용 | 로딩 화면 없음 |

일반 네트워크 지연으로 에셋이 300ms 이상 준비되지 않았을 때만 작은 inline non-blocking loading이 표시된다. 이번 두 정상 로컬 여정에서는 inline도0회였다. 실패는 같은 작은 영역에서 “다시 불러오기”로 재시도한다. 별도 blocking loading은 첫 boot에만 사용한다. 로딩을 CSS로 숨기는 방식이 아니며 캐시된 texture와 준비된 stage는 즉시 반환한다.

전체 상태 변경과 표시 시각 원본: `after/neck-loading-ux/loading-car.json`, `loading-subway.json`. 영상: `videos/journey-car.webm`, `journey-subway.webm`. 의도적으로 한 요청을 실패시킨 production 재시도는 정상 여정과 별도인 `regressions/load-recovery.json`에 있다.

## 첫 화면 bytes

393×852 / DPR1, production preview, Chromium CDP, cold cache, 로컬 무제한 네트워크로 측정했다. `Network.loadingFinished.encodedDataLength` 합계이며 응답 헤더와 HTML/JS/CSS/font/그림을 포함한다.

| 경로 | 첫 화면 전체 응답 bytes | 게임 에셋 응답 bytes | 표시까지 ms |
|---|---:|---:|---:|
| 자동차 선택 전 첫 화면 | 3,515,099 | 3,094,744 | 874 |
| 지하철 선택 전 첫 화면 | 3,515,099 | 3,094,744 | 697 |

둘 다 5,000,000 bytes 이하다. 직전 목·로딩 패키지의 3,514,909 bytes보다 190 bytes(+0.0054%) 증가했으며, 게임 에셋 bytes는 같다. 새 의상의 첫 화면 전송은0이다. 무제한 로컬 단회 측정으로 실기기 속도 향상을 주장하지 않는다.

원본 응답 목록·캐시 여부·후속 에셋은 `regressions/performance-car.json`, `performance-subway.json`에 있다. shipping 파일 합계와 브라우저 실제 전송 합계는 구분한다.
