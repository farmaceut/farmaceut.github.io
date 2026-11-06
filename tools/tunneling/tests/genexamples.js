// Generates synthetic (Eckart-model) example inputs in ../examples: ORCA *_trj.xyz and a Gaussian-style IRC summary.
const fs=require('fs'),path=require('path'),I=require('../irc.js'),C=require('../core.js');
function rng(seed){let s=seed;return()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;}}
const rnd=rng(7);
function rot(){const q=[0,0,0,0].map(()=>rnd()-0.5);const n=Math.hypot(...q);const [a,b,c,d]=q.map(x=>x/n);
 return [[a*a+b*b-c*c-d*d,2*(b*c-a*d),2*(b*d+a*c)],[2*(b*c+a*d),a*a-b*b+c*c-d*d,2*(c*d-a*b)],[2*(b*d-a*c),2*(c*d+a*b),a*a-b*b-c*c+d*d]];}
const V1=12,V2=17,nu=1800;const A=V1-V2,B=Math.pow(Math.sqrt(V1)+Math.sqrt(V2),2);const t=(A+B)/(2*B),l=Math.sqrt(2*B)*t*(1-t),K=nu/C.CONST.NUCONST;
const mH=I.MASS.H,mC=I.MASS.C,mO=I.MASS.O,fac=Math.sqrt(mH*(1-mH/(mH+mC+mO)));
const n=161,span=10;const L=[],G=['',' Summary of reaction path following','                 (Int. Coord: Bohr amu(1/2))','                  Energy      RxCoord'];
for(let i=0;i<n;i++){const xi=-span+2*span*i/(n-1);const tt=1/(1+Math.exp(-xi));const v=A*tt+B*tt*(1-tt);const si=xi*l/K;
  const base=[[0,0,0],[2.5,0,0],[1.25+si/fac,0,0]];const R=rot();const tr=[rnd()*5,rnd()*5,rnd()*5];
  L.push('3',`Coordinates from ORCA-job TS_IRC_Full E ${(-100+v/I.HARTREE_KCAL).toFixed(10)}`);
  ['C','O','H'].forEach((a,k)=>{const p=base[k];const x=[0,1,2].map(r=>R[r][0]*p[0]+R[r][1]*p[1]+R[r][2]*p[2]+tr[r]);L.push(`${a} ${x[0].toFixed(8)} ${x[1].toFixed(8)} ${x[2].toFixed(8)}`)});
  G.push(`${String(i+1).padStart(4)} ${(-76+v/I.HARTREE_KCAL).toFixed(8).padStart(16)} ${(si/I.BOHR).toFixed(5).padStart(12)}`);}
G.push('','Normal termination of Gaussian');
const d=path.join(__dirname,'..','examples');
fs.writeFileSync(path.join(d,'synthetic_ORCA_IRC_Full_trj.xyz'),L.join('\n')+'\n');
fs.writeFileSync(path.join(d,'synthetic_Gaussian_IRC.log'),G.join('\n')+'\n');
fs.writeFileSync(path.join(d,'synthetic_table_s_V.csv'),'# s (angstrom*amu^0.5)   V (kcal/mol)\n'+Array.from({length:n},(_,i)=>{const xi=-span+2*span*i/(n-1);const tt=1/(1+Math.exp(-xi));return (xi*l/K).toFixed(6)+', '+(A*tt+B*tt*(1-tt)).toFixed(6)}).join('\n')+'\n');
console.log('written');
