# 청첩장 상단 메뉴 복구 · 세 번째 썸네일 · 브라우저 제목

- 공유 작업에서 불필요하게 바꾼 상단 메뉴를 이전 flex 배치로 복구. 단독 청첩장 메뉴는 원래대로 예식 안내 / 사진 / 방명록. 게임 중 열었을 때만 기존 게임으로 돌아가기 유지.
- 하단 링크 복사 / 카카오톡으로 전달과 공유 제목은 유지. 제거된 재시작 버튼 callback 정리.
- 세 번째 사진은 3열 썸네일에서만 object-position:left center. 원본 JPEG와 크게 보기 이미지는 변경하지 않음.
- 브라우저 title은 JJ ♥ HS. OG/카카오/native share 문구는 직전 승인된 현서와 재준, 현재의 시작 유지.

검증: cwd game에서 npm run build (tsc / e2e typecheck / Vite) PASS. scripts/verify.config.ts 초기 메뉴 복구 7 PASS, scripts/final.config.ts 최종 제목 포함 7 PASS. scripts/gallery.config.ts는 320×568 / 393×852 / 430×932 갤러리 첫 줄과 세 번째 크게 보기, 공유 버튼을 실제 Chromium에서 캡처. 브라우저 도구의 직접 UI 연결은 사용 가능한 browser가 없어 실행되지 않았으며 Playwright Chromium으로 확인했다.

각 실행의 JSON reporter와 캡처는 logs/ 및 runs/에 보존. 실제 메뉴/공유 동작과 게임→청첩장→기존 수첩 복귀 검증. 제거된 단독 청첩장 재시작 CTA를 쓰던 후속 테스트는 다음 fixture를 root URL로 시작하도록 명시했다. 기존 아트/미니미/로딩 로직/원본 사진 파일 수정 없음.

현재 작업 diff changes.diff, scoped fingerprint source-version.json. 이전 검증 기록은 덮어쓰지 않았다.

최종 갤러리 캡처: 3 PASS. 320/393/430 상단 메뉴 및 393/430 세 번째 썸네일의 왼쪽 인물, 393 크게 보기의 원본 전체 구도를 직접 확인. 그리드 캡처는 요청된 첫 줄 이미지 decode 후 촬영했으므로 아래 행의 lazy-loading 빈칸이 포함될 수 있으며 전체 갤러리 로딩 완료 캡처로 사용하지 않는다.
