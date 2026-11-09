import sys,os,json;S=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,S)
from comp2 import comp
from PIL import Image
def one(d,n,t=0.0,size=(1600,944)):
    A=f'{d}/{n}_A.png';bl=f'{d}/_blank.png'
    if not os.path.exists(bl):Image.new('RGBA',Image.open(A).size,(0,0,0,0)).save(bl)
    comp(A,f'{d}/{n}_B.png',bl,f'{d}/{n}.png',size=size,t=t)
if __name__=='__main__':
    d=sys.argv[1]
    for n in sys.argv[2:]:one(d,n)
