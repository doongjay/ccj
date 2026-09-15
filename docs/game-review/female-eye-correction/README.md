# 여성 눈 원형 복구 및 의상 선택 수정

사용자가 기존 눈으로 복구된 얼굴을 승인한 뒤 `classicMinimi.ts`는 변경하지 않았습니다. 승인 시점과 최종 소스의 SHA-256이 일치합니다(`accepted-face-version.json`, `source-fingerprint.json`). 남자 얼굴, 3번째 표정, 턱·목 연결, 배경, 로딩 전략, 진행·이동 로직은 이번 수정으로 바뀌지 않았습니다.

## 변경

- 여성 1·2번은 새 둥근 눈을 그리는 처리를 제거하고 원래 눈동자·흰자·형태를 복구했습니다. 바깥 눈매만 1px 낮추고 짧은 속눈썹을 더했습니다. 이 버전을 사용자 승인 후 고정했습니다.
- 여성 6번 흰 나시의 노출된 천 가장자리에 1px 외곽선을 추가했습니다. 검정 카라, 흰 내부, 목, 소매, 치마, 부츠는 보존했습니다.
- 버튼과 미선택 오류 안내의 성별 표기를 ‘남자·여자’로 바꿨습니다. 인라인 검증 동작과 접근성은 유지했습니다.
- 이전/다음 의상 버튼을 첫째·셋째 카드의 바깥 세로 테두리 중앙에 겹쳐 배치했습니다. 픽셀 화살표는 남자 하늘색/여자 분홍색이며 44×44px 터치 영역, 포커스 표시, 키보드 조작을 유지합니다. 의상은 1–3 / 4–6으로 전환됩니다.

## 검증

- 최종 관련 10개 테스트 PASS: 원본 미니미 등록 1, 320×568/393×852/430×932 선택 UI 3, F03 인라인 검증 1, 정면 전체 108조합 렌더 1, 기존 D 애니메이션 보존 1, 성별 캐시 1, 실제 여자 1번/2번 플레이 및 촬영 흐름 2.
- `logs/final-01.json`의 7 PASS + `logs/ui-03.json`의 3 PASS를 중복 없이 집계했습니다. 전체 저장소 테스트를 전부 재실행한 결과는 아닙니다.
- 첫 UI 실행에서 화살표가 카드 중앙보다 2px 높아 3건 실패했습니다. CSS 높이 계산을 수정했고 <=1px 검사 기준은 유지했습니다. 실패 JSON·error-context·trace는 `runs/final-01/`에 그대로 남아 있습니다. 중간 ui-02도 3 PASS, 최종 도트 형태 확인 후 ui-03 3 PASS입니다.
- `npm run build`: 타입 검사와 production 빌드 PASS. 기존 큰 번들 경고는 그대로 보존했습니다.
- shipping `verify:assets`: 독립 실행, 종료 0, 101 등록/101 검사/100 디코드/오류 0. 전체 원본 결과 `assets-final-01.json`.
- 실제 Chromium 브라우저 화면을 열어 세 폭의 양 성별 버튼·화살표·6번 의상을 확인했습니다. 포토부스/신부대기실 사진 결과를 각각 5.5초 감상하고 직접 복귀했습니다. 실제 깜빡임, 걷기, 박수, 수첩 복원, 그룹 사진 전환과 콘솔 오류 없음도 확인했습니다. 원본 정상 속도 영상은 `runs/final-01/` 아래 webm입니다. 배속·재인코딩·실패 구간 삭제는 하지 않았습니다.
- 남녀 정면 전체 108조합을 실제 렌더링하고 `after/male-all54-front-native.png`, `after/female-all54-front-native.png`를 확인했습니다. 열은 얼굴×헤어, 행은 의상입니다. D 애니메이션 검사는 외형의 정답으로 사용하지 않았습니다.
- 첫 화면 네트워크 bytes는 이번 국소 수정에서는 다시 측정하지 않았습니다. 에셋 검사 값은 전체 네트워크 전송량이 아닙니다. 실물 휴대폰 및 Safari 검증으로 주장하지 않습니다.

## 증빙 위치

- 승인된 눈: `face-original-rejected-corrected-4x.png` (원래 얼굴 / 반려된 둥근 눈 / 승인된 복구 얼굴).
- 나시 6방향 비교: `after/camisole-six-poses-before-after-4x.png`.
- 최종 3개 폭 화면: `runs/ui-03/`의 `male-outfit-arrows.png`, `female-camisole-outlined.png` 등.
- 실제 게임/촬영: `after/flows/04-female-face1-hair1-white-shirt/`, `after/flows/06-female-round-glasses-black-mini-boots/`.
- 정확한 변경 파일: `CHANGED_FILES.md`. 이번 작업 시작 시점 대비 diff: `source-diff.patch`. 이전 A/B/C/D 변경 전체와 섞지 않았습니다.
- 소스/검수 자료는 기존 `touch-face-refinement/` 및 이전 ZIP을 덮어쓰지 않았습니다.

로컬 개발 서버: http://127.0.0.1:5174/ (현재 프로젝트).
재실행: `cd /Users/user/wedding/ccj/game` 후 `npm run dev -- --host 127.0.0.1 --port 5174 --strictPort`.
