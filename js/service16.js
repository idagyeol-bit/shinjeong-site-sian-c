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
/* 시안C 44차: '작업 장면' 영상 — 화면에 보일 때만 재생(무음 반복), 움직임 줄이기 설정이면 첫 장면 그림만 */
(function () {
  var vs = [].slice.call(document.querySelectorAll('video[data-scene]'));
  if (!vs.length || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { var v = e.target; if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else { try { v.pause(); } catch (x) {} } });
  }, { threshold: 0.3 });
  vs.forEach(function (v) { io.observe(v); });
})();

/* 시안C 49차: 작업 장면 위 설명표(첫 화면과 같은 글 · 같은 자리 자료 assets/hero-flow/pins.json) — 장면이 보이고 0.6초 뒤 하나씩 나타나고, 영상 속 대상을 따라간다 */
(function(){var vs=[].slice.call(document.querySelectorAll('.s6-scene__v'));if(!vs.length||!window.fetch)return;var P=null,mob=matchMedia('(max-width:820px)');
var base=(document.querySelector('script[src*="service16.js"]')||{}).src||'js/service16.js';
fetch(new URL('../assets/hero-flow/pins.json',base).href).then(function(r){return r.json()}).then(function(j){P=j;requestAnimationFrame(loop)}).catch(function(){});
var seen=new Map();if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){seen.set(e.target,e.isIntersecting?(seen.get(e.target)||performance.now()):0)})},{threshold:.35});vs.forEach(function(v){io.observe(v)})}
function at(arr,f){if(!arr||!arr.length)return null;var i=Math.min(arr.length-1,Math.floor(f)),k=Math.min(arr.length-1,i+1),u=Math.min(1,f-i),a=arr[i],b=arr[k];if(!a||!b)return a||b;return[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u]}
function place(wrap){var box=wrap.querySelector('.pins'),v=wrap.querySelector('video');var d=P[box.dataset.v];if(!d)return;var r=wrap.getBoundingClientRect(),W=r.width,H=r.height,m=mob.matches,M=8,rects=[],f=v.currentTime>0?v.currentTime*8:0,L=[];
  [].forEach.call(box.children,function(pin){var p=at(d[pin.dataset.id],f),use=p&&(!m||pin.dataset.m);pin.style.display=use?'':'none';if(use)L.push([pin,p[0]*W,p[1]*H])});
  L.forEach(function(e){rects.push([e[1]-9,e[2]-9,18,18])});
  L.forEach(function(e){var pin=e[0],x=e[1],y=e[2],b=pin.querySelector('b'),bw=b.offsetWidth,bh=b.offsetHeight,side=pin.dataset.side,dy=(+pin.dataset.dy||0)*(m?.6:.85),gap=(m?.6:.85)*(+pin.dataset.dx||26);
    var fit=function(q){q[0]=Math.min(Math.max(q[0],M),W-M-bw);q[1]=Math.min(Math.max(q[1],M),H-M-bh);return q},free=function(q){return !rects.some(function(r){return q[0]<r[0]+r[2]+5&&q[0]+bw+5>r[0]&&q[1]<r[1]+r[3]+5&&q[1]+bh+5>r[1]})};
    var best=null,sides=side==='l'?['l','r']:['r','l'];for(var si=0;si<2&&!best;si++)for(var o=0;o<9&&!best;o++){var q=fit([sides[si]==='l'?x-gap-bw:x+gap,y+dy-bh/2+[0,1,-1,2,-2,3,-3,4,-4][o]*(bh/2+4)]);if(free(q))best=q}
    if(!best)best=fit([side==='l'?x-gap-bw:x+gap,y+dy-bh/2]);rects.push([best[0],best[1],bw,bh]);
    pin.querySelector('.pd').style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px)';b.style.transform='translate('+best[0].toFixed(1)+'px,'+best[1].toFixed(1)+'px)';
    var ex=Math.max(best[0],Math.min(x,best[0]+bw)),ey=Math.max(best[1],Math.min(y,best[1]+bh));if(ex===x&&ey===y)ey=best[1];var lx=ex-x,ly=ey-y;var k=pin.querySelector('.pk');k.style.width=Math.hypot(lx,ly).toFixed(1)+'px';k.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) rotate('+Math.atan2(ly,lx)+'rad)'})}
function loop(){vs.forEach(function(w){var t0=seen.has(w)?seen.get(w):performance.now();if(!t0){w.querySelector('.pins').classList.remove('on');return}place(w);if(performance.now()-t0>600)w.querySelector('.pins').classList.add('on')});requestAnimationFrame(loop)}
})();
