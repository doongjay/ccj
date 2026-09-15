export const OUTFIT_LABELS = {
  male: ["하늘색 셔츠", "코트", "긴팔티셔츠", "네이비 수트", "버건디 니트 조끼", "체크 재킷 + 베이지 바지"],
  female: ["셔츠 + 바지", "코트 + 미니 치마", "블라우스 + 롱치마", "핑크 원피스", "그레이 트위드", "검정 미니 원피스 + 롱부츠"],
} as const;

export function validOutfit(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < OUTFIT_LABELS.male.length ? value : 0;
}

export const OUTFIT_POSES = ["down", "left", "right", "up", "posing", "seated"] as const;

export function outfitFrameBounds(width: number, height: number, gender: "male" | "female", outfit: number, row: number) {
  const center = (gender === "male" ? [0.26, 0.5, 0.735] : [0.275, 0.5, 0.718])[outfit] ?? 0.5;
  const edges = gender === "male" ? [0, 0.195, 0.36, 0.524, 0.692, 0.858, 1] : [0, 0.181, 0.348, 0.51, 0.672, 0.836, 1];
  const top = edges[row] ?? 0;
  const bottom = edges[row + 1] ?? 1;
  return {
    x: Math.floor((center - 0.095) * width),
    y: Math.floor(top * height),
    width: Math.floor(width * 0.19),
    height: Math.floor((bottom - top) * height),
  };
}
