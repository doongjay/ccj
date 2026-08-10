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

- [ ] `npm create vite@latest` 로 TypeScript 템플릿 생성 (`game/` 서브디렉토리에 배치 권장,
      루트는 `docs/`와 분리)
- [ ] `phaser` 패키지 설치
- [ ] 기본 `Phaser.Game` 설정: `Scale.FIT`, 기준 해상도 720×1280, `physics: arcade`(충돌용)
- [ ] ESLint/Prettier 설정 (선택)
- [ ] `npm run dev`로 로컬에서 빈 화면 렌더 확인

### 제안 폴더 구조

```
game/
  src/
    main.ts                 # Phaser.Game 부트스트랩
    scenes/
      BootScene.ts
      IntroScene.ts
      HomeSelectScene.ts
      CarRouteScene.ts
      SubwayRouteScene.ts
      VenueLobbyScene.ts
      VenueHallScene.ts
      EndingScene.ts
    systems/
      TapToMove.ts           # 탭투무브 + 경로탐색
      QuizModal.ts            # 공용 퀴즈 UI 컴포넌트
      TriggerZone.ts          # 트리거 존 → 씬/퀴즈 연결
      ArrowGuide.ts            # 화살표 안내 연출(C2)
    data/
      scenario.ts | scenario.json   # scenario.md 내용을 데이터화
    objects/
      Player.ts
      Npc.ts
  public/
    assets/
      tiles/ ...
      sprites/ ...
      ui/ ...
  index.html
  vite.config.ts
  tsconfig.json
```

---

## 3. Phase 1 — 코어 이동/씬 전환

- [ ] `TapToMove` 시스템: 탭 좌표 → 그리드 스냅 → A\*(`easystarjs`) 또는 자체 BFS로 경로
      계산 → 경로 따라 스프라이트 이동 (이동 중 재탭 시 목적지 갱신)
- [ ] 타일맵 충돌 레이어 처리 (Tiled에서 export한 JSON, 우선은 사각형 플레이스홀더 맵 1개로
      시스템 검증)
- [ ] `TriggerZone`: 특정 좌표/영역에 캐릭터가 도달하면 이벤트 발생(씬 전환 또는 퀴즈 오픈)
- [ ] 씬 전환 트랜지션(페이드) 공통 유틸
- [ ] 플레이스홀더 스프라이트(단색 사각형/원)로 캐릭터 이동 동작 확인

**완료 기준**: 빈 사각형 맵 위에서 탭한 곳까지 캐릭터가 걸어가고, 특정 지점에 닿으면 콘솔에
로그가 찍히거나 씬이 전환된다.

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
