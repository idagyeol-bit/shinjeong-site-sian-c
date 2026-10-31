/* 시안C 16차: 사업분야 상세 — 위에 붙는 줄에서 지금 보고 있는 칸(개요 · 작업 방식 · 보유 장비 · 알아 두실 점 · 문의·사례)을 표시하고, 주소의 #칸으로 들어오면 자리를 맞춘다 */
(function () {
  var nav = document.querySelector('.s6-nav'); if (!nav) return;
  var ls = [].slice.call(nav.querySelectorAll('a[data-s]'));
  function spy() {
    var y = nav.getBoundingClientRect().bottom + 48, on = null;
    ls.forEach(function (l) { var el = document.getElementById(l.getAttribute('href').slice(1)); if (el && el.getBoundingClientRect().top < y) on = l; });
    if (!on && ls.length && document.getElementById('sv-ov').getBoundingClientRect().top < innerHeight * 0.6) on = ls[0];
    ls.forEach(function (l) { l.classList.toggle('is-on', l === on); });
  }
  addEventListener('scroll', spy, { passive: true }); addEventListener('resize', spy); spy();
  /* 다른 분야에서 #sv-ov 로 들어올 때: 글꼴·사진이 다 들어온 뒤 자리가 바뀌므로, 다 읽힌 다음 한 번 더 맞춘다 */
  addEventListener('load', function () {
    var id = location.hash.slice(1), el = id && document.getElementById(id);
    if (!el) return;
    /* 16차 보정(지시서 밖): 글꼴이 늦게 들어와 자리가 다시 바뀌는 경우가 있어, 글꼴이 다 들어온 뒤 한 번 더 맞춘다. 그 사이 사용자가 움직였으면 맞추지 않는다 */
    var moved = false;
    ['wheel', 'touchstart', 'keydown'].forEach(function (t) { addEventListener(t, function () { moved = true; }, { once: true, passive: true }); });
    var fix = function () { if (!moved) { el.scrollIntoView({ block: 'start', behavior: 'instant' }); spy(); } };
    setTimeout(fix, 60);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(fix, 250); });
  });
})();
