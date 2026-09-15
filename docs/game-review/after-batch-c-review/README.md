# Batch C 검수용 패키지

기존 Batch C(F11/F12/F13/F14/F15, B-E01/B-V01) 검증 자료를 선별한 패키지다. 이번 작업에서 게임 코드·검사·테스트를 수정하거나 다시 실행하지 않았다. 승인된 A/A1/B와 원본 `after-batch-c/`, `after-batch-c.zip`을 보존했다. Batch D/F24/F25는 미착수다.

**최종 브라우저 테스트: 102 PASS / 3 SKIP. 별도 에셋 목록 검사: exit 1 / 미등록 40건.** 두 결과는 합산하지 않는다. SKIP 3건은 dev production-only 조건이며 같은 테스트가 production에서 통과했다. 정확한 이름·사유·미검증 범위와 에셋 오류/기존 여부 근거는 [REVIEW_NOTES.md](REVIEW_NOTES.md)에 있다.

## 먼저 볼 자료

- [정확한 변경 파일 목록 및 목적](CHANGED_FILES.md) / [전후 파일 해시](changed-files.json): C 소스·테스트·설정 27개 + 완료 표시 문서 3개.
- [검수 참고사항](REVIEW_NOTES.md): SKIP, 40개 에셋 파일/키, 실패·재실행, B-E01/B-V01, 검증 한계.
- [원본 Batch C 완료 보고](BATCH_C_REPORT_ORIGINAL.md): 원래 README 그대로. 전체 trace 등 원본 보유 범위는 검수용 범위와 구별한다.
- [최종 전체 개별 결과](final-verification.json), 원본 JSON reporter [dev](logs/regression-final.json) / [production](logs/production-final.json), [재집계 검사](reporter-recheck.json).
- [항목별 acceptance](acceptance-checks.json), [시간·리소스 기록](timing-and-resources.json), [첫 화면 성능](performance-summary.json).
- [원본 ZIP 용량 조사](SIZE_AUDIT.md), [제외 목록 CSV](EXCLUDED_FILES.csv), [원본 보존 검사](preservation-check.json).

## 필수 AFTER 스크린샷 15종

원본 PNG를 변환 없이 유지했다. 파일명 viewport는 CSS 크기이며 DPR에 따라 실제 PNG 픽셀 크기는 다를 수 있다.

- [f11-applause-response-393.png](f11-applause-response-393.png)
- [f11-cheer-response-393.png](f11-cheer-response-393.png)
- [f12-booth-result-393.png](f12-booth-result-393.png)
- [f12-bridal-result-393.png](f12-bridal-result-393.png)
- [f12-notebook-keepsakes-393.png](f12-notebook-keepsakes-393.png)
- [f12-booth-controls-no-overlap-393.png](f12-booth-controls-no-overlap-393.png)
- [f13-booth-result-320.png](f13-booth-result-320.png)
- [f13-bridal-result-320.png](f13-bridal-result-320.png)
- [f13-photo-result-430.png](f13-photo-result-430.png)
- [f14-group-bride-393.png](f14-group-bride-393.png)
- [f14-group-groom-393.png](f14-group-groom-393.png)
- [f15-reception-acknowledged-393.png](f15-reception-acknowledged-393.png)
- [f15-lobby-revisit-no-banner-393.png](f15-lobby-revisit-no-banner-393.png)
- [keyboard-photo-result-desktop.png](keyboard-photo-result-desktop.png)
- [reduced-motion-response-393.png](reduced-motion-response-393.png)

추가 AFTER 5종, 동일 조건 BEFORE 10종, B 재검증 캡처와 영상 대표 프레임도 포함한다. B-V01 비교는 [BEFORE](before/b-booth-controls-overlap-393.png) → [AFTER](f12-booth-controls-no-overlap-393.png)이다.

## 실제 시간 영상 5개

추가 인코딩·재포장·편집 없이 원본 clip을 그대로 복사했다. 입력→반응→전환, 사진 5.5초 이상 대기 후 직접 복귀, 박수/환호/한글 UI를 유지한다.

| 영상 | 길이 | 크기 MiB |
|---|---:|---:|
| [f12-booth.webm](f12-booth.webm) | 11.76초 | 8.79 |
| [f12-bridal.webm](f12-bridal.webm) | 12.96초 | 7.27 |
| [f11-applause.webm](f11-applause.webm) | 11.32초 | 4.74 |
| [f11-cheer.webm](f11-cheer.webm) | 14.68초 | 5.17 |
| [f15-reception.webm](f15-reception.webm) | 16.32초 | 10.39 |

모두 1× 속도, 392×852, 25fps VP9다. 사진 영상에는 결과 감상·직접 복귀, 접수 영상에는 청첩장/재방문 후 일회 안내가 반복되지 않는 구간을 포함한다. [video-manifest.json](video-manifest.json)과 [영상 실행 이벤트](video-inputs/photo-events.json)가 원본 경로/범위/시각을 설명한다. 11개 보유 실패 전체 녹화와 raw JSON이 없는 photos-02 재실행 전체 영상도 runs/에 별도로 포함했다.

## 실패와 근거 보관

모든 보유 로그 21개, 역사적 실패 raw JSON, 13개 error-context, 실패 디렉터리의 전체 녹화/첨부, 6개 trace의 비미디어 진단을 유지한다. `logs/exploratory-photos.md`는 과거 raw JSON이 없는 탐색 실행의 한계를 명시한다. B-E01의 과거 상세 누락 16개는 꾸며 넣지 않았고, 현재 최종 raw 전체로 별도 증명한다.

대형 trace/중복 성공 전체 녹화/반복 캡처를 검수용에서 제외한 339개 경로·크기·이유는 EXCLUDED_FILES.csv와 excluded-files.json에 있다. 전체 Trace Viewer 재생에는 보존된 원본 trace가 필요하다. 첨부 경로 연결은 test-attachments.json, 비미디어 추출 member 목록은 trace-diagnostics/inventory.json을 참고한다. 원본 reporter의 내용과 절대 경로는 변경하지 않았다.

## 검증 소스와 무결성

Commit `a2a31405940560e169c819ee0f2677f073ccba40` + 미커밋 소스를 검증했다. 최종 working-tree fingerprint는 `87a0fbfaf3e1c9c0e99c35a6ac132245855c494a0d58c3e653714f7bcb93d287`이며 `source-final.json`에 278개 해시가 있다. 패키징 시 모두 실제 파일과 일치했다.

`source-evidence/`에는 시작 전 해시/메타데이터, 현재 비교 및 검사 해석에 필요한 작은 소스 사본이 있다. `preservation-baseline.json`과 `preservation-check.json`은 원본 폴더 515개 파일·원본 ZIP·게임/명세 파일의 패키징 전후 일치를 기록한다. `included-original-files.json`은 원본→검수 사본 경로와 해시, `review-manifest.json`은 검수용 전체 파일의 크기와 해시를 기록한다. 패키지에서 원본 보조 도구를 실행할 필요는 없다.
