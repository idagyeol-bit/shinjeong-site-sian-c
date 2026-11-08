/* 시안C 16차 → 35차: 사업분야 상세 — 흰 메뉴 줄(.s6-lnb) 세 화면(작업 방식 · 보유 장비 · 알아 두실 점). 누르면 그 화면만 보인다(.s6-view).
   쪽 안 주소(#sv-how · #st-3 · #sv-eq · #sv-note · 그 안의 어떤 id 든)는 그 id 가 들어 있는 화면을 열고 그 자리로 간다. #sv-ov · #sv-end 는 화면을 바꾸지 않고 자리만.
   스크립트가 없으면 세 화면이 차례로 모두 보인다. */
(function () {
  var lnb = document.querySelector('.s6-lnb'), views = [].slice.call(document.querySelectorAll('.s6-view'));
  if (!lnb || !views.length) return;
  var tabs = [].slice.call(lnb.querySelectorAll('.um-lnb__t a'));
  var hh = function () { var h = document.querySelector('header'); return h ? Math.max(0, h.getBoundingClientRect().bottom) : 80; };
  var go = function (el, under, smooth) { if (!el) return; var y = el.getBoundingClientRect().top + pageYOffset - hh() - (under ? lnb.offsetHeight : 0) + 1; scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' }); };
  var view = function (v) { views.forEach(function (x) { x.hidden = x.dataset.view !== v; }); tabs.forEach(function (a) { if (a.dataset.view === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); }); window.dispatchEvent(new Event('resize')); };
  var viewOf = function (h) { var m = /^v-(.+)$/.exec(h); if (m && views.some(function (x) { return x.dataset.view === m[1]; })) return m[1]; var el = h && document.getElementById(h); var w = el && el.closest && el.closest('.s6-view'); return w ? w.dataset.view : null; };
  var route = function (h, smooth) {
    var el = h && document.getElementById(h);
    if (h === 'sv-ov') { scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' }); return true; }
    if (h === 'sv-end') { go(el, true, smooth); return true; }
    var v = viewOf(h); if (!v) return false;
    view(v);
    if (/^v-/.test(h)) { var top = lnb.getBoundingClientRect().top; if (Math.abs(top - hh()) > 2) go(document.getElementById(h), true, smooth); }
    else go(el, true, smooth);
    return true;
  };
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    var h = a.getAttribute('href').slice(1); if (!(h === 'sv-ov' || h === 'sv-end' || viewOf(h))) return;
    e.preventDefault(); if (history.replaceState) history.replaceState(null, '', '#' + h);
    route(h, true);
  });
  addEventListener('hashchange', function () { route(location.hash.slice(1), true); });
  var h0 = location.hash.slice(1), v0 = viewOf(h0);
  view(v0 || views[0].dataset.view);
  /* 다른 쪽에서 #sv-eq 같은 주소로 들어올 때: 글꼴 · 사진이 다 들어온 뒤 자리를 맞춘다(사용자가 이미 움직였으면 그대로) */
  if (h0 && h0 !== 'sv-ov' && (v0 || h0 === 'sv-end')) {
    var moved = false;
    ['wheel', 'touchstart', 'keydown'].forEach(function (t) { addEventListener(t, function () { moved = true; }, { once: true, passive: true }); });
    var fix = function () { if (!moved) route(h0, false); };
    addEventListener('load', function () { setTimeout(fix, 60); setTimeout(fix, 450); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(fix, 250); });
  } else if (h0 === 'sv-ov') { addEventListener('load', function () { scrollTo(0, 0); }); }
})();
