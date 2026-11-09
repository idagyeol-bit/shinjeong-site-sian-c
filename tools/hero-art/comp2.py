# 시안C 29차: '깊이 있는' 합성 — 배경 흐림(피사계 심도) · 바닥 그림자 · 빛줄기 · 두 겹 먼지(시차) · 림 라이트
import numpy as np, math, random
from PIL import Image, ImageFilter, ImageDraw
def hexc(h):h=h.lstrip('#');return np.array([int(h[i:i+2],16) for i in (0,2,4)],float)/255
_P={}
def particles(W,H,n,seed):
    k=(W,H,n,seed)
    if k not in _P:
        r=random.Random(seed);_P[k]=[(r.random(),r.random(),r.random(),r.random()) for _ in range(n)]
    return _P[k]
def comp(A,B,C,out,size=None,t=0.0,dof=1.0,dust=1.0,shafts=1.0):
    a=np.asarray(Image.open(A).convert('RGB'),float)/255
    mi=Image.open(B).convert('RGBA').split()[3]
    m=np.asarray(mi,float)/255
    H,W=m.shape;s=W/2000
    lum=a@np.array([.2126,.7152,.0722])
    lum=np.clip((lum-0.35)/0.65,0,1)**1.1
    d=np.array([4,12,24],float)/255;l=np.array([60,88,122],float)/255
    bg=d+(l-d)*lum[...,None]
    yy=np.linspace(0,1,H)[:,None,None];bg=bg*(0.80+0.28*yy)
    # 피사계 심도: 배경만 흐리게
    if dof>0:
        bgi=Image.fromarray((np.clip(bg,0,1)*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(4.2*s*dof*2))
        bg=np.asarray(bgi,float)/255
    # 빛줄기(위에서 비스듬히, 천천히 이동)
    if shafts>0:
        yv,xv=np.mgrid[0:H,0:W].astype(float)
        u=(xv/W)+0.32*(yv/H)-0.04*math.sin(t*0.9)
        beam=np.zeros_like(u)
        for c,w,k in ((0.30,0.05,1.0),(0.52,0.035,0.7),(0.78,0.06,0.85)):
            beam+=k*np.exp(-((u-c-0.015*math.sin(t*0.7+c*9))/w)**2)
        beam*=np.clip(1.15-(yv/H)*1.1,0,1)
        bg=bg+beam[...,None]*0.075*shafts*hexc('cfe3ff')
    # 따뜻한 빛 번짐 + 바닥 접촉 그림자
    g1=np.asarray(mi.filter(ImageFilter.GaussianBlur(90*s)),float)/255
    g2=np.asarray(mi.filter(ImageFilter.GaussianBlur(22*s)),float)/255
    bg=bg+(g1[...,None]*0.30)*hexc('ffe4b0')+(g2[...,None]*0.12)*hexc('9cc8ff')
    sh=Image.new('L',(W,H));sh.paste(mi,(int(10*s),int(14*s)))
    sh=np.asarray(sh.filter(ImageFilter.GaussianBlur(16*s)),float)/255
    bg=bg*(1-0.55*sh[...,None])
    # 비네트
    yv2,xv2=np.mgrid[0:H,0:W];r=np.sqrt(((xv2-W/2)/(W/2))**2+((yv2-H*0.55)/(H/1.6))**2)
    bg=bg*np.clip(1-0.42*np.clip(r-0.42,0,1.2),0.5,1)[...,None]
    sub=np.clip((a-0.5)*1.1+0.5+0.02,0,1)
    me=np.asarray(mi.filter(ImageFilter.MaxFilter(5)),float)/255
    rim=np.clip(me-m,0,1)[...,None]*0.5
    o=bg*(1-m[...,None])+sub*m[...,None]+rim*np.array([0.85,0.95,1.0])
    # 먼지 두 겹: 먼 겹(작고 느림) · 가까운 겹(크고 흐리고 빠름) → 시차
    if dust>0:
        lay=Image.new('L',(W,H));dr=ImageDraw.Draw(lay)
        for (x,y,z,ph) in particles(W,H,70,7):
            px=(x*W+t*14*s*(0.5+z))%W;py=(y*H-t*9*s*(0.4+z)+math.sin(t*1.3+ph*6)*6*s)%H
            rr=(1.1+1.4*z)*s*1.6;dr.ellipse([px-rr,py-rr,px+rr,py+rr],fill=int(90+90*z))
        far=np.asarray(lay.filter(ImageFilter.GaussianBlur(0.8*s)),float)/255
        lay2=Image.new('L',(W,H));dr2=ImageDraw.Draw(lay2)
        for (x,y,z,ph) in particles(W,H,14,11):
            px=(x*W+t*48*s*(0.6+z))%W;py=(y*H-t*22*s+math.sin(t+ph*6)*10*s)%H
            rr=(5+7*z)*s*1.6;dr2.ellipse([px-rr,py-rr,px+rr,py+rr],fill=int(70+60*z))
        near=np.asarray(lay2.filter(ImageFilter.GaussianBlur(6*s)),float)/255
        o=o+(far*0.22+near*0.16)[...,None]*dust*hexc('dfeaff')
    c=np.asarray(Image.open(C).convert('RGBA'),float)/255
    o=o*(1-c[...,3:4])+c[...,:3]*c[...,3:4]
    im=Image.fromarray((np.clip(o,0,1)*255).astype(np.uint8))
    if size:im=im.resize(size,Image.LANCZOS)
    if out.endswith('.webp'):im.save(out,quality=84)
    elif out.endswith('.jpg'):im.save(out,quality=93)
    else:im.save(out)
