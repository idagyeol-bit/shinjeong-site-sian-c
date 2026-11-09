// 시안C 47차(다시): 원래 그림(28~30차 밤 현장)을 그대로 두고 다듬기 — 로봇 세부 · 파쇄부 회전 · 파쇄/흡입 장면 · 이름표 자리 계산
(function(){
const NS='http://www.w3.org/2000/svg',$=id=>document.getElementById(id);
const mk=(tag,attrs,parent)=>{const e=document.createElementNS(NS,tag);for(const a in attrs)e.setAttribute(a,attrs[a]);if(parent)parent.appendChild(e);return e};
function robotInner(){const rb=$('rb');return rb?rb.querySelector(':scope>g'):null}
function addDefs(){const svg=$('w'),defs=svg.querySelector('defs');if($('x47y'))return;
  const lg=(id,dir,stops)=>{const g=mk('linearGradient',Object.assign({id},dir),defs);stops.forEach(([o,c,a])=>mk('stop',{offset:o,'stop-color':c,'stop-opacity':a==null?1:a},g))};
  lg('x47y',{x1:0,x2:1,y1:0,y2:0},[[0,'#fff3a8'],[.28,'#f4cb2a'],[.75,'#d9a812'],[1,'#a37c08']]);
  lg('x47b',{x1:0,x2:0,y1:0,y2:1},[[0,'#7fb4ff'],[.45,'#2a6fc9'],[1,'#123f7e']]);
  lg('x47m',{x1:0,x2:0,y1:0,y2:1},[[0,'#ffffff',.55],[.5,'#ffffff',0],[1,'#000000',.25]]);
  const rgd=mk('radialGradient',{id:'x47g'},defs);[['0','#fff6d8',1],['.4','#ffe7a8',.55],['1','#ffe7a8',0]].forEach(([o,c,a])=>mk('stop',{offset:o,'stop-color':c,'stop-opacity':a},rgd));
  const bl=mk('filter',{id:'x47bl',x:'-50%',y:'-50%',width:'200%',height:'200%'},defs);mk('feGaussianBlur',{stdDeviation:'2.2'},bl);
}
/* 로봇(5세대 그림) 세부: r5 좌표(앞 = 오른쪽, 바닥 = 0) */
function gen5(){const gs=document.querySelectorAll('#gens > g');return gs[4]||null}
function robotDetail(g){if(!g||g.querySelector('.x47r'))return;addDefs();
  const d=mk('g',{class:'x47r'},g),sc={class:'sc'};
  // 유압 모터: 원통 음영 · 반사 · 이음쇠 · 표지판
  mk('rect',{x:-82,y:-124,width:26,height:72,rx:3,fill:'url(#x47y)',stroke:'#7a5d08','stroke-width':.9},d);
  [-116,-104,-92,-80,-68].forEach(y=>mk('path',{d:`M-82 ${y}h26`,stroke:'#a88a10','stroke-width':.7,opacity:.7},d));
  mk('rect',{x:-79,y:-122,width:3.2,height:68,rx:1.5,fill:'#fff',opacity:.55},d);
  mk('rect',{x:-75,y:-86,width:12,height:8,fill:'#fff',stroke:'#7a5d08','stroke-width':.5},d);mk('path',{d:'M-73 -83h8M-73 -80.5h6',stroke:'#7a5d08','stroke-width':.7},d);
  mk('rect',{x:-78,y:-136,width:18,height:12,fill:'#d6dde3',stroke:'#2c353c','stroke-width':.7},d);mk('rect',{x:-76,y:-134,width:14,height:2.4,fill:'#fff',opacity:.8},d);
  // 파란 유압 실린더: 반사줄 · 피스톤 막대 광택
  mk('path',Object.assign({d:'M-42 -77.4L13 -105.9',stroke:'#9cc6ff','stroke-width':2.2,opacity:.85,'stroke-linecap':'round'},sc),d);
  mk('path',Object.assign({d:'M15 -105.6L37 -116.8',stroke:'#ffffff','stroke-width':1.2,opacity:.9,'stroke-linecap':'round'},sc),d);
  // 알루미늄 몸체 광택
  mk('path',Object.assign({d:'M-96 -48L-72 -76.5H30L54 -48',fill:'none',stroke:'#ffffff','stroke-width':1.4,opacity:.6},sc),d);
  // 방폭 카메라: 렌즈 · 반짝임 · 표시등
  mk('rect',{x:20,y:-110,width:26,height:14,rx:3,fill:'#4a5762',stroke:'#1d2429','stroke-width':.8},d);mk('rect',{x:22,y:-109,width:22,height:3,rx:1.5,fill:'#fff',opacity:.35},d);
  mk('circle',{cx:47,cy:-103,r:5,fill:'#0f1a24',stroke:'#1d2429','stroke-width':.8},d);mk('circle',{cx:47,cy:-103,r:3.2,fill:'#3d8fd8'},d);mk('circle',{cx:45.8,cy:-104.4,r:1.2,fill:'#fff'},d);
  mk('circle',{cx:24,cy:-99,r:1.3,fill:'#47d18e'},d);
  // 앞 조명(LED)
  mk('rect',{x:48,y:-66,width:12,height:9,rx:2,fill:'#39434b',stroke:'#1d2429','stroke-width':.7},d);mk('rect',{x:57,y:-64.5,width:4,height:6,rx:1,fill:'#fff8e0'},d);
  mk('circle',{cx:61,cy:-61.5,r:14,fill:'url(#x47g)',class:'x47led'},d);
  // 궤도 윗면 광택 · 아래 그림자
  mk('path',Object.assign({d:'M-86 -45.5H40',stroke:'#9aa6af','stroke-width':1.6,opacity:.55,'stroke-linecap':'round'},sc),d);
  // 뒤 흡입 호스 이음(주름)
  mk('rect',{x:-124,y:-70,width:14,height:21,rx:3,fill:'#c9d2d9',stroke:'#2c353c','stroke-width':.8},d);[0,1,2,3].forEach(i=>mk('path',{d:`M${-123+i*3.4} -69v19`,stroke:'#7e8b95','stroke-width':.9},d));
  // 볼트 줄
  for(let i=0;i<6;i++)mk('circle',{cx:-66+i*20,cy:-74,r:1.1,fill:'#3a4650'},d);
}
/* 파쇄부(앞 톱니 바퀴) 회전 — 프레임마다 */
function spin(k,sp){const g=robotInner();if(!g)return;g.querySelectorAll('.dr').forEach(e=>e.setAttribute('transform','rotate('+((k*sp)%360)+')'))}
/* r5 좌표 → 화면(px) / 세계 좌표 */
function r2s(x,y){const g=robotInner(),svg=$('w');const p=svg.createSVGPoint();p.x=x;p.y=y;return p.matrixTransform(g.getScreenCTM())}
function w2s(x,y){const svg=$('w'),ref=$('sludge')||svg;const p=svg.createSVGPoint();p.x=x;p.y=y;return p.matrixTransform(ref.getScreenCTM())}
function s2w(pt){const svg=$('w'),ref=$('sludge')||svg;const p=svg.createSVGPoint();p.x=pt.x;p.y=pt.y;return p.matrixTransform(ref.getScreenCTM().inverse())}
/* 03 장면: 파쇄부가 슬러지를 부수고, 조각이 흡입구로 빨려 들어간다 */
function crush(k,on){let g=$('x47');const sl=$('sludge');if(!g){g=mk('g',{id:'x47'});sl.parentNode.appendChild(g)}g.innerHTML='';if(!on)return;
  const c=s2w(r2s(92,-18)),n=s2w(r2s(70,-40)),u=Math.abs(s2w(r2s(0,0)).x-s2w(r2s(10,0)).x)/10;  // u = r5 1단위의 세계 길이
  const d=sl.getAttribute('d')||'',pts=[];const re=/L(\d+(?:\.\d+)?) (\d+(?:\.\d+)?)/g;let m;while((m=re.exec(d)))pts.push([+m[1],+m[2]]);
  let fx=c.x+u*40;for(const [x,y] of pts){if(x>c.x+u*10&&690-y>5){fx=x;break}}
  window.__x47={face:[fx,676],mid:[(c.x+fx)/2,c.y-u*6]};
  let seed=3;const rnd=()=>(seed=(seed*9301+49297)%233280)/233280;
  // 슬러지 앞면에서 떨어져 나와 파쇄부 · 흡입구로 빨려 드는 덩어리
  for(let i=0;i<40;i++){const q=((k*0.026)+i/40)%1,a=rnd(),x0=fx+u*(2+rnd()*14),y0=688-u*(2+rnd()*30);
    const x=x0+(c.x+u*8-x0)*q,y=y0+(c.y-u*6-y0)*q-Math.sin(q*Math.PI)*u*(3+a*8),r=u*(1.4+(1-q)*2.6*a+.8);
    mk('ellipse',{cx:x.toFixed(2),cy:y.toFixed(2),rx:(r*1.25).toFixed(2),ry:r.toFixed(2),fill:i%4==0?'#2a1a0e':(i%3?'#8b5e34':'#c48a52'),stroke:'#e2b27c','stroke-width':.35,opacity:(0.35+0.65*Math.sin(q*Math.PI)).toFixed(2),transform:`rotate(${(q*400+i*37)%360} ${x.toFixed(1)} ${y.toFixed(1)})`},g)}
  // 앞면이 깎이는 자국(밝은 테두리)
  mk('path',{d:`M${fx-u*2} 690Q${fx-u*6} ${690-u*16} ${fx+u*4} ${690-u*30}`,fill:'none',stroke:'#e6b07a','stroke-width':1.6,opacity:.8},g);
  // 파쇄부 둘레에 튀는 작은 알갱이
  for(let i=0;i<16;i++){const q=((k*0.05)+i/16)%1,a=rnd()*Math.PI*1.2-Math.PI*.95,R=u*(20+q*18);mk('circle',{cx:(c.x+Math.cos(a)*R).toFixed(2),cy:(c.y+Math.sin(a)*R).toFixed(2),r:(u*(1.1-q*.6)).toFixed(2),fill:'#a8743f',opacity:(1-q).toFixed(2)},g)}
  // 흡입구로 들어가는 흐름(점선 두 줄)
  mk('path',{d:`M${fx} ${c.y-u*16}Q${c.x+u*14} ${c.y-u*26} ${n.x} ${n.y}`,fill:'none',stroke:'#e6b07a','stroke-width':1,'stroke-dasharray':'3 4','stroke-dashoffset':String(-k*1.6),opacity:.85},g);
  mk('path',{d:`M${fx} ${c.y+u*8}Q${c.x+u*20} ${c.y+u*4} ${n.x} ${n.y+u*6}`,fill:'none',stroke:'#e6b07a','stroke-width':1,'stroke-dasharray':'3 4','stroke-dashoffset':String(-k*1.6),opacity:.75},g);
  // 흙먼지(흐림)
  mk('ellipse',{cx:((c.x+fx)/2).toFixed(1),cy:(c.y-u*4).toFixed(1),rx:(u*30).toFixed(1),ry:(u*18).toFixed(1),fill:'#b07a45',opacity:.28,filter:'url(#x47bl)'},g);
}
window.__enh47=function(j){robotDetail(robotInner());robotDetail(gen5());addDefs();spin(j.k||0,j.spin||0);crush(j.k||0,!!j.crush);
  const led=document.querySelector('.x47led');if(led)led.style.opacity=j.led==null?1:j.led};
window.__subjX=function(f){try{if(f.r)return s2w(r2s(f.r[0]||0,f.r[1]||0)).x;const b=document.querySelector(f.e).getBoundingClientRect();return s2w({x:b.left+b.width*(f.f||.5),y:b.top+b.height/2}).x}catch(e){return null}};
/* 이름표 자리: [{id, r:[x,y]} | {id, w:[x,y]} | {id, e:'#id', f:[fx,fy]}] → 화면 비율 [x/W, y/H] */
window.__anchors=function(list){const W=innerWidth,H=innerHeight,o={};list.forEach(a=>{let p=null;try{
  if(a.r)p=r2s(a.r[0],a.r[1]);else if(a.g)p=(function(){const svg=$('w'),q=svg.createSVGPoint();q.x=a.g[0];q.y=a.g[1];return q.matrixTransform(gen5().getScreenCTM())})();else if(a.pp){const el=document.querySelector(a.pp[0]);const q=el.getPointAtLength(el.getTotalLength()*a.pp[1]);p=w2s(q.x,q.y)}else if(a.x){const v=window.__x47&&window.__x47[a.x[0]];p=v?w2s(v[0]+(a.x[1]||0),v[1]+(a.x[2]||0)):null}else if(a.w)p=w2s(a.w[0],a.w[1]);else if(a.e){const el=document.querySelector(a.e);const b=el.getBoundingClientRect();p={x:b.left+b.width*a.f[0],y:b.top+b.height*a.f[1]}}}catch(e){}
  o[a.id]=p?[+(p.x/W).toFixed(4),+(p.y/H).toFixed(4)]:null});return o};
})();
