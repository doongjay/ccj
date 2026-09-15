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
  title: 'JJ ♥ HS',
  shareTitle: '현서와 재준, 현재의 시작',
  description: '2026년 11월 21일 오후 2시, 라시따시어터 1층 그랜드볼룸에서 만나요.',
  shareCopy: '현서와 재준, 현재의 시작',
  themeColor: '#738D5F',
  canonicalPath: '/',
  mobileApp: {
    title: '현서와 재준, 현재의 시작',
    capable: 'yes',
    appleCapable: 'yes',
    statusBarStyle: 'default',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    imagePath: '/assets/invitation/share-pixel-wide-v2.png',
    imageAlt: '계단에 나란히 앉아 서로 바라보는 재준과 현서의 픽셀 웨딩 그림',
    imageType: 'image/png',
    imageWidth: 1774,
    imageHeight: 887,
    twitterCard: 'summary_large_image',
  },
} as const;
