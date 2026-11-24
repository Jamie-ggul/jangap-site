// RSS feed for Naver/Google discovery. Add new pages to the top of `items`.
const site = 'https://jangap.com';
const items = [
  { path: '/auto-coffee-machine/', title: '전자동 커피머신 비교: 필립스·드롱기 우유 방식·관리법·1잔 값', desc: '전자동 커피머신을 라떼 빈도와 우유 거품 방식으로 고르고, 필립스·드롱기·제니퍼룸 사양과 관리법, 1잔 원두값을 정리.', date: '2026-11-23T12:00:00+09:00' },
  { path: '/coffee-types/', title: '커피 종류: 메뉴별 에스프레소·우유 비율 한눈에 (라떼·카푸치노·플랫화이트)', desc: '아메리카노, 카페라떼, 카푸치노, 플랫화이트, 마키아또 등 커피 종류 12가지의 에스프레소·우유·거품 비율 비교와 취향별 메뉴 추천.', date: '2026-11-18T12:00:00+09:00' },
  { path: '/coffee-grinder/', title: '커피 그라인더 추천: 전동 vs 수동, 추출별 원두 분쇄도', desc: '전동 커피 그라인더와 수동 핸드그라인더 차이, 에스프레소·핸드드립·콜드브루별 원두 분쇄도 정리.', date: '2026-11-15T12:00:00+09:00' },
  { path: '/coffee-bean-types/', title: '원두 종류: 커피 원두 종류별 맛 차이 (산지·로스팅·가공)', desc: '산지, 로스팅, 가공 방식으로 보는 커피 원두 종류별 맛 차이와 취향별 원두 추천.', date: '2026-11-14T15:30:00+09:00' },
  { path: '/coffee-bean-ranking/', title: '커피 원두 추천: 맛별 1잔 단가 랭킹', desc: '쿠팡 인기 원두를 1잔(15g) 단가 순으로 비교한 커피 원두 추천 랭킹.', date: '2026-11-14T15:00:00+09:00' },
  { path: '/coffee-caffeine/', title: '커피 카페인 함량표: 스타벅스·메가커피·이디야 한 잔 몇 mg', desc: '카페 메뉴별 카페인 함량과 하루 권장량 대비 몇 잔까지 괜찮은지 계산.', date: '2026-11-14T12:00:00+09:00' },
  { path: '/nespresso-capsule/', title: '네스프레소 캡슐 추천: 정품 vs 호환 1잔 값 비교', desc: '오리지널·버츄오 라인과 취향별 네스프레소 캡슐 종류, 한 달 캡슐 비용 비교.', date: '2026-11-14T11:00:00+09:00' },
  { path: '/home-coffee-machine/', title: '가정용 커피머신 추천: 캡슐·전자동·반자동 비용 비교', desc: '캡슐·전자동·반자동·드립 커피머신을 하루 잔수와 예산으로 3년 총비용 비교.', date: '2026-11-14T10:00:00+09:00' },
  { path: '/coffee-beans-1kg/', title: '원두 1kg 몇 잔? 며칠 가는지 계산기', desc: '하루 잔수와 1잔 원두 양으로 원두 1kg이 며칠 가는지, 용량별 1잔 단가 비교.', date: '2026-11-13T12:00:00+09:00' },
  { path: '/office-coffee-cost/', title: '사무실 커피머신 렌탈 비용 계산기', desc: '사무실 인원과 잔수로 커피머신 렌탈, 캡슐, 원두, 카페 비용을 월 단위로 비교.', date: '2026-11-13T11:00:00+09:00' },
];
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>잔값</title><link>${site}/</link><description>커피 한 잔 값을 숫자로 비교하는 홈카페 도구</description><language>ko</language>
<lastBuildDate>${new Date(items[0].date).toUTCString()}</lastBuildDate>
${items.map(i => `<item><title>${esc(i.title)}</title><link>${site}${i.path}</link><guid>${site}${i.path}</guid><description>${esc(i.desc)}</description><pubDate>${new Date(i.date).toUTCString()}</pubDate></item>`).join('\n')}
</channel></rss>`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
