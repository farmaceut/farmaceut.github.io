const C=require('../core.js');
const T=298.15, ref={gauss:[54.5,48.6,55.2,54.8,1720],lorentz:[37.5,32.6,37.0,36.5,1637],sech2:[63.4,56.0,63.7,63.4,1750],sech4:[97.5,85.7,97.4,97.7,1838],lorentz2:[63.4,55.7,63.3,63.0,1749]};
for(const fam of Object.keys(ref)){
  let t0=Date.now();
  const p=C.matchProfile(fam,12,-8,1800);
  const ex=C.exactForProfile(p); 
  const r=ex.kappa([T,200]);
  const L=Math.max(10,10*p.w), n=8001, s=[],V=[];
  for(let i=0;i<n;i++){const x=-L+2*L*i/(n-1); s.push(x); V.push(p.V(x));}
  const pm=new C.PathModel(s,V,{nu:p.nuAct});
  const k=C.allModels(pm.V1,pm.dE,pm.nu,[T],pm)[0];
  console.log(fam.padEnd(9),'V0',p.V0.toFixed(3),'w',p.w.toFixed(4),'V1/V2/nu(seen)',ex.V1.toFixed(3),ex.V2.toFixed(3),p.nuAct.toFixed(2),
   '| exact',r.kappa[0].toFixed(2),'ZCT',k.zct.toFixed(2),'EC',k.zctEC.toFixed(2),'EQ',k.eqfreq.toFixed(2),'nuEff',k.nuEff.toFixed(0),'Eck',k.eckart.toFixed(2),
   '| paper',ref[fam].join(' '),'| ms',Date.now()-t0);
}
