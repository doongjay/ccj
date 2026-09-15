# 의상 선택 화살촉 — 2026-09-16

- `game/src/ui/MinimiPicker.ts`: 게임/청첩장 공통 SVG를 막대 없는 도트 세모로 변경.
- `game/src/style.css`: 청첩장 공통 button 스타일이 덮어쓰던 화살표의 배경·테두리·패딩을 공통 선택자로 재지정. 44×44 투명 hit target, 키보드 focus, 카드 양 끝의 위치, 남자 하늘색/여자 분홍색 테마 유지.
- 미니미 원본 얼굴/목/의상 픽셀은 수정하지 않음.

`cd game` 후 `npm run test:e2e -- --config=../docs/game-review/minimi-arrowheads/scripts/verify.config.ts`: 6 PASS.

320×568, 393×852, 430×932에서 게임·청첩장 각 1개 테스트. 남녀 모두 1–3/4–6 전환·반복·선택 유지·Space/Enter/Tab·44px 터치 영역·투명 배경·테두리/그림자 없음·도트 화살촉의 평평한 뒷면을 검사했다. 청첩장 콘솔 오류 0. 실제 게임에서 선택한 얼굴/의상으로 다음 장면까지 진행.

`runs/browser/`에 남녀 게임/청첩장 PNG가 있다. 393px에서 네 조합을 직접 확인했고, 320/430에서도 대표 화면과 경계 위치를 확인했다. 빌드 종료 0. 원래 실패 기록/검수 ZIP는 변경하지 않았다.
