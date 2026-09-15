# 신부대기실 배경의 신부 제거

사용자가 기존 신부 미니미를 재사용하도록 요청했다. built-in `image_gen`으로 기존 신부만 제거한 빈 소파를 생성한 후 원본의 (648,498) 128×126 영역만 교체했다. 영역 밖 픽셀 변경 0. 원래 배경/생성 출력은 모두 보존.

원본: `game/artwork/sources/assets/lacitta/pixel-venue/bridal-room-white.png`
생성 원본: `artwork/generated-empty-room.png`
최종 master: `game/artwork/sources/assets/lacitta/pixel-venue/bridal-room-empty-v2.png`
사용 파일: `game/public/assets/optimized/lacitta-pixel-venue-bridal-room-empty-v2.png` (master와 동일한 무손실 PNG).

Prompt: Remove ONLY the tiny bride in front of the rear ivory sofa, around x=650–775,y=496–625 in the 941×1672 source. Reconstruct the empty ivory sofa cushions, seat edge and beige stage floor. No person, face, veil, held bouquet or dress remains. Preserve all other furniture, flowers, curtains, perspective, lighting, warm cream/gold/dark-green pixel colours and framing. Do not add a new character; an existing game sprite is placed later by code.

`ffmpeg -c:v libwebp -lossless 1` 변환은 설치된 ffmpeg에 libwebp 인코더가 없어 exit 8. 원본 PNG 2,914,085 bytes를 그대로 사용하며 기존 stage-image 3MB 기준을 만족한다. 손실 압축/감추기/기준 변경 없음.
