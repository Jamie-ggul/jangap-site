// POST /api/lead — office quote request → email via Resend.
// Env (set in Vercel, never in the repo):
//   RESEND_API_KEY  required
//   LEAD_TO         default contact@jangap.com
//   LEAD_FROM       default "잔값 견적 <lead@jangap.com>" (domain must be verified in Resend)
//   LEADS_SHEET_URL / LEADS_SHEET_TOKEN  optional: Google Apps Script web app that appends a row (scripts/leads-sheet.gs)
const AREAS = ['서울 강남·서초', '서울 마포·영등포', '서울 종로·중구', '서울 성동·광진', '서울 기타', '서울 외 지역'];
const MACHINES = ['있음', '없음', '잘 모르겠음'];
const clip = (v, n) => String(v ?? '').trim().slice(0, n);
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method' });
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};

  // Honeypot: bots fill hidden fields. Pretend success, send nothing.
  if (clip(b.website, 200)) return res.status(200).json({ ok: true });

  const d = {
    company: clip(b.company, 80),
    area: AREAS.includes(b.area) ? b.area : '미선택',
    people: clip(b.people, 6).replace(/[^\d]/g, ''),
    machine: MACHINES.includes(b.machine) ? b.machine : '미선택',
    name: clip(b.name, 40),
    phone: clip(b.phone, 30),
    email: clip(b.email, 120),
    memo: clip(b.memo, 1000),
    calc: clip(b.calc, 200),
  };
  if (!/^[0-9+\-() ]{8,20}$/.test(d.phone)) return res.status(400).json({ ok: false, error: 'phone' });
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return res.status(400).json({ ok: false, error: 'email' });
  if (b.agree !== true) return res.status(400).json({ ok: false, error: 'agree' });

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(503).json({ ok: false, error: 'config' });

  const rows = [
    ['회사명', d.company || '-'], ['담당자', d.name || '-'], ['연락처', d.phone], ['이메일', d.email || '-'],
    ['지역', d.area], ['인원', d.people ? d.people + '명' : '-'], ['커피머신 보유', d.machine],
    ['계산기 입력', d.calc || '-'], ['요청사항', d.memo || '-'],
  ];
  const html = `<h2 style="margin:0 0 12px">사무실 원두 구독 견적 요청</h2>
<table cellpadding="8" style="border-collapse:collapse;font-size:14px">${rows.map(([k, v]) =>
    `<tr><td style="background:#f5efe8;font-weight:700;white-space:nowrap">${k}</td><td style="border-bottom:1px solid #eee">${esc(v).replace(/\n/g, '<br>')}</td></tr>`).join('')}</table>
<p style="color:#888;font-size:12px">jangap.com 사무실 커피 비용 계산기에서 접수 · 개인정보 수집·이용 동의함 · ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</p>`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');

  const mail = fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.LEAD_FROM || '잔값 견적 <lead@jangap.com>',
      to: [process.env.LEAD_TO || 'contact@jangap.com'],
      subject: `[잔값 견적] ${d.company || '회사명 미입력'} · ${d.people ? d.people + '명' : '인원 미입력'}`,
      html, text,
      ...(d.email ? { reply_to: d.email } : {}),
    }),
  }).then(async r => { if (!r.ok) throw new Error('resend ' + r.status + ' ' + await r.text()); return true; });

  const sheetUrl = process.env.LEADS_SHEET_URL, sheetToken = process.env.LEADS_SHEET_TOKEN;
  const sheet = (sheetUrl && sheetToken)
    ? fetch(sheetUrl, {
        method: 'POST', redirect: 'follow', signal: AbortSignal.timeout(8000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sheetToken, ...d, people: d.people ? d.people + '명' : '' }),
      }).then(async r => { const j = await r.json().catch(() => ({})); if (!j.ok) throw new Error('sheet ' + r.status + ' ' + (j.error || '')); return true; })
    : Promise.resolve(null);

  const [m, sh] = await Promise.allSettled([mail, sheet]);
  if (m.status === 'rejected') console.error(m.reason?.message);
  if (sh.status === 'rejected') console.error(sh.reason?.message);
  // 메일이나 시트 중 하나라도 저장되면 접수 성공
  if (m.status !== 'fulfilled' && !(sh.status === 'fulfilled' && sh.value)) {
    return res.status(502).json({ ok: false, error: 'send' });
  }
  return res.status(200).json({ ok: true });
}
