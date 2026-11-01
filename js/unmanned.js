/* 신정개발 홈페이지 — 무인 솔루션 페이지 (시안C 14차 → 21차: 세 화면)
   - 흰 메뉴 줄(.um-lnb) 세 칸: 로봇 라인업(#robots) · 작업 방식(#method) · 연구개발 · 특허(#rnd). 누르면 그 화면(.um-view)만 보인다.
   - 예전 주소도 맞는 화면으로: #r-suction 등 → 로봇 라인업 + 그 로봇, #how · #why · #conditions · #compare → 작업 방식의 그 구역, #ask → 맨 아래 문의.
   - 로봇 상세(.um-rd)는 하나만 보인다(라인업 · 이전/다음 · 다른 페이지의 #r-… 링크로 바뀜).
   - 스크립트가 없으면 세 화면과 로봇 다섯이 차례로 모두 보인다. */
(function () {
  'use strict';
  var views = [].slice.call(document.querySelectorAll('.um-view'));
  var lnb = document.querySelector('.um-lnb');
  if (!views.length || !lnb) return;
  var tabs = [].slice.call(lnb.querySelectorAll('.um-lnb__t a'));
  var ds = [].slice.call(document.querySelectorAll('.um-rd'));
  var bots = [].slice.call(document.querySelectorAll('.um-bot'));
  var MAP = { robots: 'robots', method: 'method', compare: 'method', how: 'method', why: 'method', conditions: 'method', rnd: 'rnd' };
  document.documentElement.classList.add('um-js');
  function headerH() { var v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')); return isNaN(v) ? 80 : v; }
  function go(el, under) { window.scrollTo(0, el.getBoundingClientRect().top + window.pageYOffset - headerH() - (under ? lnb.offsetHeight : 0) + 1); }
  function view(v) {
    views.forEach(function (x) { x.hidden = x.dataset.view !== v; });
    tabs.forEach(function (a) { if (a.dataset.view === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  }
  function bot(id) {
    var d = ds.filter(function (x) { return x.id === id; })[0] || ds[0];
    ds.forEach(function (x) { x.hidden = x !== d; });
    bots.forEach(function (b) { b.setAttribute('aria-current', b.getAttribute('href') === '#' + d.id ? 'true' : 'false'); });
  }
  function route(h, scroll) {
    if (/^r-/.test(h) && document.getElementById(h)) { view('robots'); bot(h); if (scroll) go(document.querySelector('.um-details'), true); return true; }
    if (h === 'ask') { if (!lnb.querySelector('[aria-current]')) view('robots'); var a = document.getElementById('ask'); if (a && scroll) go(a, true); return true; }
    var v = MAP[h]; if (!v) { view('robots'); return false; }
    view(v);
    if (scroll) go(h === v ? views.filter(function (x) { return !x.hidden; })[0] : document.getElementById(h), true);   /* 화면 이름이면 그 화면 맨 위(메뉴 줄 바로 밑)로 */
    return true;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var h = a.getAttribute('href').slice(1);
    if (!(MAP[h] || h === 'ask' || (/^r-/.test(h) && document.getElementById(h)))) return;
    e.preventDefault();
    if (history.replaceState) history.replaceState(null, '', '#' + h);
    route(h, true);
  });
  window.addEventListener('hashchange', function () { route(location.hash.slice(1), true); });
  bot(ds.length ? ds[0].id : '');
  var first = location.hash.slice(1);
  route(first, false);
  /* 다른 페이지에서 #conditions 같은 주소로 들어오면, 글꼴 · 사진이 다 들어온 뒤 그 자리로 */
  if (first) window.addEventListener('load', function () { setTimeout(function () { route(first, true); }, 60); });
})();
