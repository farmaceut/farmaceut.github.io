// Sensitivity of the path-based models to implementation choices (spline boundary condition, density of the dense grid,
// refinement of the barrier top, discrete vs analytic Eckart reference). "Python-like" = scipy CubicSpline (not-a-knot),
// n_dense = 20001, argmax without refinement, discrete 801-point Eckart reference path, as described in the author's audit.
const C=require('../core.js');
const V1=12,dE=-8,nu=1800,Ts=[200,298.15,400]; // V2 = 20, as in Table 2
function prof(key,opts){const p=C.matchProfile(key,V1,dE,nu);const L=Math.max(14,14*p.w),n=8001,s=new Float64Array(n),V=new Float64Array(n);
  for(let i=0;i<n;i++){const x=-L+2*L*i/(n-1);s[i]=x;V[i]=p.V(x);}return new C.PathModel(s,V,Object.assign({nu:p.nuAct},opts));}
function eckartPath(v1,v2,nu_,opts){const A=v1-v2,B=Math.pow(Math.sqrt(v1)+Math.sqrt(v2),2),t=(A+B)/(2*B),l=Math.sqrt(2*B)*t*(1-t),K=nu_/C.CONST.NUCONST,n=801,s=[],V=[];
  for(let i=0;i<n;i++){const xi=-10+20*i/(n-1),tt=1/(1+Math.exp(-xi));V.push(A*tt+B*tt*(1-tt));s.push(xi*l/K);}return new C.PathModel(s,V,Object.assign({nu:nu_},opts));}
const pct=(a,b)=>(100*(a/b-1)).toFixed(3).padStart(8)+'%';
const PY={spline:'notaknot',nDense:20001,refineTop:false};
for(const key of ['gauss','lorentz','sech2']){
  const ref=prof(key,{});                 // JS default: natural, 8001, refined top
  const o1=prof(key,{spline:'notaknot'}), o2=prof(key,{nDense:20001}), o3=prof(key,{refineTop:false}), py=prof(key,PY);
  console.log(`\n${key}: V1 JS ${ref.V1.toFixed(5)}  python-like ${py.V1.toFixed(5)};  nuPath JS ${ref.nuPath.toFixed(2)}  py-like ${py.nuPath.toFixed(2)}`);
  console.log('  T      kappa_path(JS)  | not-a-knot | nDense 20001 | no top refinement | all python-like');
  for(const T of Ts){const k=ref.kappa(T);console.log('  '+String(T).padEnd(7)+k.toPrecision(6).padEnd(15)+'|'+pct(o1.kappa(T),k)+'  |'+pct(o2.kappa(T),k)+'    |'+pct(o3.kappa(T),k)+'        |'+pct(py.kappa(T),k));}
  console.log('  ZCT-EC / EQ-FREQ: JS (analytic Eckart ZCT) vs python-like (discrete 801-pt Eckart reference, not-a-knot, 20001, argmax)');
  for(const T of Ts){
    const kJS=C.kappaZCTEC(ref,T), eJS=C.kappaEQFREQ(ref,T).kappa;
    const kp=py.kappa(T), er=eckartPath(py.V1,py.V2,py.nu,PY);
    const kPy=kp*C.kappaEckart(py.V1,py.V2,py.nu,T)/er.kappa(T);
    const ePy=C.kappaEQFREQ(Object.assign(Object.create(Object.getPrototypeOf(py)),py),T,kp).kappa;
    console.log('  '+String(T).padEnd(7)+'EC '+kJS.toPrecision(6)+' vs '+kPy.toPrecision(6)+pct(kPy,kJS)+'   EQ '+eJS.toPrecision(6)+' vs '+ePy.toPrecision(6)+pct(ePy,eJS)+'   (Eckart-path ZCT discrete/analytic '+pct(er.kappa(T),C.kappaZCTonEckart(py.V1,py.V2,py.nu,T)).trim()+')');}
}

// sparse input (typical IRC: 41-121 points): natural vs not-a-knot, same dense grid
console.log('\nSparse IRC-like input (Gaussian profile on [-2.5w, 2.5w], n input points): kappa_path at 298.15 K, natural vs not-a-knot vs exact-profile reference');
{const p=C.matchProfile('gauss',V1,dE,nu), ref=prof('gauss',{}).kappa(298.15), L=Math.max(2.5*p.w,0.8);
 for(const n of [31,41,61,121,241]){const s=[],V=[];for(let i=0;i<n;i++){const x=-L+2*L*i/(n-1);s.push(x);V.push(p.V(x));}
  const a=new C.PathModel(s,V,{nu:p.nuAct}).kappa(298.15), b=new C.PathModel(s,V,{nu:p.nuAct,spline:'notaknot'}).kappa(298.15);
  console.log('  n='+String(n).padEnd(4)+'natural '+pct(a,ref)+'   not-a-knot '+pct(b,ref)+'   (vs dense-profile '+ref.toPrecision(6)+')');}}
