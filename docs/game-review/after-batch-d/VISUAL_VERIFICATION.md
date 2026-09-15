# 최종 렌더링 검토

2026-09-14, source `1402719dd9a38740f9b3955698e0ca61dd028dbfb2467650529ac2f33bf1858e`. 로컬 실제 Chromium151 자동 브라우저에서 촬영된 PNG/정상 속도 영상 프레임을 직접 열어 확인했다. 코드 컴파일이나 dataset 값만으로 시각 PASS를 정하지 않았다. 전체 화면 PNG는 viewport 크기이며 원본 PNG를 수정하지 않았다.

| 항목 | 확인한 화면/기록 | 눈으로 확인한 결과 |
|---|---|---|
| F16 | `f16-canceled.png`, `f16-disabled.png`, `f16-keyboard-focus.png` | drag 취소 뒤 금색 눌림 잔류 없음, disabled 채도/실제 비활성 일치, 출발 버튼의 키보드 focus가 명확함 |
| F17 | `f17-normal-*.png`, `f17-reduced-{booth,bridal,group}.png`; 영상05/06 프레임 | 감소 모드에서도 결과 사진/직접 복귀·단체사진 성공 표시가 남음. 세 장면의 실제 fullscreen flash0와 REC tween0를 프레임 관찰 JSON으로 교차 확인 |
| F18 | `f18-continue-{1,2}-photos-{320,393,430}.png`, `f18-restored-notebook-{1,2}.png`, corrupt/unknown-version/denied/quota PNG | 이어하기/처음부터44px 유지,320 간격5.328125px. 날짜와 버튼을 가리지 않음. 수첩2/4·원래 촬영 외형의 두 사진, 저장 실패 후 진행 가능한 명시적 안내 |
| F18 추가 | `local-server-first-screen-393.png`, `f18-normal-photo-before-reload.png`, `f18-normal-restored-notebook-393.png`, 영상04 | 정상 첫 화면, 실제 결과5.504초 뒤 직접 복귀, reload/Continue 후 수첩1/3과 동일 사진. reload 흰 프레임 보존 |
| F19 | `f19-b3-320.png`, `f19-b3-393.png`, `f19-tower-320.png`, `f19-tower-393.png`, `f19-emart-320.png` | 목적지 헤더를 대사가 덮지 않음. 이동/정차 차량 모두 top-down, 파랑/분홍/노랑과 기존 설명을 함께 식별. 잘못된 경로에서 복귀 |
| F20 | `f20-buffet-{320,393,430}.png`, 영상09 첫/다음 카드 | 사진3장 원본 비율/내용, 명확한 이전/다음과 식사 종료, 기존 미니미/식사 장면 일부가 남음. 다음 페이지·키보드 동작도 실제 영상으로 확인 |
| F21/F22 | `f21-f22-lobby-{320x568,393x852,430x932,1440x900,852x393}.png`, 같은 production5종 | 명패 글자/위계가 읽히며 장소·수첩·청첩장 겹침 없음. 320 필수 조작 존재. 큰 화면 크림 프레임, 가로 세로안내/청첩장 대안, 실제 body 높이/비율 검사 일치 |
| C 비교 | C와 D의 `f15-lobby-revisit-no-banner-393.png` | 같은 재방문 상태에서 기존 배경/인물/장소/발 위치 구도를 보존. D에서 명패 재료만 바뀜. C 원본은 수정하지 않고 해시로 보존 확인 |
| F23/C-P01 | `f23-cp01-{male,female}-frames.png`, `f23-walking.png`, `f23-stopped.png`, `cp01-{applause,cheer}.png`, 영상01/02/03 | 실제 걸음/정지, 얼굴·발 기준이 안정적. 모든 의상군 박수의 초기 허리 notch 문제를 최종 전체 bent-arm pose에서 해소. 가까운 말풍선 꼬리·하트/문구, 환호와 박수 구별, 한 번의 단체사진 전환 |

기존 A/A1의 첫 안내/수첩/식장 알림/정보 panel/F03 오류·focus/F06 크기는 `runs/regression-03/review-batch-a*`의 개별 실제 입력과 PNG로 회귀 확인했다. B 양 경로/바닥/키보드-only/청첩장·메시지 생략, C 사진/명시적 복귀/접수1회/단체사진은 최종 dev 및 production reporter에서 확인했다. 강제 focus/진행 flag/time acceleration으로 정상 완주 증빙을 만들지 않았다. 격리된 아트·disabled·저장 오류 fixture는 별도 표시했다.

초기 320 재개 화면은 button box가1.78125px 겹쳤다. `f18-resume-320-before.png`는 **BEFORE**, `f18-resume-320-after.png`는 **AFTER**다. 두 가지를 완료 화면처럼 섞지 않았다. 수정 후 실제 클릭과320/393/430 측정이 통과했다.

최종 영상은 타임스탬프별47개 실제 프레임을 남겼고, 선택 전/반응 중/전환 뒤 및 사진 유지/직접 복귀/새로고침/수첩, 주차/뷔페 조작을 확인했다. 정상 박수·환호에는 청첩장이 없으며 pause/resume는10번 별도 영상이다. 자세한 원본/packet/시간 대조는 VIDEO_NOTES와 videos INDEX에 있다.

F22의 실제 폰 safe area·주소창·OS 키보드 및 WebKit/Firefox는 미검증이다. 393×650→852 높이 변경과852×393 rotation은 자동 Chromium viewport 대체 검사이며 실기기 결과라고 표시하지 않는다. F24의 전역 아트 재작업과 F25는 하지 않았다.
