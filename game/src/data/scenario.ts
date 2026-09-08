import { ROUTE_CHOICE_VALUES, SCENE_KEYS } from '../state/gameState';
import type { RouteChoice, RouteSceneKey, SceneKey } from '../state/gameState';

export const ROUTE_IDS = ROUTE_CHOICE_VALUES;
export type RouteId = RouteChoice;

export const QUIZ_IDS = ['Q1', 'Q2', 'Q3'] as const;
export type QuizId = (typeof QUIZ_IDS)[number];

export const SCENE_IDS = [
  SCENE_KEYS.CarRoute,
  SCENE_KEYS.SubwayRoute,
  SCENE_KEYS.VenueLobby,
  SCENE_KEYS.VenueHall,
] as const;

export type StoryBeat =
  | {
      readonly id: string;
      readonly kind: 'story';
      readonly copy: string;
    }
  | {
      readonly id: string;
      readonly kind: 'quiz';
      readonly quizId: QuizId;
      readonly successNextScene: SceneKey;
    };

export type RouteData = {
  readonly id: RouteId;
  readonly label: string;
  readonly sceneId: RouteSceneKey;
  readonly storyBeats: readonly StoryBeat[];
};

export const ROUTES = {
  car: {
    id: 'car',
    label: '자차로 간다',
    sceneId: SCENE_KEYS.CarRoute,
    storyBeats: [
      {
        id: 'A1',
        kind: 'story',
        copy: '어... 양재IC인데 오늘따라 왜 이렇게 막히지?',
      },
      {
        id: 'A2',
        kind: 'quiz',
        quizId: 'Q1',
        successNextScene: SCENE_KEYS.VenueLobby,
      },
    ],
  },
  subway: {
    id: 'subway',
    label: '지하철을 타고 간다',
    sceneId: SCENE_KEYS.SubwayRoute,
    storyBeats: [
      {
        id: 'B1',
        kind: 'story',
        copy: '신분당선 양재시민의숲역에서 내려 셔틀로 만나요!',
      },
      {
        id: 'B2',
        kind: 'quiz',
        quizId: 'Q2',
        successNextScene: SCENE_KEYS.VenueLobby,
      },
    ],
  },
} as const satisfies Readonly<Record<RouteId, RouteData>>;

export type QuizCallbackIntent =
  | 'advance-to-venue-lobby'
  | 'guide-to-groom-reception'
  | 'guide-to-bride-reception';

export type CorrectQuizOption = {
  readonly id: string;
  readonly label: string;
  readonly isCorrect: true;
  readonly successCopy: string;
  readonly callbackIntent: QuizCallbackIntent;
};

export type WrongQuizOption = {
  readonly id: string;
  readonly label: string;
  readonly isCorrect: false;
  readonly wrongReaction: string;
};

export type QuizOption = CorrectQuizOption | WrongQuizOption;

// This conditional type becomes never unless an option is marked correct.
export type QuizOptionsWithCorrect<Options extends readonly QuizOption[]> =
  Extract<Options[number], CorrectQuizOption> extends never ? never : Options;

export type QuizData = {
  readonly id: QuizId;
  readonly question: string;
  readonly options: readonly QuizOption[];
  readonly hint: string;
  readonly wrongAnswerReaction: string;
};

const defineQuiz = <const Options extends readonly QuizOption[]>(
  quiz: Omit<QuizData, 'options'> & {
    readonly options: Options & QuizOptionsWithCorrect<Options>;
  },
): QuizData & { readonly options: Options } => quiz;

export const QUIZZES = [
  defineQuiz({
    id: 'Q1',
    question: '어떤 색 유도선을 타고 가야 하지?',
    options: [
      {
        id: 'yellow',
        label: '노란색 유도선',
        isCorrect: false,
        wrongReaction: '어라, 여기 이마트인데요? 주차비 정산하고 다시 나가볼까요?',
      },
      {
        id: 'pink',
        label: '핑크색 유도선',
        isCorrect: false,
        wrongReaction: '타워 주차장은 계속 뱅글뱅글... 어질어질하네요. 다른 색을 찾아봐요.',
      },
      {
        id: 'blue',
        label: '파란색 유도선',
        isCorrect: true,
        successCopy: '지하 3층 주차장에 도착했어요. 예식장으로 이어집니다!',
        callbackIntent: 'advance-to-venue-lobby',
      },
    ],
    hint: '지하로, 아주 깊숙하게 내려가는 길이 제일 편하다고 하던데요?',
    wrongAnswerReaction: '살짝 코믹하게 되돌아오며 힌트 버튼을 보여 줍니다.',
  }),
  defineQuiz({
    id: 'Q2',
    question: '양재시민의숲역\n몇 번 출구로 나가야 하지?',
    options: [
      {
        id: 'exit-1',
        label: '1번 출구',
        isCorrect: false,
        wrongReaction: '어? 여기서 나가면 반대편인데요, 다시 내려가 볼까요?',
      },
      {
        id: 'exit-4',
        label: '4번 출구',
        isCorrect: false,
        wrongReaction: '어? 여기서 나가면 반대편인데요, 다시 내려가 볼까요?',
      },
      {
        id: 'exit-5',
        label: '5번 출구',
        isCorrect: true,
        successCopy: '5번 출구에서 셔틀을 타고 예식장으로 가요!',
        callbackIntent: 'advance-to-venue-lobby',
      },
      {
        id: 'exit-7',
        label: '7번 출구',
        isCorrect: false,
        wrongReaction: '어? 여기서 나가면 반대편인데요, 다시 내려가 볼까요?',
      },
      {
        id: 'exit-8',
        label: '8번 출구',
        isCorrect: false,
        wrongReaction: '어? 여기서 나가면 반대편인데요, 다시 내려가 볼까요?',
      },
    ],
    hint: '라시따시어터 방향은 홀수도 짝수도 아닌... 딱 중간, 5번이에요!',
    wrongAnswerReaction: '엉뚱한 출구로 나가 다시 계단을 내려가는 짧은 연출을 보여 줍니다.',
  }),
  defineQuiz({
    id: 'Q3',
    question: '누구 쪽 손님이세요?',
    options: [
      {
        id: 'groom-side',
        label: '신랑측 친구',
        isCorrect: true,
        successCopy: '포토부스 인근의 축의대 1로 안내할게요.',
        callbackIntent: 'guide-to-groom-reception',
      },
      {
        id: 'bride-side',
        label: '신부측 친구',
        isCorrect: true,
        successCopy: '연회장 입구와 신부대기실 복도 방향의 축의대 2로 안내할게요.',
        callbackIntent: 'guide-to-bride-reception',
      },
    ],
    hint: '포토테이블에서 신부 캐릭터에게 말을 걸어 손님 쪽을 선택해 주세요.',
    wrongAnswerReaction: '어이쿠, 그쪽은 반대편 축의대예요!',
  }),
] as const satisfies readonly QuizData[];

export type LogicalPoint = {
  readonly x: number;
  readonly y: number;
};

export type VenueZone = {
  readonly id: string;
  readonly label: string;
  readonly purpose: 'interactive' | 'guide' | 'decorative';
  readonly anchor: LogicalPoint;
  readonly size: LogicalPoint;
};

// Coordinates use a compact 100 by 100 logical venue grid, not surveyed venue coordinates.
export const VENUE_ZONES = [
  { id: 'lobby', label: '건물 로비', purpose: 'guide', anchor: { x: 8, y: 8 }, size: { x: 20, y: 18 } },
  { id: 'groom-waiting-room', label: '신랑 대기실', purpose: 'decorative', anchor: { x: 68, y: 6 }, size: { x: 12, y: 12 } },
  { id: 'bride-waiting-room', label: '신부 대기실', purpose: 'decorative', anchor: { x: 82, y: 6 }, size: { x: 12, y: 12 } },
  { id: 'greenery-corridor', label: '그리너리 복도', purpose: 'guide', anchor: { x: 38, y: 18 }, size: { x: 50, y: 12 } },
  { id: 'bridal-room', label: '신부대기실', purpose: 'decorative', anchor: { x: 45, y: 30 }, size: { x: 24, y: 18 } },
  { id: 'photo-table', label: '포토 테이블', purpose: 'interactive', anchor: { x: 48, y: 50 }, size: { x: 15, y: 8 } },
  { id: 'wedding-hall', label: '식장', purpose: 'decorative', anchor: { x: 73, y: 30 }, size: { x: 20, y: 28 } },
  { id: 'family-meal-room', label: '혼주 식사 룸', purpose: 'decorative', anchor: { x: 12, y: 42 }, size: { x: 18, y: 14 } },
  { id: 'groom-reception-desk', label: '축의대 1', purpose: 'interactive', anchor: { x: 48, y: 66 }, size: { x: 16, y: 8 } },
  { id: 'bride-reception-desk', label: '축의대 2', purpose: 'interactive', anchor: { x: 24, y: 66 }, size: { x: 16, y: 8 } },
  { id: 'banquet-entrance', label: '연회장 입구', purpose: 'guide', anchor: { x: 20, y: 78 }, size: { x: 12, y: 8 } },
  { id: 'banquet-hall', label: '연회장', purpose: 'guide', anchor: { x: 8, y: 84 }, size: { x: 42, y: 12 } },
  { id: 'beverage-self-bar', label: '음료 셀프바', purpose: 'decorative', anchor: { x: 76, y: 70 }, size: { x: 14, y: 10 } },
  { id: 'photo-booth', label: '포토부스', purpose: 'decorative', anchor: { x: 76, y: 88 }, size: { x: 16, y: 8 } },
] as const satisfies readonly VenueZone[];

export type VenueZoneId = (typeof VENUE_ZONES)[number]['id'];

export type GuidePath = {
  readonly id: string;
  readonly label: string;
  readonly zoneIds: readonly VenueZoneId[];
  readonly points: readonly LogicalPoint[];
};

export const GUIDE_PATHS = [
  {
    id: 'lobby-to-photo-table',
    label: '로비에서 포토테이블',
    zoneIds: ['lobby', 'greenery-corridor', 'photo-table'],
    points: [{ x: 18, y: 17 }, { x: 42, y: 24 }, { x: 55, y: 54 }],
  },
  {
    id: 'groom-reception-to-banquet',
    label: '축의대 1에서 연회장',
    zoneIds: ['groom-reception-desk', 'banquet-entrance', 'banquet-hall'],
    points: [{ x: 56, y: 70 }, { x: 26, y: 82 }, { x: 28, y: 90 }],
  },
  {
    id: 'bride-reception-to-banquet',
    label: '축의대 2에서 연회장',
    zoneIds: ['bride-reception-desk', 'banquet-entrance', 'banquet-hall'],
    points: [{ x: 32, y: 70 }, { x: 26, y: 82 }, { x: 28, y: 90 }],
  },
] as const satisfies readonly GuidePath[];

export type GuidePathId = (typeof GUIDE_PATHS)[number]['id'];
