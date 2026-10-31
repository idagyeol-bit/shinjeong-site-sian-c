/* 신정개발 홈페이지 — 적용 사례 페이지 (시안C 13차)
   - 주소 끝 #s01 등으로 그 분야 하나만 보인다(없거나 모르는 값이면 첫 분야). 위 분야 탭은 지금 분야에 밑줄.
   - 목록이 5줄을 넘으면 5줄만 보이고 '전체 N건 보기'로 펼친다.
   - 스크립트가 없으면 다섯 분야가 모두 보인다. */
(function () {
  'use strict';
  var arts = [].slice.call(document.querySelectorAll('.csd'));
  var tabs = [].slice.call(document.querySelectorAll('.csd-nav a'));
  if (!arts.length) return;
  document.documentElement.classList.add('csd-js');
  function route(first) {
    var id = location.hash.replace('#', '');
    var on = arts.filter(function (a) { return a.id === id; })[0] || arts[0];
    arts.forEach(function (a) { a.hidden = a !== on; });
    tabs.forEach(function (t) { if (t.getAttribute('href') === '#' + on.id) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
    var cur = tabs.filter(function (t) { return t.getAttribute('aria-current'); })[0];
    if (cur && cur.scrollIntoView) cur.parentNode.scrollLeft = cur.offsetLeft - 20;
    if (!first) { var nav = document.querySelector('.csd-nav'); window.scrollTo(0, nav ? nav.offsetTop - 60 : 0); }
  }
  [].forEach.call(document.querySelectorAll('.csd__rows'), function (ul) {
    var btn = ul.nextElementSibling;
    if (!btn || !btn.classList.contains('csd__more')) return;
    if (ul.children.length > 5) {
      ul.classList.add('is-folded'); btn.hidden = false; btn.textContent = '전체 ' + ul.children.length + '건 보기';
      btn.addEventListener('click', function () { ul.classList.remove('is-folded'); btn.hidden = true; });
    }
  });
  window.addEventListener('hashchange', function () { route(false); });
  route(true);
})();
