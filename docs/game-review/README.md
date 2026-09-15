# 검수 자료 보존 정책

게임 코드, 실제 shipping 에셋, artwork 원본, 테스트, 구현 명세와 이 폴더의 요약/출처 JSON/검증 스크립트는 Git에 보관한다. 전체 검수 폴더는 약 16 GiB로, 중복 소스 복사본·전체 녹화·trace·HTML report·검수 ZIP·대량 PNG는 로컬에 보존하고 Git에는 추가하지 않는다. 원본 검수 ZIP과 모든 실패/재시도 기록은 삭제하거나 덮어쓰지 않았다.

추적할 요약/출처 파일은 선택적으로 git add -f로 등록했다. 이미 추적된 파일의 수정은 일반 git add로 포함된다. shippingAssets.json의 모든 provenance evidence와 source/master는 저장소에서 확인할 수 있다. 개별 README가 가리키는 전체 영상/PNG는 로컬 검수 패키지 경로이다.
