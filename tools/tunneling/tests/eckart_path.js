const C=require('../core.js');
// Eckart model path numerical vs analytic theta; ZCT on Eckart
function eckartPath(V1,V2,nu,n=4001,span=40){
  const A=V1-V2,B=Math.pow(Math.sqrt(V1)+Math.sqrt(V2),2);
  const t=(A+B)/(2*B), l=Math.sqrt(2*B)*t*(1-t), K=nu/C.CONST.NUCONST;
  const s=[],V=[];
  for(let i=0;i<n;i++){const xi=-span+2*span*i/(n-1); const tt=1/(1+Math.exp(-xi)); V.push(A*tt+B*tt*(1-tt)); s.push(xi*l/K);}
  return {s,V};
}
let t0=Date.now();
const {s,V}=eckartPath(12,20,1800);
const pm=new C.PathModel(s,V,{nu:1800});
console.log('pm V1,V2,nu',pm.V1,pm.V2,pm.nuPath,pm.nu, 'ms',Date.now()-t0);
for(const T of [200,298.15,400]){
  t0=Date.now();
  const kz=pm.kappa(T), kza=C.kappaZCTonEckart(12,20,1800,T), ke=C.kappaEckart(12,20,1800,T);
  console.log(T,'ZCTpath',kz,'ZCT analytic',kza,'Eckart',ke,'ratio',kz/kza,'ms',Date.now()-t0);
}
t0=Date.now(); const eq=C.kappaEQFREQ(pm,298.15); console.log('EQ',eq, Date.now()-t0);
console.log('EC',C.kappaZCTEC(pm,298.15));
console.log('--- convergence in nDense (path from 20001 pts)');
const p2=eckartPath(12,20,1800,20001,40);
for(const nd of [4001,8001,16001,32001]){
  const pm2=new C.PathModel(p2.s,p2.V,{nu:1800,nDense:nd});
  console.log(nd, pm2.kappa(298.15)/C.kappaZCTonEckart(12,20,1800,298.15));
}
