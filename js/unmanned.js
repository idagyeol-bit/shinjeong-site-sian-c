/* 신정개발 홈페이지 — 무인 솔루션 페이지 (시안C 14차)
   - 로봇 상세(.um-rd)는 하나만 보인다. 주소 끝 #r-suction 등이면 그 로봇, 아니면 첫 로봇.
   - 라인업 · 탭 · 이전/다음 · 비교표의 #r-… 링크를 누르면 그 로봇으로 바꾸고 상세 맨 위로 옮긴다.
   - 위에 붙는 탭(.um-nav)은 지금 보는 곳에 밑줄. 스크립트가 없으면 로봇 다섯이 모두 보인다. */
(function () {
  'use strict';
  var ds = [].slice.call(document.querySelectorAll('.um-rd'));
  var nav = document.querySelector('.um-nav');
  if (!ds.length || !nav) return;
  var bots = [].slice.call(document.querySelectorAll('.um-bot'));
  var links = [].slice.call(nav.querySelectorAll('a'));
  var box = document.querySelector('.um-details');
  var secs = ['compare', 'how', 'why', 'conditions', 'rnd'].map(function (id) { return document.getElementById(id); }).filter(Boolean);
  function headerH() { var v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')); return isNaN(v) ? 80 : v; }
  function current() { return ds.filter(function (d) { return !d.hidden; })[0] || ds[0]; }
  function spy() {
    var href = '#' + current().id;
    var line = nav.getBoundingClientRect().bottom + 40;
    secs.forEach(function (s) { if (s.getBoundingClientRect().top < line) href = '#' + s.id; });
    links.forEach(function (a) {
      var on = a.getAttribute('href') === href || (a.classList.contains('um-nav__m') && /^#r-/.test(href));
      a.classList.toggle('is-on', on);
      if (on && a.offsetParent && a.parentNode.scrollWidth > a.parentNode.clientWidth) a.parentNode.scrollLeft = a.offsetLeft - 20;
    });
  }
  function show(id, scroll) {
    var d = ds.filter(function (x) { return x.id === id; })[0];
    if (!d) return false;
    ds.forEach(function (x) { x.hidden = x !== d; });
    bots.forEach(function (b) { b.setAttribute('aria-current', b.getAttribute('href') === '#' + d.id ? 'true' : 'false'); });
    if (scroll) window.scrollTo(0, box.getBoundingClientRect().top + window.pageYOffset - headerH() - nav.offsetHeight + 1);
    spy();
    return true;
  }
  document.documentElement.classList.add('um-js');
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#r-"]') : null;
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!document.getElementById(id)) return;
    e.preventDefault();
    if (history.replaceState) history.replaceState(null, '', '#' + id);
    show(id, true);
  });
  window.addEventListener('hashchange', function () { var id = location.hash.slice(1); if (/^r-/.test(id)) show(id, true); });
  window.addEventListener('scroll', spy, { passive: true });
  var first = location.hash.slice(1);
  if (!(/^r-/.test(first) && show(first, true))) show(ds[0].id, false);
})();
