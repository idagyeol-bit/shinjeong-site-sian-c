/* 시안C 27차 · 30차(휴대폰 가로 넘김): 첫 화면 'flow' 움직임 — 칸 선택(노트북 마우스 올림 · 휴대폰 누름) · 5.6초 자동 넘김(누른 뒤 12초 멈춤) · 펼친 칸 그림 1.8초 교차 · 펼친 칸 영상만 재생. 움직임 줄이기면 자동 넘김 · 영상 없음 */
(function(){var Ls=[].slice.call(document.querySelectorAll('#hs>li')),cur=-1,hold=0,rm=matchMedia('(prefers-reduced-motion: reduce)').matches,T0=performance.now(),F=0;
function frames(){var im=Ls[cur].querySelectorAll('.ph img.fa');[].forEach.call(im,function(x,k){x.classList.toggle('v',k===F%im.length)})}
function sel(i,user){var vs=document.querySelectorAll('#hs .vd');[].forEach.call(vs,function(v,k){if(k!==i){try{v.pause()}catch(e){}v.parentNode.classList.remove('pl')}});var cv=vs[i];clearTimeout(window.__hvT);if(cv&&!rm){var dl=(mob.matches||cur===i)?0:420;window.__hvT=setTimeout(function(){try{if(cv.paused){if(cv.currentTime>0.2)cv.currentTime=0;if(cv.preload!=='auto')cv.preload='auto';var pp=cv.play();if(pp&&pp.catch)pp.catch(function(){})}}catch(e){}},dl);cv.onplaying=function(){cv.parentNode.classList.add('pl')}}cur=i;Ls.forEach(function(li,k){var on=k===i;li.classList.toggle('on',on);li.querySelector('.sb').setAttribute('aria-expanded',String(on))});F=0;frames();T0=performance.now();if(user)hold=performance.now()+12000;if(typeof mark==='function')mark(i)}
Ls.forEach(function(li,i){li.querySelector('.sb').onclick=function(){if(mob.matches){go(i);return}sel(i,true)};li.onmouseenter=function(){clearTimeout(window.__hiT);if(matchMedia('(hover:hover) and (min-width:821px)').matches&&cur!==i)window.__hiT=setTimeout(function(){sel(i,true)},140)};li.onmouseleave=function(){clearTimeout(window.__hiT)}});
setInterval(function(){if(document.hidden||cur<0)return;if(performance.now()-T0<2400||Ls[cur].querySelector('.ph.pl'))return;F++;frames()},1800);   /* 31차: 영상이 도는 동안 · 막 열린 직후에는 그림을 바꾸지 않는다(겹쳐 보임 방지) */
var mob=matchMedia('(max-width:820px)');function tk(n){var el=n-T0,D=5600;if(!rm&&!mob.matches&&n>hold&&el>D)sel((cur+1)%Ls.length);var b=Ls[cur].querySelector('.bar');b.style.transform='scaleX('+(rm||mob.matches||n<hold?1:Math.min(1,el/D))+')';requestAnimationFrame(tk)}
/* 30차: 휴대폰 = 가로로 넘기는 칸. 가운데 온 카드를 고른다 · 카드나 점을 누르면 그 카드로 넘긴다 */
var strip=document.getElementById('hs'),dots=document.createElement('div');dots.className='hsd';dots.setAttribute('aria-label','단계 위치');
var Ds=Ls.map(function(li,i){var b=document.createElement('button');b.type='button';b.className=li.classList.contains('rbt')?'rbt':'';b.setAttribute('aria-label',(i+1)+'단계로');b.appendChild(document.createElement('i'));b.onclick=function(){go(i)};dots.appendChild(b);return b});
var cnt=document.createElement('span');dots.appendChild(cnt);if(strip)strip.parentNode.insertBefore(dots,strip.nextSibling);
function mark(i){Ds.forEach(function(b,k){b.classList.toggle('on',k===i)});cnt.textContent=String(i+1).padStart(2,'0')+' / '+String(Ls.length).padStart(2,'0')}
function go(i){var li=Ls[i];if(!strip||!li)return;strip.scrollTo({left:li.offsetLeft-(strip.clientWidth-li.offsetWidth)/2,behavior:rm?'auto':'smooth'});if(cur!==i)sel(i,true)}
var rq=0;function pick(){rq=0;if(!mob.matches||!strip)return;var c=strip.scrollLeft+strip.clientWidth/2,best=0,bd=1e9;Ls.forEach(function(li,k){var d=Math.abs(li.offsetLeft+li.offsetWidth/2-c);if(d<bd){bd=d;best=k}});if(best!==cur)sel(best,true)}
if(strip)strip.addEventListener('scroll',function(){if(!rq)rq=requestAnimationFrame(pick)},{passive:true});
sel(0);requestAnimationFrame(tk);window.__hsel=sel;
/* 28차: 남색 무대 높이 — 노트북은 다섯 칸 카드 가운데까지, 휴대폰은 CSS 가 100% */
var hx=document.getElementById('hx'),hs=document.getElementById('hs');function dk(){if(!hx||!hs)return;if(matchMedia('(max-width:820px)').matches){hx.style.removeProperty('--dk');return}hx.style.setProperty('--dk',Math.round(hs.offsetTop+hs.offsetHeight*0.52)+'px')}dk();addEventListener('resize',dk);addEventListener('load',dk);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(dk);
})();

/* 29차: 휴대폰은 저절로 넘기지 않는다(읽는 중에 칸이 바뀌어 헷갈리지 않게) · 누른 칸이 화면 밖이면 그 칸 위로 부드럽게 맞춘다 · 첫 화면이 화면 밖이면 영상을 멈춘다(배터리) */
(function(){var hs=document.getElementById('hs');if(!hs||!('IntersectionObserver' in window))return;new IntersectionObserver(function(es){es.forEach(function(e){var v=hs.querySelector('li.on .vd');if(!v)return;if(e.isIntersecting){if(!matchMedia('(prefers-reduced-motion: reduce)').matches){var p=v.play();if(p&&p.catch)p.catch(function(){})}}else{try{v.pause()}catch(x){}}})},{threshold:0.15}).observe(hs)})();

/* 31차: 노트북 · PC — 줄 높이 · 그림 크기를 처음에 재서 고정(열릴 때 덜컥거림 없앰). 휴대폰은 30차 가로 카드 그대로 */
(function(){var hs=document.getElementById('hs');if(!hs)return;var desk=matchMedia('(min-width:821px)'),G=2.9,last=0;
function lay(){if(!desk.matches){hs.classList.remove('sm');return}var W=hs.clientWidth;if(!W)return;if(W===last&&hs.classList.contains('sm'))return;last=W;
var gap=parseFloat(getComputedStyle(hs).columnGap)||14,n=hs.children.length,u=(W-gap*(n-1))/(n-1+G),aw=Math.round(u*G),cw=Math.floor(u);
hs.style.setProperty('--aw',aw+'px');hs.style.setProperty('--cw',cw+'px');hs.style.setProperty('--phH',Math.round(aw*826/1400)+'px');
var m=hs.cloneNode(true);m.removeAttribute('id');m.className='hs sm hsmx';m.setAttribute('aria-hidden','true');[].forEach.call(m.querySelectorAll('.ph'),function(p){p.remove()});hs.parentNode.appendChild(m);
m.style.setProperty('--aw',aw+'px');m.style.setProperty('--cw',cw+'px');var h=0;
[].forEach.call(m.children,function(li){li.style.transition='none';li.classList.add('on');li.style.width=aw+'px';h=Math.max(h,li.querySelector('.tx').offsetHeight);li.classList.remove('on');li.style.width=cw+'px';var t=li.querySelector('.tx'),ef=t.querySelector('.ef'),ds=t.querySelector('.ds');if(ds)ds.style.display='none';if(ef)ef.style.display='none';h=Math.max(h,t.offsetHeight)});
m.remove();hs.style.setProperty('--txH',Math.ceil(h+2)+'px');hs.classList.add('sm');addEventListener('load',function(){},{once:true})}
lay();var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){last=0;lay();window.dispatchEvent(new Event('hxlay'))},120)});if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){last=0;lay()});addEventListener('load',function(){last=0;lay()})})();

/* 시안C 47차: 펼친 칸 그림 위 설명표 — 그림 속 무엇을 가리키는지(로봇 부품 · 장비 · 슬러지). 자리는 영상 프레임마다 따라간다(assets/hero-flow/pins.json, 24fps 의 3프레임마다).
   칸이 다 열린 뒤 하나씩 나타나고, 닫히면 바로 숨는다. 휴대폰은 data-m 이 붙은 설명표만 */
(function(){var hs=document.getElementById('hs');if(!hs||!window.fetch)return;var P=null,rm=matchMedia('(prefers-reduced-motion: reduce)').matches,mob=matchMedia('(max-width:820px)');
var base=(document.querySelector('script[src*="hero-flow.js"]')||{}).src||'js/hero-flow.js';
fetch(new URL('../assets/hero-flow/pins.json',base).href).then(function(r){return r.json()}).then(function(j){P=j;requestAnimationFrame(loop)}).catch(function(){});
var shown=null,tOn=0;
function frame(li){var v=li.querySelector('.vd'),ph=li.querySelector('.ph');if(!v||!ph||!ph.classList.contains('pl')||rm)return 0;return Math.max(0,v.currentTime*8)}   /* 8 = 24fps ÷ 3 */
function at(arr,f){if(!arr||!arr.length)return null;var i=Math.min(arr.length-1,Math.floor(f)),k=Math.min(arr.length-1,i+1),u=Math.min(1,f-i),a=arr[i],b=arr[k];if(!a||!b)return a||b;return[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u]}
function place(li){var box=li.querySelector('.pins'),ph=li.querySelector('.ph'),img=ph&&ph.querySelector('img.po');if(!box||!img||!P)return;var d=P[box.dataset.v];if(!d)return;
  var pr=ph.getBoundingClientRect(),ir=img.getBoundingClientRect(),W=pr.width,H=pr.height,f=frame(li),m=mob.matches,M=10,rects=[];
  var L=[];[].forEach.call(box.children,function(pin){var p=at(d[pin.dataset.id],f),use=p&&(!m||pin.dataset.m);pin.style.display=use?'':'none';if(use)L.push([pin,ir.left-pr.left+p[0]*ir.width,ir.top-pr.top+p[1]*ir.height])});
  L.forEach(function(e){rects.push([e[1]-9,e[2]-9,18,18])});   /* 점 자리는 비워 둔다 */
  L.forEach(function(e){var pin=e[0],x=e[1],y=e[2],b=pin.querySelector('b'),bw=b.offsetWidth,bh=b.offsetHeight;
    var side=pin.dataset.side,dy=(+pin.dataset.dy||0)*(m?.7:1),gap=(m?.7:1)*(+pin.dataset.dx||26);
    var fitIn=function(q){q[0]=Math.min(Math.max(q[0],M),W-M-bw);q[1]=Math.min(Math.max(q[1],M),H-M-bh);return q};
    var free=function(q){return !rects.some(function(r){return q[0]<r[0]+r[2]+6&&q[0]+bw+6>r[0]&&q[1]<r[1]+r[3]+6&&q[1]+bh+6>r[1]})};
    var best=null,sides=side==='l'?['l','r']:['r','l'];
    for(var si=0;si<2&&!best;si++)for(var o=0;o<9&&!best;o++){var st=[0,1,-1,2,-2,3,-3,4,-4][o]*(bh/2+4);var q=fitIn([sides[si]==='l'?x-gap-bw:x+gap,y+dy-bh/2+st]);if(free(q))best=q}
    if(!best)best=fitIn([side==='l'?x-gap-bw:x+gap,y+dy-bh/2]);var bx=best[0],by=best[1];rects.push([bx,by,bw,bh]);
    var inside=x>=0&&x<=W&&y>=0&&y<=H;pin.classList.toggle('out',!inside);
    pin.querySelector('.pd').style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px)';b.style.transform='translate('+bx.toFixed(1)+'px,'+by.toFixed(1)+'px)';
    var ex=Math.max(bx,Math.min(x,bx+bw)),ey=Math.max(by,Math.min(y,by+bh));if(ex===x&&ey===y)ey=by;var lx=ex-x,ly=ey-y,Ln=Math.hypot(lx,ly);var k=pin.querySelector('.pk');k.style.width=Ln.toFixed(1)+'px';k.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) rotate('+Math.atan2(ly,lx)+'rad)'})}
function loop(){var li=hs.querySelector('li.on');if(li!==shown){if(shown){var o=shown.querySelector('.pins');if(o)o.classList.remove('on')}shown=li;tOn=performance.now()}
  if(li&&!document.hidden){var box=li.querySelector('.pins');if(box){var ready=performance.now()-tOn>(mob.matches?250:760);place(li);if(ready)box.classList.add('on')}}
  requestAnimationFrame(loop)}
})();
