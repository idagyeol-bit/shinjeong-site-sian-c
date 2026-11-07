/* 시안C 27차 · 30차(휴대폰 가로 넘김): 첫 화면 'flow' 움직임 — 칸 선택(노트북 마우스 올림 · 휴대폰 누름) · 5.6초 자동 넘김(누른 뒤 12초 멈춤) · 펼친 칸 그림 1.8초 교차 · 펼친 칸 영상만 재생. 움직임 줄이기면 자동 넘김 · 영상 없음 */
(function(){var Ls=[].slice.call(document.querySelectorAll('#hs>li')),cur=0,hold=0,rm=matchMedia('(prefers-reduced-motion: reduce)').matches,T0=performance.now(),F=0;
function frames(){var im=Ls[cur].querySelectorAll('.ph img.fa');[].forEach.call(im,function(x,k){x.classList.toggle('v',k===F%im.length)})}
function sel(i,user){var vs=document.querySelectorAll('#hs .vd');[].forEach.call(vs,function(v,k){if(k!==i){try{v.pause()}catch(e){}v.parentNode.classList.remove('pl')}});var cv=vs[i];if(cv&&!rm){try{cv.currentTime=0;var pp=cv.play();if(pp&&pp.catch)pp.catch(function(){})}catch(e){}cv.onplaying=function(){cv.parentNode.classList.add('pl')}}cur=i;Ls.forEach(function(li,k){var on=k===i;li.classList.toggle('on',on);li.querySelector('.sb').setAttribute('aria-expanded',String(on))});F=0;frames();T0=performance.now();if(user)hold=performance.now()+12000;if(typeof mark==='function')mark(i)}
Ls.forEach(function(li,i){li.querySelector('.sb').onclick=function(){if(mob.matches){go(i);return}sel(i,true)};li.onmouseenter=function(){if(matchMedia('(hover:hover) and (min-width:821px)').matches&&cur!==i)sel(i,true)}});
setInterval(function(){if(!document.hidden){F++;frames()}},1800);
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
