// ORCA *_trj.xyz: JS parser + ZCT-MEP vs the Python package (parse_orca.load_irc + ZCT) on the same file.
const fs=require('fs'),path=require('path');const I=require('../irc.js'),C=require('../core.js');
const py=JSON.parse(fs.readFileSync(path.join(__dirname,'pyref','irc_orca_synthetic.json')));
const text=fs.readFileSync(path.join(__dirname,'..','examples','synthetic_ORCA_IRC_Full_trj.xyz'),'utf8');
const rel=(a,b)=>Math.abs(a/b-1);
for(const set of ['std','iso']){
  const r=I.orcaPath([{name:'TS_IRC_Full_trj.xyz',text}],{massSet:set});
  const n=r.s.length, ds=r.s.map((v,i)=>v-r.s[0]), pds=py.s.map(v=>v-py.s[0]);
  let ms=0;for(let i=0;i<n;i++)ms=Math.max(ms,Math.abs(ds[i]-pds[i]));
  let mv=0;for(let i=0;i<n;i++)mv=Math.max(mv,Math.abs(r.V[i]-py.V[i]));
  const pm=new C.PathModel(r.s,r.V,{nu:1800});
  console.log(`masses=${set}: max|Δs| ${ms.toExponential(2)} Å·amu^½ (s span ${pds[n-1].toFixed(4)}), max|ΔV| ${mv.toExponential(2)} kcal/mol, V1 ${pm.V1.toFixed(5)} (py ${py.V1.toFixed(5)}), V2 ${pm.V2.toFixed(5)} (py ${py.V2.toFixed(5)})`);
  console.log('   kappa ZCT-MEP  JS vs Python:',[200,298.15,400].map(T=>`${T} K ${pm.kappa(T).toPrecision(6)} / ${py.kappa[String(T)].toPrecision(6)} (${(100*rel(pm.kappa(T),py.kappa[String(T)])).toFixed(3)} %)`).join(' | '));
}
