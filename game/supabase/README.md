# 방명록 저장

## 설정

1. Supabase SQL Editor에서 `migrations/`의 SQL을 파일명 순서로 각각 한 번 실행합니다. 기존 연결 프로젝트는 `20260916010000_public_guestbook.sql`만 추가 실행합니다.
2. Authentication → Sign In / Providers에서 Anonymous Sign-Ins를 활성화합니다.
3. 로컬 `.env.local` 및 Vercel Production에 아래 두 환경 변수를 설정하고 다시 빌드·배포합니다.
   - `VITE_SUPABASE_URL`: 프로젝트 URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: Publishable key 또는 Legacy anon key

Secret/service_role 키는 브라우저 환경 변수에 넣지 않습니다.

## 확인하는 곳

- Table Editor → `guest_messages`: 하객 이름·신랑/신부측·메시지·미니미·작성 시각
게임의 촬영 사진은 서버에 전송하지 않습니다. 기존 `guest_photos` 테이블과 `guest-photos` 버킷은 이전 기록 보존을 위해 그대로 두며, 앱에서 새 사진을 쓰지 않습니다.

`guestbook_entries`는 이름·신랑/신부측·메시지·미니미·작성 시각을 모든 방문자에게 공개하는 읽기 전용 뷰입니다. 이 뷰는 소유자 권한으로 전체 방명록을 조회하며, 인증 ID는 노출하지 않습니다. 원본 테이블은 RLS로 하객 본인의 조회·추가만 허용합니다. 다른 하객의 원본 레코드와 촬영 이미지 조회, 수정, 삭제는 허용하지 않습니다. 사진 버킷은 비공개이며 PNG 한 장은 최대 2MB입니다. 관리자는 Supabase 대시보드에서 전체 기록을 봅니다. 계정 비밀번호를 공유하지 말고 필요한 관리자만 프로젝트에 초대합니다.

## 저장 동작

메시지는 서버가 저장을 확인한 뒤에만 완료 표시합니다. 실패하면 입력을 유지하고 같은 ID로 재시도합니다. 촬영·사진 결과·수첩은 기존 게임 안에서 이용하며 사진 업로드나 전송 상태 UI는 없습니다.

익명 인증 정보는 현재 브라우저에 저장됩니다. 브라우저 데이터를 지우거나 다른 기기로 접속해도 공개 방명록은 계속 볼 수 있습니다. 개인 촬영 이미지의 접근 권한은 기존 브라우저에 연결되며 관리자는 계속 확인할 수 있습니다. 기존 로컬 체험판 메시지를 자동으로 서버에 올리지는 않습니다.

두 환경 변수가 모두 없으면 기존 로컬 체험판으로 동작합니다. 운영 배포에는 두 값이 모두 필요합니다.

## 검증

```sh
npm run build
# 별도의 가짜 HTTP 응답으로 저장 실패·재시도·중복 방지를 검증합니다.
npm run test:cloud
```

이 테스트는 실제 DB 권한 검증을 대체하지 않습니다. 초기 설정 후 별도 익명 하객 두 명으로 공개 방명록 조회, 타인의 원본 테이블·촬영 이미지 조회 차단, 무인증 쓰기 차단을 실제 Supabase에서 확인합니다.

무료 요금제에는 저장량·전송량 한도가 있고 비활성 프로젝트가 정지될 수 있습니다. 배포 후 사용량을 확인하고, 방명록 메시지는 Supabase에서 주기적으로 내려받아 보관합니다. 공개 트래픽이 커지면 Supabase 익명 인증의 CAPTCHA 설정도 함께 적용해야 합니다.

실제 프로젝트 검증은 `CCJ_LIVE_QA=1 npm run test:e2e -- cloud-live --workers=1 --output=test-results-live`로 실행합니다. 실제 `연동 검증` 기록을 남기므로 관리자 확인 후 해당 테스트 기록과 파일을 정리할 수 있습니다.


## Server Save Feedback

Message forms keep their existing save/retry behavior and public guestbook visibility. Game photos have no server-save behavior or status UI. The photo regression test verifies that capture, viewing and returning work with zero cloud requests, including when Supabase environment variables are configured.
