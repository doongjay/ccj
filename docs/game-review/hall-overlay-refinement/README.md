# 예식장 말풍선·원판 촬영 배치 수정

2026-09-15. 현재 완료본 위에서 요청한 예식장 UI·짧은 축하 인사·잔디 통로 표기만 수정했다. 이전 검수 폴더와 ZIP은 보존했다.

## 변경 파일

| 파일 | 목적 |
| --- | --- |
| `game/src/style.css` | 예식 안내를 신랑신부와 하객 사이에 배치하고, 두 선택지 사이에 하객 공간 확보. 원판 안내는 스크린 중심, 촬영·다음 버튼은 카메라 프레임 아래 같은 위치. |
| `game/src/ui/speechBubble.ts` | 밝은 답례 말풍선과 어두운 하객 말풍선 모두 몸체·꼬리를 연결한 픽셀 테두리. 말풍선 제거 시 테두리도 함께 제거. |
| `game/src/scenes/VenueHallScene.ts` | 하객측에 맞춘 신랑/신부 답례 위치, ‘나’ 표기 제거, 촬영 전 네 가지 축하 인사 순환과 정리. |
| `game/src/scenes/GreeneryCorridorScene.ts` | ‘신부대기실 입구’ 텍스트만 삭제. 기존 이동·대기실 진입 유지. |
| `game/e2e/hall-overlay-layout.spec.ts` | 세 폭 × 두 하객측 × 박수/환호, reduced motion, 통로 이동의 실제 브라우저 검증. |
| `game/e2e/hall-greeting-lifecycle.spec.ts` | 축하 인사의 일시정지, 실시간 모션 설정 변경, 촬영·이탈 정리, 재입장 검사. |
| `game/e2e/review-batch-c-ceremony.spec.ts` | 사용자 요청으로 삭제한 ‘나’ 태그의 기대값만 `false`로 변경. 기존 반응 시간·다양한 하객·단일 전환 검사 유지. |

이 폴더에는 추가로 실행 설정, 원본/수정 소스, 이번 변경만의 `this-change.diff`, 소스 fingerprint, 개별 테스트 JSON, 측정치, PNG 및 실제 속도 WebM 영상을 기록했다.

## 화면과 동작

- 예식 안내의 위쪽은 게임 좌표 y=764. 신랑신부의 발끝 y=746보다 아래이고, 하객의 머리 y=952보다 위다.
- 선택지는 안내 아래 8 CSS px 간격으로 배치하며, 중앙 공간은 화면 폭의 20%다. 320/393/430 폭에서 각각 약 64/79/86 CSS px.
- 신랑측의 답례는 신랑 x=320, 신부측은 신부 x=395에 표시한다. 박수·환호·답례 모두 테두리가 있다.
- 원판 안내와 촬영 결과 안내는 배경 스크린의 세로 중심 y=364에 맞췄다. ‘사진 찍기’와 ‘다음으로’의 y 차이는 0이며 카메라 하단 y=1004 아래 약 8 CSS px에 있다.
- ‘축하해!’, ‘잘살아!’, ‘멋지다!’, ‘예쁘다!’가 뒷줄 하객 위 여유 공간에서 하나씩 1.5초 간격으로 바뀐다. 촬영을 누르면 즉시 제거되며 다시 생기지 않는다. 화면 이탈 시 타이머도 제거된다.
- 청첩장을 열면 인사 순환이 함께 멈춘다. 모션 줄이기에서는 하나의 고정 인사만 표시한다.
- ‘나’와 ‘신부대기실 입구’는 표시하지 않는다. 통로 제목과 기존 입구 화살표는 요청 범위 밖이므로 유지했다.

## 증빙

최종 화면은 `after-final-02/`이며, `before/`는 수정 전 393×852 화면이다. `after/`와 `after-final/`은 중간 검증 기록으로 보존했다.

- [예식 안내·선택지 320](after-final-02/ceremony-choice-320-cheer-groom.png)
- [신랑측 하트 답례 393](after-final-02/ceremony-response-393-applause-groom.png)
- [신부측 하트 답례 393](after-final-02/ceremony-response-393-applause-bride.png)
- [신부측 환호·답례 테두리 430](after-final-02/ceremony-response-430-cheer-bride.png)
- [원판 촬영 대기 430](after-final-02/group-photo-ready-430-cheer-bride.png)
- [원판 촬영 결과 430](after-final-02/group-photo-result-430-cheer-bride.png)
- [다른 하객의 축하 인사 393](after-final-02/guest-greeting-3-393-cheer-groom.png)
- [통로 표기 삭제 393](after-final-02/greenery-corridor-393.png)

실제 속도 전체 영상은 `runs/after-final-02/*/video.webm`. 재인코딩, 배속, 프레임 보간, 실패 구간 편집을 하지 않았다. 두 하객측·박수/환호·세 폭과 모션 설정, 촬영·다음 진행을 기록했다. 기존 전체 진행 영상은 `runs/regression/`에 있다.

## 검증 방법과 기록

Chromium에서 320×568, 393×852, 430×932로 화면을 캡처하고 실제 렌더링 결과를 확인했다. Playwright로 버튼을 누르고 정상 장면 타이머를 기다렸다. 새 화면 검사에서만 준비된 장면 fixture를 사용하며, 기존 전체 진행 검사는 프로필 작성부터 자동차/지하철, 로비 시설, 신부대기실, 예식, 원판, 식사, 메시지 저장/건너뛰기를 실제 입력으로 진행한다.

모든 실행 명령의 작업 디렉터리는 `game/`이다.

```sh
npm run test:e2e -- --config=../docs/game-review/hall-overlay-refinement/scripts/after-final-02.config.ts
npm run test:e2e -- --config=../docs/game-review/hall-overlay-refinement/scripts/regression.config.ts
npm run build
npm run typecheck:e2e
npm run verify:assets -- --report ../docs/game-review/hall-overlay-refinement/assets-final.json
```

최종 결과는 새 검증 15건 + 기존 회귀 20건 = **35 PASS / 0 FAIL / 0 SKIP**다. 각 검사에서 수집한 브라우저 콘솔·런타임 오류도 0이다. 개별 결과와 요약은 `logs/after-final-02.json`, `logs/regression.json`, `verification.json`에 있다. 에셋 검사는 별도의 `assets-final.json`을 사용하며 등록 101 / 검사 101 / 디코딩 100, 오류 0, 종료 코드 0이다. 빌드는 통과했고 기존 Vite 500 kB 청크 경고는 유지했다. 검사 기준을 변경하지 않았다.

### 중간 검증 기록 보존

- `logs/before.json`: 수정 전 캡처 3건 통과.
- `logs/after.json`: 초기 배치 캡처 7건 통과. 이 시점의 320 폭에서는 청첩장 inset CSS가 예식 위치를 덮어쓰는 것을 **실제 화면에서 발견**해 이후 수정했다. 이 실행의 테스트 통과만으로 시각 합격 처리하지 않았다.
- `logs/after-final.json`: 11 통과 / 3 실패. 네 인사를 정확히 1500ms 간격으로 샘플링해 장면 타이머 경계에서 이전 인사를 중복 읽은 검사였다. 실패 위치·영상·trace는 `runs/after-final/`에 그대로 보존했다.
- 최종 검사는 다음 인사가 실제 표시되는 것을 기다리며, 여전히 서로 다른 네 인사 전부를 요구한다. 인사 수나 검사 기준을 줄이지 않았다. 이전 테스트 코드는 `source-test-retry/hall-overlay-layout.spec.ts`에 보존했다.
- `logs/after-final-02.json`: 새 검증 15건 통과, 실패·SKIP 0.

## 보존 및 실행

직전 검수 fingerprint의 247개 소스·설정·에셋과 비교했다. 기존 파일 중 달라진 것은 위 제품 코드 4개와 기존 테스트 1개뿐이며 새 테스트 2개가 추가됐다. 얼굴·의상·썸네일·미리보기 코드 4개는 이전 SHA-256과 일치한다. 자동차 유도선 배경, 로비 및 원판 사진 배경 등 기존 에셋은 변경하지 않았다. F24/F25 작업은 하지 않았다.

로컬 서버: <http://127.0.0.1:5174/>

다시 실행하려면 `game/`에서:

```sh
npm run dev -- --host 127.0.0.1 --port 5174 --strictPort
```
