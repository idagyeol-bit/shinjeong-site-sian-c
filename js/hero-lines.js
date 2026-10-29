/* 신정개발 홈페이지 — 첫 화면 세 줄 카피 5장면 (시안C 12차, 큰 틀 'lines')
   - 7초마다 다음 장면(교차 흐림 1.1초). 장면이 켜질 때 .is-play 를 붙여 사진 다가옴·세 줄 떠오름을 처음부터(css/site.css 의 .heroL 규칙).
   - 아래 이름을 누르면 그 장면으로. 멈춤 단추로 자동 전환을 멈추고 다시 켠다. ← → 키도 된다.
   - 휴대폰: 옆으로 밀면 넘기고, 길게 누르고 있으면 잠시 멈춘다(손을 떼면 이어서).
   - 세 줄이 언제나 세 줄: 가장 긴 줄이 화면 폭을 넘으면 그 장면의 글자만 줄인다.
   - 움직임 줄이기: 처음부터 멈춘 상태(1장면). 다른 탭에 가 있으면 멈춘다.
   - 화면에 보이는 글은 HTML 에만 있다. */
(function () {
  'use strict';
  var root = document.getElementById('heroL');
  if (!root) return;
  var S = [].slice.call(root.querySelectorAll('.heroL__s'));
  var B = [].slice.call(root.querySelectorAll('.heroL__tabs button'));
  var pp = root.querySelector('[data-pp]');
  var n = S.length;
  var DUR = 7000;   // css 의 --heroL-dur(7s)과 같은 값
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = 0, timer = null, playing = !reduce && n > 1, left = DUR, started = 0, held = false;

  function fit() {
    S.forEach(function (s) {
      var h = s.querySelector('.heroL__h');
      if (!h) return;
      h.style.fontSize = '';
      var box = h.clientWidth, w = 0;
      [].forEach.call(h.querySelectorAll('.heroL__ln > span'), function (x) { w = Math.max(w, x.scrollWidth); });
      if (w > box && box > 0) h.style.fontSize = (parseFloat(getComputedStyle(h).fontSize) * box / w * 0.98) + 'px';
    });
  }
  function restartFill() {
    var b = B[cur]; if (!b) return;
    b.removeAttribute('aria-current'); void b.offsetWidth; b.setAttribute('aria-current', 'true');
  }
  function go(i) {
    cur = (i + n) % n;
    S.forEach(function (s, k) {
      var on = k === cur;
      s.classList.toggle('is-on', on);
      if (on) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
    });
    var s = S[cur];
    s.classList.remove('is-play'); void s.offsetWidth;
    if (!reduce) s.classList.add('is-play');
    B.forEach(function (b, k) { if (k === cur) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    restartFill();
  }
  function schedule(ms) {
    clearTimeout(timer); timer = null;
    left = ms || DUR; started = Date.now();
    if (playing && !held && !document.hidden) timer = setTimeout(function () { go(cur + 1); schedule(); }, left);
  }
  function setPlaying(on) {
    playing = on;
    root.classList.toggle('is-playing', on);
    if (pp) pp.setAttribute('aria-label', on ? '자동 전환 멈춤' : '자동 전환 재생');
    restartFill();
    schedule();
  }
  function jump(i) { go(i); schedule(); }
  function hold(on) {
    if (!playing) return;
    held = on;
    root.classList.toggle('is-hold', on);
    if (on) { clearTimeout(timer); left -= Date.now() - started; }
    else schedule(Math.max(400, left));
  }

  B.forEach(function (b) { b.addEventListener('click', function () { jump(Number(b.getAttribute('data-to'))); }); });
  if (pp) pp.addEventListener('click', function () { setPlaying(!playing); });
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); jump(cur - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); jump(cur + 1); }
  });
  var x0 = null, y0 = 0, ht = null, wasHeld = false;
  root.addEventListener('touchstart', function (e) {
    if (e.target.closest && e.target.closest('button, a')) return;
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; wasHeld = false;
    ht = setTimeout(function () { wasHeld = true; hold(true); }, 350);
  }, { passive: true });
  root.addEventListener('touchmove', function (e) {
    if (x0 === null) return;
    if (Math.abs(e.touches[0].clientX - x0) > 10 || Math.abs(e.touches[0].clientY - y0) > 10) clearTimeout(ht);
  }, { passive: true });
  root.addEventListener('touchend', function (e) {
    clearTimeout(ht);
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if (wasHeld) { hold(false); return; }
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.2) jump(dx < 0 ? cur + 1 : cur - 1);
  });
  document.addEventListener('visibilitychange', function () { restartFill(); schedule(); });
  window.addEventListener('resize', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

  fit();
  root.classList.add('is-ready');
  go(0);
  setPlaying(playing);
})();
