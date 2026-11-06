const C=require('../core.js');
let t0=Date.now();
const p=C.matchProfile('double',12,0,1800);
console.log('w',p.w,'maxima',p.countMaxima(),'xmax',p.xMax,'Vmax',p.Vmax,'nu',p.nuAct, 'dip%', (()=>{const v0=p.V(0); return (1-v0/p.Vmax)*100})());
const ex=C.exactForProfile(p); const r=ex.kappa([298.15,200],{fine:true});
const L=Math.max(14,14*p.w),n=8001,s=[],V=[];for(let i=0;i<n;i++){const x=-L+2*L*i/(n-1);s.push(x);V.push(p.V(x));}
const pm=new C.PathModel(s,V,{nu:p.nuAct});
const m=C.allModels(pm.V1,pm.dE,pm.nu,[298.15,200],pm);
console.log('V1,V2,nu',ex.V1,ex.V2,p.nuAct);
console.log('exact',r.kappa,'paper 2.23 483');
console.log('Eck',m.map(x=>x.eckart),'paper 68.40 5.9e4');
console.log('ZCT',m.map(x=>x.zct),'paper 2.92 359');
console.log('EC',m.map(x=>x.zctEC),'paper 3.41 420', 'ms',Date.now()-t0);
// shoulder
const q=C.matchProfile('shoulder',12,-8,1800); console.log('shoulder w',q.w,'maxima',q.countMaxima(),q.V1,q.V2,q.nuAct);
