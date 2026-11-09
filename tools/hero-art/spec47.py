import json,sys,math
SL=["#sludge","#sludge2","#stain"]
SPEC={
 1:dict(t=(-2.75,-2.75),co=([-2452,600,470],[-2440,602,420]),extra=[],hide=[],spin=6,
   anchors=[dict(id='hyd',g=[-69,-104]),dict(id='cam',g=[47,-103]),dict(id='jet',g=[94,-79]),dict(id='crs',g=[96,-20]),dict(id='trk',g=[-40,-10]),dict(id='alu',g=[-20,-50])]),
 2:dict(t=(2.97,3.2),co=([1090,606,480],[1112,610,440]),extra=SL,hide=[],spin=10,
   anchors=[dict(id='vac',e='#truck',f=[.3,.32]),dict(id='hose',pp=['#hosep',.55]),dict(id='mh',w=[1135,600]),dict(id='rob',r=[-20,-128])]),
 3:dict(t=(3.45,3.9),co=([1380,622,360],[1380,624,350]),follow=dict(r=[0,0],fx=.44),extra=SL,hide=["#sig","#sigd"],spin=14,crush=True,
   anchors=[dict(id='crs',r=[96,-14]),dict(id='suck',x=['mid',0,0]),dict(id='sl',x=['face',40,-34]),dict(id='hose',pp=['#hosep',.04]),dict(id='cam',r=[47,-103])]),
 4:dict(t=(6.27,6.6),co=([1300,612,390],[1300,614,370]),follow=dict(e='#men > .man:last-child',fx=.40),extra=SL,hide=[],spin=0,
   anchors=[dict(id='man',e='#men > .man:last-child',f=[.55,.06]),dict(id='spr',e='#spray',f=[.7,.5]),dict(id='res',e='#spray',f=[1.08,.8])]),
 5:dict(t=(7.30,7.90),co=([2270,612,620],[2262,614,560]),extra=[],hide=[],spin=0,
   anchors=[dict(id='in',w=[2093,620]),dict(id='dec',w=[2230,588]),dict(id='cake',w=[2382,668]),dict(id='liq',w=[2198,672])]),
}
FPS=24;N=144;M=0
def ease(x):return x*x*(3-2*x)
def jobs(n,frames):
    sp=SPEC[n];out=[]
    for i in frames:
        u=i/N;e=ease(min(1,u)) if u<=1 else 1
        t=sp['t'][0]+(sp['t'][1]-sp['t'][0])*u
        co=[a+(b-a)*e for a,b in zip(*sp['co'])]
        out.append(dict(name=f'v{n}_{i:03d}',t=t,time=12000+i*1000/FPS,co=co,follow=sp.get('follow'),extra=sp['extra'],hide=sp['hide'],spin=sp['spin'],crush=sp.get('crush',False),k=i,anchors=sp['anchors'],wait=20))
    return out
if __name__=='__main__':
    n=int(sys.argv[1]);fr=[int(x) for x in sys.argv[2].split(',')] if len(sys.argv)>2 and sys.argv[2]!='all' else list(range(N+M))
    json.dump(jobs(n,fr),open(sys.argv[3] if len(sys.argv)>3 else f'j47_{n}.json','w'))
