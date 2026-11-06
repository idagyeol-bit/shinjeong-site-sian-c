/* 시안C 27차: 첫 화면 'flow' 움직임 — 칸 선택(노트북 마우스 올림 · 휴대폰 누름) · 5.6초 자동 넘김(누른 뒤 12초 멈춤) · 펼친 칸 그림 1.8초 교차 · 펼친 칸 영상만 재생. 움직임 줄이기면 자동 넘김 · 영상 없음 */
(function(){var Ls=[].slice.call(document.querySelectorAll('#hs>li')),cur=0,hold=0,rm=matchMedia('(prefers-reduced-motion: reduce)').matches,T0=performance.now(),F=0;
function frames(){var im=Ls[cur].querySelectorAll('.ph img.fa');[].forEach.call(im,function(x,k){x.classList.toggle('v',k===F%im.length)})}
function sel(i,user){var vs=document.querySelectorAll('#hs .vd');[].forEach.call(vs,function(v,k){if(k!==i){try{v.pause()}catch(e){}v.parentNode.classList.remove('pl')}});var cv=vs[i];if(cv&&!rm){try{cv.currentTime=0;var pp=cv.play();if(pp&&pp.catch)pp.catch(function(){})}catch(e){}cv.onplaying=function(){cv.parentNode.classList.add('pl')}}cur=i;Ls.forEach(function(li,k){var on=k===i;li.classList.toggle('on',on);li.querySelector('.sb').setAttribute('aria-expanded',String(on))});F=0;frames();T0=performance.now();if(user)hold=performance.now()+12000}
Ls.forEach(function(li,i){li.querySelector('.sb').onclick=function(){sel(i,true)};li.onmouseenter=function(){if(matchMedia('(hover:hover) and (min-width:821px)').matches&&cur!==i)sel(i,true)}});
setInterval(function(){if(!document.hidden){F++;frames()}},1800);
function tk(n){var el=n-T0,D=5600;if(!rm&&n>hold&&el>D)sel((cur+1)%Ls.length);var b=Ls[cur].querySelector('.bar');b.style.transform='scaleX('+(rm||n<hold?1:Math.min(1,el/D))+')';requestAnimationFrame(tk)}
sel(0);requestAnimationFrame(tk);window.__hsel=sel;
})();
