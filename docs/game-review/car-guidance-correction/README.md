# 현재 자동차 유도선 검증

이번 작업에서는 자동차 배경과 경로 코드를 변경하지 않았습니다. 현재 적용된 분리본을 실제 브라우저에서 다시 확인한 증빙입니다. `before/`라는 폴더명은 검사 설정의 phase 이름이며, 현재 제공 중인 게임의 화면입니다.

- 하단 출발 순서: 왼쪽 노랑 / 가운데 분홍 / 오른쪽 파랑.
- 노랑은 이마트(지원 불가), 분홍은 타워, 파랑은 B3에 도착합니다.
- 320×568, 393×852, 430×932에서 선택 화면과 선을 캡처했습니다. `car-lines-renderer-*`는 선 확인을 위해 Phaser 렌더러만 저장한 화면이며 DOM 선택 UI를 포함하지 않습니다. 일반 화면은 `car-choice-*`입니다.
- `runs/before/`의 세 색 주행 영상은 원본 정상 속도 WebM입니다. 노랑 실패 후 B3 재선택도 검증했습니다.
- `logs/before.json`: 4 PASS / 0 FAIL / 0 SKIP, 콘솔/pageerror 확인 포함.
- `path-to-runtime-image.json`: 실제 경로 샘플과 현재 WebP의 해당 색 선까지 거리 검사. 노랑 151/분홍 141/파랑 166개 샘플 모두 대응 선을 찾았고 최대 거리는 원본 이미지 기준 각각 약 1.04/0.67/2.35 px입니다. 실제 화면 시각 확인과 함께 사용한 보조 검사입니다.
- 실제 에셋: `game/public/assets/optimized/lacitta-routes-car-guidance-v2.webp`, SHA-256 `cf6931548aec4e9cde6a7b8a202235dda1ac580d5a2123548dc2850a849b4421`.
- 원본: `game/artwork/sources/assets/lacitta/routes/car-guidance-separated.png`, SHA-256 `30e7c9f99f5ad34e7dfb192c8613120bd5af68442bba115c673ebab0f842788c`.

로비 복귀 및 연회장 변경·최종 검증은 함께 제공한 `lobby-return-tap-fix/README.md`에 있습니다.
