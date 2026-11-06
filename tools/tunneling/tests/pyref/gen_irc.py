# usage: TUNNELING_PROJECT=/path/to/Tunneling python3 -I gen_irc.py <dir with TS_IRC_Full_trj.xyz> out.json
import sys, json, warnings
import os
PROJ=os.environ.get('TUNNELING_PROJECT','./Tunneling')
sys.path.insert(0,PROJ); warnings.simplefilter('ignore')
from irc.parse_orca import load_irc
from methods.zct import ZCT
s,V,_=load_irc(sys.argv[1],'TS')
z=ZCT(s,V,nu_imag=1800.0)
json.dump(dict(s=list(map(float,s)),V=list(map(float,V)),kappa={str(T):z.kappa(T) for T in (200,298.15,400)},V1=z.V1,V2=z.V2),open(sys.argv[2],'w'))
print('ok',len(s),z.V1,z.V2,[z.kappa(T) for T in (200,298.15,400)])
