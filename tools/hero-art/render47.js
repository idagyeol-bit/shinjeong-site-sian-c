// 47차: A(전체) · B(주인공만) 두 겹 + 이름표 자리(anchors). 이름표는 그림에 굽지 않는다(사이트에서 HTML 로 얹음)
const {chromium}=require('playwright');const fs=require('fs');(async()=>{const [d,jf,od]=process.argv.slice(2);const jobs=JSON.parse(fs.readFileSync(jf,'utf8'));const b=await chromium.launch();const er=[];fs.mkdirSync(od,{recursive:true});
const SUBJ='#xstream,#xchunks,#xres,#xflow,#suck,#fleet,#trl,#car,#kit,#cones,#yard,#truck,#hosep,#hosef,#robot,#cutg,#men,#spray,#life,#airl,#sig,#sigd,#wipe,#x47';
const LBL='#w g:has(> text.lt)';
const W=1000,H=590,DSF=+(process.env.DSF||1.6);const c=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:DSF});const p=await c.newPage();p.on('pageerror',e=>er.push(e.message));await p.goto('file://'+d+'/시안C_첫화면_A안.html');await p.waitForTimeout(500);
await p.evaluate(()=>{document.getElementById('track').classList.remove('off');const w=document.getElementById('w');let n=w;while(n&&n.parentElement){for(const sib of n.parentElement.children){if(sib!==n&&sib.tagName!=='SCRIPT'&&sib.tagName!=='STYLE')sib.style.setProperty('display','none','important')}n=n.parentElement;if(n===document.body)break}window.dispatchEvent(new Event('resize'))});
await p.addScriptTag({path:__dirname+'/enhance.js'});await p.addScriptTag({path:__dirname+'/enh47.js'});
await p.addStyleTag({content:`.pv,.hd,.hx,.panel,.head,.cta,.pause,.layer,.rail,.note,.inset,.hint,#fadev,.mcta,.lineup,.nums{display:none!important}.stage{position:fixed!important;left:0!important;top:0!important;width:${W}px!important;height:${H}px!important;min-height:0!important;z-index:50}#w{left:0!important;width:${W}px!important;top:0!important;height:${H}px!important;bottom:auto!important}`});
const mode=async(m,extra,hide)=>{await p.evaluate(([m,extra,hide,SUBJ,LBL])=>{let s=document.getElementById('modecss');if(!s){s=document.createElement('style');s.id='modecss';document.head.appendChild(s)}
const tr='html,body,.stage,.track{background:transparent!important}';const fx='#w #fleet text{fill:#eef3f8!important}#w #sludge,#w #sludge2{filter:brightness(2.2) saturate(1.25)}';
const hd=(hide||[]).map(x=>'#w '+x).join(',');const hc=hd?hd+'{visibility:hidden!important}':'';
const glab='#w .glab,#w .glab2{visibility:hidden!important}';
if(m==='A')s.textContent=fx+LBL+'{visibility:hidden!important}'+hc+glab;
else s.textContent=tr+'#w>*{visibility:hidden!important}'+SUBJ.split(',').concat(extra||[]).map(x=>'#w '+x).join(',')+'{visibility:visible!important}'+LBL+'{visibility:hidden!important}'+hc+glab;},[m,extra,hide,SUBJ,LBL])};
const out={};
for(const j of jobs){for(const m of ['A','B']){await mode(m,j.extra,j.hide);await p.evaluate(f=>{window.__lblScale=1;window.__t(f.t,f.time,f.co);if(f.follow&&window.__subjX){const x=window.__subjX(f.follow);if(x!=null){const co=f.co.slice();co[0]=x+(0.5-f.follow.fx)*co[2];window.__t(f.t,f.time,co)}}if(window.__enh)window.__enh(f.k||0);if(window.__enh47)window.__enh47(f)},j);await p.waitForTimeout(j.wait||40);await p.screenshot({path:`${od}/${j.name}_${m}.png`,clip:{x:0,y:0,width:W,height:H},omitBackground:m!=='A'})}
 if(j.anchors)out[j.name]=await p.evaluate(a=>window.__anchors(a),j.anchors)}
fs.writeFileSync(od+'/anchors.json',JSON.stringify(out));console.log('errors',er.slice(0,3));await b.close()})()
