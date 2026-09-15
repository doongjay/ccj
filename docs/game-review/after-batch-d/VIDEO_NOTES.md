# 정상 속도 영상과 편집 범위

모두 실제 Playwright Chromium 렌더링의 **25fps VP8 WebM**이다. 배속, 프레임 보간, AI 생성 영상, 재인코딩, 중간 실패 구간 삭제를 하지 않았다. 7개는 원본 바이트 그대로 복사했다. 01/02/10만 관련 구간 앞뒤를 `ffmpeg -ss … -i … -t … -c copy`로 연속 추출했다. 해당 세 영상의 encoded packet hash가 원본의 연속 구간과 동일하고 상대 timestamp 차이가 동일함을 `videos/stream-copy-audit.json`으로 확인했다.

| 파일 | 길이 | 내용 | 원본/검증 |
|---|---:|---|---|
| `01-normal-applause.webm` | 7.40s | 로비에서 식장 진입, 실제 선택 → 작은 손 박수/짝짝 → 단체사진1회. 중간 청첩장 없음 | final production |
| `02-normal-cheer.webm` | 7.84s | 식장 실제 선택 → 환호 포즈/축하해·고마워 → 단체사진1회. 중간 청첩장 없음 | final production |
| `03-walking-repath-stop.webm` | 21.72s | 입장부터 실제 이동 입력·새 목적지·에스컬레이터 우회·정지 | final dev 전체 원본. 끝의 별도 FPS fixture는 invisible 객체이며 실제 이동 증빙과 JSON에서 구분 |
| `04-photo-reload-continue-notebook.webm` | 24.44s | 정상 사진 촬영, 결과5.504초, 직접 복귀, reload, Continue, 같은 사진의 수첩 | 5174 최종 소스의 별도 고정393×852 정상 입력. reload 중 실제 흰 프레임도 삭제하지 않음 |
| `05-photo-normal.webm` | 58.56s | 정상 모드 포토부스/신부대기실 각5.5초 유지·직접 복귀, 단체사진. 실행 중 REC 감소 설정 전환 검사도 포함 | final dev 전체 원본 |
| `06-photo-reduced.webm` | 56.00s | 같은3개 사진 장면의 감소 모드 완료, fullscreen flash0·반복 REC0 | final dev 전체 원본 |
| `07-parking-wrong-return-tower.webm` | 22.04s | 실제 오답 이마트 → 경로 복귀 → 타워 안내 → 로비 | final dev 전체 원본 |
| `08-parking-b3.webm` | 14.00s | B3 안내도와 실제 정상 진행 | final dev 전체 원본 |
| `09-buffet-manual-cards.webm` | 26.96s | 입장 → 첫3장/다음3장/이전 → 키보드 → 식사 직접 완료 | final dev 전체 원본 |
| `10-separate-invitation-pause-resume.webm` | 9.80s | 박수 중 청첩장 pause → 복귀 → 단체사진, 입력 반복의 별도 검사 | final production C 회귀. 정상01/02와 구분 |

01–06/10의 실제 영상 크기는392×852이다. Playwright가393px viewport를 VP8 짝수 너비로 기록한 원본 그대로이며 추가 축소는 하지 않았다. 07–09는430×932 recorder 안에서 실제320/393 viewport를 검사하므로 회색 빈 영역이 보인다. 이는 recorder canvas의 빈 부분이며 웹페이지 여백 판정에는 원본 viewport PNG와 실제 bounds JSON을 사용한다. 보기 좋게 자르거나 화면을 늘리지 않았다.

`videos/INDEX.json`에는 각 원본 파일 경로·SHA-256·바이트·실제 해상도/fps·길이·최종 reporter/test/project 및 stream-copy 명령/종료 코드가 있다. 일부 테스트 관찰 JSON의 `page.video().path()`는 Playwright가 완료 때 옮기기 전 임시 경로다. 검수자가 실제 원본을 찾을 때는 **videos/INDEX.json의 source**를 사용한다.

시간 프레임은 `video-frames/INDEX.json`과 원본 해상도 PNG로 남겼다. 주요 선택/박수/환호/정지/사진/복구/카드/주차 상태를 직접 눈으로 확인했다. 10번 영상13초 요청은9.8초 길이 밖이라 프레임이 생성되지 않았고, INDEX에 미생성으로 표시했다. 이를 캡처나 테스트 PASS로 세지 않는다. 최종 실제 추출 프레임은47개다.

손 움직임은 작은 원본 인물 크기와150ms cadence를 유지한다. 전체 화면을 흔들거나 인물을 확대하지 않았다. 전 조합의 머리/옷/발/손은 별도 원본 PNG pose matrix와90조합 audit JSON으로 교차 확인했다. 사진 결과를 성급하게 넘기는 영상으로5.5초 수용 기준을 대신하지 않았다.
