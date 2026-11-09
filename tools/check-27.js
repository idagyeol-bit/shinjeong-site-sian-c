/* 시안C 27차 검사 — node tools/check-27.js
   다시 만든 결과(index.html 과 다른 쪽)가 27차 지시서대로인지 확인한다. 문제가 있으면 '✗' 줄과 함께 끝 코드 1 로 끝난다. */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
let bad = 0;
const ok = (cond, msg) => { console.log((cond ? '✓ ' : '✗ ') + msg); if (!cond) bad++; };

/* JPEG · PNG · WebP 의 실제 가로 · 세로 */
function size(file) {
  const b = fs.readFileSync(file);
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1], len = b.readUInt16BE(i + 2);
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
      i += 2 + len;
    }
  }
  if (b.toString('ascii', 1, 4) === 'PNG') return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b.toString('ascii', 8, 12) === 'WEBP') {
    const k = b.toString('ascii', 12, 16);
    if (k === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    if (k === 'VP8L') { const v = b.readUInt32LE(21); return [(v & 0x3fff) + 1, ((v >> 14) & 0x3fff) + 1]; }
    if (k === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  }
  return null;
}

const h = read('index.html');
const main = h.slice(h.indexOf('<main'), h.indexOf('</main>'));
const ids = [...main.matchAll(/<section([^>]*)>/g)].map((m) => (m[1].match(/\bid="([^"]+)"/) || m[1].match(/class="([\w-]+)/) || [])[1]);
ok(ids.join(',') === 'hx,quick,what,field,unmanned,company', `메인 구역 순서 hx,quick,what,field,unmanned,company (지금: ${ids.join(',')})`);
ok(/<body[^>]*data-hero="flow"/.test(h), "body data-hero=\"flow\"");
ok(!/class="h3d"|hero-story\.js|class="why2"|id="how"/.test(h), '3D 첫 화면 · 왜 로봇인가 · 어떻게 일하나 없음');
ok(/<script src="js\/hero-flow\.js\?v=/.test(h), 'js/hero-flow.js 연결');
ok((main.match(/<li(?: class="rbt")?><i class="bar"><\/i><button type="button" class="sb"/g) || []).length === 5, '일하는 순서 다섯 칸');
ok((h.match(/assets\/hero-flow\/p\d\.webp/g) || []).length === 5 && !/assets\/hero-flow\/[tf]\d/.test(h) && (h.match(/assets\/hero-flow\/v\d\.mp4/g) || []).length === 5, '47차: 칸마다 한 장면(p1~p5) · 영상 5개 연결, 예전 t · f 그림 없음');
ok(!/<section class="hn"/.test(main), '숫자 줄은 첫 화면으로 합침(43차)');
ok((main.match(/class="sv5__rec"/g) || []).length === 5 && !/<span class="sv5__t"><em>/.test(main), '다섯 가지 일: 실적 한 줄 5개 · 번호 없음');
ok((main.match(/<section class="rf"[\s\S]*?<\/section>/)[0].match(/<figure[ >]/g) || []).length === 4, '실제 현장 사진 넷');
ok(h.includes('1992년 설립 · 산업설비 클리닝 전문기업') && h.includes('사람이 없는 곳에') && h.includes('<strong>신정개발이 직접 개발한 무인 로봇</strong>'), '첫 화면 글자');
ok(/<li><b>1992<\/b>설립<\/li><li><b>170<small>여 건<\/small><\/b>수행 실적 · 2020~2023<\/li><li><b>4<small>년 연속<\/small><\/b>4개 발주처 단가계약<\/li><li><b>8<small>건<\/small><\/b>등록 특허<\/li>/.test(h), '숫자 넷 1992 · 170여 건 · 4년 연속 · 8건 (43차)');
ok(!/1992년부터 (석유|플랜트)|작업자 대신 로봇|보호구를 착용한 작업자가 진입/.test(h) && !h.includes('1992년부터 한 길.<br>') && !h.includes('그다음에 들어갑니다.</p>'), '회사 소개 반복 문장 뺌 · 32차 근거 없는 문구 없음');
ok(/<!-- trust-numbers [\d ]+-->/.test(h), '영문판용 trust-numbers 주석 남음');

/* 모든 쪽: 사이트 안 링크 · 그림 파일이 있는지, 사진 width/height 비율이 실제 파일과 같은지 */
const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
let miss = [], ratio = [];
for (const f of pages) {
  const t = read(f);
  for (const m of t.matchAll(/(?:href|src|poster)="([^"#?:]+)(?:[?#][^"]*)?"/g)) {
    const u = m[1];
    if (!u || u.startsWith('//') || u === '/' || /^(mailto|tel|https?)/.test(u)) continue;
    if (!fs.existsSync(path.join(ROOT, u))) miss.push(`${f} → ${u}`);
  }
  for (const m of t.matchAll(/<img[^>]*>/g)) {
    const tag = m[0], src = (tag.match(/\ssrc="([^"]+)"/) || [])[1], w = +(tag.match(/\swidth="(\d+)"/) || [])[1], hh = +(tag.match(/\sheight="(\d+)"/) || [])[1];
    if (!src || !w || !hh || /^(data:|https?:)/.test(src)) continue;
    const p = path.join(ROOT, src.split('?')[0]);
    if (!fs.existsSync(p)) continue;
    const s = size(p);
    if (s && Math.abs(s[0] / s[1] - w / hh) > 0.02) ratio.push(`${f}: ${src} ${w}x${hh} ↔ 실제 ${s[0]}x${s[1]}`);
  }
}
ok(miss.length === 0, `사이트 안 링크 · 파일 모두 있음 (${pages.length}쪽)` + (miss.length ? '\n   ' + [...new Set(miss)].slice(0, 15).join('\n   ') : ''));
ok(ratio.length === 0, '사진 width/height 비율 = 실제 파일' + (ratio.length ? '\n   ' + ratio.slice(0, 15).join('\n   ') : ''));

console.log(bad ? `\n✗ ${bad}개 문제 — 커밋하지 말고 이다결 님에게 알린다` : '\n✓ 27차 검사 통과');
process.exit(bad ? 1 : 0);
