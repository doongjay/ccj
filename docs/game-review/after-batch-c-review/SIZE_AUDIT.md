# 원본 ZIP 용량 조사

원본 `docs/game-review/after-batch-c.zip`: **1,039,572,809 bytes = 991.41 MiB**. 원본 폴더 515개 파일: 1,054,563,809 bytes = 1,005.71 MiB.

| 구분 | 파일 수 | 원본 파일 bytes (MiB) | 원본 ZIP 내 압축 bytes (MiB) |
|---|---:|---:|---:|
| 실패 실행 trace.zip | 6 | 683,342,897 (651.69) | 680,029,096 (648.53) |
| 성공/실패 전체 녹화 | 33 | 138,964,187 (132.53) | 138,157,695 (131.76) |
| 실행별 반복 스크린샷 | 312 | 127,130,126 (121.24) | 126,472,202 (120.61) |
| 필수 실제 시간 영상 5개 | 5 | 38,111,298 (36.35) | 38,027,128 (36.27) |
| 실행 로그 + 원본 JSON reporter | 21 | 35,399,363 (33.76) | 26,264,322 (25.05) |
| 그 외 BEFORE/AFTER/이벤트/진단/문서 | 138 | 31,615,938 (30.15) | 30,477,800 (29.07) |

주 원인은 첫 전체 실행의 실패 trace 6개다. 각 trace가 긴 screencast JPEG 프레임과 동일 배경/사진/WebP 응답 본문을 독립적으로 담고 있다. ZIP/WebM/PNG/JPEG/WebP는 이미 압축돼 있어 ZIP으로 한 번 더 압축해도 크게 줄지 않는다. 예전 실패 trace를 원본에 보존하면서 실행별 전체 녹화와 반복 PNG도 함께 들어간 결과 약 991 MiB가 됐다. 원본 안에 또 다른 전체 after-batch-c.zip이 들어간 재귀 패키징은 없으며, 별도 HTML report도 없다.

검수용에서는 필수 PNG/영상과 진단 결과를 유지하고 반복 성공 캡처/성공 전체 녹화/대형 trace 사본만 선별했다. 실패 전체 영상과 모든 원본 JSON/로그는 유지한다. 필수 5개 clip이 전체 원본 ZIP의 주 원인이 아니므로 영상 재인코딩을 통한 화질 손실은 불필요하다.

## 가장 큰 파일

| 원본 상대 경로 | bytes | MiB |
|---|---:|---:|
| `runs/regression-all-01/review-batch-c-ceremony-F1-6ec4a-up-entry-and-diverse-guests-chromium/trace.zip` | 164,795,787 | 157.16 |
| `runs/regression-all-01/review-batch-c-photos-F12--c7c88-eepsakes-and-clean-controls-chromium/trace.zip` | 151,149,775 | 144.15 |
| `runs/regression-all-01/review-batch-c-ceremony-F1-83986-up-entry-and-diverse-guests-chromium/trace.zip` | 145,265,850 | 138.54 |
| `runs/regression-all-01/review-batch-c-ceremony-F1-2706b-up-entry-and-diverse-guests-chromium/trace.zip` | 126,975,824 | 121.09 |
| `runs/regression-all-01/reception-only-single-rece-6f818-movement-and-completes-once-chromium/trace.zip` | 53,098,694 | 50.64 |
| `runs/regression-all-01/reception-only-single-rece-12ee6-movement-and-completes-once-chromium/trace.zip` | 42,056,967 | 40.11 |
| `logs/regression-final.json` | 17,300,989 | 16.50 |
| `logs/regression-all-01.json` | 17,286,858 | 16.49 |
| `f15-reception.webm` | 10,893,132 | 10.39 |
| `f12-booth.webm` | 9,212,460 | 8.79 |
| `f12-bridal.webm` | 7,618,128 | 7.27 |
| `runs/regression-final/review-batch-c-ceremony-F1-6ec4a-up-entry-and-diverse-guests-chromium/video/page@e968ca655db2fedf0dcb64e685cdff34.webm` | 7,014,488 | 6.69 |
| `runs/refinement-02/review-batch-c-ceremony-F1-6ec4a-up-entry-and-diverse-guests-chromium/video/page@7624ddfd2d7e9dc41cb8af42bf87eb40.webm` | 6,808,324 | 6.49 |
| `runs/regression-final/review-batch-c-photos-F12--c7c88-eepsakes-and-clean-controls-chromium/video.webm` | 6,671,025 | 6.36 |
| `runs/refinement-02/review-batch-c-photos-F12--c7c88-eepsakes-and-clean-controls-chromium/video.webm` | 6,196,228 | 5.91 |

## 큰 폴더 (하위 폴더와 합산 중복 주의)

| 경로 | 파일 수 | bytes | MiB |
|---|---:|---:|---:|
| `runs` | 372 | 949,584,438 | 905.59 |
| `runs/regression-all-01` | 173 | 765,869,764 | 730.39 |
| `runs/regression-all-01/review-batch-c-ceremony-F1-6ec4a-up-entry-and-diverse-guests-chromium` | 3 | 169,347,437 | 161.50 |
| `runs/regression-all-01/review-batch-c-photos-F12--c7c88-eepsakes-and-clean-controls-chromium` | 3 | 154,853,718 | 147.68 |
| `runs/regression-all-01/review-batch-c-ceremony-F1-83986-up-entry-and-diverse-guests-chromium` | 3 | 148,707,741 | 141.82 |
| `runs/regression-all-01/review-batch-c-ceremony-F1-2706b-up-entry-and-diverse-guests-chromium` | 3 | 130,369,957 | 124.33 |
| `runs/regression-final` | 164 | 99,624,382 | 95.01 |
| `runs/regression-all-01/reception-only-single-rece-6f818-movement-and-completes-once-chromium` | 2 | 53,105,379 | 50.65 |
| `runs/regression-all-01/reception-only-single-rece-12ee6-movement-and-completes-once-chromium` | 2 | 42,063,599 | 40.11 |
| `runs/refinement-02` | 10 | 36,297,095 | 34.62 |

검수 사본에 원본 파일 176개를 포함하고 339개 (908,146,435 bytes)를 제외했다. trace 비미디어 추출 및 검수 문서는 별도 추가다. 제외 목록은 EXCLUDED_FILES.csv에 있다. 원본의 삭제·덮어쓰기는 없다.
