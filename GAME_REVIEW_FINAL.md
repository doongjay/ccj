# GAME_REVIEW_FINAL

## 목적

이 문서는 `docs/game-review/`의 전체 캡처와 기존 `GAME_REVIEW.md`를 다시 검토한 뒤,
**실제 수정 우선순위를 Codex가 바로 구현할 수 있도록 재정리한 최종 지시서**다.

이 게임은 일반적인 액션 게임이 아니라 **픽셀 아트 기반의 웨딩 청첩장 어드벤처**다.
따라서 난이도, 전투, 점수 시스템을 추가하는 방향이 아니라 아래 세 가지를 우선한다.

1. 처음 보는 하객도 헤매지 않는 것
2. 예쁜 배경과 커플/미니미를 UI가 가리지 않는 것
3. 사진·축하·방문 같은 핵심 행동에 감정적인 보상이 있는 것

---

# 0. 현재 상태 요약

## 강점

- 예식장, 로비, 신부대기실, 연회장 등 주요 배경의 완성도가 높다.
- 크림/골드/딥그린 UI 팔레트는 전체 분위기와 잘 맞는다.
- 미니미 커스터마이징은 이 게임의 핵심 매력이다.
- 신랑/신부측, 자차/지하철, 식사 순서가 실제 진행에 반영되는 점이 좋다.
- 단체사진에서 플레이어가 커플 옆에 합류하는 구조는 엔딩 보상으로 좋다.
- 실제 커플 사진을 포토테이블/청첩장에서 보여주는 것은 픽셀 스타일 위반으로 보지 않는다.

## 가장 큰 문제

배경 아트의 품질에 비해 **UI/진행 규칙/행동 피드백이 프로토타입처럼 느껴진다.**

특히:
- 무엇을 해야 하는지 숨겨져 있음
- 화면 중앙의 큰 패널이 핵심 장면을 가림
- 모바일에서 라벨과 캐릭터가 너무 작음
- 사진/축하 같은 필수 행동의 보상이 짧거나 없음
- 브라우저 기본 UI가 노출되는 구간이 있음

---

# 1. 구현 원칙

## 반드시 지킬 것

- 기존 배경 아트를 전면 교체하지 않는다.
- 기존 크림/골드/딥그린 색상 체계를 유지한다.
- Galmuri 계열 픽셀 텍스트와 현재 UI 프레임을 기반으로 개선한다.
- 실제 웨딩 사진은 픽셀화하지 않는다.
- 미니미 커스터마이징을 축소하거나 삭제하지 않는다.
- 전투, HP, 점수, 재화, XP, 타이머 압박을 추가하지 않는다.
- 모든 화면에 파티클/스크린셰이크를 추가하지 않는다.
- 기능을 늘리기보다 현재 경험을 명확하고 따뜻하게 만드는 것을 우선한다.

## 수정 방식

- 한 번에 전체 UI를 재작성하지 않는다.
- 아래 Phase 순서대로 수정한다.
- 각 Phase 후 실제 브라우저에서 320×568, 393×852, 430×932를 확인한다.
- 주요 수정은 before/after 스크린샷을 남긴다.

---

# PHASE 1 — 반드시 먼저 수정

## [F01 / 기존 G01] 로비 도착 시 이동법과 필수 일정 공개

- [x] fixed — Batch A, 2026-09-12

**우선순위:** P1

### 문제
로비에 도착하면 플레이어는 작은 캐릭터와 장소 라벨만 본다.
바닥을 눌러 이동하는지, 어느 장소가 필수인지 알 수 없다.
식장으로 먼저 가면 그제야 다른 필수 장소를 알려준다.

### 수정
첫 로비 진입 시 1회만 짧은 안내를 보여준다.

예:
- `바닥을 눌러 이동할 수 있어요.`
- `수첩의 추억을 채우고 식장으로 가볼까요?`

수첩 버튼은 항상 진행도를 표시한다.

예:
- `수첩 0/4`
- `수첩 2/4`

수첩을 열면 **현재 측에 필요한 모든 필수 활동을 처음부터 표시**한다.
완료한 항목은 즉시 체크/하트/스탬프로 갱신한다.

식장 진입 시 새로운 필수 조건을 뒤늦게 공개하지 않는다.

### 추가 권장
현재의 일반 체크박스보다 하트/도장 모티프를 사용하면 웨딩 수첩 느낌이 더 강하다.

### 완료 조건
- 첫 식장 시도 이전에 필요한 활동을 전부 알 수 있다.
- 현재 진행도가 로비에서 바로 보인다.
- 완료 직후 수첩 진행도가 갱신된다.

---

## [F02 / 기존 G02] 로비 walkable area 수정

- [x] fixed — Batch B, 2026-09-13; [검증 기록](docs/game-review/after-batch-b/README.md)

**우선순위:** P1

### 문제
플레이어가 왼쪽 벽 등 실제 바닥이 아닌 영역 위에 설 수 있다.

### 수정
- 실제 바닥 형태에 맞는 walkable polygon/region을 정의한다.
- 벽/가구/에스컬레이터 클릭 시:
  - 근처의 유효 바닥 지점으로 projection하거나
  - 이동 불가 피드백을 짧게 준다.
- 캐릭터 중심점이 아니라 발 위치 기준 clearance를 사용한다.

### 완료 조건
벽, 가구, 에스컬레이터 위에 캐릭터 발이 올라가지 않는다.

---

## [F03 / NEW] 브라우저 기본 validation UI 제거

- [x] fixed — Batch A, 2026-09-12

**우선순위:** P1

### 문제
이름 없이 시작할 때 브라우저의 기본
`Please fill out this field.` 툴팁과 파란 focus outline이 나타난다.

이 화면은 현재 게임에서 가장 강하게 "웹 폼"처럼 보이는 순간 중 하나다.

### 수정
- native required validation bubble을 사용하지 않는다.
- 게임 스타일의 inline validation을 구현한다.
- 예:
  - 입력창 아래 `이름을 알려주세요!`
  - 짧은 흔들림 또는 골드→핑크 테두리 변화
- 접근성을 위해 `aria-live`를 사용한다.
- focus ring도 게임 UI 스타일로 직접 정의하되 focus 자체는 제거하지 않는다.

### 완료 조건
어떤 입력 오류에서도 브라우저 기본 validation bubble이 보이지 않는다.

---

## [F04 / 기존 G20 승격] 핵심 장면을 가리는 대형 선택 패널 재배치

- [x] fixed — Batch A, 2026-09-12

**우선순위:** P1

### 문제
예식 장면에서 대사+버튼이 신랑신부를 거의 완전히 가린다.
자동차 경로 화면에서도 선택지가 도로/유도선 정보를 덮는다.

배경 아트가 이 게임의 가장 큰 강점인데,
의사결정 순간마다 그 배경을 UI가 가린다.

### 수정
`StoryDialog`에 scene-specific safe-area/layout 옵션을 추가한다.

예식:
- 대사는 상단 compact box
- `박수를 친다 / 환호를 한다`는 하단에 2열 버튼
- 중앙의 신랑신부는 반드시 보이게 한다.

자동차:
- 도로/유도선/표지판은 가리지 않는다.
- 색상 선택 버튼은 하단 compact 영역으로 이동한다.

지하철:
- 5개 출구 버튼을 세로로 길게 쌓기보다
  2열 또는 compact selector로 정리할 수 있다.

### 완료 조건
320/393/430 폭 모두에서:
- 예식 선택 중 신랑신부가 보인다.
- 자동차 선택 중 유도선이 보인다.
- 텍스트와 버튼은 최소 크기를 유지한다.

---

## [F05 / 기존 G04] 모든 패널에 진행 방법을 명시

- [x] fixed — Batch A, 2026-09-12

**우선순위:** P1

### 문제
수첩/ATM/웰컴드링크/제한 안내 등은 닫는 방법이 눈에 보이지 않는다.
다른 대화는 탭, 자동 진행, 선택 버튼이 섞여 있다.

### 수정
패널 타입을 명확히 나눈다.

- 정보성: `닫기`
- 서사/대화: `다음` 또는 명시적 `화면을 눌러 계속`
- 선택: 선택 버튼
- 사진 갤러리: 현재처럼 `×`, 좌우 이동

Escape도 dismissible panel에서 동일하게 동작하게 한다.

### 완료 조건
모든 대기 상태에서 사용자가 화면만 보고 다음 행동을 알 수 있다.

---

## [F06 / 기존 G05] 모바일 가독성과 터치 영역 보정

- [x] fixed — Batch A, 2026-09-12

**우선순위:** P1

### 문제
320px 폭에서 로비 라벨이 너무 작고,
현재 canvas 내부 touch target은 실제 CSS px 기준 44px보다 작아진다.
landscape에서는 사실상 읽기 어렵다.

### 수정
- critical text는 320px 폭에서도 최소 약 14 CSS px가 되도록 보정한다.
- primary touch target은 표시 크기 기준 최소 44×44 CSS px.
- canvas scale을 기준으로 필요한 world-unit 크기를 계산한다.
- 로비 라벨은 1차 정보만 남기고 글자 크기를 키운다.
- landscape에서는 억지로 전체 플레이를 지원하기보다
  `세로 화면에서 더 편하게 즐길 수 있어요` 안내 + 청첩장 바로가기 제공을 허용한다.

### 완료 조건
320×568에서도 장소 이름과 주 CTA가 편하게 읽히고 누를 수 있다.

---

## [F07 / 기존 G06] 경로 선택을 '찍기 문제'가 아니라 실제 안내로 변경

- [x] fixed — Batch B, 2026-09-13; [검증 기록](docs/game-review/after-batch-b/README.md)

**우선순위:** P1

### 문제
자동차의 노랑/분홍/파랑과 지하철 1~5번 출구는
정답에 대한 정보를 보여주기 전에 선택시킨다.

### 수정
선택 이전 장면에 정답을 유추할 수 있는 실제 정보를 보여준다.

자동차 예:
- `B3 지하주차장 → 파란 유도선`
- `타워주차장 → 분홍 유도선`

지하철 예:
- `셔틀버스: 5번 출구`

오답 연출은 유지 가능하나,
한 번 틀리면 다음 선택 화면에서 힌트가 강화되고 시도한 선택은 표시한다.

### 완료 조건
처음 플레이한 사람도 화면에 나온 정보만으로 정답을 고를 수 있다.

---

## [F08 / 기존 G07] 청첩장 접근과 엔딩 메시지 선택권

- [x] fixed — Batch B, 2026-09-13; [검증 기록](docs/game-review/after-batch-b/README.md)

**우선순위:** P1

### 문제
게임 시작 이후 청첩장으로 바로 나가는 경로가 사라진다.
엔딩에서는 메시지를 반드시 작성해야 다음 버튼이 나타난다.

### 수정
- 주요 장면에서 최대 2번의 액션 안에 `청첩장 보기`가 가능하게 한다.
- 엔딩에:
  - `메시지 남기기`
  - `나중에 남기기`
  두 경로를 제공한다.
- 메시지를 건너뛰어도 청첩장/다시하기 접근 가능.

### 완료 조건
메시지 입력 없이도 정상적으로 경험을 종료할 수 있다.

---

## [F09 / 기존 G03] 초기 56MB preload 분리

- [x] fixed — Batch B, 2026-09-13; [검증 기록](docs/game-review/after-batch-b/README.md)

**우선순위:** P1

### 수정
1. Intro + setup 필수 리소스만 먼저 로드
2. 선택된 이동 경로 prefetch
3. 로비 도착 후 인접 장면 prefetch
4. 예식/뷔페/후반부는 이후 load

큰 음식/사진 이미지는 실제 표시 해상도 기준으로 thumbnail/WebP/AVIF 최적화 검토.

### 주의
코드만 정리하고 "최적화됨"이라고 판단하지 말고 production build + cold cache를 측정한다.

### 목표
opening interactive 이전 asset budget을 우선 5MB 근처로 낮추는 것을 목표로 한다.

---

## [F10 / 기존 G08] 키보드 접근성 보완

- [x] fixed — Batch B, 2026-09-13; [검증 기록](docs/game-review/after-batch-b/README.md)

**우선순위:** P1

### 수정
- DOM semantic control 또는 canvas control과 대응되는 focusable control을 제공한다.
- Tab/Enter/Space/Escape로 핵심 플로우 진행 가능.
- focus visible 유지.
- WASD 이동을 억지로 추가할 필요는 없다.
- 로비는 destination list 방식의 키보드 대안으로 충분하다.

---

# PHASE 2 — 체감 완성도를 크게 올리는 수정

## [F11 / 기존 G14] 박수와 환호를 실제로 다르게 보여주기

- [x] fixed — Batch C, 2026-09-14; [검증 기록](docs/game-review/after-batch-c/README.md)

**우선순위:** P2 / ROI 높음

현재 두 선택 모두 사실상 같은 다음 장면으로 간다.

### 수정
박수:
- 플레이어 clap pose 또는 간단한 2-frame 반응
- 주변 하객의 작은 박수 표현

환호:
- `축하해!` 말풍선
- 커플 또는 주변 인물의 작은 반응

0.8~1.5초 정도면 충분하다.
과도한 파티클은 금지.

---

## [F12 / 기존 G15] 포토부스/신부대기실 사진에 '결과물' 남기기

- [x] fixed — Batch C, 2026-09-14; [검증 기록](docs/game-review/after-batch-c/README.md)

**우선순위:** P2 / ROI 높음

### 문제
현재는 사진 → flash → 자동 복귀라
필수 체크리스트를 처리한 느낌이 강하다.

### 수정
사진 촬영 후 작은 pixel-polaroid/result card를 보여준다.

예:
- `추억을 수첩에 남겼어요 ♥`
- `로비로 돌아가기`

사용자가 버튼을 누를 때까지 결과를 볼 수 있게 한다.
수첩에서도 찍은 사진을 작은 썸네일/스탬프로 재사용하면 좋다.

---

## [F13 / 기존 G13] 사진 장면의 캐릭터 크기/접지감 개선

- [x] fixed — Batch C, 2026-09-14; [검증 기록](docs/game-review/after-batch-c/README.md)

**우선순위:** P2

### 수정
- 플레이어 발 아래 1~2px 계열의 작은 contact shadow.
- 사진을 찍는 최종 순간에는 미니미를 조금 더 크게 보여준다.
- 신부대기실 사진은 넓은 빈 방보다 인물 중심으로 framing한다.
- 접근 장면은 현재 wide shot을 유지하고, 촬영 순간만 camera punch-in 가능.

---

## [F14 / 기존 G16] 단체사진 게스트 반복 버그 수정

- [x] fixed — Batch C, 2026-09-14; [검증 기록](docs/game-review/after-batch-c/README.md)

**우선순위:** P2 / 구현 쉬움

현재 42개 후보에서 `(index * 7) % 42`로 인해 사실상 6종만 반복된다.

### 수정
- deterministic shuffle without replacement 또는
- 42와 서로소인 step 사용.

플레이어와 완전히 같은 외형을 가까이에 배치하지 않는다.
단체사진이 처음 뜰 때 `나` 표시를 잠깐 보여줘도 좋다.

---

## [F15 / 기존 G17] '접수 완료' 영구 배너 제거

- [x] fixed — Batch C, 2026-09-14; [검증 기록](docs/game-review/after-batch-c/README.md)

**우선순위:** P2 / 구현 쉬움

### 수정
- 완료 직후 1회 toast
- 1~2초 후 사라짐
- 지속 진행 상태는 `수첩 n/m`으로 통합

로비 이동 경로와 캐릭터를 가리지 않는다.

---

## [F16 / 기존 G18] 버튼 상태 시스템 통일

- [x] fixed — Batch D, 2026-09-14; 검증·한계는 아래 구현 기록 참조.

**우선순위:** P2 / 구현 쉬움

공통 token:
- idle
- hover/focus
- pressed
- disabled

press → drag outside → release 시 반드시 idle로 복귀.
실행 불가 버튼은 시각적으로 disabled.

DOM/Canvas에서 의미가 같게 보이도록 한다.

---

## [F17 / 기존 G19] reduced-motion 일관화

- [x] fixed — Batch D, 2026-09-14; 검증·한계는 아래 구현 기록 참조.

**우선순위:** P2

- 포토부스/신부대기실/단체사진 flash를 공통 preference로 제어
- reduce 상태에서는 full-screen white flash 금지
- REC blink도 정적 상태로 전환
- 성공 피드백 자체는 유지

---

## [F18 / 기존 G09] 새로고침 복구

- [x] fixed — Batch D, 2026-09-14; 검증·한계는 아래 구현 기록 참조.

**우선순위:** P2

stable boundary마다 작은 versioned checkpoint 저장.

저장:
- 이름
- 성별/외형
- 하객 측
- 이동 방법
- 완료 활동
- 식사 여부

Intro에서:
- `이어하기`
- `처음부터`

진행 중 tween/frame 자체를 복원하지 말고 안전한 scene entry에서 복구.

---

## [F19 / 기존 G11] 주차장 아트 방향 통일

- [x] fixed — Batch D, 2026-09-14; 검증·한계는 아래 구현 기록 참조.

**우선순위:** P2

주차장 전체를 새로 그리는 대규모 작업은 하지 않는다.

둘 중 하나를 선택:
1. 현재 장면을 **의도적인 주차 안내 지도**처럼 만든다.
   - 플레이어 차량도 top-down icon으로 맞춘다.
   - UI frame을 지도 카드처럼 명확히 한다.
2. 기존 원근 장면에 맞춘 주차 배경으로 교체한다.

코드만으로 해결할 경우 1번을 추천한다.

---

## [F20 / NEW] 뷔페 실사 사진을 '의도적인 정보 카드'로 보이게 하기

- [x] fixed — Batch D, 2026-09-14; 검증·한계는 아래 구현 기록 참조.

**우선순위:** P2

### 문제
뷔페에서 실사 사진 6장이 화면 대부분을 바로 덮으면서
픽셀 게임에서 갑자기 raw image collage로 전환된 인상이 강하다.

실사 자체는 문제 아니다.
**연출 없이 붙인 방식**이 문제다.

### 수정
- `오늘의 뷔페 미리보기` 같은 pixel frame/card 안에 넣는다.
- 사진 수를 한 화면 3~4장 정도로 줄이거나 carousel로 만든다.
- 사진 사이 여백/프레임을 통일한다.
- 실제 사진임을 명확히 보여주는 scrapbook/photo-card 느낌을 사용한다.
- 이 작업과 동시에 이미지 용량도 최적화한다.

### 금지
실제 음식 사진에 강제로 pixel-art 필터를 걸지 않는다.

---

## [F21 / NEW] 로비 장소 라벨을 '디버그 태그'처럼 보이지 않게 정리

- [x] fixed — Batch D, 2026-09-14; 검증·한계는 아래 구현 기록 참조.

**우선순위:** P2

### 문제
검은 직사각형 라벨이 여러 개 동시에 떠 있어
완성된 장소 안내판보다 debug overlay처럼 보인다.

### 수정
- gold/cream/green의 작은 plaque 스타일로 통일하거나
- 아이콘 + 짧은 텍스트로 정리
- 중요도가 낮은 시설은 플레이어가 가까워질 때 강조
- 필수 목적지는 수첩과 연동해서 살짝 pulse/heart marker

### 주의
라벨을 모두 숨겨서 탐색 난이도를 올리지 않는다.

---

## [F22 / NEW] 모바일 바깥 여백을 의도적인 프레임으로 정리

- [ ] remaining

**우선순위:** P2

### 문제
9:16 게임과 실제 viewport 비율 차이로
상단 cream / 하단 pale-green의 큰 빈 영역이 계속 보인다.

현재도 별/하트가 있어 의도는 보이지만,
portrait에서는 일부 화면이 "가운데 게임을 박아둔 웹 페이지"처럼 느껴진다.

### 수정
- outer shell 색/패턴을 하나의 wedding stationery theme으로 통일.
- 상하 여백이 생길 때는:
  - 상단: `JJ ♥ HS`, 진행도 또는 discreet `청첩장`
  - 하단: 필요한 경우 control hint
  중 하나를 활용할 수 있다.
- 아무 기능도 넣지 않는다면 최소한 상하 영역의 색/경계가 의도적으로 이어지게 한다.

### 주의
320×568처럼 여백이 거의 없는 화면을 기준으로 핵심 조작을 배치하지 않는다.
즉, letterbox 영역은 optional chrome이지 필수 control area가 아니다.

---

## [F23 / 기존 G12] 미니미 걷기 개선

- [x] fixed — Batch D, 2026-09-14; 검증·한계는 아래 구현 기록 참조.

**우선순위:** P2 / 난이도 중간

가능하면 2~4 frame walk cycle.
속도가 달라도 이동 거리 기준 cadence 유지.

다만 이 작업 때문에 커스터마이징 atlas 시스템을 대규모로 재작성해야 한다면
다른 P2보다 뒤로 미룬다.

---

# PHASE 3 — 아트 파이프라인/선택적 개선

## [F24 / 기존 G10] 픽셀 밀도 통일

- [ ] remaining

**우선순위:** P2이지만 비용 큼

이 문제는 `image-rendering: pixelated` 한 줄로 해결되지 않는다.

배경 941px대, world 720px, minimi 128px frame 등
서로 다른 authored density가 혼재한다.

### 지시
첫 구현 패스에서 무작정 모든 asset을 resize/re-export하지 않는다.

별도 art pass에서:
- background logical density
- character density
- UI density
를 문서화한 뒤
가장 눈에 띄는 scene부터 재-export한다.

현재 코드 설정(`pixelArt`, `roundPixels`, pixelated)은 유지한다.

---

## [F25 / 기존 G21] 식사 선택 1개 추가

- [ ] remaining

**우선순위:** P3

선택 사항.

`먹고 싶은 메뉴 하나 고르기` 정도는 가능하나
미니게임/배고픔 수치/반복 클릭은 금지.

---

# 2. 우선 구현 순서

## Batch A — UX/시각적 방해 제거
1. F03 native validation 제거
2. F04 핵심 장면 overlay 재배치
3. F05 패널 진행법 통일
4. F01 로비 onboarding + 수첩 progress
5. F06 모바일 텍스트/터치 크기

## Batch B — 진행 문제
6. F02 walkable floor
7. F07 경로 힌트
8. F08 청첩장/메시지 exit
9. F09 lazy preload
10. F10 keyboard path

## Batch C — 게임 feel
11. F11 박수/환호
12. F12 사진 결과 card
13. F13 캐릭터 grounding/촬영 framing
14. F14 단체사진 variant
15. F15 완료 banner

## Batch D — polish
16. F16 button states
17. F17 reduced motion
18. F18 refresh resume
19. F19 parking direction
20. F20 buffet photo presentation
21. F21 lobby labels
22. F22 outer shell
23. F23 walk animation

F24/F25는 별도 결정 후 진행.

---

# 3. Codex 검증 체크리스트

각 Batch 후 반드시:

- [ ] 320×568
- [ ] 393×852
- [ ] 430×932
- [ ] desktop DPR 1
- [ ] car route
- [ ] subway route
- [ ] bride side
- [ ] groom side
- [ ] meal-before-ceremony branch
- [ ] ceremony applause
- [ ] ceremony cheer
- [ ] message skip
- [ ] invitation open
- [ ] refresh / continue
- [ ] prefers-reduced-motion

확인할 것:
- uncaught console error 0
- failed request 0
- 버튼 double trigger 없음
- dialog 뒤 scene input 차단
- 필수 progression 누락 없음
- 기존 `Things That Are Already Good` 훼손 없음

---

# 4. Codex가 하지 말아야 할 것

- 모든 배경을 새로 만들지 말 것.
- 게임 엔진/상태 관리를 이유 없이 전면 rewrite하지 말 것.
- 픽셀 스타일을 "현대적인 웹 UI"로 바꾸지 말 것.
- gradient/glassmorphism/rounded SaaS card를 도입하지 말 것.
- 실제 웨딩 사진을 픽셀화하지 말 것.
- 점수/HP/퀘스트 XP를 추가하지 말 것.
- 로비에서 설명을 없애고 "탐색하게 두자"라고 단순화하지 말 것.
- P2를 먼저 하느라 P1 completion을 늦추지 말 것.


## Batch A implementation record — 2026-09-12

Implementation follows `GAME_REVIEW_FINAL.md` Batch A (F03, F04, F05, F01, F06). The original findings above are preserved as audit evidence. Status refers to the final review’s acceptance criteria. Batch B/C/D and F24/F25 remain deferred.

See [acceptance checks, exact file list, and AFTER comparisons](docs/game-review/after-batch-a/README.md).


## Batch D 구현·검증 기록 — 2026-09-14

원래 finding은 유지한다. 이번 판정은 `BATCH_D_IMPLEMENTATION.md`의 수용 기준과 고정된 최종 소스의 실제 Chromium 검증을 따른다. 앞선 배치 기록의 deferred 표시는 해당 당시 상태다.

- [x] fixed — D-A01: 실제 shipping 98개와 runtime/production 대조, 기존40개 추적 및 원본 보존, 정상/음성 검사.
- [x] fixed — C-P01: 작은 손 박수와 주체에 연결한 말풍선, 정상 반응 후 단체사진1회.
- [x] fixed — F16: 공통 취소/pressed/disabled/키보드 focus 및 단일 입력.
- [x] fixed — F17: 세 촬영 장면의 공통 감소 모드·실행 중 변경·리스너 정리.
- [x] fixed — F18: versioned 안전 checkpoint와 사진 메타데이터 복구,320 이어하기 겹침 해소.
- [x] fixed — F19: 같은 top-down 차량의 주차 안내도, 기존 B3/타워/오답 경로 보존.
- [x] fixed — F20: 수동3장 사진 카드와 직접 식사 종료.
- [x] fixed — F21: 크림/골드/딥그린 장소 명패, 기존 접근점·이름·수첩 유지.
- [ ] remaining — F22: 프레임 구현·5 viewport 자동 검증 PASS. 실제 폰 safe area/주소창/OS 키보드 검증은 남아 PARTIAL.
- [x] fixed — F23: 거리 기준4방향×2걸음, idle/발 앵커·90외형 검증.
- [x] F24 대상 선별 문서만 완료(후보0개).
- [ ] remaining — F24 실제 아트 재가공 및 F25: 이번 범위 밖이며 미실행.

최종 dev112 PASS/3 production-only SKIP, production32 PASS, 별도 첫 화면·정상 사진 복구2 PASS와320 입력1 PASS. 정상 shipping 검사 exit0 및 별도 음성 fixture5 PASS. 상세/요약/실패 이력/화면/영상/한계는 [Batch D 검수 README](docs/game-review/after-batch-d/README.md)에 있다. 외부 배포·공유·전송 없음.
