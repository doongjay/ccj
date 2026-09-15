import type { MinimiProfile } from "./minimi";

export type CeremonyGuest = { texture: string; frame: string | number; key: string };
export const CEREMONY_SEED = 20261121;
export function ceremonyCandidates(): CeremonyGuest[] {
  const guests: CeremonyGuest[] = Array.from({ length: 12 }, (_, frame) => ({ texture: "formal-guest-portraits", frame, key: `formal-${frame}` }));
  for (const gender of ["male", "female"]) for (let outfit = 0; outfit < 6; outfit++) for (let hair = 0; hair < 3; hair++) {
    guests.push({ texture: `minimi-${gender}`, frame: `${outfit}-${hair}-down`, key: `${gender}-${outfit}-${hair}-0` });
  }
  return guests;
}

/** Exhaust a seeded shuffle before reusing anyone; never clone the selected guest. */
export function selectCeremonyGuests(candidates: readonly CeremonyGuest[], count: number, player: MinimiProfile, seed = CEREMONY_SEED): number[] {
  const playerKey = `${player.gender}-${player.outfit}-${player.hair}-${player.face}`;
  const eligible = candidates.flatMap((guest, index) => guest.key === playerKey ? [] : [index]);
  if (!eligible.length) return [];
  let state = seed >>> 0;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  const selected: number[] = [];
  while (selected.length < count) {
    const cycle = [...eligible];
    for (let i = cycle.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [cycle[i], cycle[j]] = [cycle[j]!, cycle[i]!]; }
    if (cycle.length > 1 && cycle[0] === selected.at(-1)) [cycle[0], cycle[1]] = [cycle[1]!, cycle[0]!];
    selected.push(...cycle.slice(0, count - selected.length));
  }
  return selected;
}
