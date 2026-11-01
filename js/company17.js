/* 시안C 17차: 회사 소개 — 위에 붙는 줄 표시 · 가로 줄(연혁 · 인증서 · 특허증) ‹ › · 인증서 · 특허증 확대 보기 */
(function () {
  var nav = document.querySelector('.c7-nav'); if (!nav) return;
  var ls = [].slice.call(nav.querySelectorAll('a'));
  function spy() { var y = nav.getBoundingClientRect().bottom + 80, on = null; ls.forEach(function (l) { var el = document.getElementById(l.getAttribute('href').slice(1)); if (el && el.getBoundingClientRect().top < y) on = l; }); ls.forEach(function (l) { l.classList.toggle('is-on', l === on); }); }
  addEventListener('scroll', spy, { passive: true }); spy();
  /* 다른 페이지에서 #location 같은 주소로 들어올 때: 글꼴 · 사진이 다 들어온 뒤 자리를 한 번 더 맞춘다 */
  addEventListener('load', function () { var id = location.hash.slice(1), el = id && document.getElementById(id); if (!el) return;
    /* 17차 보정(지시서 밖): 브라우저가 # 자리로 부드럽게 내려가는 도중에 맞추면 휴대폰에서 자리가 크게 어긋나는 경우가 있어, 지금 자리에 먼저 멈춘 뒤 맞추고, 조금 뒤와 글꼴이 다 들어온 뒤 한 번 더 맞춘다. 그 사이 사용자가 움직였으면 맞추지 않는다 */
    var moved = false;
    ['wheel', 'touchstart', 'keydown'].forEach(function (t) { addEventListener(t, function () { moved = true; }, { once: true, passive: true }); });
    var fix = function () { if (moved) return; window.scrollTo({ top: scrollY, behavior: 'instant' }); el.scrollIntoView({ block: 'start', behavior: 'instant' }); spy(); };
    setTimeout(fix, 60); setTimeout(fix, 450);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(fix, 250); });
  });
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
