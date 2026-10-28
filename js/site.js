/* ============================================================
   신정개발 — 공통 스크립트
   헤더 고정/투명 전환 · 모바일 메뉴 · 스크롤 등장 · 숫자 카운트 · 맨 위로
   (외부 라이브러리 없음. 자바스크립트가 꺼져 있어도 내용은 모두 보입니다.)
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 스크립트가 살아 있을 때만 등장 효과를 켠다 */
  document.documentElement.classList.add('js-on');

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- 1. 헤더: 스크롤하면 흰 배경으로 ---------- */
    var hdr = document.querySelector('.hdr');
    if (hdr) {
      var onScroll = function () {
        hdr.classList.toggle('is-scrolled', window.scrollY > 24);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ---------- 1-2. 히어로 등장 ---------- */
    var hero = document.querySelector('.hero');
    if (hero) {
      // 다음 프레임에 클래스를 붙여 전환이 확실히 일어나게 한다.
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { hero.classList.add('is-in'); });
      });
      // 어떤 이유로든 위가 실패하더라도 1.2초 뒤에는 반드시 보이게 한다.
      setTimeout(function () { hero.classList.add('is-in'); }, 1200);
    }

    /* ---------- 2. 모바일 전체 메뉴 ---------- */
    var burger = document.querySelector('.burger');
    var drawer = document.getElementById('drawer');
    if (burger && drawer) {
      var setMenu = function (open) {
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
        drawer.classList.toggle('is-open', open);
        drawer.setAttribute('aria-hidden', String(!open));
        document.documentElement.classList.toggle('is-locked', open);
      };
      setMenu(false);
      burger.addEventListener('click', function () {
        setMenu(burger.getAttribute('aria-expanded') !== 'true');
      });
      drawer.addEventListener('click', function (e) {
        if (e.target.closest('a')) setMenu(false);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
          setMenu(false);
          burger.focus();
        }
      });
      // 데스크톱 폭으로 넓어지면 메뉴를 닫는다
      var mq = window.matchMedia('(min-width: 961px)');
      var mqHandler = function (e) { if (e.matches) setMenu(false); };
      if (mq.addEventListener) mq.addEventListener('change', mqHandler);
      else if (mq.addListener) mq.addListener(mqHandler);
    }

    /* ---------- 3. 스크롤 등장 ---------- */
    var targets = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!targets.length) { /* 없음 */ }
    else if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
          if (delay) el.style.transitionDelay = (delay / 1000) + 's';
          el.classList.add('is-in');
          io.unobserve(el);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
      targets.forEach(function (el) { io.observe(el); });
    }

    /* ---------- 4. 숫자 카운트 ---------- */
    var nums = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
    if (nums.length) {
      var run = function (el) {
        var end = parseFloat(el.getAttribute('data-count'));
        if (isNaN(end)) return;
        if (reduce) { el.textContent = String(end); return; }
        var dur = 1000, t0 = null;   // 시안B 16차: 약 1초(HTML 원문 숫자는 그대로, 표시만 0→제 값)
        var step = function (t) {
          if (t0 === null) t0 = t;
          var p = Math.min((t - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(end * eased));
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = String(end);
        };
        requestAnimationFrame(step);
      };
      if (!('IntersectionObserver' in window)) {
        nums.forEach(run);
      } else {
        var io2 = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            run(entry.target);
            io2.unobserve(entry.target);
          });
        }, { threshold: 0.4 });
        nums.forEach(function (el) { io2.observe(el); });
      }
    }

    /* ---------- 5. 맨 위로 ---------- */
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-totop]');
      if (!btn) return;
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      var skip = document.querySelector('.skip-link');
      if (skip) skip.focus({ preventScroll: true });
    });

    /* ---------- 5-2. 사업분야 하위 메뉴: Esc로 닫기 ---------- */
    /* 여는 것은 CSS(:hover·:focus-within)가 맡고, 여기서는 Esc로 닫는 것만 처리한다. */
    Array.prototype.forEach.call(document.querySelectorAll('.gnb__item[data-sub]'), function (item) {
      var top = item.querySelector('a');
      // 마우스만 올려 둔 상태에서도 닫히도록 문서 전체에서 Esc를 받는다.
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        var hasFocus = item.contains(document.activeElement);
        if (!hasFocus && !item.matches(':hover')) return;
        item.classList.add('is-esc');
        if (hasFocus && top) top.focus();
      });
      item.addEventListener('mouseleave', function () { item.classList.remove('is-esc'); });
      item.addEventListener('focusout', function (e) { if (!item.contains(e.relatedTarget)) item.classList.remove('is-esc'); });
    });

    /* ---------- 5-3. 장비·로봇: 보유 장비 분야 탭 (24차) ---------- */
    /* HTML에는 여섯 묶음이 모두 보이게 들어 있고, 여기서만 숨긴다(스크립트가 없으면 탭은 묶음으로 가는 링크). */
    var eqSec = document.getElementById('equipment');
    var eqTabs = eqSec && eqSec.querySelector('.eqtabs');
    if (eqTabs) {
      var eqGroups = Array.prototype.slice.call(eqSec.querySelectorAll('.eqgroup'));
      var eqBtns = Array.prototype.slice.call(eqTabs.querySelectorAll('a[data-eq]'));
      var isGroup = function (id) { return eqGroups.some(function (g) { return g.id === id; }); };
      var eqShow = function (id) {
        var all = !isGroup(id);
        eqGroups.forEach(function (g) {
          var on = all || g.id === id;
          g.hidden = !on;
          if (on) g.classList.add('is-in');      // 탭으로 나타난 묶음이 투명한 채로 남지 않게
        });
        eqBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-eq') === (all ? 'equipment' : id))); });
      };
      // 묶음 주소로 들어왔을 때: '보유 장비' 제목이 상단 메뉴 바로 아래에 보이게
      var eqToTitle = function () {
        var head = eqSec.querySelector('.head');
        var hh = hdr ? hdr.offsetHeight : 0;
        var top = head.getBoundingClientRect().top + window.pageYOffset - hh - 24;
        var html = document.documentElement;
        var prev = html.style.scrollBehavior;
        html.style.scrollBehavior = 'auto';
        window.scrollTo(0, Math.max(0, top));
        html.style.scrollBehavior = prev;
      };
      var eqFromHash = function (scroll) {
        var h = decodeURIComponent(location.hash.slice(1));
        if (h && h !== 'equipment' && !isGroup(h)) return;   // #rnd, #recovery 등은 원래대로
        eqShow(h);
        if (scroll && h) eqToTitle();
      };
      eqBtns.forEach(function (b) {
        b.setAttribute('role', 'button');
        b.addEventListener('click', function (e) {
          e.preventDefault();
          var id = b.getAttribute('data-eq');
          eqShow(id);
          if (history.replaceState) history.replaceState(null, '', '#' + id);   // 화면이 튀지 않게, 뒤로 가기 기록도 늘리지 않음
        });
        b.addEventListener('keydown', function (e) {
          if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); b.click(); }
        });
      });
      eqFromHash(true);
      // 브라우저가 주소의 위치로 늦게 스크롤하는 경우가 있어, 사용자가 직접 스크롤하기 전까지 몇 번 더 맞춘다
      var eqUserMoved = false;
      var eqMark = function () { eqUserMoved = true; };
      ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) { window.addEventListener(ev, eqMark, { passive: true, once: true }); });
      var eqAgain = function () { if (!eqUserMoved && isGroup(decodeURIComponent(location.hash.slice(1)))) eqToTitle(); };
      window.addEventListener('load', function () {
        eqAgain();
        requestAnimationFrame(eqAgain);
        setTimeout(eqAgain, 120);
        setTimeout(eqAgain, 400);
      });
      window.addEventListener('hashchange', function () { eqFromHash(true); });
    }

    /* ---------- 5-1. 사업분야 차트 간결판(시안C 5차): 휴대폰 가로 넘김 위치를 점으로 표시 ---------- */
    var chDots = document.querySelector('[data-chart-dots]');
    var chGrid = chDots && chDots.parentNode.querySelector('.bizCh__grid');
    if (chDots && chGrid) {
      var chCards = chGrid.querySelectorAll('.bizCh__card'), chI = chDots.querySelectorAll('i'), chLab = chDots.querySelector('span');
      var chUpd = function () {
        if (!chCards.length) return;
        var w = chCards[0].getBoundingClientRect().width + 12;            // 카드 너비 + css 의 gap
        var i = Math.max(0, Math.min(chCards.length - 1, Math.round(chGrid.scrollLeft / w)));
        for (var k = 0; k < chI.length; k++) chI[k].className = k === i ? 'on' : '';
        if (chLab) chLab.textContent = (i + 1) + ' / ' + chCards.length;
      };
      chGrid.addEventListener('scroll', chUpd, { passive: true });
      window.addEventListener('resize', chUpd);
      chUpd();
    }

    /* ---------- 5-2. 주요 수행 이력 분류 탭(시안C 6차): 누르면 그 분류만, 화살표 키로 이동 ---------- */
    var rtBar = document.querySelector('.rtab__bar');
    if (rtBar) {
      var rtTabs = Array.prototype.slice.call(rtBar.querySelectorAll('[role="tab"]'));
      var rtShow = function (tab) {
        rtTabs.forEach(function (t) {
          var on = t === tab; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1;
          var p = document.getElementById(t.getAttribute('aria-controls'));
          if (p) { if (on) { p.removeAttribute('hidden'); p.classList.add('is-in'); } else p.setAttribute('hidden', ''); }
        });
        if (tab.scrollIntoView) tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      };
      rtTabs.forEach(function (t, i) {
        t.addEventListener('click', function () { rtShow(t); });
        t.addEventListener('keydown', function (e) {
          var j = i;
          if (e.key === 'ArrowRight') j = (i + 1) % rtTabs.length; else if (e.key === 'ArrowLeft') j = (i - 1 + rtTabs.length) % rtTabs.length; else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = rtTabs.length - 1; else return;
          e.preventDefault(); rtShow(rtTabs[j]); rtTabs[j].focus();
        });
      });
    }

    /* ---------- 5-4 (9차). 무인 솔루션 페이지(unmanned.html): 페이지 안 차례 강조 · 적용 설비 필터 · 로봇 칸 탭 ---------- */
    /* 다른 페이지에는 해당 요소가 없어 아무 일도 하지 않는다. 스크립트가 없어도 로봇 5칸·첫 탭 내용은 모두 보인다(필터·탭 전환만 안 됨). */
    (function(){
      /* 9차: 무인 솔루션 — 페이지 안 차례 강조 */
      var links=[].slice.call(document.querySelectorAll('.us-nav a')),secs=links.map(function(a){return document.querySelector(a.getAttribute('href'))});
      function upd(){var y=scrollY+140,i=0;secs.forEach(function(s,k){if(s&&s.offsetTop<=y)i=k});links.forEach(function(a,k){a.classList.toggle('is-on',k===i)})}
      if(links.length){addEventListener('scroll',upd,{passive:true});upd();}
      /* 9차: 적용 설비 필터 — 단추와 사진 아래 태그가 같은 필터를 움직인다 */
      var btns=[].slice.call(document.querySelectorAll('.rb-filter button')),cards=[].slice.call(document.querySelectorAll('.rb')),cnt=document.querySelector('[data-count]');
      function apply(f){btns.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.f===f))});var n=0;cards.forEach(function(c){var on=f==='all'||(' '+c.dataset.tags+' ').indexOf(' '+f+' ')>-1;c.hidden=!on;if(on)n++});if(cnt)cnt.textContent=(f==='all'?'로봇 ':'이 설비에 해당하는 로봇 ')+n+'종'}
      btns.forEach(function(b){b.addEventListener('click',function(){apply(b.dataset.f)})});
      [].slice.call(document.querySelectorAll('.rb__tags a')).forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();apply(a.dataset.f);var r=document.getElementById('robots');if(r)r.scrollIntoView({behavior:'smooth'})})});
      /* 9차: 로봇 칸 탭 — 6차 수행 이력 탭과 같은 동작(클릭 · ←→ Home End) */
      [].slice.call(document.querySelectorAll('.rb__tabs')).forEach(function(bar){
        var tabs=[].slice.call(bar.querySelectorAll('[role="tab"]'));
        function show(t){tabs.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',on?'true':'false');x.tabIndex=on?0:-1;var p=document.getElementById(x.getAttribute('aria-controls'));if(p){if(on)p.removeAttribute('hidden');else p.setAttribute('hidden','')}})}
        tabs.forEach(function(t,i){t.addEventListener('click',function(){show(t)});t.addEventListener('keydown',function(e){var j=i;if(e.key==='ArrowRight')j=(i+1)%tabs.length;else if(e.key==='ArrowLeft')j=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')j=0;else if(e.key==='End')j=tabs.length-1;else return;e.preventDefault();show(tabs[j]);tabs[j].focus()})});
      });
    })();

    /* ---------- 5-5 (10차). 메인 무인 솔루션 '로봇이 하는 일': 휴대폰 가로 넘김 위치를 점으로 ---------- */
    (function(){var r=document.querySelector('.u10__jobs'),d=[].slice.call(document.querySelectorAll('.u10__dots i'));if(!r||!d.length)return;
    r.addEventListener('scroll',function(){var c=r.children,k=0,b=1e9,pl=parseFloat(getComputedStyle(r).paddingLeft)||0;for(var i=0;i<c.length;i++){var x=Math.abs(c[i].offsetLeft-r.offsetLeft-pl-r.scrollLeft);if(x<b){b=x;k=i}}if(r.scrollLeft+r.clientWidth>=r.scrollWidth-4)k=c.length-1;d.forEach(function(e,i){e.classList.toggle('on',i===k)})},{passive:true});})();

    /* ---------- 6. 현재 연도 ---------- */
    var y = document.querySelector('[data-year]');
    if (y) y.textContent = String(new Date().getFullYear());
  });
})();
