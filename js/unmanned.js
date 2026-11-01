/* 신정개발 홈페이지 — 무인 솔루션 페이지 (시안C 14차 → 21차: 세 화면 → 22차: 로봇 라인업 여섯)
   - 흰 메뉴 줄(.um-lnb) 세 칸: 로봇 라인업(#robots) · 작업 방식(#method) · 연구개발 · 특허(#rnd). 누르면 그 화면(.um-view)만 보인다.
   - 로봇 라인업: 고르기(.rl-b, 현장 장비 셋 · 연구개발 시제품 셋) → 고른 로봇 상세(.rl-d) 하나 → 로봇과 함께 쓰는 장비(#with).
     상세 안에서 사진 바꾸기(.rl-th__b), 세대 · 크기 · 모델 바꾸기(.rl-seg). 무인 로더는 크기를 바꾸면 사진도 바뀐다(data-photo).
   - 예전 주소도 맞는 곳으로: #r-suction · #r-crusher → #r-vacuum, #r-cctv → #with, #how · #why · #conditions · #compare → 작업 방식의 그 구역, #ask → 맨 아래 문의.
   - 머리글 높이는 --header-h 가 calc() 라 숫자로 읽히지 않으므로 머리글(header) 아래끝을 잰다(21차 어긋남 고침).
   - 스크립트가 없으면 세 화면과 로봇 여섯이 차례로 모두 보인다. */
(function () {
  'use strict';
  var views = [].slice.call(document.querySelectorAll('.um-view'));
  var lnb = document.querySelector('.um-lnb');
  if (!views.length || !lnb) return;
  var tabs = [].slice.call(lnb.querySelectorAll('.um-lnb__t a'));
  var ds = [].slice.call(document.querySelectorAll('.rl-d'));
  var picks = [].slice.call(document.querySelectorAll('.rl-b'));
  var MAP = { robots: 'robots', with: 'robots', method: 'method', compare: 'method', how: 'method', why: 'method', conditions: 'method', rnd: 'rnd' };
  var OLD = { 'r-suction': 'r-vacuum', 'r-crusher': 'r-vacuum', 'r-cctv': 'with' };
  document.documentElement.classList.add('um-js');
  function headerH() { var h = document.querySelector('header'); return h ? Math.max(0, h.getBoundingClientRect().bottom) : 80; }
  function go(el, under, smooth) {
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.pageYOffset - headerH() - (under ? lnb.offsetHeight : 0) + 1;
    window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' });
  }
  function view(v) {
    views.forEach(function (x) { x.hidden = x.dataset.view !== v; });
    tabs.forEach(function (a) { if (a.dataset.view === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  }
  function bot(id) {
    var d = ds.filter(function (x) { return x.id === id; })[0] || ds[0];
    if (!d) return;
    ds.forEach(function (x) { x.hidden = x !== d; });
    picks.forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('href') === '#' + d.id ? 'true' : 'false'); });
  }
  function route(h, scroll) {
    h = OLD[h] || h;
    if (/^r-/.test(h) && document.getElementById(h)) { view('robots'); bot(h); if (scroll) go(document.querySelector('.rl-ds'), true, false); return true; }
    if (h === 'ask') { if (!lnb.querySelector('[aria-current]')) view('robots'); if (scroll) go(document.getElementById('ask'), true); return true; }
    var v = MAP[h]; if (!v) { view('robots'); return false; }
    view(v);
    if (scroll) go(h === v ? views.filter(function (x) { return !x.hidden; })[0] : document.getElementById(h), true);   /* 화면 이름이면 그 화면 맨 위(메뉴 줄 바로 밑)로 */
    return true;
  }
  /* 로봇 고르기 · '다음 로봇': 상세가 화면 위쪽 절반 안에 있으면 그대로, 아니면 상세 머리로 부드럽게 */
  function pickBot(id) {
    view('robots'); bot(id);
    var box = document.querySelector('.rl-ds');
    var top = box.getBoundingClientRect().top, off = headerH() + lnb.offsetHeight;
    if (top < off || top > window.innerHeight * 0.55) go(box, true, true);
  }
  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    var th = e.target.closest('.rl-th__b');
    if (th) {
      var d = th.closest('.rl-d'), img = d.querySelector('.rl-ph img'), src = th.querySelector('img');
      img.srcset = src.srcset; img.src = src.src; img.alt = src.alt;
      d.querySelector('.rl-ph figcaption').textContent = th.dataset.cap;
      [].forEach.call(d.querySelectorAll('.rl-th__b'), function (b) { b.setAttribute('aria-pressed', b === th ? 'true' : 'false'); });
      return;
    }
    var sb = e.target.closest('.rl-seg button');
    if (sb) {
      var v = sb.closest('.rl-var');
      [].forEach.call(v.querySelectorAll('.rl-seg button'), function (b) { b.setAttribute('aria-pressed', b === sb ? 'true' : 'false'); });
      [].forEach.call(v.querySelectorAll('.rl-var__p'), function (p) { p.hidden = p.dataset.p !== sb.dataset.v; });
      if (v.hasAttribute('data-photo')) { var t = v.closest('.rl-d').querySelectorAll('.rl-th__b')[+sb.dataset.v]; if (t) t.click(); }
      return;
    }
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var h = a.getAttribute('href').slice(1);
    if (/^r-/.test(h) && document.getElementById(h)) { e.preventDefault(); if (history.replaceState) history.replaceState(null, '', '#' + h); pickBot(h); return; }
    h = OLD[h] || h;
    if (!(MAP[h] || h === 'ask')) return;
    e.preventDefault();
    if (history.replaceState) history.replaceState(null, '', '#' + h);
    route(h, true);
  });
  window.addEventListener('hashchange', function () { route(location.hash.slice(1), true); });
  bot(ds.length ? ds[0].id : '');
  var first = location.hash.slice(1);
  route(first, false);
  /* 다른 페이지에서 #conditions · #r-wall 같은 주소로 들어오면, 글꼴 · 사진이 다 들어온 뒤 그 자리로 */
  if (first) window.addEventListener('load', function () { setTimeout(function () { route(first, true); }, 60); });
})();
