export type QuizOption = {
  id: string;
  label: string;
  correct: boolean;
  reactionText?: string;
};

export type Quiz = {
  id: string;
  question: string;
  options: QuizOption[];
  hintText: string;
};

// Mirrors docs/scenario.md — that document is the source of truth; keep this in sync with it.
export const QUIZZES: Record<'Q1' | 'Q2' | 'Q3', Quiz> = {
  Q1: {
    id: 'Q1',
    question: '어떤 색의 유도선을 타고 가야 하지?',
    options: [
      {
        id: 'yellow',
        label: '노란색',
        correct: false,
        reactionText: '어라, 여기 이마트인데요? 주차비 정산하고 다시 나가볼까요?',
      },
      {
        id: 'pink',
        label: '핑크색',
        correct: false,
        reactionText: '타워 주차장은 계속 뱅글뱅글... 어질어질하네요. 다른 색을 찾아봐요.',
      },
      { id: 'blue', label: '파란색', correct: true },
    ],
    hintText: '지하로, 아주 깊숙하게 내려가는 길이 제일 편하다고 하던데요?',
  },
  Q2: {
    id: 'Q2',
    question: '양재역 몇 번 출구로 나가야 하지?',
    options: [
      { id: '1', label: '1번 출구', correct: false },
      { id: '4', label: '4번 출구', correct: false },
      { id: '5', label: '5번 출구', correct: true },
      { id: '7', label: '7번 출구', correct: false },
      { id: '8', label: '8번 출구', correct: false },
    ],
    hintText: '라시따시어터 방향은 홀수도 짝수도 아닌... 딱 중간, 5번이에요!',
  },
  // Not a real quiz — both answers are "correct" (it just routes the guest to the
  // matching 축의대), so there's no wrong-answer reaction or hint to show.
  Q3: {
    id: 'Q3',
    question: '누구 쪽 손님이세요?',
    options: [
      { id: 'groom', label: '신랑측 친구', correct: true },
      { id: 'bride', label: '신부측 친구', correct: true },
    ],
    hintText: '',
  },
};
