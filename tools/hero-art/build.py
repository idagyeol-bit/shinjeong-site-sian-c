import re,sys,base64,subprocess,os,glob,io
S,repo=sys.argv[1],sys.argv[2]
h=open(S+'/heroA/src.html',encoding='utf8').read()
logo=open(repo+'/assets/logo/shinjeong-symbol.svg',encoding='utf8').read()
h=h.replace('<!--LOGO-->',re.sub(r'\s(width|height|role|aria-label)="[^"]*"','',logo,count=0).replace('<svg ','<svg aria-hidden="true" ',1))
st=S+'/heroA/stills.html'
h=h.replace('<!--STILLS-->',open(st,encoding='utf8').read() if os.path.exists(st) else '')
h=h.replace('<!--WORKERS-->',open(S+'/heroA/workers.html',encoding='utf8').read())
def _fr(m):
    p=S+'/heroA/fr/'+m.group(1)+'.webp'
    return 'data:image/webp;base64,'+base64.b64encode(open(p,'rb').read()).decode() if os.path.exists(p) else 'data:,'
h=re.sub(r'<!--F:(\w+)-->',_fr,h)
def _vd(m):
    p=S+'/heroA/vd/'+m.group(1)+'.mp4'
    return 'data:video/mp4;base64,'+base64.b64encode(open(p,'rb').read()).decode() if os.path.exists(p) else ''
h=re.sub(r'<!--V:(\w+)-->',_vd,h)
chars=''.join(sorted(set(re.sub(r'\s','',h)+' ·→“”※')))
from fontTools import subset
from fontTools.ttLib import TTFont
css=open(repo+'/css/tokens.css',encoding='utf8').read()
faces=re.findall(r"url\('\.\./assets/fonts/sub/(PretendardVariable-\d\.woff2)'\).*?unicode-range:\s*([^;]+);",css,flags=re.S)
out=''
need={ord(c) for c in chars}
for fn,ur in faces:
    f=TTFont(repo+'/assets/fonts/sub/'+fn);cm=f.getBestCmap();u=need&set(cm)
    need-=u
    if not u: continue
    o=subset.Options();o.flavor='woff2';o.layout_features=['*'];sb=subset.Subsetter(o);sb.populate(unicodes=u);sb.subset(f);f.flavor='woff2';b=io.BytesIO();f.save(b)
    out+="@font-face{font-family:Pretendard;src:url(data:font/woff2;base64,%s) format('woff2');font-weight:100 900;font-display:swap;unicode-range:%s}\n"%(base64.b64encode(b.getvalue()).decode(),','.join('U+%04X'%c for c in sorted(u)))
print('missing',[chr(c) for c in need],'font kb',len(out)//1024)
h=h.replace('/*FONT*/',out)
open(S+'/heroA/시안C_첫화면_A안.html','w',encoding='utf8').write(h);print(len(h)//1024,'KB')
