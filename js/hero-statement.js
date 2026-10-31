/* 신정개발 홈페이지 — 첫 화면 한 문장 + 바뀌는 현장 사진 (시안C 12차 v4, 큰 틀 'statement')
   - 글은 바뀌지 않는다. 6초마다 뒤의 사진, 사진 설명 한 줄, 그 사진에 맞는 아래 칸(data-item)만 바뀐다.
   - PC: 아래 칸에 마우스를 올리면 그 칸의 사진으로. 처음 한 번만 글이 아래에서 떠오른다.
   - 휴대폰: 첫 화면이 화면에 40% 넘게 보이는 동안 아래 고정 문의 띠(.mcta)를 숨긴다.
   - 움직임 줄이기: 첫 사진에 멈춘다. 다른 탭에 가 있으면 멈춘다. */
(function () {
  'use strict';
  var root = document.getElementById('heroS');
  if (!root) return;
  var imgs = [].slice.call(root.querySelectorAll('.heroS__img'));
  var items = [].slice.call(root.querySelectorAll('.heroS__glance li'));
  var cap = root.querySelector('.heroS__cap'), capT = cap && cap.querySelector('span');
  var DUR = 6000, k = 0, t = null;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(n) {
    k = (n + imgs.length) % imgs.length;
    imgs.forEach(function (im, i) {
      var on = i === k;
      if (on) { im.removeAttribute('loading'); im.classList.remove('is-on'); void im.offsetWidth; }
      im.classList.toggle('is-on', on);
    });
    var it = imgs[k].getAttribute('data-item');
    items.forEach(function (li, i) {
      var on = it !== null && String(i) === it;
      if (on) { li.classList.remove('is-on'); void li.offsetWidth; }
      li.classList.toggle('is-on', on);
    });
    if (cap) {
      var c = imgs[k].getAttribute('data-cap') || '';
      cap.classList.add('is-swap');
      setTimeout(function () { capT.textContent = c; cap.classList.remove('is-swap'); }, 250);
    }
    schedule();
  }
  function schedule() {
    clearTimeout(t); t = null;
    if (!reduce && !document.hidden && imgs.length > 1) t = setTimeout(function () { show(k + 1); }, DUR);
  }
  items.forEach(function (li) {
    li.addEventListener('mouseenter', function () {
      if (!window.matchMedia('(min-width: 961px)').matches) return;
      var i = li.getAttribute('data-i');
      for (var j = 0; j < imgs.length; j++) if (imgs[j].getAttribute('data-item') === i) { show(j); break; }
    });
  });
  document.addEventListener('visibilitychange', schedule);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      document.body.classList.toggle('is-heroS-in', es[0].intersectionRatio > 0.4);
    }, { threshold: [0, 0.4, 1] }).observe(root);
  }
  if (!reduce) document.documentElement.classList.add('heroS-intro');
  root.classList.add('is-ready');
  schedule();
})();
