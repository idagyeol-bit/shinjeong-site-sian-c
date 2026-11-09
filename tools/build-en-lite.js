/* 신정개발 홈페이지 — 시안C 축약 영문판 생성기 (34차 시작, 55차 2026-11-09 이다결 님 요청으로 국문 시안C 모양 · 말에 맞춰 다시 짬)
   - 55차: 머리말 · 남색 쪽 머리 · 바닥글(54차 .ftr2) · 휴대폰 아래 문의 띠를 국문과 같은 모양으로. 홈 = 표어 · 숫자 넷 · 다섯 단계(연출 그림 p1~p5) · 다섯 분야(사진) · 현장 사진 넷 · 로봇 안내 · 문의 띠,
     Our Robots = 로봇 여섯(현장 장비 셋 · 연구개발 시제품 셋) · 작업 여섯 단계, Contact = 바로 연락 + 메일 문의 양식(js/en-contact.js).
   - 문구는 tools/i18n/en-lite.json(국문 시안C 문장의 같은 뜻, 새 사실 없음).
   - en/index.html · en/technology.html · en/contact.html 3쪽만 만든다. 기존 전체 미러(tools/build-en.js, tools/i18n/en.json)는 쓰지 않고 보존만 한다.
   - 영문 문구는 tools/i18n/en-lite.json 한 곳에 있다(34차 지시서 카피 전문 그대로). 여기서는 문구를 만들지 않는다.
   - 숫자·연락처·주소 숫자 같은 사실 값은 국문 생성 결과(index.html · company.html · unmanned.html · contact.html, 곧 tools/build.js 의 데이터)에서 읽는다.
     영문 파일에 숫자를 손으로 다시 치지 않는다(국문과 어긋남 방지). 읽지 못하면 멈춘다.
   - 모든 영문 쪽: noindex, 시안 띠(영문), 제목 앞 [Draft], 바닥글 AI 고지(영문). 머리말은 Home · Technology · Contact + KOR(국문 홈으로).
   실행: node tools/build.js → node tools/build-en-lite.js */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'en');
const D = JSON.parse(fs.readFileSync(path.join(__dirname, 'i18n', 'en-lite.json'), 'utf8'));
const CFG = require(path.join(__dirname, 'site.config.js'));
const SIAN = CFG.sian || {};
const SITE_URL = (() => { const m = fs.readFileSync(path.join(__dirname, 'build.js'), 'utf8').match(/^const SITE_URL = '([^']+)'/m); return m ? m[1] : ''; })();
const LITE_PAGES = ['index.html', 'technology.html', 'contact.html'];

const fail = (m) => { console.error('영문판(축약) 생성 오류: ' + m); process.exit(1); };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const read = (f) => { const p = path.join(ROOT, f); if (!fs.existsSync(p)) fail(`국문 ${f} 이 없습니다. 먼저 node tools/build.js 를 돌리세요.`); return fs.readFileSync(p, 'utf8'); };
const pick = (html, re, what) => { const m = html.match(re); if (!m) fail(`국문 페이지에서 ${what}을(를) 찾지 못했습니다`); return m[1]; };

/* ---------- 사실 값: 국문 생성 결과에서 ---------- */
const ko = { index: read('index.html'), company: read('company.html'), technology: read('unmanned.html'), contact: read('contact.html') };
const trustNote = ko.index.match(/<!-- trust-numbers ((?:\d+\s*)+)-->/);   // 시안C 24차: 메인에 숫자 띠가 없으면 생성기가 남긴 주석에서
const statsBlock = trustNote ? '' : pick(ko.index, /<section[^>]*class="[^"]*\btrust\b[^"]*"[\s\S]*?<div class="stats"[^>]*>([\s\S]*?)<\/div>\s*<div class="trust__info"/, '숫자 띠');
const stats = trustNote ? trustNote[1].trim().split(/\s+/).map(Number) : [...statsBlock.matchAll(/data-count="(\d+)"/g)].map((m) => +m[1]);
/* 55차: 첫 화면 숫자 넷(설립 · 수행 실적 · 연속 단가계약 · 등록 특허)은 국문 홈 첫 화면의 숫자 줄에서 */
const heroMeta = [...pick(ko.index, /<ul class="meta">([\s\S]*?)<\/ul>/, '첫 화면 숫자 줄').matchAll(/<li><b>(\d+)/g)].map((m) => m[1]);
if (heroMeta.length !== 4) fail('첫 화면 숫자가 4개가 아닙니다: ' + heroMeta.join(', '));
const pdfProfile = pick(ko.index, /href="(assets\/docs\/[^"]*company-profile[^"]*\.pdf)"/, '회사소개서 공개용 PDF 링크');
if (stats.length !== 4) fail(`숫자 띠 값이 4개가 아닙니다: ${stats.join(', ')}`);
const founded = +pick(ko.company, /<dt>설립<\/dt><dd>(\d{4})(?:<small>)?년/, '설립 연도');   // 회사 소개 '한눈에 보기' 표(설립 1992년)
const rnd = +pick(ko.company, /<dt>기업부설연구소<\/dt><dd>(\d{4})(?:<small>)?년/, '기업부설연구소 설립 연도');
const generations = ((ko.technology.match(/<ol class="(?:rb-hist|um-gens)"[^>]*>([\s\S]*?)<\/ol>|aria-label="세대 고르기">([\s\S]*?)<\/div>/) || ['', '', '']).slice(1).join('').match(/<li\b|<button\b/g) || []).length;   // 시안C 22차: 세대 띠가 없어져 라인업 '세대 고르기' 단추 수도 센다   // 시안C 9차: 무인 솔루션 페이지(unmanned.html)의 세대 띠 <li> 수(= 5)
if (!generations) fail('세대 띠(rb-hist)를 찾지 못했습니다');
const pdfTech = pick(ko.technology, /href="(assets\/docs\/[^"]*robot[^"]*public\.pdf)"/, '기술소개서 공개용 PDF 링크');
const tel = pick(ko.contact, /<a href="tel:\d+">([\d-]+)<\/a>/, '대표 전화');
const fax = pick(ko.contact, /팩스 ([\d-]+)/, '팩스');
const hours = pick(ko.contact, /문의 가능 시간 ([\d:]+ ~ [\d:]+)/, '문의 가능 시간');
const email = pick(ko.contact, /<a href="mailto:([^"]+)">/, '이메일');
const koAddr = pick(ko.index, /본사 ([^<]+)(?:<br>|<\/span>)/, '본사 주소');
const koBranch = pick(ko.index, /지사 ([^<]+)(?:<br>|<\/span>)/, '지사 주소');
/* 주소 로마자 줄의 번지 숫자가 국문 주소의 숫자와 같은지 */
const num = (s) => (s.match(/\d+/g) || []);
if (!num(D.common.hqLine).includes(num(koAddr)[num(koAddr).length - 1])) fail(`본사 주소 번지가 다릅니다: ${D.common.hqLine} ↔ ${koAddr}`);
if (!num(D.common.branchLine).includes(num(koBranch)[num(koBranch).length - 1])) fail(`지사 주소 번지가 다릅니다: ${D.common.branchLine} ↔ ${koBranch}`);
const intl = (n) => D.common.phonePrefix + n.replace(/^0/, '');   // 061-682-5537 → +82-61-682-5537
/* og:image 는 국문 홈과 같은 사진(35차: 영문 쪽에 og:image 가 없던 것을 보강) */
const OG_IMAGE = (() => { const m = ko.index.match(/<meta property="og:image" content="[^"]*?(assets\/[^"]+)">\s*<meta property="og:image:width" content="(\d+)">\s*<meta property="og:image:height" content="(\d+)">/); if (!m) fail('국문 홈의 og:image 를 찾지 못했습니다'); return { src: m[1], w: m[2], h: m[3] }; })();
const koYear = new Date().getFullYear();

/* ---------- 공통 틀 ---------- */
const arrow = (s) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M13 6.5l5.5 5.5L13 17.5"/></svg>`;
const C = D.common;
const V = { founded: heroMeta[0], projects: heroMeta[1], years: heroMeta[2], patents: heroMeta[3], gens: generations, lab: rnd, hours: hours.replace(' ~ ', '–'), fax: intl(fax), tel: intl(tel), year: koYear };
const fill = (t) => String(t).replace(/\{(\w+)\}/g, (m, k) => (k in V ? V[k] : m));
const t = (x) => esc(fill(x));
const b = (x) => t(x).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const telHref = 'tel:' + intl(tel).replace(/-/g, '');

/* 사진: assets/photos/<ID>-<폭>.jpg 중 있는 크기로 srcset, width/height 는 가장 큰 파일에서 읽는다(JPEG SOF) */
const jpgSize = (p) => { const d = fs.readFileSync(p); let i = 2; while (i < d.length) { if (d[i] !== 0xFF) { i++; continue; } const m = d[i + 1]; const L = d.readUInt16BE(i + 2); if (m >= 0xC0 && m <= 0xCF && ![0xC4, 0xC8, 0xCC].includes(m)) return { h: d.readUInt16BE(i + 5), w: d.readUInt16BE(i + 7) }; i += 2 + L; } fail('사진 크기를 읽지 못했습니다: ' + p); };
const pic = (id, alt, sizes, eager) => {
  const dir = path.join(ROOT, 'assets', 'photos');
  const ws = fs.readdirSync(dir).map((f) => (f.match(new RegExp('^' + id + '-(\\d+)\\.jpg$')) || [])[1]).filter(Boolean).map(Number).sort((a, c) => a - c);
  if (!ws.length) fail('사진이 없습니다: ' + id);
  const big = jpgSize(path.join(dir, `${id}-${ws[ws.length - 1]}.jpg`));
  const src = ws.find((w) => w >= 1000) || ws[ws.length - 1];
  return `<img src="../assets/photos/${id}-${src}.jpg" srcset="${ws.map((w) => `../assets/photos/${id}-${w}.jpg ${w}w`).join(', ')}" sizes="${sizes}" width="${big.w}" height="${big.h}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
};

function head(o) {
  return `<!doctype html>
<html lang="en" class="is-preview">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(C.draftTitle + o.title)}</title>
<meta name="description" content="${esc(o.desc)}">
<meta name="format-detection" content="telephone=no">
<meta name="theme-color" content="#0e2e4a">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(C.brand)}">
<meta property="og:title" content="${esc(C.draftTitle + o.title)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:url" content="${SITE_URL}en/${o.file === 'index.html' ? '' : o.file}">
<meta property="og:locale" content="en_US">
<meta property="og:image" content="${SITE_URL}${OG_IMAGE.src}">
<meta property="og:image:width" content="${OG_IMAGE.w}">
<meta property="og:image:height" content="${OG_IMAGE.h}">
<link rel="alternate" hreflang="ko" href="${SITE_URL}${o.ko}">
<link rel="icon" href="../assets/logo/shinjeong-symbol.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="../assets/logo/shinjeong-symbol.png">
<script>/* 56차: 한국어로 설정된 브라우저는 이 영문 쪽을 기계 번역하지 않고 한국어 쪽으로 안내한다(번역 중 오류 · 엉뚱한 번역 방지). 다른 언어 브라우저는 번역 그대로 쓸 수 있다 */
(function(){try{var L=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||'']).join(',').toLowerCase();if(/(^|,)ko/.test(L)){document.documentElement.classList.add('ko-user');var m=document.createElement('meta');m.name='google';m.content='notranslate';document.head.appendChild(m);document.documentElement.setAttribute('translate','no');}}catch(e){}})();</script>
<link rel="stylesheet" href="../css/tokens.css">
<link rel="stylesheet" href="../css/site.css">
</head>
<body class="moB-root enC" data-page="${o.page}">
<a class="skip-link" href="#main">${esc(C.skip)}</a>
<div class="enC-ko" lang="ko" translate="no" role="note"><span>신정개발 한국어 홈페이지가 따로 있습니다.</span><a href="../${o.ko || 'index.html'}" hreflang="ko">한국어로 보기 →</a></div>
<div class="sianbar" role="note" style="--sian: ${SIAN.color || '#c2410c'}"><span class="sianbar__name">${esc(SIAN.name ? 'Draft ' + ((SIAN.name.match(/[A-Z]\s*$/) || [''])[0].trim()) : 'Draft')}</span><span class="sianbar__note">${esc(C.draftNote)}</span></div>
`;
}
const NAV = [['index.html', C.nav.home, 'index'], ['technology.html', C.nav.technology, 'technology'], ['contact.html', C.nav.contact, 'contact']];
function header(page, koFile) {
  const a = (n, extra) => `<a href="${n[0]}"${n[2] === page ? ' aria-current="page"' : ''}>${esc(n[1])}${extra || ''}</a>`;
  return `<header class="hdr">
  <a class="hdr__brand" href="index.html">
    <img class="hdr__logo" src="../assets/logo/shinjeong-symbol.svg" width="36" height="44" alt="" aria-hidden="true">
    <span class="hdr__brandtext" translate="no"><b>${esc(C.brand)}</b><span aria-hidden="true">${esc(C.brandUpper)}</span></span>
  </a>
  <nav class="gnb" aria-label="${esc(C.navLabel)}">
${NAV.map((n) => `      ${a(n)}`).join('\n')}
  </nav>
  <div class="hdr__act">
    <a class="hdr__lang" href="../${koFile}" hreflang="ko" lang="ko" translate="no">한국어</a>
    <a class="hdr__tel" href="${telHref}"><small>${esc(C.telSmall)}</small>${esc(intl(tel))}</a>
    <a class="hdr__cta" href="contact.html">${esc(C.cta)} ${arrow(14)}</a>
    <button class="burger" type="button" aria-expanded="false" aria-controls="drawer" aria-label="${esc(C.menuOpen)}"><i></i><i></i><i></i></button>
  </div>
</header>

<div class="drawer" id="drawer" aria-hidden="true">
  <nav aria-label="Menu">
${NAV.map((n, i) => `    ${a(n, `<span>0${i + 1}</span>`)}`).join('\n')}
    <a href="../${koFile}" hreflang="ko" lang="ko">${esc(C.koreanSite)}<span>04</span></a>
  </nav>
  <div class="drawer__foot">
    ${esc(C.brandCo)}<br>
    <a href="${telHref}">${esc(intl(tel))}</a><br>
    <a href="mailto:${email}">${email}</a>
  </div>
</div>
`;
}
/* 남색 쪽 머리 — 국문 phero 와 같은 모양(초록 점 머리글 + 흰 제목 + 초록 막대) */
function phero(kick, h1, lead) {
  return `  <section class="phero">
    <div class="wrap">
      <h1><small>${esc(kick)}</small>${h1}</h1>
      ${lead ? `<p class="phero__lead">${esc(lead)}</p>` : ''}
    </div>
  </section>
`;
}
/* 바닥글 — 국문 54차 .ftr2 와 같은 모양 */
function footer(koFile) {
  const doc = (href, label) => `<a href="../${href}" target="_blank" rel="noopener" hreflang="ko">${esc(label)}</a>`;
  return `<footer class="ftr ftr2">
  <div class="wrap">
    <div class="ftr2__head">
      <a class="ftr2__brand" href="index.html"><img src="../assets/logo/shinjeong-symbol.svg" width="30" height="37" alt="" aria-hidden="true"><span><b>${esc(C.brandCo)}</b><small>${esc(C.brandUpper)}</small></span></a>
      <div class="ftr2__docs"><span>${esc(C.docsLabel)} <small>(${esc(C.docNote)})</small></span>${doc(pdfProfile, C.docProfile)}${doc(pdfTech, C.docTech)}</div>
    </div>
    <nav class="ftr2__map enC-map" aria-label="Site map"><ul>${NAV.map((n) => `<li><a href="${n[0]}">${esc(n[1])}</a></li>`).join('')}<li><a href="../${koFile}" hreflang="ko" lang="ko">${esc(C.koreanSite)}</a></li></ul></nav>
    <div class="ftr2__info">
      <address class="ftr2__addr" translate="no">
        <p><span><b>${esc(C.brandCo)}</b></span><span>${esc(C.hq)} ${esc(C.hqLine)}</span></p>
        <p><span>${esc(C.branch)} ${esc(C.branchLine)}</span></p>
        <p><span>${esc(C.tel)} <a href="${telHref}">${esc(intl(tel))}</a></span><span>${esc(C.fax)} ${esc(intl(fax))}</span><span>${esc(C.email)} <a href="mailto:${email}">${email}</a></span></p>
      </address>
      <div class="ftr2__cs" translate="no"><small>${esc(C.csSmall)}</small><a href="${telHref}">${esc(intl(tel))}</a><span>${t(C.hoursLine)}</span></div>
    </div>
    <div class="ftr2__bot">
      <ul class="ftr2__pol"><li><a class="is-b" href="../privacy.html" hreflang="ko">${esc(C.privacy)} <small>(${esc(C.docNote)})</small></a></li><li><a href="../privacy.html#no-email" hreflang="ko">${esc(C.noEmail)}</a></li><li><a href="../${koFile}" hreflang="ko" lang="ko">${esc(C.koreanSite)}</a></li></ul>
      <p class="ftr2__copy">${t(C.copyright)}</p>
      <button class="totop" type="button" data-totop>${esc(C.toTop)} <span aria-hidden="true">↑</span></button>
    </div>
  </div>
</footer>

<nav class="mcta" aria-label="Quick contact">
  <a class="mcta__tel" href="${telHref}">${esc(C.mCall)}</a>
  <a class="mcta__go" href="contact.html">${esc(C.mContact)} ${arrow(17)}</a>
</nav>
`;
}
const foot = (js) => `<script src="../js/site.js"></script>
<script src="../js/moB.js"></script>
${(js || []).map((j) => `<script src="../js/${j}"></script>`).join('\n')}
</body>
</html>
`;

/* ---------- 쪽 1: 홈 ---------- */
const H = D.home;
const stepsHtml = H.steps.map((st, i) => `        <li class="enC-st"><figure class="enC-st__ph"><img src="../assets/hero-flow/p${i + 1}.webp" width="1600" height="944" alt="" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async">${st.badge ? `<span class="enC-st__b">${esc(st.badge)}</span>` : ''}</figure><div class="enC-st__t"><em>${String(i + 1).padStart(2, '0')}</em><h3>${t(st.t)}</h3><p>${b(st.d)}</p></div></li>`).join('\n');
const homePage = head({ file: 'index.html', page: 'en-home', title: H.title, desc: H.desc, ko: '' }) + header('index', 'index.html') + `
<main id="main">
  <section class="enC-hero" aria-labelledby="enC-h">
    <div class="wrap">
      <div class="enC-hero__g">
        <div>
          <p class="enC-eye">${t(H.eyebrow)}</p>
          <h1 id="enC-h">${H.h1.map((l) => `<span>${b(l)}</span>`).join('')}</h1>
          <p class="enC-gain">${b(H.gain)}</p>
        </div>
        <div>
          <p class="enC-lede">${b(H.lede)}</p>
          <ul class="enC-meta">${H.meta.map(([n, u, l]) => `<li><b>${t(n)}${u ? `<small>${t(u)}</small>` : ''}</b>${t(l)}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="enC-steps__h"><b>${t(H.stepsTitle)}</b><span>${t(H.stepsSub)}</span></div>
      <ol class="enC-steps">
${stepsHtml}
      </ol>
      <p class="enC-note">${t(H.stepsNote)}</p>
    </div>
  </section>

  <section class="section enC-sec" aria-labelledby="enC-svc">
    <div class="wrap">
      <p class="enC-k">${t(H.svcKick)}</p><h2 class="enC-h2" id="enC-svc">${t(H.svcTitle)}</h2>
      <ul class="enC-svcs">
${H.services.map((s, i) => `        <li><figure>${pic(s.photo, s.alt, '(max-width:860px) 80vw, 20vw')}</figure><div><em>${String(i + 1).padStart(2, '0')}</em><h3>${t(s.t)}</h3><p>${t(s.d)}</p><span class="enC-rec">${t(s.rec)}</span></div></li>`).join('\n')}
      </ul>
    </div>
  </section>

  <section class="section enC-sec enC-sec--soft" aria-labelledby="enC-field">
    <div class="wrap">
      <p class="enC-k">${t(H.fieldKick)}</p><h2 class="enC-h2" id="enC-field">${t(H.fieldTitle)}</h2>
      <ul class="enC-field">
${H.field.map((x) => `        <li><figure>${pic(x.photo, x.alt, '(max-width:860px) 50vw, 25vw')}<figcaption><b>${t(x.t)}</b>${t(x.alt)}</figcaption></figure></li>`).join('\n')}
      </ul>
      <div class="enC-band">
        <div><h2>${t(H.robotsTitle)}</h2><p>${t(H.robotsText)}</p></div>
        <a class="enC-btn enC-btn--line" href="technology.html">${t(H.robotsButton)} ${arrow(16)}</a>
      </div>
    </div>
  </section>

  <section class="enC-ask" aria-label="${esc(C.cta)}">
    <div class="wrap enC-ask__in">
      <div><h2>${t(H.askTitle)}</h2><p>${t(H.askText)}</p></div>
      <div class="enC-ask__act"><a class="enC-ask__tel" href="${telHref}"><small>${esc(C.telSmall)}</small>${esc(intl(tel))}</a><a class="enC-btn" href="contact.html">${esc(C.cta)} ${arrow(16)}</a></div>
    </div>
  </section>
</main>

` + footer('index.html') + foot();

/* ---------- 쪽 2: Our Robots ---------- */
const T = D.technology;
const robot = (r, i) => `      <article class="enC-rb${r.grp === 'rd' ? ' enC-rb--rd' : ''}">
        <figure class="enC-rb__ph${/^X0/.test(r.photo) ? ' is-fit' : ''}">${pic(r.photo, r.alt, '(max-width:860px) 100vw, 33vw', i === 0)}</figure>
        <div class="enC-rb__t">
          <h3>${t(r.n)}<small>${t(r.sub)}</small></h3>
          <p class="enC-rb__job">${t(r.job)}</p>
          <p class="enC-rb__where"><span>${esc(T.whereLabel)}</span>${r.where.map((w) => `<i>${t(w)}</i>`).join('')}</p>
          ${r.uses ? `<div class="enC-rb__l"><h4>${esc(T.usesLabel)}</h4><ul>${r.uses.map((x) => `<li>${t(x)}</li>`).join('')}</ul></div>` : ''}
          ${r.notes ? `<div class="enC-rb__l enC-rb__l--note"><h4>${esc(T.noteLabel)}</h4><ul>${r.notes.map((x) => `<li>${t(x)}</li>`).join('')}</ul></div>` : ''}
          ${r.tests ? `<div class="enC-rb__l enC-rb__l--test"><h4>${esc(T.testsLabel)}</h4><ul>${r.tests.map((x) => `<li>${t(x)}</li>`).join('')}</ul></div>` : ''}
        </div>
      </article>`;
const techPage = head({ file: 'technology.html', page: 'technology', title: T.title, desc: T.desc, ko: 'unmanned.html' }) + header('technology', 'unmanned.html') + `
<main id="main">
` + phero(T.kick, T.h1, T.lead) + `
  <section class="section enC-sec" aria-label="${esc(T.fieldKick)}">
    <div class="wrap">
      <p class="enC-k">${esc(T.fieldKick)}</p>
      <div class="enC-rbs">
${T.robots.filter((r) => r.grp === 'field').map(robot).join('\n')}
      </div>
      <p class="enC-k enC-k--rd">${esc(T.rdKick)}</p>
      <div class="enC-rbs enC-rbs--rd">
${T.robots.filter((r) => r.grp === 'rd').map((r, i) => robot(r, i + 3)).join('\n')}
      </div>
    </div>
  </section>

  <section class="section enC-sec enC-sec--soft" aria-labelledby="enC-how">
    <div class="wrap">
      <p class="enC-k">${esc(T.howKick)}</p><h2 class="enC-h2" id="enC-how">${t(T.howTitle)}</h2>
      <ol class="enC-how">
${T.steps.map((s, i) => `        <li${s.pl === 'in' ? ' class="is-robot"' : ''}><div class="enC-how__h"><em>${String(i + 1).padStart(2, '0')}</em>${s.pl ? `<span class="enC-pl enC-pl--${s.pl}">${esc(T.places[s.pl])}</span>` : ''}</div><h3>${t(s.t)}</h3><p>${t(s.d)}</p></li>`).join('\n')}
      </ol>
      <div class="enC-line"><p>${t(T.bottomLine)}</p><a class="enC-btn enC-btn--line" href="../${pdfTech}" target="_blank" rel="noopener" hreflang="ko">${t(T.pdfButton)} ${arrow(16)}</a></div>
    </div>
  </section>

  <section class="enC-ask" aria-label="${esc(C.cta)}">
    <div class="wrap enC-ask__in">
      <div><h2>${t(H.askTitle)}</h2><p>${t(H.askText)}</p></div>
      <div class="enC-ask__act"><a class="enC-ask__tel" href="${telHref}"><small>${esc(C.telSmall)}</small>${esc(intl(tel))}</a><a class="enC-btn" href="contact.html">${esc(C.cta)} ${arrow(16)}</a></div>
    </div>
  </section>
</main>

` + footer('unmanned.html') + foot();

/* ---------- 쪽 3: Contact ---------- */
const K = D.contact;
const contactPage = head({ file: 'contact.html', page: 'contact', title: K.title, desc: K.desc, ko: 'contact.html' }) + header('contact', 'contact.html') + `
<main id="main">
` + phero(K.kick, K.h1, K.lead) + `
  <section class="section enC-sec" aria-label="${esc(K.formTitle)}">
    <div class="wrap enC-ct">
      <aside class="enC-ct__side">
        <h2>${esc(K.directTitle)}</h2>
        <p class="enC-ct__k">${esc(K.phone)}</p>
        <a class="enC-ct__tel" href="${telHref}" translate="no">${esc(intl(tel))}</a>
        <p class="enC-ct__s">${t(C.hoursLine)} · ${t(K.faxLine)}</p>
        <p class="enC-ct__k">${esc(K.email)}</p>
        <p class="enC-ct__mail" translate="no"><a href="mailto:${email}">${email}</a> <button type="button" class="enC-copy" data-copy="${email}" data-done="${esc(K.copied)}">${esc(K.copy)}</button></p>
        <p class="enC-ct__s">${esc(K.emailNote)}</p>
        <div class="enC-ct__box"><h3>${esc(K.prepTitle)}</h3><ul>${K.prep.map((x) => `<li>${t(x)}</li>`).join('')}</ul></div>
        <div class="enC-ct__box"><h3>${esc(K.nextTitle)}</h3><ol>${K.next.map((x) => `<li>${t(x)}</li>`).join('')}</ol></div>
        <p class="enC-ct__k">${esc(K.address)}</p>
        <p class="enC-ct__s">${esc(C.hq)} — ${esc(C.hqLine)}<br>${esc(C.branch)} — ${esc(C.branchLine)}</p>
      </aside>
      <form class="enC-form" id="enForm" data-to="${email}" data-subject="${esc(K.mailSubject)}" data-req="${esc(K.required)}" data-need="${esc(K.needBody)}" novalidate>
        <h2>${esc(K.formTitle)}</h2>
        <fieldset class="enC-eq"><legend>${esc(K.eqLabel)}</legend>
${K.eq.map((e) => `          <label><input type="radio" name="eq" value="${e.id}" data-t="${esc(e.t)}" data-field="${esc(e.field)}"><span>${esc(e.t)}</span></label>`).join('\n')}
        </fieldset>
        <p class="enC-fit" hidden><span>${esc(K.fitLabel)}</span><b></b></p>
        <div class="enC-row">
          <label>${esc(K.name)} <i>*</i><input type="text" name="name" autocomplete="organization" required></label>
          <label>${esc(K.replyEmail)} <i>*</i><input type="email" name="email" autocomplete="email" required></label>
        </div>
        <label>${esc(K.tel)}<input type="tel" name="tel" autocomplete="tel"></label>
        <label>${esc(K.body)}<textarea name="body" rows="5" placeholder="${esc(K.bodyPh)}"></textarea></label>
        <p class="enC-msg" role="alert" hidden></p>
        <button class="enC-btn enC-send" type="submit">${esc(K.send)} ${arrow(16)}</button>
        <p class="enC-note2">${t(K.sendNote)}</p>
        <p class="enC-note2">${esc(K.privacyNote)} <a href="../privacy.html" hreflang="ko">${esc(C.privacy)} (${esc(C.docNote)})</a></p>
      </form>
    </div>
  </section>
</main>

` + footer('contact.html') + foot(['en-contact.js']);

/* ---------- 쓰기: 화석(옛 전체 미러) 결과물은 지우고 3쪽만 남긴다 ---------- */
fs.mkdirSync(OUT, { recursive: true });
fs.readdirSync(OUT).forEach((f) => {
  const p = path.join(OUT, f);
  if (f === 'js' && fs.statSync(p).isDirectory()) { fs.rmSync(p, { recursive: true, force: true }); return; }   // 옛 전체 미러의 번역된 JS
  if (/\.html$/.test(f) && !LITE_PAGES.includes(f)) fs.unlinkSync(p);
});
const out = { 'index.html': homePage, 'technology.html': techPage, 'contact.html': contactPage };
/* 57차 보완(2026-11-09): 국문과 같이 css · js 주소 끝에 파일 지문(?v=8글자)을 붙인다 — 바뀐 디자인 파일을 브라우저가 예전 것(캐시)으로 쓰지 않게.
   지문이 없어서 엣지 · 크롬이 55차 이전 site.css 를 그대로 써 영문 본문 모양이 깨져 보였다 */
const BUST = {};
const bust = (html) => html.replace(/(href|src|poster)="\.\.\/((?:css|js)\/[^"?#]+\.(?:css|js)|assets\/hero-flow\/[^"?#]+\.(?:webp|mp4))"/g, (m, a, f) => {
  if (!(f in BUST)) { const p = path.join(ROOT, f); BUST[f] = fs.existsSync(p) ? require('crypto').createHash('sha1').update(fs.readFileSync(p)).digest('hex').slice(0, 8) : ''; }
  return BUST[f] ? `${a}="../${f}?v=${BUST[f]}"` : m;
});
Object.keys(out).forEach((f) => fs.writeFileSync(path.join(OUT, f), bust(out[f]), 'utf8'));
console.log(`영문판(축약) 생성 완료: en/ ${Object.keys(out).length}쪽 (첫 화면 숫자 ${heroMeta.join('·')}, 연구소 ${rnd}, 로봇 ${generations}세대, 전화 ${intl(tel)}, 팩스 ${intl(fax)})`);
