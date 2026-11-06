const I=require('../irc.js'), C=require('../core.js');
// synthetic ORCA IRC: Eckart MEP carried by atom H between C and O, random rotations/translations
function rng(seed){let s=seed;return()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;}}
const rnd=rng(7);
function rot(){const q=[0,0,0,0].map(()=>rnd()-0.5);const n=Math.hypot(...q);const [a,b,c,d]=q.map(x=>x/n);
 return [[a*a+b*b-c*c-d*d,2*(b*c-a*d),2*(b*d+a*c)],[2*(b*c+a*d),a*a-b*b+c*c-d*d,2*(c*d-a*b)],[2*(b*d-a*c),2*(c*d+a*b),a*a-b*b-c*c+d*d]];}
const V1=12,V2=17,nu=1800; const A=V1-V2,B=Math.pow(Math.sqrt(V1)+Math.sqrt(V2),2);const t=(A+B)/(2*B), l=Math.sqrt(2*B)*t*(1-t), K=nu/C.CONST.NUCONST;
const mH=I.MASS.H,mC=I.MASS.C,mO=I.MASS.O, fac=Math.sqrt(mH*(1-mH/(mH+mC+mO)));
const n=161,span=10; const L=[],sTrue=[];
for(let i=0;i<n;i++){const xi=-span+2*span*i/(n-1);const tt=1/(1+Math.exp(-xi));const v=A*tt+B*tt*(1-tt);const si=xi*l/K;sTrue.push(si);
  const base=[[0,0,0],[2.5,0,0],[1.25+si/fac,0,0]];const R=rot();const tr=[rnd()*5,rnd()*5,rnd()*5];
  L.push('3',`Coordinates from ORCA-job TS_IRC_Full E ${(-100+v/I.HARTREE_KCAL).toFixed(10)}`);
  ['C','O','H'].forEach((a,k)=>{const p=base[k];const x=[0,1,2].map(r=>R[r][0]*p[0]+R[r][1]*p[1]+R[r][2]*p[2]+tr[r]);L.push(`${a} ${x[0].toFixed(8)} ${x[1].toFixed(8)} ${x[2].toFixed(8)}`)});}
const res=I.orcaPath([{name:'TS_IRC_Full_trj.xyz',text:L.join('\n')+'\n'}]);
// compare shapes: s relative to TS, V
const iTop=res.V.indexOf(Math.max(...res.V)); const iTopT=0;
let maxds=0; const s0=res.s[iTop]; let tt=0; sTrue.forEach((v,i)=>{ if(Math.abs(v)<Math.abs(sTrue[tt]))tt=i;});
for(let i=0;i<n;i++){maxds=Math.max(maxds,Math.abs((res.s[i]-s0)-(sTrue[i]-sTrue[tt])));}
console.log('ORCA synthetic: max |ds|',maxds,'  V1',Math.max(...res.V),'  dE',res.V[n-1]-res.V[0]);
const pm=new C.PathModel(res.s,res.V); console.log('pm V1,V2,nuPath',pm.V1,pm.V2,pm.nuPath,'kappa',pm.kappa(298.15),'vs',C.kappaZCTonEckart(12,17,1800,298.15));
// Gaussian synthetic summary
const gl=['x',' Summary of reaction path following','                 (Int. Coord: Bohr amu(1/2))','                  Energy      RxCoord'];
for(let i=0;i<n;i++){const xi=-span+2*span*i/(n-1);const tt=1/(1+Math.exp(-xi));const v=A*tt+B*tt*(1-tt);gl.push(`${String(i+1).padStart(4)} ${(-76+v/I.HARTREE_KCAL).toFixed(8).padStart(16)} ${(xi*l/K/I.BOHR).toFixed(5).padStart(12)}`);}
gl.push('','Done');
const g=I.gaussianPath(gl.join('\n')); const pg=new C.PathModel(g.s,g.V); console.log('Gaussian synthetic: n',g.n,'V1',pg.V1,'nuPath',pg.nuPath);
console.log('table',I.tablePath('# s V\n'+res.s.map((x,i)=>x+' '+res.V[i]).join('\n')).n);
console.log('freq',I.imaginaryFrequency(' Frequencies --  -1234.5678   120.1  300.2'),I.imaginaryFrequency('\n   6:   -987.65 cm**-1 ***imaginary mode***'));
