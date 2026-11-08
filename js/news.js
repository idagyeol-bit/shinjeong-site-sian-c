/* 시안C 37차: 소식 — 분류 단추(전체 · 로봇 · 연구 · 인증 · 수상 · 언론 보도 · 지역 나눔)로 카드 거르기. 스크립트가 없으면 모두 보인다 */
(function () {
  var bs = [].slice.call(document.querySelectorAll('.nw-f button')), cards = [].slice.call(document.querySelectorAll('.nw-list .nw-card'));
  if (!bs.length) return;
  function go(f) {
    bs.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.f === f)); });
    cards.forEach(function (c) { c.hidden = !(f === 'all' || c.dataset.cat === f); });
  }
  bs.forEach(function (b) { b.addEventListener('click', function () { go(b.dataset.f); if (history.replaceState) history.replaceState(null, '', b.dataset.f === 'all' ? location.pathname : '#' + b.dataset.f); }); });
  var h = location.hash.slice(1); if (h && bs.some(function (b) { return b.dataset.f === h; })) go(h);
})();
