/* 시안C 41차: 소식 — 분류 단추로 목록 거르기(전체 · 인터뷰 · 기업 선정 · 지역 나눔). 스크립트가 없으면 모두 보인다 */
(function () {
  var bs = [].slice.call(document.querySelectorAll('.nw4-f button')), rows = [].slice.call(document.querySelectorAll('.nw4-list > .nr'));
  var n = document.querySelector('[data-nw-n]'), empty = document.querySelector('.nw4-empty');
  if (!bs.length) return;
  function go(f) {
    var k = 0;
    bs.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.f === f)); });
    rows.forEach(function (r) { var on = f === 'all' || r.dataset.kind === f; r.hidden = !on; if (on) k++; });
    if (n) n.textContent = k;
    if (empty) empty.hidden = k > 0;
  }
  bs.forEach(function (b) { b.addEventListener('click', function () { go(b.dataset.f); }); });
})();
