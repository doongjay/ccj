// Keep game/index.html title and meta tags synchronized with these values until
// build-time metadata injection is introduced.
export const WEDDING_METADATA = {
  groomName: '이재준',
  brideName: '김현서',
  eventDate: {
    isoDate: '2026-11-21',
    time24h: '14:00',
    displayText: '2026년 11월 21일 오후 2시',
  },
  venue: {
    name: '라시따시어터',
    englishName: 'LACITTA',
    hall: '1층 그랜드볼룸',
    address: '서울특별시 서초구 매헌로 16',
  },
  title: '이재준 ♥ 김현서 결혼식으로 가는 길',
  description: '2026년 11월 21일 오후 2시, 라시따시어터 1층 그랜드볼룸에서 만나요.',
  shareCopy: '게임을 따라 라시따시어터까지 와 주세요. 이재준 ♥ 김현서 결혼식 초대장입니다.',
  themeColor: '#738D5F',
  canonicalPath: '/',
  mobileApp: {
    title: '이재준 ♥ 김현서',
    capable: 'yes',
    appleCapable: 'yes',
    statusBarStyle: 'default',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    imagePath: '/assets/lacitta/share/og-lacitta-wedding.png',
    imageAlt: '이재준 김현서 결혼식 게임형 청첩장 미리보기',
    imageType: 'image/png',
    imageWidth: 1200,
    imageHeight: 630,
    twitterCard: 'summary_large_image',
  },
} as const;
