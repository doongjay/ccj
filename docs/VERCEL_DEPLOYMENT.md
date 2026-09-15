# Vercel Hobby 배포

개인 결혼식 청첩장은 개인 비상업 용도의 Hobby 플랜으로 시작한다. 유료 플랜 전환/도메인 구매는 이 작업에 포함하지 않는다. [Hobby 안내](https://vercel.com/docs/plans/hobby)

## GitHub 연결

- 저장소: `https://github.com/doongjay/ccj`, production branch: `master`
- 작성자: `larvava <with.larva@gmail.com>`
- 2026-09-16: 최초 권한 확인은 `larvava` 계정으로 403이었으나, 이후 `100b6ae` 커밋을 `origin/master`에 푸시했고 원격 반영까지 확인했다.
- 원격 저장소/기존 인증 계정은 임의로 변경하지 않았다.
- Vercel Hobby의 Git 자동 배포는 프로젝트 소유자와 커밋 작성자 계정 연결도 확인해야 한다. [Git 연결 안내](https://vercel.com/docs/git)

## Import 설정

Vercel에서 개인 Hobby 계정으로 `Add New → Project`에서 위 저장소를 선택한다.

| 설정 | 값 |
|---|---|
| Root Directory | `game` |
| Framework Preset | `Vite` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Production Branch | `master` |

`game/vercel.json`에 명령을 명시했다. 현재 화면은 정적 배포로 제공하고, 원본 사진은 `public/assets`에서 그대로 제공한다. 공용 방명록은 아래 Supabase 설정을 사용한다. [Vite 배포](https://vercel.com/docs/frameworks/frontend/vite)

현재 원본 사진 포함 public은 약 248 MiB이므로 **Git 저장소 Import**로 빌드한다. Hobby CLI의 source upload 한도는 100 MB이므로 이 프로젝트 전체를 CLI로 직접 업로드하는 방식은 맞지 않는다. 원본 사진을 임의로 압축하거나 누락하지 않는다. [업로드 한도](https://vercel.com/docs/limits)

## 주소 · 공유

- 최초에는 프로젝트에 제공되는 `*.vercel.app` 주소를 사용한다.
- `SITE_URL`을 지정하면 그 주소를 canonical/공유 이미지 절대 주소로 사용한다.
- 비워 두면 Vercel의 `VERCEL_PROJECT_PRODUCTION_URL`을 자동 사용한다. System Environment Variables 노출을 활성화한다. [공식 변수](https://vercel.com/docs/environment-variables/system-environment-variables)
- 카카오 전용 카드 공유는 본인의 공개 JavaScript 키 `VITE_KAKAO_JAVASCRIPT_KEY`와 해당 웹 도메인의 Kakao Developers 등록이 필요하다. 미설정이면 기존 기기 공유/링크 복사가 동작한다.

## 사용자 도메인

`Project → Settings → Domains → Add Domain`에서 보유한 도메인을 추가한다. 등록기관에 Vercel이 **해당 프로젝트에 표시한** DNS 값을 설정하고 HTTPS 인증서 발급을 확인한다. 웹 연결에는 전체 nameserver 이전이 필요하지 않으며 기존 메일 DNS는 유지한다. 새 도메인의 구매/갱신 비용은 별도다. [도메인 연결](https://vercel.com/docs/domains/working-with-domains/add-a-domain)

도메인을 바꾼 뒤에는 재배포하여 canonical/OG 주소도 새 주소로 갱신한다. 첫 화면, `/#invitation`, 사진 원본, 링크 복사, 공유 미리보기와 실제 모바일 게임 흐름을 배포 주소에서 확인한다.

## 현재 검증 범위

### 방명록 보관 — 원격 Supabase 패치 반영

2026-09-16 원격 `04ba87b`까지의 방명록·사진 저장 패치를 그대로 반영했다. `VITE_SUPABASE_URL`과 `VITE_SUPABASE_PUBLISHABLE_KEY`가 설정된 배포에서는 메시지를 Supabase `guest_messages`에 저장하고, 공개 읽기 뷰 `guestbook_entries`로 모든 방문자에게 표시한다. 촬영 사진은 비공개 `guest-photos` 버킷과 `guest_photos` 테이블에 저장한다. 받는 사람 선택을 포함한 방명록 추가 수정은 취소했다.

설정과 보관 방법은 [원격 패치의 안내](../game/supabase/README.md)를 따른다. 관리자는 Supabase 대시보드에서 메시지·사진을 확인하고 주기적으로 내려받아 별도 보관한다. 앱에 새로운 JSON/CSV 내보내기 기능을 추가하지 않았다. 기존 브라우저 로컬 기록은 삭제하거나 자동 업로드하지 않는다.

두 환경 변수가 없는 로컬 실행은 기존 localStorage 체험판으로 동작한다. 이 작업 환경에는 `game/.env.local`이 없다. 사용자가 원격 동작을 확인했다고 전달하여 방명록 추가 검증은 중단했다. 실제 서비스에 테스트 기록을 쓰거나 DB 설정을 변경하지 않는다.

로컬 build 및 실제 Chromium 검증 기록은 `docs/game-review/`에 있다. shipping asset 검사는 원본 사진 품질 유지로 기존 23개 사진 개별 용량 + 전체 용량, 24건의 한도 초과가 남아 있다. 기준을 낮추지 않았다.

Vercel 계정 연결/원격 배포 URL은 아직 확보되지 않았다. 로컬 준비를 실제 외부 배포 완료로 간주하지 않는다.
