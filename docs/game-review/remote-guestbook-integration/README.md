# 원격 방명록 패치 반영

- 원격 `04ba87b`(공개 방명록·미니미) 및 `38ed95e`(Supabase 메시지·사진)를 병합 커밋 `9797ef8`로 반영했다.
- 사용자가 원격 동작을 확인했으며 받는 사람 버튼 등 방명록 추가 작업과 검증을 취소했다. 원격 방명록/클라우드/업로드/SQL 코드를 그대로 유지한다.
- `npm ci --cache /private/tmp/ccj-npm-cache`: 제한 환경 DNS 실패 후 허용된 설치로 성공. 36 packages, audit 0 vulnerabilities. 기존 npm 로그는 캐시에 보존.
- 병합 직후 `npm run build` 종료 0. 이후 실행되던 개발 서버가 설치 전 ky 모듈 실패를 캐시해 화면 검증이 실패했다. 이 프로젝트의 vite.config.ts 변경 감지로 서버를 재시작하고 실제 첫 화면 정상 실행을 확인했다. 다른 프로젝트의 프로세스는 종료하지 않았다.
- cloud 테스트는 설정 파일 import.meta/cwd 오류 및 샌드박스 포트 차단으로 실행되지 않았고, 권한 요청 중 사용자 취소 후 중단했다. 통과로 보고하지 않는다. 실패 로그 보존. 실제 DB 쓰기 없음.
- `runs/visual` 및 `logs/visual.json`: 모듈 캐시 문제 당시 1 PASS / 14 FAIL / 1 interrupted. 후속 사진·디자인 검증은 `../invitation-photo-loading/`에 별도로 기록한다.
