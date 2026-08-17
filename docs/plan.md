# 구현 계획

introduction.md / scenario.md / map.md / design.md에서 확정된 내용을 실제 코드로 옮기기
위한 실행 계획. 아직 저장소에 코드가 전혀 없는 상태(문서만 존재)이므로, 프로젝트 스캐폴딩부터
시작한다.

## 0. MVP 정의

이번 구현 범위(1차 완성 목표)는 다음을 모두 포함한다.

- 인트로 → 집 갈림길 선택 → (자차 or 지하철) → 로비 합류 → 축의대 분기 → 뷔페 화살표 안내
  → 엔딩(빈 플레이스홀더)까지 **끊김 없이 플레이 가능한 전체 흐름**
- 탭투무브 이동, 퀴즈 모달(재시도+힌트), 화살표 안내 연출 동작
- 모바일 브라우저(카카오톡 인앱 브라우저 포함)에서 정상 동작
- 실제 픽셀 아트는 없어도 됨 — **플레이스홀더 아트로 전체 흐름이 완주 가능한 상태**를
  1차 목표로 하고, 아트 교체는 이후 단계로 분리

범위 밖(이번 계획에서 다루지 않음):
- 실제 픽셀 아트 제작(별도 작업/외주 필요 — 8장 참고)
- 엔딩 화면 최종 콘텐츠(현재 의도적으로 비워둠, scenario.md 5장)
- RSVP/방명록 등 백엔드 연동 (필요 여부 미정)

## 1. Phase 구성 (실행 순서)

| Phase | 목표 | 주요 산출물 |
|---|---|---|
| P0 | 프로젝트 스캐폴딩 | Vite+Phaser+TS 프로젝트, 로컬 개발 서버 동작 |
| P1 | 코어 이동/씬 전환 프레임워크 | 탭투무브, 씬 매니저, 트리거 존, 플레이스홀더 타일맵 1개 |
| P2 | 퀴즈 시스템 | 퀴즈 모달 컴포넌트, 오답/힌트 로직, 시나리오 데이터 로더 |
| P3 | 전체 시나리오 연결 | 모든 씬 연결, Q1~Q3 + 화살표 안내까지 처음부터 끝까지 완주 가능 |
| P4 | 모바일 대응 & 공유 | 반응형 스케일링, 카카오 OG 메타, 인앱 브라우저 QA |
| P5 | 아트 교체 (별도 트랙) | 플레이스홀더 → 실제 픽셀 아트 에셋 순차 교체 |

Phase는 순차적이지만 P5(아트)는 P1~P4와 병행해서 준비(에셋 제작)만 미리 진행 가능.

---

## 2. Phase 0 — 프로젝트 스캐폴딩

목표: "아무 콘텐츠는 없지만, 모바일 브라우저에서 빈 화면이 뜨고 배포 파이프라인까지 검증된"
상태를 만든다. 이 Phase가 끝나면 Phase 1부터는 게임 로직에만 집중할 수 있어야 한다.

### 0.1 저장소 구조 결정

- 게임 코드는 저장소 루트가 아니라 **`game/` 서브디렉토리**에 둔다. `docs/`(기획 문서)와
  코드가 섞이지 않게 분리하기 위함.
- 루트 `README.md`는 이후 "이 저장소는 무엇인가 + `docs/`와 `game/` 안내" 정도로 짧게
  갱신 (지금은 `# ccj` 한 줄뿐 — Phase 0 마지막에 갱신)
- 결정 사항이므로 별도 승인 불필요, Phase 0 착수 시 바로 적용

### 0.2 개발 환경 전제조건

- [ ] Node.js LTS 버전 확인 (`node -v`, 20.x 이상 권장 — Vite 최신 버전 요구사항 기준)
- [ ] 패키지 매니저는 `npm` 사용 (별도 사유 없으면 pnpm/yarn 도입 안 함, 의존성 단순화)

### 0.3 Vite + TypeScript 프로젝트 생성

```bash
npm create vite@latest game -- --template vanilla-ts
cd game
npm install
```

- `vanilla-ts` 템플릿 사용 이유: Phaser는 React 등 UI 프레임워크가 필요 없고, 프레임워크
  오버헤드 없이 캔버스 하나만 렌더하면 되므로 가장 가벼운 템플릿이 적합
- 생성 직후 불필요한 템플릿 기본 파일(`counter.ts`, 기본 로고/스타일 등) 정리

### 0.4 Phaser 설치

```bash
npm install phaser
```

- 버전은 설치 시점의 최신 stable(Phaser 3.8x 계열 예상)로 고정하고 `package.json`에 커밋
- 타입 정의는 Phaser 패키지에 내장되어 있어 별도 `@types` 불필요

### 0.5 폴더 구조 생성

```
game/
  src/
    main.ts                       # Phaser.Game 부트스트랩
    config.ts                     # 게임 전역 설정값(해상도, 물리 등)
    scenes/
      BootScene.ts                # 최소 프리로드 + 다음 씬으로 즉시 전환
      IntroScene.ts
      HomeSelectScene.ts
      CarRouteScene.ts
      SubwayRouteScene.ts
      VenueLobbyScene.ts
      VenueHallScene.ts
      EndingScene.ts
    systems/
      TapToMove.ts                 # Phase 1
      QuizModal.ts                 # Phase 2
      TriggerZone.ts                # Phase 1
      ArrowGuide.ts                  # Phase 2
    data/
      scenario.ts                    # Phase 2 (scenario.md 데이터화)
    objects/
      Player.ts
      Npc.ts
  public/
    assets/
      tiles/
      sprites/
      ui/
  index.html
  vite.config.ts
  tsconfig.json
  package.json
```

- Phase 0에서는 `systems/`, `data/`, `objects/`, `scenes/`의 각 파일을 **빈 껍데기(스텁)**로만
  만들어둔다. 실제 로직은 Phase 1~3에서 채운다. 폴더 구조를 미리 잡아두는 이유는 이후 Phase
  진행 시 파일을 어디에 둘지 매번 고민하지 않기 위함.

### 0.6 `index.html` 모바일 대응 설정

- `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">`
  추가 (핀치 줌 방지, 노치 대응)
- `<div id="app"></div>` 하나만 두고 Phaser가 그 안에 캔버스를 생성하도록 구성
- 카카오톡 인앱 브라우저 대응을 위해 `<meta name="format-detection" content="telephone=no">`
  등 불필요한 자동 링크 변환 방지 메타도 함께 추가

### 0.7 `main.ts` — Phaser 게임 부트스트랩

- `Phaser.Game` 설정값 (design.md 2장 기준):
  - `type: Phaser.AUTO`
  - 기준 해상도 `width: 720, height: 1280`
  - `scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }`
  - `physics: { default: 'arcade' }` (충돌/트리거 존에 사용)
  - `scene: [BootScene, IntroScene, HomeSelectScene, CarRouteScene, SubwayRouteScene, VenueLobbyScene, VenueHallScene, EndingScene]`
- `BootScene`은 Phase 0 단계에서는 로딩할 에셋이 없으므로, 화면 중앙에 "Hello Wedding Game"
  같은 텍스트 하나만 그리고 5초 후(혹은 탭 시) `IntroScene`으로 전환하는 최소 스텁으로 구현
  → 씬 전환 자체가 동작하는지만 검증하는 것이 이 시점의 목적

### 0.8 tsconfig / lint 설정

- [ ] `tsconfig.json`에서 `strict: true` 유지 (Vite 템플릿 기본값 그대로 사용 권장)
- [ ] ESLint + Prettier 도입 여부 결정 — 1인 개발 + 빠른 진행이 우선이므로 **Phase 0에서는
      생략**하고, 코드베이스가 커지는 시점(Phase 3 이후)에 필요하면 추가하는 것으로 보류
      (introduction.md의 "최대한 빨리" 요구사항 반영)

### 0.9 `.gitignore`

- [ ] `game/node_modules/`, `game/dist/` 반드시 제외
- [ ] 루트 `.gitignore`에 위 경로 추가 (기존 저장소에는 `.gitignore`가 없으므로 새로 생성)

### 0.10 로컬 개발 서버 & 모바일 기기 테스트

```bash
npm run dev -- --host
```

- `--host` 옵션으로 로컬 네트워크에 개발 서버 노출 → 같은 Wi-Fi의 실제 스마트폰에서
  `http://<PC-IP>:5173` 접속해 렌더 확인 (모바일 전용 프로젝트이므로 Phase 0부터 실기기
  확인 습관화)
- 확인 항목: 빈 화면이 아니라 `BootScene`의 텍스트가 세로 화면 중앙에 정상적으로 뜨는지,
  화면 회전/줌이 막혀 있는지

### 0.11 빌드 파이프라인 검증

```bash
npm run build
npm run preview
```

- 정적 빌드(`dist/`)가 정상 생성되고 `preview`로 로컬에서 프로덕션 빌드가 동일하게
  렌더되는지 확인 — Phase 4의 실제 배포(Vercel/Netlify) 전에 빌드 자체가 깨지지 않는지
  미리 검증하는 목적

### 0.12 커밋 & 문서 갱신

- [ ] `game/` 스캐폴딩 전체를 하나의 커밋으로 저장소에 반영
- [ ] 루트 `README.md`를 "문서는 `docs/`, 게임 코드는 `game/`" 안내로 갱신
- [ ] `game/README.md`(선택)에 `npm install && npm run dev` 실행법 간단히 기록

### Phase 0 완료 기준 (Definition of Done)

- [x] `game/` 디렉토리에서 `npm install && npm run dev`로 로컬 서버가 뜨고, 브라우저에서
      빈 화면이 아닌 `BootScene`의 플레이스홀더 콘텐츠가 보인다 (헤드리스 브라우저 스크린샷으로 확인)
- [ ] 같은 내용이 실제 스마트폰 브라우저(모바일)에서도 동일하게 보인다 — **실기기 확인은
      사용자가 직접 해야 함** (`npm run dev -- --host`로 같은 Wi-Fi에서 접속)
- [x] `npm run build && npm run preview`가 에러 없이 동작한다
- [x] `scenes/`, `systems/`, `data/`, `objects/` 폴더와 각 스텁 파일이 저장소에 커밋되어
      있다 (내용은 비어있어도 됨)
- [x] `.gitignore`로 `node_modules/`, `dist/`가 저장소에 올라가지 않는다

---

## 3. Phase 1 — 코어 이동/씬 전환

- [x] `Grid` 시스템 (`systems/Grid.ts`): 월드↔셀 좌표 변환 + walkable 매트릭스 기반 BFS
      최단경로 (별도 라이브러리 없이 자체 구현 — plan에 명시된 두 옵션 중 "자체 BFS" 채택)
- [x] `TapToMove` 시스템: 탭 좌표 → 그리드 스냅 → BFS 경로 계산 → `physics.moveTo`로 웨이포인트를
      순서대로 이동 (이동 중 재탭 시 목적지 갱신)
- [x] `TriggerZone`: 플레이어와 정적 물리 존의 1회성 overlap → 콜백 실행
- [x] `HomeSelectScene`을 실제 콘텐츠로 구현: 코드로 정의한 9×16 그리드 플레이스홀더 방,
      가운데 장애물(BFS가 실제로 우회 경로를 찾는지 검증하는 용도), "자차로 간다"/
      "지하철을 타고 간다" 트리거 존 2개, 플레이스홀더 원형 텍스처 플레이어
  - 실제 Tiled 타일맵 연동은 진짜 타일 에셋이 생기는 Phase 5로 미룸 — 지금은 코드로 정의한
    walkable 배열로 시스템 자체를 검증
- [x] 씬 전환: 존 도달 시 선택(`car`/`subway`)을 `this.registry`에 저장하고 카메라
      `fadeOut` 후 `CarRouteScene`/`SubwayRouteScene`로 전환 (각 씬은 Phase 3 전까지
      "route = ..." 플레이스홀더 텍스트만 표시해 전환을 눈으로 확인 가능)
- [x] `IntroScene`에 탭하면 `HomeSelectScene`으로 넘어가는 연결 추가 (Boot→Intro→HomeSelect
      전체 체인 테스트 가능)

**완료 기준**: 빈 사각형 맵 위에서 탭한 곳까지 캐릭터가 걸어가고, 특정 지점에 닿으면 콘솔에
로그가 찍히거나 씬이 전환된다. → **검증 완료.** 헤드리스 브라우저(CDP)로 탭을 실제 시뮬레이션해
자차/지하철 존 모두 장애물을 우회해 도착 → overlap 발생 → registry 저장 → 페이드 → 다음 씬
전환까지 엔드투엔드로 확인함.

### 디버깅 중 발견한 버그 2건 (기록)

1. **물리 바디 미동기화**: 매 프레임 `sprite.x/y`를 직접 증감시키는 방식은 Arcade 물리
   바디 위치를 갱신하지 않아 트리거 overlap이 실제 이동을 인식하지 못함. `physics.moveTo`
   (속도 기반 이동)로 교체. 웨이포인트 도착 스냅도 `setPosition()`이 아니라 `body.reset()`을
   써야 바디와 트랜스폼이 함께 갱신됨 — 그렇지 않으면 다음 물리 스텝이 스냅을 덮어써
   목표 지점을 그대로 통과해버리는(결국 월드 경계에서 멈추는) 버그로 이어짐.
2. **CSS 이중 중앙정렬**: `#app`에 flexbox 중앙정렬을 주면 Phaser의 `Scale.CENTER_BOTH`와
   겹쳐 캔버스가 이중으로 오프셋됨. `#app`은 단순 블록 요소로 두고 Phaser가 캔버스 위치를
   전담하도록 수정.

---

## 4. Phase 2 — 퀴즈 시스템

- [ ] 시나리오 데이터 스키마 정의 (아래 6장 참고) 후 `data/scenario.ts`에 Q1~Q3 입력
- [ ] `QuizModal` 컴포넌트: 질문 텍스트, 선택지 버튼(2~5개 가변), 정답 콜백, 오답 시
      리액션 텍스트 표시 + "힌트 보기" 버튼 노출
- [ ] 오답 시: 모달 유지(또는 짧게 닫혔다 재오픈) + 리액션 문구, 재시도 무제한
- [ ] 정답 시: 모달 닫힘 + 다음 씬/이벤트로 콜백
- [ ] `ArrowGuide` 컴포넌트: 좌표 배열을 받아 화살표 오브젝트를 순차 표시, 캐릭터가 마지막
      지점 도달 시 완료 이벤트 발생 (C2 전용)

**완료 기준**: 플레이스홀더 맵 위에서 트리거 존에 닿으면 퀴즈 모달이 뜨고, 오답 선택 시
힌트가 뜨며, 정답 선택 시 모달이 닫히고 이벤트가 발생한다.

---

## 5. Phase 3 — 전체 시나리오 연결

scenario.md 기준으로 씬을 순서대로 구현하고 연결한다.

- [ ] `BootScene`: 프리로드 (플레이스홀더 단계에서는 최소 에셋만)
- [ ] `IntroScene`: 타이틀 텍스트 + 시작 버튼 (신랑신부 인사 연출은 플레이스홀더 텍스트로 대체 가능)
- [ ] `HomeSelectScene`: 두 트리거 존(자차/지하철) 배치 → 선택값을 전역 상태(Phaser
      Registry 또는 간단한 상태 모듈)에 저장
- [ ] `CarRouteScene`: 정체 연출(스토리 비트) → Q1 트리거 → 정답 시 `VenueLobbyScene`으로
- [ ] `SubwayRouteScene`: 노선 연출 → Q2 트리거 → 정답 시 `VenueLobbyScene`으로
- [ ] `VenueLobbyScene`: 포토테이블 NPC 트리거 → Q3(신랑측/신부측) → 정답에 따라 축의대
      1/2 위치로 캐릭터 이동
- [ ] `VenueHallScene`: `ArrowGuide`로 연회장까지 안내 → 도달 시 `EndingScene`으로
- [ ] `EndingScene`: 현재는 "곧 공개됩니다" 수준의 빈 플레이스홀더 화면만 구현 (scenario.md
      5장 참고, 추후 콘텐츠 확정되면 채움)

**완료 기준**: 인트로에서 시작해 자차/지하철 어느 경로를 택하든 처음부터 끝(엔딩 플레이스홀더)까지
막힘 없이 완주 가능.

---

## 6. 시나리오 데이터 스키마 (제안)

퀴즈/스테이지 내용을 코드에 하드코딩하지 않고 데이터로 분리해 scenario.md 수정 시 반영이
쉽도록 한다.

```ts
type Quiz = {
  id: string;                 // "Q1"
  question: string;
  options: { id: string; label: string; correct: boolean; reactionText?: string }[];
  hintText: string;
};

type Stage = {
  id: string;                 // "A2"
  sceneKey: string;
  quiz?: Quiz;
  onComplete: { nextSceneKey: string };
};
```

scenario.md의 각 표(6장 퀴즈 데이터 요약표 등)를 이 구조에 맞춰 그대로 옮기면 된다.
문서와 데이터가 어긋나지 않도록, **scenario.md가 원본(source of truth)이고 코드 데이터는
그 내용을 그대로 반영**하는 원칙을 유지한다.

---

## 7. Phase 4 — 모바일 대응 & 공유

- [ ] 실기기(iOS Safari, Android Chrome) + 카카오톡 인앱 브라우저에서 탭투무브 동작 확인
- [ ] `Scale.FIT` 기준으로 다양한 화면비(19.5:9, 16:9 등)에서 레이아웃 깨짐 없는지 확인
- [ ] OG 메타 태그(`og:title`, `og:description`, `og:image`) 추가 — 카톡 공유 미리보기 확인
- [ ] 정적 호스팅 배포 (Vercel/Netlify) 및 실제 링크로 카톡 공유 테스트
- [ ] 로딩 속도 확인 (플레이스홀더 단계는 가벼우므로 실제 아트 교체 후 재확인 필요)

---

## 8. Phase 5 — 아트 트랙 (병행 진행)

design.md 7장 에셋 목록 기준. 코드 작업과 별개로 준비 가능하므로 P1~P4와 병행.

- [ ] 플레이어 캐릭터 스프라이트시트 (4방향 walk + idle)
- [ ] 신랑/신부 NPC 스프라이트
- [ ] 배경 타일셋: 도로/주차장, 지하철역, 예식장 로비/복도/신부대기실/연회장/축의대/포토부스
      (map.md 참고 이미지 기반)
- [ ] 오브젝트: 유도선(노랑/핑크/파랑), 출구 표지판, 포토테이블, 축의대 데스크, 화살표
      가이드 아이콘
- [ ] UI 컴포넌트 아트: 대화창, 퀴즈 모달, 버튼, 힌트 아이콘
- [ ] 픽셀 폰트 선정 (라이선스 확인)

에셋이 준비되는 대로 Phase 1~3에서 만든 플레이스홀더를 하나씩 교체한다 (전체 재작업 없이
씬별로 점진적 교체 가능하도록 구조를 짜는 것이 P0~P3의 목표이기도 함).

---

## 9. 확인이 필요한 선행 결정 (착수 전 확인 권장)

- [ ] 자차/지하철 루트에 스테이지를 더 추가할지 여부 — 추가한다면 Phase 3 범위가 늘어남
      (introduction.md TBD)
- [ ] 개발 완료 목표일 — Phase별 소요 기간 산정에 필요 (introduction.md TBD)
- [ ] 지하철 오답 출구별 리액션 문구 — Phase 4 전에는 확정되어야 실제 카피 반영 가능

## 10. 완주 기준 (Definition of Done, 1차 MVP)

- [ ] 모바일 브라우저에서 링크 접속 → 인트로 → 경로 선택 → 퀴즈 통과 → 로비 합류 →
      축의대 분기 → 화살표 안내 → 엔딩(플레이스홀더)까지 끊김/크래시 없이 완주
- [ ] 모든 퀴즈에서 오답 선택 시 힌트가 뜨고 재시도로 정답 도달 가능
- [ ] 카카오톡 공유 시 미리보기(OG 이미지/문구) 정상 노출
