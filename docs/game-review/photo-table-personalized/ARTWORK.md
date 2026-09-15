# User-supplied photo-table portraits — 2026-09-16

The user supplied six JPEG photographs and explicitly requested that the photo table and the three lobby picture frames show the selected guest side, in filename order. The mobile invitation gallery remains unchanged.

| Guest side | Supplied filename | Preserved master | Game copy |
| --- | --- | --- | --- |
| Groom | 재준1.jpeg | game/artwork/sources/photo-table/groom-01.jpeg | /assets/optimized/photo-table-groom-01.jpg |
| Groom | 재준2.jpeg | game/artwork/sources/photo-table/groom-02.jpeg | /assets/optimized/photo-table-groom-02.jpg |
| Groom | 재준3.jpeg | game/artwork/sources/photo-table/groom-03.jpeg | /assets/optimized/photo-table-groom-03.jpg |
| Bride | 현서1.jpeg | game/artwork/sources/photo-table/bride-01.jpeg | /assets/optimized/photo-table-bride-01.jpg |
| Bride | 현서2.jpeg | game/artwork/sources/photo-table/bride-02.jpeg | /assets/optimized/photo-table-bride-02.jpg |
| Bride | 현서3.jpeg | game/artwork/sources/photo-table/bride-03.jpeg | /assets/optimized/photo-table-bride-03.jpg |

Supplied files in `/Users/user/wedding/` and their preserved copies have identical SHA-256 hashes. `asset-import-final.json` records original Unicode paths, byte counts, hashes, dimensions and derived file hashes.

The final copies use Chromium's native image decode and an sRGB canvas, preserving the full photograph at a maximum edge of 1600 pixels and JPEG quality 0.92. There is no cropping, generative editing, face alteration or retouching. Downsampling applies only to real photographs; the pixel-art background and gold frames remain unchanged.

The first `sips` conversion exited successfully but produced a black groom-01 derivative. It was rejected by visual inspection, not accepted as valid output. All first conversion files and original command logs remain in `first-conversion/` and `asset-import.json`. The final preparation checks that decoded photographs are not flat, and real game screenshots verify the images themselves.

The three previous photo-table JPEG derivatives remain registered and preserved as inactive previous assets. They are not loaded by the new gallery stages. New portraits are loaded only for the selected groom/bride side during travel, not on the opening screen.
