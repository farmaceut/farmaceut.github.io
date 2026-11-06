const C=require('../core.js');
function eckartV(V1,V2,nu){const A=V1-V2,B=Math.pow(Math.sqrt(V1)+Math.sqrt(V2),2);const t=(A+B)/(2*B), l=Math.sqrt(2*B)*t*(1-t), K=nu/C.CONST.NUCONST;
  return (s)=>{const xi=s*K/l; const tt=1/(1+Math.exp(-xi)); return A*tt+B*tt*(1-tt);}, {};}
function eckV(V1,V2,nu){const A=V1-V2,B=Math.pow(Math.sqrt(V1)+Math.sqrt(V2),2);const t=(A+B)/(2*B), l=Math.sqrt(2*B)*t*(1-t), K=nu/C.CONST.NUCONST;
  return (s)=>{const xi=s*K/l; const tt=1/(1+Math.exp(-xi)); return A*tt+B*tt*(1-tt);};}
const V1=12,V2=20,nu=1800;
const Vf=eckV(V1,V2,nu);
const L=12; // A sqrt amu: xi range ~ L*K/l
let t0=Date.now();
const ex=new C.ExactSolver(Vf,-L,L); ex.nuEst=nu;
const Ts=[200,298.15,400];
const r=ex.kappa(Ts);
console.log('nodes',r.nodes.length,'ms',Date.now()-t0);
console.log('V1,V2',ex.V1,ex.V2);
Ts.forEach((T,i)=>console.log(T,r.kappa[i],C.kappaEckart(V1,V2,nu,T),r.kappa[i]/C.kappaEckart(V1,V2,nu,T)-1,'fsub',r.fsub[i]));
// P(E) check
for(const E of [4,8,12,16]){const lt=ex.lnT(E); console.log('E',E,Math.exp(lt),Math.exp(C.eckartLnT(E,V1,V2,C.CONST.HNU*nu)));}
