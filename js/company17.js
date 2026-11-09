/* 시안C 17차: 회사 소개 — 가로 줄(연혁 · 인증서 · 특허증) ‹ › · 인증서 · 특허증 확대 보기
   34차: 위 메뉴 줄을 무인 솔루션과 같은 흰 메뉴 줄 · 네 화면으로 — 누르면 그 화면만 보인다(.c7-view). 예전 주소(#history · #credentials · #location 등)도 맞는 화면으로 간다.
   스크립트가 없으면 네 화면이 차례로 모두 보인다. */
(function () {
  var lnb = document.querySelector('.c7-lnb'), views = [].slice.call(document.querySelectorAll('.c7-view'));
  if (lnb && views.length) {
    var tabs = [].slice.call(lnb.querySelectorAll('.um-lnb__t a'));
    var MAP = { 'v-hist': 'hist', history: 'hist', overview: 'hist', greeting: 'hist', 'v-cred': 'cred', credentials: 'cred', 'v-org': 'org', organization: 'org', equipment: 'org', 'v-loc': 'loc', location: 'loc' };
    var hh = function () { var h = document.querySelector('header'); return h ? Math.max(0, h.getBoundingClientRect().bottom) : 80; };
    var go = function (el, smooth) { if (!el) return; var y = el.getBoundingClientRect().top + pageYOffset - hh() - lnb.offsetHeight + 1; scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' }); };
    var view = function (v) { views.forEach(function (x) { x.hidden = x.dataset.view !== v; }); tabs.forEach(function (a) { if (a.dataset.view === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); }); window.dispatchEvent(new Event('resize')); };
    var route = function (h, scroll, smooth) {
      var v = MAP[h]; if (!v) return false; view(v);
      if (!scroll) return true;
      var el = /^v-/.test(h) || h === 'greeting' ? (h === 'greeting' ? null : lnb) : document.getElementById(h);
      if (h === 'greeting') { scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' }); return true; }
      if (el === lnb) { var top = lnb.getBoundingClientRect().top; if (Math.abs(top - hh()) > 2) { var y = views.filter(function (x) { return !x.hidden; })[0]; go(y, smooth); } }
      else go(el, smooth);
      return true;
    };
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
      var h = a.getAttribute('href').slice(1); if (!MAP[h]) return;
      e.preventDefault(); if (history.replaceState) history.replaceState(null, '', '#' + h);
      route(h, true, true);
    });
    addEventListener('hashchange', function () { route(location.hash.slice(1), true, true); });
    var h0 = location.hash.slice(1);
    if (!route(h0, false)) view('hist');
    /* 다른 쪽에서 #location 같은 주소로 들어올 때: 글꼴 · 사진이 다 들어온 뒤 자리를 맞춘다(사용자가 이미 움직였으면 그대로) */
    if (MAP[h0] && h0 !== 'greeting') {
      var moved = false;
      ['wheel', 'touchstart', 'keydown'].forEach(function (t) { addEventListener(t, function () { moved = true; }, { once: true, passive: true }); });
      var fix = function () { if (!moved) route(h0, true, false); };
      addEventListener('load', function () { setTimeout(fix, 60); setTimeout(fix, 450); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(fix, 250); });
    }
  }
  [].forEach.call(document.querySelectorAll('[data-rail]'), function (r) {
    var tr = r.querySelector('.c7-rail__track'), pr = r.querySelector('.c7-rail__prog i'), bs = [].slice.call(r.querySelectorAll('.c7-rail__b'));
    function upd() { var max = tr.scrollWidth - tr.clientWidth, w = tr.clientWidth / tr.scrollWidth, x = max ? tr.scrollLeft / max : 0; pr.style.width = (w * 100) + '%'; pr.style.transform = 'translateX(' + (x * (1 / w - 1) * 100) + '%)'; bs[0].disabled = tr.scrollLeft < 4; bs[1].disabled = tr.scrollLeft > max - 4; }
    bs.forEach(function (b) { b.addEventListener('click', function () { var it = tr.children[0], g = parseFloat(getComputedStyle(tr).columnGap) || 0; tr.scrollBy({ left: (+b.dataset.d) * (it.offsetWidth + g), behavior: 'smooth' }); }); });
    tr.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  });
  var lb = document.querySelector('.c7-lb'); if (!lb) return;
  var st = lb.querySelector('.c7-lb__st'), im = st.querySelector('img'), list = [], cur = 0, back = null;
  function show(i) { cur = (i + list.length) % list.length; var c = list[cur]; im.src = c.querySelector('img').getAttribute('src').replace(/-440\.jpg$/, '-' + c.dataset.w + '.jpg');   /* 큰 그림 = 작은 그림과 같은 자리의 원본 크기 파일(시험 시안 test/ 의 ../ 도 그대로) */ im.alt = c.dataset.t + ' — ' + c.dataset.m; lb.querySelector('b').textContent = c.dataset.t; lb.querySelector('small').textContent = c.dataset.m; lb.querySelector('.c7-lb__n').textContent = (cur + 1) + ' / ' + list.length; st.classList.remove('is-zoom'); st.scrollTop = 0; }
  function open(c) { list = [].slice.call(document.querySelectorAll('.c7-cd[data-k="' + c.dataset.k + '"]')); back = c; lb.hidden = false; lb.classList.add('is-open'); document.body.style.overflow = 'hidden'; show(list.indexOf(c)); lb.querySelector('.c7-lb__x').focus(); }
  function close() { lb.classList.remove('is-open'); lb.hidden = true; document.body.style.overflow = ''; if (back) back.focus(); }
  [].forEach.call(document.querySelectorAll('.c7-cd'), function (c) { c.addEventListener('click', function () { open(c); }); });
  lb.querySelector('.c7-lb__x').addEventListener('click', close);
  [].forEach.call(lb.querySelectorAll('[data-go]'), function (b) { b.addEventListener('click', function () { show(cur + (+b.dataset.go)); }); });
  function zoom() { st.classList.toggle('is-zoom'); }
  im.addEventListener('click', zoom); lb.querySelector('.c7-lb__zb').addEventListener('click', zoom);
  st.addEventListener('click', function (e) { if (e.target === st && !st.classList.contains('is-zoom')) close(); });
  addEventListener('keydown', function (e) { if (!lb.classList.contains('is-open')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); });
  var sx = null; st.addEventListener('touchstart', function (e) { if (!st.classList.contains('is-zoom')) sx = e.touches[0].clientX; }, { passive: true });
  st.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); sx = null; });
})();

/* 시안C 18차: 문의 띠의 이메일 — 누르면 주소 복사(안 되면 주소 글자를 선택해 둔다). 화면 표시는 그림만 바뀌고, 화면낭독기에만 글로 알린다 */
(function () {
  [].forEach.call(document.querySelectorAll('.c7-end [data-copy]'), function (b) {
    var sr = b.querySelector('.sr-only'), addr = b.querySelector('.c7-end__addr'), t = null;
    function done() { b.classList.add('is-done'); sr.textContent = '이메일 주소를 복사했습니다'; clearTimeout(t); t = setTimeout(function () { b.classList.remove('is-done'); sr.textContent = ''; }, 1600); }
    function pick() { var r = document.createRange(); r.selectNodeContents(addr); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    b.addEventListener('click', function () {
      try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(b.dataset.copy).then(done, function () { pick(); done(); }); return; } } catch (e) {}
      pick(); done();
    });
  });
})();
/* 시안C 56차: 휴대폰에서 인사말은 첫 문단만 보이고, '인사말 전체 보기'로 펼친다 */
(function () {
  var box = document.querySelector('.c7-msg__b'), btn = box && box.querySelector('.c7-msg__more');
  if (!btn || !window.matchMedia('(max-width: 860px)').matches) return;
  box.classList.add('is-fold'); btn.hidden = false;
  btn.addEventListener('click', function () { var open = box.classList.toggle('is-open'); btn.setAttribute('aria-expanded', String(open)); btn.textContent = open ? '인사말 접기' : '인사말 전체 보기'; });
})();
