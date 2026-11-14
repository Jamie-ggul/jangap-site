// 잔값 리드 시트 — Google Apps Script (ggulworks 계정의 독립 프로젝트 '잔값 리드 수집')
// jangap.com /api/lead 가 견적 요청을 받을 때마다 POST로 한 줄씩 추가한다.
// 처음 한 번: setup 실행(권한 승인) → 웹 앱으로 배포(실행: 나, 액세스: 모든 사용자)
// → 배포 URL과 실행 로그의 토큰을 Vercel 환경변수 LEADS_SHEET_URL / LEADS_SHEET_TOKEN 에 입력.

const SHEET_ID = '1-KgNvrmsLPvU3QkND2iwDOnGfbPpAqKGw-RIi2DVAig'; // 스프레드시트 '잔값 견적 리드'
const SHEET = '리드';
const HEAD = ['접수일시', '회사명', '담당자', '연락처', '이메일', '지역', '인원', '커피머신', '계산기 입력', '요청사항', '상태', '메모'];
const KEYS = ['company', 'name', 'phone', 'email', 'area', 'people', 'machine', 'calc', 'memo'];

function sheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(SHEET);
  if (!sh) sh = ss.insertSheet(SHEET);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEAD);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEAD.length).setFontWeight('bold').setBackground('#F5EFE8');
  }
  return sh;
}

// 수식으로 해석될 수 있는 값은 텍스트로 고정 (연락처 앞자리 0 보존 포함)
function text_(v) {
  v = String(v == null ? '' : v).slice(0, 1000);
  return v === '' ? '' : "'" + v;
}

function doPost(e) {
  const out = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (_) { return out({ ok: false, error: 'json' }); }
  const token = PropertiesService.getScriptProperties().getProperty('TOKEN');
  if (!token || d.token !== token) return out({ ok: false, error: 'auth' });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet_().appendRow([new Date()].concat(KEYS.map(k => text_(d[k])), ['연락 전', '']));
  } finally {
    lock.releaseLock();
  }
  return out({ ok: true });
}

// 1회 실행: 접근 토큰 생성 + 매일 새벽 정리 트리거 + 헤더 준비
function setup() {
  const p = PropertiesService.getScriptProperties();
  if (!p.getProperty('TOKEN')) {
    p.setProperty('TOKEN', Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, ''));
  }
  ScriptApp.getProjectTriggers().forEach(t => { if (t.getHandlerFunction() === 'purgeOld') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('purgeOld').timeBased().everyDays(1).atHour(4).create();
  sheet_();
  Logger.log('LEADS_SHEET_TOKEN = ' + p.getProperty('TOKEN'));
}

// 접수 후 1년이 지난 행 삭제 (개인정보처리방침 3항)
function purgeOld() {
  const sh = sheet_();
  const n = sh.getLastRow();
  if (n < 2) return;
  const cut = new Date();
  cut.setFullYear(cut.getFullYear() - 1);
  const v = sh.getRange(2, 1, n - 1, 1).getValues();
  for (let i = v.length - 1; i >= 0; i--) {
    const t = v[i][0];
    if (t instanceof Date && t < cut) sh.deleteRow(i + 2);
  }
}
