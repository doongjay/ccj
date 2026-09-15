export const GUEST_PHOTO_PAGE_SIZE = 30;

/** Four close rows on the real hall's gray steps, below its flower arches. */
export const GUEST_PHOTO_POSITIONS = [
  ...[7, 19, 30, 70, 81, 93].map(x => ({ x, bottom: 6, depth: 4 })),
  ...[8, 20, 32, 44, 56, 68, 80, 92].map(x => ({ x, bottom: 14, depth: 3 })),
  ...[9, 21, 33, 45, 57, 69, 81, 93].map(x => ({ x, bottom: 22, depth: 2 })),
  ...[7, 19, 31, 43, 55, 67, 79, 91].map(x => ({ x, bottom: 30, depth: 1 })),
] as const;
