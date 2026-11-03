/* 신정개발 홈페이지 — 메인 첫 화면 사진 영화(시안C 24차, 큰 틀 'film')
   - 일곱 장면을 3.9초씩(HOME24.dur) 천천히 확대하며 교차 · 왼쪽 아래 진행 줄 · 오른쪽 아래 사진 설명
   - 처음 한 번: 흰 바탕에 글이 먼저, 그 뒤로 현장이 떠오르고 글이 흰색이 된다(.hf-lit)
   - 첫 화면이 안 보이거나 탭이 숨으면 멈춘다. 움직임 줄이기면 첫 장면에 멈춘다. 다음 장면 사진은 그때그때 받는다(data-src)
   - 단면도(.hs)는 보일 때 선이 그려진다(.is-in). 스크립트가 없으면 첫 장면 · 글 · 단면도가 그대로 보인다 */
(function () {
  'use strict';
  var html = document.documentElement;
  var hero = document.getElementById('hero');
  var imgs = [].slice.call(document.querySelectorAll('.hf__img'));
  var segs = [].slice.call(document.querySelectorAll('.hf__seg li'));
  var cap = document.querySelector('.hf__cap');
  var DUR = 3900, i = 0, timer = null, visible = true;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.style.setProperty('--hf-dur', DUR + 'ms');
  function show(k) {
    imgs.forEach(function (im, j) { im.classList.toggle('is-on', j === k); if (j === k) im.classList.toggle('alt', k % 2 === 1); });
    segs.forEach(function (s, j) { s.classList.toggle('is-on', j === k); s.classList.toggle('is-done', j < k); });
    if (cap) cap.textContent = imgs[k].getAttribute('data-cap') || '';
    /* 다음 사진 미리 받기 */
    var n = imgs[(k + 1) % imgs.length]; if (n && n.dataset.src) { if (n.dataset.srcset) { n.srcset = n.dataset.srcset; delete n.dataset.srcset; } n.src = n.dataset.src; delete n.dataset.src; }
  }
  function next() { i = (i + 1) % imgs.length; show(i); }
  function start() { if (reduce || timer || imgs.length < 2) return; timer = setInterval(next, DUR); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  if (imgs.length) show(0);
  requestAnimationFrame(function () {
    setTimeout(function () { html.classList.add('hf-in'); }, 120);
    setTimeout(function () { html.classList.add('hf-lit'); if (visible) start(); }, 520);
  });
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      document.body.classList.toggle('is-heroS-in', visible && es[0].intersectionRatio > 0.2);
      if (visible && html.classList.contains('hf-lit')) start(); else stop();
    }, { threshold: [0, 0.2, 0.6] }).observe(hero);
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (visible && html.classList.contains('hf-lit')) start(); });
  /* 단면도: 보일 때 그리기 */
  var hs = document.querySelector('.hs');
  if (hs && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) hs.classList.add('is-in'); }); }, { threshold: 0.3 }).observe(hs);
  } else if (hs) hs.classList.add('is-in');
})();
