// 시안C 30차: 장면 보강 — 슬러지(덩어리 · 갈색 층), 로봇 앞 흡입 입자, 호스 속 슬러지 흐름, 작업자 앞 잔여물 · 고압수 · 튀는 방울, 이름표 추가
window.__enh=function(k){
  const NS='http://www.w3.org/2000/svg',$=id=>document.getElementById(id);
  const mk=(tag,attrs,parent)=>{const e=document.createElementNS(NS,tag);for(const a in attrs)e.setAttribute(a,attrs[a]);if(parent)parent.appendChild(e);return e};
  const svg=$('w');let defs=svg.querySelector('defs');
  if(!$('xsl')){const g=mk('linearGradient',{id:'xsl',x1:0,x2:0,y1:0,y2:1},defs);
    [['0','#b07a45'],['.18','#7a4f2a'],['.6','#4a2f19'],['1','#2a1a0e']].forEach(([o,c])=>mk('stop',{offset:o,'stop-color':c},g));}
  const sl=$('sludge'),s2=$('sludge2');
  // 슬러지 표면 점들
  const pts=[];if(sl){const d=sl.getAttribute('d')||'';const re=/L(\d+(?:\.\d+)?) (\d+(?:\.\d+)?)/g;let m;while((m=re.exec(d)))pts.push([+m[1],+m[2]]);}
  if(sl){sl.setAttribute('fill','url(#xsl)');sl.setAttribute('stroke','#c99159');sl.setAttribute('stroke-width','1.4');}
  if(s2)s2.style.opacity='0';
  const par=sl?sl.parentNode:svg;
  let ch=$('xchunks');if(!ch){ch=mk('g',{id:'xchunks'});par.insertBefore(ch,s2?s2.nextSibling:null)}ch.innerHTML='';
  // 덩어리 · 자갈(표면 아래로 흩어짐): 위치는 고정 난수, 높이는 지금 슬러지 두께에 맞춤
  let seed=7;const rnd=()=>(seed=(seed*9301+49297)%233280)/233280;
  const floorY=690;
  pts.forEach(([x,y],i)=>{const h=floorY-y;if(h<2.5)return;for(let j=0;j<3;j++){const yy=y+rnd()*h*0.85+1.5,r=0.9+rnd()*Math.min(3.2,h*0.12);
    mk('ellipse',{cx:(x+rnd()*6).toFixed(1),cy:yy.toFixed(1),rx:(r*1.4).toFixed(2),ry:r.toFixed(2),fill:rnd()<.35?'#2a1a0e':(rnd()<.5?'#8b5e34':'#5c3a1f'),opacity:.9},ch)}});
  // 얇게 남은 잔여물(04 장면): 두께가 얇으면 바닥 위 갈색 얼룩으로 크게 보이게
  const thin=true;
  const sp=$('spray'),spOn=sp&&getComputedStyle(sp).opacity!=='0';
  let nozX=null;if(sp){const xs=[...sp.querySelectorAll('circle')].map(c=>+c.getAttribute('cx')).filter(v=>v);if(xs.length)nozX=Math.min(...xs)}
  let rs=$('xres');if(!rs){rs=mk('g',{id:'xres'},svg)}rs.innerHTML='';
  if(spOn&&nozX){
    // 앞(오른쪽): 아직 남은 잔여물 덩어리 · 물줄기 속: 떨어져 나가는 잔여물 조각 · 뒤(왼쪽): 씻긴 바닥 물기
    seed=11;for(let x=nozX+44;x<1738;x+=4+rnd()*4){const w=2.5+rnd()*4.5,hh=1.8+rnd()*3.6;mk('ellipse',{cx:x.toFixed(1),cy:(floorY-hh*0.55).toFixed(1),rx:w.toFixed(1),ry:hh.toFixed(2),fill:rnd()<.3?'#7a4f2a':(rnd()<.5?'#c48a52':'#a46f3e'),stroke:'#ecc08e','stroke-width':'.45'},rs)}
    mk('path',{d:`M${nozX} ${floorY-24}Q${nozX+26} ${floorY-20} ${nozX+44} ${floorY-2}`,fill:'none',stroke:'#d6efff','stroke-width':'2.2','stroke-linecap':'round',opacity:.9},rs);
    mk('rect',{x:1162,y:floorY-1.1,width:Math.max(0,nozX-1162),height:1.1,fill:'#bfe3f7',opacity:.7},rs);
    seed=19+k;for(let i=0;i<16;i++){const q=((k*0.06)+i/16)%1,a=-0.25-rnd()*0.9;mk('circle',{cx:(nozX+40+q*30+rnd()*4).toFixed(1),cy:(floorY-2-Math.sin(q*Math.PI)*(5+rnd()*9)).toFixed(1),r:(0.9+rnd()*1.3).toFixed(2),fill:rnd()<.6?'#a8743f':'#e3f3ff'},rs)}
  }
  if(sp)sp.querySelectorAll('circle').forEach(c=>{c.setAttribute('r','1.9');c.setAttribute('fill','#d6efff')});
  // 로봇 앞 흡입 입자: 크고 갈색
  const su=$('suck');const suOn=su&&getComputedStyle(su).opacity!=='0';
  if(su)su.querySelectorAll('circle').forEach(c=>{const r0=+(c.dataset.r0||(c.dataset.r0=c.getAttribute('r')));c.setAttribute('r',(r0*1.9).toFixed(2));c.setAttribute('fill','#8b5e34');c.setAttribute('stroke','#c99159');c.setAttribute('stroke-width','.5')});
  let st=$('xstream');if(!st){st=mk('g',{id:'xstream'},svg)}st.innerHTML='';
  if(su&&suOn){const cs=[...su.querySelectorAll('circle')];const ax=cs.reduce((a,c)=>a+ +c.getAttribute('cx'),0)/cs.length,ay=cs.reduce((a,c)=>a+ +c.getAttribute('cy'),0)/cs.length;
    const sx0=Math.min(...cs.map(c=>+c.getAttribute('cx')));seed=5;
    for(let i=0;i<22;i++){const q=((k*0.035)+i/22)%1,yy0=floorY-4-rnd()*14,x0=ax+20+rnd()*22;const x=x0+(sx0-2-x0)*q,y=yy0+(ay-yy0)*q-Math.sin(q*Math.PI)*3;
      mk('circle',{cx:x.toFixed(1),cy:y.toFixed(1),r:(1.1+ (1-q)*1.5+rnd()*.6).toFixed(2),fill:i%3?'#a8743f':'#5c3a1f',stroke:'#d9a46b','stroke-width':'.3',opacity:(0.35+0.65*Math.sin(q*Math.PI)).toFixed(2)},st)}
    mk('path',{d:`M${sx0-3} ${ay-9}Q${ax+32} ${ay-14} ${ax+44} ${floorY-2}`,fill:'none',stroke:'#e6b07a','stroke-width':'.8','stroke-dasharray':'2 3',opacity:.8},st);
    mk('path',{d:`M${sx0-3} ${ay+6}Q${ax+30} ${ay+8} ${ax+44} ${floorY-1}`,fill:'none',stroke:'#e6b07a','stroke-width':'.8','stroke-dasharray':'2 3',opacity:.8},st)}
  // 호스 속 슬러지 흐름(로봇이 빨아들일 때만)
  const hp=$('hosep');let fl=$('xflow');if(!fl&&hp){fl=mk('path',{id:'xflow',fill:'none',stroke:'#e09a55','stroke-width':'3.4','stroke-linecap':'round','stroke-dasharray':'6 8'});hp.parentNode.insertBefore(fl,hp.nextSibling)}
  if(fl&&hp){fl.setAttribute('d',hp.getAttribute('d')||'');fl.style.opacity=suOn?'1':'0';fl.setAttribute('stroke-dashoffset',String(-k*3.5))}
  // 이름표 추가(장면에 맞을 때만 보임)
  const lab=(id,txt)=>{let g=$(id);if(!g){g=mk('g',{id},svg);mk('path',{class:'ld',fill:'none',stroke:'#0e2e4a','stroke-width':'.8'},g);const t=mk('text',{class:'lt',fill:'#0e2e4a','font-weight':'600','paint-order':'stroke',stroke:'#fff','stroke-width':'3.5','stroke-linejoin':'round'},g);t.textContent=txt}return g};
  const L1=lab('xl1','슬러지 흡입'),L2=lab('xl2','호스로 이송'),L3=lab('xl3','고압수로 밀어냄');
  const ls=window.__lblScale||1;let fsz=null;
  for(const g of svg.querySelectorAll('g')){if(/^xl/.test(g.id))continue;const t=g.querySelector(':scope>text.lt');if(t&&t.getAttribute('font-size')&&parseFloat(getComputedStyle(g).opacity)>.01&&g.getBBox().width>0){fsz=+t.getAttribute('font-size');break}}
  const u=fsz?fsz/(15*ls):0;
  const put=(g,x,y,dx,dy,on)=>{if(!on||!u){g.style.opacity=0;return}g.style.opacity=1;const fs=15*u*ls;g.querySelector('.ld').setAttribute('d','M'+x+' '+y+'L'+(x+dx*u)+' '+(y+dy*u)+'h'+(dx<0?-14:14)*u);const t=g.querySelector('.lt');t.setAttribute('font-size',fs);t.setAttribute('x',x+(dx+(dx<0?-18:18))*u);t.setAttribute('y',y+(dy+4.5)*u);t.setAttribute('text-anchor',dx<0?'end':'start')};
  let sx=null,sy=null;if(su&&suOn){const cs=[...su.querySelectorAll('circle')];sx=cs.reduce((a,c)=>a+ +c.getAttribute('cx'),0)/cs.length;sy=cs.reduce((a,c)=>a+ +c.getAttribute('cy'),0)/cs.length}
  put(L1,sx||0,sy||0,22,-40,!!(suOn&&sx));
  let hx=null,hy=null;if(fl&&suOn){try{const L=fl.getTotalLength();const p=fl.getPointAtLength(L*0.18);hx=p.x;hy=p.y}catch(e){}}
  put(L2,hx||0,hy||0,-12,-36,!!(suOn&&hx));
  put(L3,(nozX||0)+18,floorY-16,8,-104,!!(spOn&&nozX));
};
