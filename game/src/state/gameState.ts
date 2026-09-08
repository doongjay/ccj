export const SCENE_KEYS = {
  Boot: 'BootScene',
  Intro: 'IntroScene',
  HomeSelect: 'HomeSelectScene',
  CarRoute: 'CarRouteScene',
  SubwayRoute: 'SubwayRouteScene',
  VenueLobby: 'VenueLobbyScene',
  VenueHall: 'VenueHallScene',
  PhotoBooth: 'PhotoBoothScene',
  Banquet: 'BanquetScene',
  BridalRoom: 'BridalRoomScene',
  GreeneryCorridor: 'GreeneryCorridorScene',
  WaitingRoom: 'WaitingRoomScene',
  Ending: 'EndingScene',
} as const;

export type SceneKey = (typeof SCENE_KEYS)[keyof typeof SCENE_KEYS];
export type RouteSceneKey = typeof SCENE_KEYS.CarRoute | typeof SCENE_KEYS.SubwayRoute;

export const ROUTE_CHOICES = {
  car: 'car',
  subway: 'subway',
} as const;

export type RouteChoice = (typeof ROUTE_CHOICES)[keyof typeof ROUTE_CHOICES];

export const ROUTE_CHOICE_VALUES = [ROUTE_CHOICES.car, ROUTE_CHOICES.subway] as const;

export const GUEST_SIDES = {
  groom: 'groom',
  bride: 'bride',
} as const;

export type GuestSide = (typeof GUEST_SIDES)[keyof typeof GUEST_SIDES];

export const PROGRESSION_FLAGS = {
  routeChosen: 'routeChosen',
  routeQuizSolved: 'routeQuizSolved',
  photoTableVisited: 'photoTableVisited',
  guestSideChosen: 'guestSideChosen',
  receptionComplete: 'receptionComplete',
  banquetGuideComplete: 'banquetGuideComplete',
} as const;

export type ProgressionFlag = (typeof PROGRESSION_FLAGS)[keyof typeof PROGRESSION_FLAGS];

export type ProgressionState = Readonly<Record<ProgressionFlag, boolean>>;

export type WeddingGameState = Readonly<{
  routeChoice: RouteChoice | undefined;
  guestSide: GuestSide | undefined;
  progression: ProgressionState;
}>;

export const GAME_STATE_REGISTRY_KEYS = {
  routeChoice: 'wedding.routeChoice',
  guestSide: 'wedding.guestSide',
  progression: 'wedding.progression',
} as const;

export type GameStateRegistry = Readonly<{
  get: (key: string) => unknown;
  set: (key: string, data?: unknown) => unknown;
}>;

export function createInitialProgressionState(): ProgressionState {
  return {
    routeChosen: false,
    routeQuizSolved: false,
    photoTableVisited: false,
    guestSideChosen: false,
    receptionComplete: false,
    banquetGuideComplete: false,
  };
}

export function readWeddingGameState(registry: GameStateRegistry): WeddingGameState {
  return {
    routeChoice: readRouteChoice(registry),
    guestSide: readGuestSide(registry),
    progression: readProgressionState(registry),
  };
}

export function resetWeddingGameState(registry: GameStateRegistry): WeddingGameState {
  registry.set(GAME_STATE_REGISTRY_KEYS.routeChoice, undefined);
  registry.set(GAME_STATE_REGISTRY_KEYS.guestSide, undefined);

  const progression = createInitialProgressionState();
  registry.set(GAME_STATE_REGISTRY_KEYS.progression, progression);

  return {
    routeChoice: undefined,
    guestSide: undefined,
    progression,
  };
}

export function setRouteChoice(registry: GameStateRegistry, routeChoice: RouteChoice): WeddingGameState {
  registry.set(GAME_STATE_REGISTRY_KEYS.routeChoice, routeChoice);
  writeProgressionFlag(registry, PROGRESSION_FLAGS.routeChosen, true);
  return readWeddingGameState(registry);
}

export function readRouteChoice(registry: GameStateRegistry): RouteChoice | undefined {
  const routeChoice: unknown = registry.get(GAME_STATE_REGISTRY_KEYS.routeChoice);
  return isRouteChoice(routeChoice) ? routeChoice : undefined;
}

export function setGuestSide(registry: GameStateRegistry, guestSide: GuestSide): WeddingGameState {
  registry.set(GAME_STATE_REGISTRY_KEYS.guestSide, guestSide);
  writeProgressionFlag(registry, PROGRESSION_FLAGS.guestSideChosen, true);
  return readWeddingGameState(registry);
}

export function readGuestSide(registry: GameStateRegistry): GuestSide | undefined {
  const guestSide: unknown = registry.get(GAME_STATE_REGISTRY_KEYS.guestSide);
  return isGuestSide(guestSide) ? guestSide : undefined;
}

export function completeProgressionFlag(registry: GameStateRegistry, flag: ProgressionFlag): WeddingGameState {
  writeProgressionFlag(registry, flag, true);
  return readWeddingGameState(registry);
}

export function isProgressionFlagComplete(registry: GameStateRegistry, flag: ProgressionFlag): boolean {
  return readProgressionState(registry)[flag];
}

function readProgressionState(registry: GameStateRegistry): ProgressionState {
  const progression: unknown = registry.get(GAME_STATE_REGISTRY_KEYS.progression);

  if (isProgressionState(progression)) {
    return progression;
  }

  const initialProgression = createInitialProgressionState();
  registry.set(GAME_STATE_REGISTRY_KEYS.progression, initialProgression);
  return initialProgression;
}

function writeProgressionFlag(registry: GameStateRegistry, flag: ProgressionFlag, isComplete: boolean): void {
  const progression = {
    ...readProgressionState(registry),
    [flag]: isComplete,
  };
  registry.set(GAME_STATE_REGISTRY_KEYS.progression, progression);
}

function isRouteChoice(value: unknown): value is RouteChoice {
  return value === ROUTE_CHOICES.car || value === ROUTE_CHOICES.subway;
}

function isGuestSide(value: unknown): value is GuestSide {
  return value === GUEST_SIDES.groom || value === GUEST_SIDES.bride;
}

function isProgressionState(value: unknown): value is ProgressionState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return Object.values(PROGRESSION_FLAGS).every((flag) => {
    const flagValue: unknown = Reflect.get(value, flag);
    return typeof flagValue === 'boolean';
  });
}
