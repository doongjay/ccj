# 원본 사진 적용 및 로비 액자 채우기

사용자 요청: 모청 갤러리 전체 교체(셀프 모청.zip의 숫자순), 포토테이블과 모청 모두 전달한 원본 화질 그대로 유지, 로비 세 액자의 파란 여백 제거.

- ZIP의 23개 파일을 `1~6, 11~13, 21~26, 31~33, 41~45` 순서로 적용. `41.png`도 PNG 원본을 그대로 사용.
- 포토테이블 원본 6개와 갤러리 원본 23개 모두 바이트 단위 복사. 리사이즈, 재압축, 색공간 변환, 메타데이터 제거 없음. `original-import.json`에 원본 경로/크기/해시/치수 기록.
- 기존 갤러리 22개는 `game/artwork/sources/retired-invitation-gallery/`에 원본 그대로 보관. 지난 검증자료와 ZIP, 포토테이블의 지난 압축본도 보존.
- 포토테이블 사진만 브라우저의 원본 이미지 레이어로 표시하여 720×1280 게임 캔버스의 픽셀 확대를 거치지 않음. 액자/캡션/버튼/게임 아트는 기존 유지.
- 로비 세 액자의 내부 전체 좌표에 비율 유지 cover 표시. 배경 파일은 변경하지 않고 사진 내부만 합성. 큰 사진에서는 자르지 않음. 두 삼각형 경계의 대각선 투명 틈도 단일 변환으로 제거.

## 용량과 검사 기준

원본 사진은 초기에 요청하지 않음. 갤러리는 청첩장에서 지연 로드하고, 포토테이블은 선택한 하객측 3장만 여행 중 미리 준비.
원본 갤러리 168,890,625 bytes, 포토테이블 34,954,536 bytes. 기존 개별 사진 3,000,000 bytes / 전체 shipping 110,000,000 bytes 기준은 변경하지 않음. 따라서 원본 유지 요청과 충돌하는 기존 용량 검사 실패는 숨기거나 PASS로 바꾸지 않고 기록함. 사진별 실제 URL 응답의 원본 해시, 브라우저 디코딩/화면 검증은 별도 수행.

`assets-final.json`: 114 registered / 114 checked, 전체 257,259,157 bytes, opening assets 3,093,352 bytes. **exit 1 / FAIL**: 원본 사진 23개의 개별 크기 초과 + 전체 shipping 크기 초과 1건. 파일 누락/미등록/출처/해시/빌드 복사 불일치는 없음. 기존 검사는 메타데이터 오류가 있으면 디코딩 단계에 진입하지 않으므로 `decoded: 0`이며 이를 이미지 검증 PASS로 해석하지 않음. 원본 29개의 디코딩과 네트워크 동일성은 아래 별도 테스트에서 통과.

## 구현 원인과 범위

이전 포토테이블은 최대 1600px·JPEG 0.92로 재압축한 파일을 720×1280 게임 캔버스 안에 렌더링한 뒤 `image-rendering: pixelated`로 표시했다. 원본 바이트 연결과 사진만의 브라우저 이미지 레이어로 두 원인을 제거했다. 픽셀게임 캔버스/미니미/주변 UI에는 smoothing을 적용하지 않았다.

기존 로비 합성 좌표는 실제 액자 내부보다 작아 원래 파란 화면이 상하좌우에 남았다. 새 내부 좌표 + cover + 단일 affine 변환으로 여백과 대각선 틈을 없앴다. 모청 갤러리 교체는 23개 항목의 명시적 파일명 매핑을 사용하므로 41번 PNG도 변환할 필요가 없다. 에셋 검사 역시 실제 매핑을 검사하고 중복/잘못된 URL을 거부한다. 기존 byte budget은 그대로다.

정확한 파일: `CHANGED_FILES.md`. 이번 변경만의 텍스트 diff: `change.diff`. 검증 소스: `source-fingerprint.json` (HEAD + dirty working-tree 파일별 SHA-256). 최근 승인된 미니미 4개 핵심 파일 해시가 그대로임을 확인했다.

## 검증 결과

최종 **관련 테스트 35 PASS / 0 SKIP / 미해결 테스트 실패 0**. 첫 시도 실패와 재실행은 별도 JSON/trace에 모두 보존. 이 집계는 위 shipping 용량 검사 FAIL과 구분한다.

- `logs/after.json`: 31개 중 27 PASS / 4 FAIL. 모청 3건은 비동기 청첩장 생성 전에 새 테스트가 빈 DOM을 읽은 것이 원인. 23개 표시 대기 후 동일한 전체 순서 검사를 수행하도록 수정. 나머지 1건은 29개 해시/디코딩 검사를 모두 통과한 뒤 증빙 시트 생성기가 ZIP 메타데이터 객체까지 사진 배열로 취급한 오류. 사진 그룹만 전달하도록 수정. 제품 코드는 실패/재실행 사이 동일.
- `logs/gallery-retry.json`: 위 모바일 순서 검사 3건 + 추가 DPR 3 사진/리사이즈/청첩장 왕복 검사 1건 = 4 PASS.
- `logs/integrity-retry.json`: 원본 29개 서버 응답과 소스의 동일 바이트/SHA-256/치수/색상 디코딩, 두 연락시트 생성 = 1 PASS. 상세 `after/original-integrity.json`.
- `logs/production-02.json`: 실제 production cold-cache 자동차/지하철 첫 화면·첫 로비 + 의도적 에셋 1회 실패 후 키보드 재시도 = 3 PASS.
- `logs/build-03.log`: TypeScript, 전체 e2e 타입 검사, Vite production build 모두 성공. 기존 큰 JS 청크 경고는 유지.
- `logs/before.json`: 비교용 변경 전 실제 브라우저 캡처 1 PASS (위 35개와 별도).

320×568, 393×852, 430×932에서 신랑/신부 포토테이블 각 1~3·로비 세 액자·모청 23개 파일 순서·처음/끝 순환·화살표/키보드·닫기·진행도·복귀 위치를 확인했다. 추가 기존 갤러리 회귀는 390×844, 720×1280, 1440×1000을 검사한다. 게임 프로필→초대장/메시지의 얼굴·의상 유지, 메시지 탐색, 로비 시설/홀 제한, 하객측 변경도 기존 테스트 그대로 통과.

원본 화질은 단순 컴파일/idle 일치가 아니라 URL별 바이트 동일성 및 고해상도 실제 브라우저 표시로 확인했다. 브라우저 콘솔/요청 오류 없음. production 재시도 테스트의 단 1회 white-car 네트워크 실패는 의도한 주입이며 원본 기록에 명시.

## 전송량

`production/regressions/performance-car.json`, `performance-subway.json`: 첫 화면 총 **3,516,964 bytes** (HTML/JS/CSS/응답 헤더 포함; 직전 3,517,339 bytes보다 375 bytes 감소). 초기 원본 사진 요청 0개. 5,000,000 bytes 목표 유지. 로컬 Chromium, 네트워크 throttling 없음, cache 비활성. 첫 로비까지의 누적 전송은 신부측 자동차 34,697,841 bytes / 신랑측 지하철 27,023,870 bytes로 원본 사진 때문에 증가했다. 이를 첫 화면 전송량과 혼동하지 않는다.

## 화면과 보존

- `before/frames-composite-4x.png` ↔ `after/frames-composite-4x.png`: 원본 배경과 실제 사진 합성 4배 확대, 파란 여백/대각선 틈 제거 확인.
- `before/photo-table-groom-1-393.png` ↔ `after/photo-table-groom-1-393.png`; `after/photo-table-groom-original-dpr3.png`: 캔버스 픽셀화 제거/원본 표시.
- `after/photo-table-{groom,bride}-{1,2,3}-{320,393,430}.png` 및 `after/lobby-{groom,bride}-{320,393,430}.png`.
- `after/invitation-{원본파일번호}-393.png`: 23장 전체 실제 lightbox 화면. 320/430은 1/41/45번도 별도 캡처.
- `after/invitation-originals-contact.png`, `after/photoTable-originals-contact.png`: 전체 29개 원본을 브라우저에서 디코딩하여 만든 육안 확인용 시트. 이 시트만 축소하며 배포 사진 파일은 원본 그대로다.
- `after/invitation-grid-*.png`는 내부 스크롤 컨테이너를 element screenshot으로 캡처하여 화면 밖 하단이 빈 캡처라는 한계가 있다. 전체 목록 증빙은 23개 실제 lightbox 화면, 순서 JSON, 전체 사진 시트를 사용한다. 해당 불완전 캡처도 덮어쓰지 않고 보존했다.
- 실제 정상/실패 동작 영상과 실패 trace: `runs/after/`, `runs/gallery-retry/`. 기존 모든 검수 폴더/ZIP과 외부 전달본은 그대로다.

로컬 개발 서버 `http://127.0.0.1:5174/` 유지. 재실행은 `game`에서 `npm run dev -- --host 127.0.0.1 --port 5174 --strictPort`. 외부 배포 없음.
