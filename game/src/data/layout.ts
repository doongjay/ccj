import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { SCENE_KEYS } from '../state/gameState';

export const LAYOUT_IDS = ['home', 'car-route', 'subway-route', 'venue-lobby', 'venue-hall', 'ending'] as const;
export type LayoutId = (typeof LAYOUT_IDS)[number];

export const LAYOUT_TOKENS = ['ivory', 'blush', 'greenery', 'gold', 'coral', 'ink-outline'] as const;
export type LayoutToken = (typeof LAYOUT_TOKENS)[number];

export type LayoutPoint = {
  readonly x: number;
  readonly y: number;
};

export type LayoutBounds = LayoutPoint & {
  readonly width: number;
  readonly height: number;
};

export type SpawnAnchor = {
  readonly id: string;
  readonly label: string;
  readonly point: LayoutPoint;
};

export type SceneAnchor = SpawnAnchor & {
  readonly kind: 'destination' | 'interaction' | 'staging';
};

export type RectangleTrigger = {
  readonly kind: 'rectangle';
  readonly bounds: LayoutBounds;
};

export type CircleTrigger = {
  readonly kind: 'circle';
  readonly center: LayoutPoint;
  readonly radius: number;
};

export type TriggerShape = RectangleTrigger | CircleTrigger;

export type LayoutTrigger = {
  readonly id: string;
  readonly label: string;
  readonly anchorId: string;
  readonly shape: TriggerShape;
};

export type SceneLayout = {
  readonly id: LayoutId;
  readonly sceneKey:
    | typeof SCENE_KEYS.HomeSelect
    | typeof SCENE_KEYS.CarRoute
    | typeof SCENE_KEYS.SubwayRoute
    | typeof SCENE_KEYS.VenueLobby
    | typeof SCENE_KEYS.VenueHall
    | typeof SCENE_KEYS.Ending;
  readonly worldBounds: LayoutBounds;
  readonly cameraBounds: LayoutBounds;
  readonly style: {
    readonly background: LayoutToken;
    readonly roles: readonly string[];
  };
  readonly spawns: readonly SpawnAnchor[];
  readonly anchors: readonly SceneAnchor[];
  readonly triggers: readonly LayoutTrigger[];
};

export const PORTRAIT_LAYOUT_BOUNDS = {
  x: 0,
  y: 0,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
} as const satisfies LayoutBounds;

export const GAMEPLAY_LAYOUTS = {
  home: {
    id: 'home',
    sceneKey: SCENE_KEYS.HomeSelect,
    worldBounds: PORTRAIT_LAYOUT_BOUNDS,
    cameraBounds: PORTRAIT_LAYOUT_BOUNDS,
    style: { background: 'ivory', roles: ['home-door', 'route-choice'] },
    spawns: [{ id: 'front-door', label: 'Home front door', point: { x: 360, y: 1212 } }],
    anchors: [
      { id: 'car-lane', label: 'Car route entrance', kind: 'destination', point: { x: 190, y: 790 } },
      { id: 'subway-stairs', label: 'Subway route entrance', kind: 'destination', point: { x: 530, y: 790 } },
    ],
    triggers: [
      { id: 'choose-car', label: 'Choose car route', anchorId: 'car-lane', shape: { kind: 'rectangle', bounds: { x: 80, y: 720, width: 220, height: 120 } } },
      { id: 'choose-subway', label: 'Choose subway route', anchorId: 'subway-stairs', shape: { kind: 'rectangle', bounds: { x: 420, y: 720, width: 220, height: 120 } } },
    ],
  },
  'car-route': {
    id: 'car-route',
    sceneKey: SCENE_KEYS.CarRoute,
    worldBounds: PORTRAIT_LAYOUT_BOUNDS,
    cameraBounds: PORTRAIT_LAYOUT_BOUNDS,
    style: { background: 'greenery', roles: ['yangjae-ic', 'traffic-lanes', 'parking-guide'] },
    spawns: [{ id: 'car-arrival', label: 'Car arrival', point: { x: 360, y: 1080 } }],
    anchors: [
      { id: 'traffic-stop', label: 'Yangjae IC traffic', kind: 'staging', point: { x: 360, y: 760 } },
      { id: 'blue-lane', label: 'Blue B3 parking guide', kind: 'interaction', point: { x: 360, y: 420 } },
      { id: 'venue-lobby-entry', label: 'Venue lobby arrival', kind: 'destination', point: { x: 360, y: 180 } },
    ],
    triggers: [
      { id: 'yellow-guide', label: 'Yellow guide lane', anchorId: 'traffic-stop', shape: { kind: 'rectangle', bounds: { x: 72, y: 530, width: 160, height: 240 } } },
      { id: 'pink-guide', label: 'Pink guide lane', anchorId: 'traffic-stop', shape: { kind: 'rectangle', bounds: { x: 280, y: 530, width: 160, height: 240 } } },
      { id: 'blue-guide', label: 'Blue guide lane', anchorId: 'blue-lane', shape: { kind: 'rectangle', bounds: { x: 488, y: 530, width: 160, height: 240 } } },
      { id: 'enter-lobby', label: 'Enter venue lobby', anchorId: 'venue-lobby-entry', shape: { kind: 'rectangle', bounds: { x: 250, y: 112, width: 220, height: 96 } } },
    ],
  },
  'subway-route': {
    id: 'subway-route',
    sceneKey: SCENE_KEYS.SubwayRoute,
    worldBounds: PORTRAIT_LAYOUT_BOUNDS,
    cameraBounds: PORTRAIT_LAYOUT_BOUNDS,
    style: { background: 'ink-outline', roles: ['platform', 'route-signage', 'exit-gates'] },
    spawns: [{ id: 'platform-arrival', label: 'Yangjae platform arrival', point: { x: 360, y: 1080 } }],
    anchors: [
      { id: 'line-transfer', label: 'Line transfer sign', kind: 'staging', point: { x: 360, y: 800 } },
      { id: 'exit-five', label: 'Exit 5', kind: 'interaction', point: { x: 360, y: 460 } },
      { id: 'venue-walkway', label: 'Venue walking route', kind: 'destination', point: { x: 360, y: 160 } },
    ],
    triggers: [
      { id: 'exit-1', label: 'Exit 1', anchorId: 'line-transfer', shape: { kind: 'circle', center: { x: 120, y: 620 }, radius: 38 } },
      { id: 'exit-4', label: 'Exit 4', anchorId: 'line-transfer', shape: { kind: 'circle', center: { x: 240, y: 620 }, radius: 38 } },
      { id: 'exit-5', label: 'Exit 5', anchorId: 'exit-five', shape: { kind: 'circle', center: { x: 360, y: 620 }, radius: 38 } },
      { id: 'exit-7', label: 'Exit 7', anchorId: 'line-transfer', shape: { kind: 'circle', center: { x: 480, y: 620 }, radius: 38 } },
      { id: 'exit-8', label: 'Exit 8', anchorId: 'line-transfer', shape: { kind: 'circle', center: { x: 600, y: 620 }, radius: 38 } },
      { id: 'walk-to-venue', label: 'Walk to venue', anchorId: 'venue-walkway', shape: { kind: 'rectangle', bounds: { x: 250, y: 112, width: 220, height: 96 } } },
    ],
  },
  'venue-lobby': {
    id: 'venue-lobby',
    sceneKey: SCENE_KEYS.VenueLobby,
    worldBounds: PORTRAIT_LAYOUT_BOUNDS,
    cameraBounds: PORTRAIT_LAYOUT_BOUNDS,
    style: { background: 'ivory', roles: ['glass-lobby', 'greenery-corridor', 'photo-table', 'reception-desks'] },
    spawns: [{ id: 'lobby-entry', label: 'Venue lobby entry', point: { x: 360, y: 1060 } }],
    anchors: [
      { id: 'photo-table', label: 'Guest reception photo table', kind: 'interaction', point: { x: 550, y: 500 } },
      { id: 'groom-reception', label: 'Groom reception desk', kind: 'interaction', point: { x: 110, y: 500 } },
      { id: 'bride-reception', label: 'Bride reception desk', kind: 'interaction', point: { x: 260, y: 500 } },
      { id: 'hall-door', label: 'Wedding hall door', kind: 'destination', point: { x: 360, y: 150 } },
    ],
    triggers: [
      { id: 'visit-photo-table', label: 'Visit photo table', anchorId: 'photo-table', shape: { kind: 'rectangle', bounds: { x: 480, y: 440, width: 140, height: 104 } } },
      { id: 'groom-desk', label: 'Use groom reception desk', anchorId: 'groom-reception', shape: { kind: 'rectangle', bounds: { x: 60, y: 440, width: 100, height: 104 } } },
      { id: 'bride-desk', label: 'Use bride reception desk', anchorId: 'bride-reception', shape: { kind: 'rectangle', bounds: { x: 210, y: 440, width: 100, height: 104 } } },
      { id: 'enter-hall', label: 'Enter wedding hall', anchorId: 'hall-door', shape: { kind: 'rectangle', bounds: { x: 250, y: 96, width: 220, height: 96 } } },
    ],
  },
  'venue-hall': {
    id: 'venue-hall',
    sceneKey: SCENE_KEYS.VenueHall,
    worldBounds: PORTRAIT_LAYOUT_BOUNDS,
    cameraBounds: PORTRAIT_LAYOUT_BOUNDS,
    style: { background: 'gold', roles: ['wedding-hall', 'ceremony-guide', 'floral-aisle'] },
    spawns: [{ id: 'hall-entry', label: 'Wedding hall entry', point: { x: 360, y: 1140 } }],
    anchors: [
      { id: 'banquet-entrance', label: 'Banquet hall entrance', kind: 'destination', point: { x: 240, y: 780 } },
      { id: 'buffet-line', label: 'Banquet buffet line', kind: 'interaction', point: { x: 240, y: 480 } },
      { id: 'photo-booth', label: 'Photo booth', kind: 'interaction', point: { x: 530, y: 480 } },
      { id: 'ending-stage', label: 'Ending staging', kind: 'destination', point: { x: 360, y: 150 } },
    ],
    triggers: [
      { id: 'follow-banquet-guide', label: 'Follow banquet guide', anchorId: 'banquet-entrance', shape: { kind: 'rectangle', bounds: { x: 150, y: 720, width: 180, height: 112 } } },
      { id: 'arrive-at-buffet', label: 'Arrive at buffet', anchorId: 'buffet-line', shape: { kind: 'rectangle', bounds: { x: 130, y: 420, width: 220, height: 120 } } },
      { id: 'visit-photo-booth', label: 'Visit photo booth', anchorId: 'photo-booth', shape: { kind: 'rectangle', bounds: { x: 450, y: 420, width: 160, height: 120 } } },
      { id: 'finish-banquet', label: 'Finish banquet', anchorId: 'ending-stage', shape: { kind: 'rectangle', bounds: { x: 250, y: 96, width: 220, height: 96 } } },
    ],
  },
  ending: {
    id: 'ending',
    sceneKey: SCENE_KEYS.Ending,
    worldBounds: PORTRAIT_LAYOUT_BOUNDS,
    cameraBounds: PORTRAIT_LAYOUT_BOUNDS,
    style: { background: 'blush', roles: ['couple-stage', 'gallery-frame', 'homebound-path'] },
    spawns: [{ id: 'homebound-arrival', label: 'Homebound arrival', point: { x: 360, y: 1080 } }],
    anchors: [
      { id: 'couple-stage', label: 'Couple ending stage', kind: 'staging', point: { x: 360, y: 600 } },
      { id: 'gallery-frame', label: 'Future gallery frame', kind: 'interaction', point: { x: 360, y: 360 } },
      { id: 'replay-start', label: 'Replay start', kind: 'destination', point: { x: 360, y: 150 } },
    ],
    triggers: [
      { id: 'view-gallery', label: 'View gallery placeholder', anchorId: 'gallery-frame', shape: { kind: 'rectangle', bounds: { x: 220, y: 290, width: 280, height: 140 } } },
      { id: 'replay', label: 'Replay route', anchorId: 'replay-start', shape: { kind: 'rectangle', bounds: { x: 250, y: 96, width: 220, height: 96 } } },
    ],
  },
} as const satisfies Readonly<Record<LayoutId, SceneLayout>>;
