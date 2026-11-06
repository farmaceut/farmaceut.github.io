// Direct comparison JS vs the author's Python package (reference values in tests/pyref/*.json, produced by gen_ref.py).
// Usage: node tests/python_agreement.js [--verbose]
const fs=require('fs'),path=require('path');const C=require('../core.js'),Tk=require('../tasks.js');
const dir=path.join(__dirname,'pyref');const files=fs.readdirSync(dir).filter(f=>/^ref_.*\.json$/.test(f)).sort();
const verbose=process.argv.includes('--verbose');
const rel=(a,b)=>Math.abs(a/b-1);
const worst={};const note=(k,v,tag)=>{if(!(k in worst)||v>worst[k].v)worst[k]={v,tag};};
const groups={};files.forEach(f=>{const r=JSON.parse(fs.readFileSync(path.join(dir,f)));const key=[r.V1t,r.dEt,r.nut].join('/');(groups[key]=groups[key]||[]).push(r);});
for(const [key,refs] of Object.entries(groups)){
  const [V1,dE,nu]=key.split('/').map(Number);
  const Ts=refs[0].T;
  const res=Tk.runProfiles({V1,dE,nu,Ts,families:refs.map(r=>r.family),rho:1,iso:false,fine:false});
  if(res.errors.length)console.log('JS errors',key,JSON.stringify(res.errors));
  for(const r of refs){
    const j=res.families.find(f=>f.key===r.family); if(!j){console.log('missing',r.family,key);continue;}
    const tag=`${r.family} ${key}`;
    note('V1 seen',rel(j.V1,r.V1),tag);note('V2 seen',rel(j.V2,r.V2),tag);note('nu seen',rel(j.nu,r.nu),tag);
    Ts.forEach((T,i)=>{
      const t2=`${tag} T=${T}`;
      note('exact',rel(j.exact[i],r.exact[i]),t2);
      note('Wigner',rel(C.kappaWigner(r.nu,T),r.wigner[i]),t2);
      note('parabola (closed form)',rel(C.kappaParabola(r.V1,r.V2,r.nu,T),r.parab[i]),t2);
      note('Eckart',rel(C.kappaEckart(r.V1,r.V2,r.nu,T),r.eckart[i]),t2);
      note('ZCT-MEP (Kemble)',rel(j.models.zct[i],r.zct[i]),t2);
      note('ZCT-MEP (WKB)',rel(j.models.zctWKB[i],r.zctwkb[i]),t2);
      note('ZCT-EC',rel(j.models.zctEC[i],r.zctec[i]),t2);
      note('EQ-FREQ',rel(j.models.eq[i],r.eq[i]),t2);
      note('nu_eff',rel(j.models.nuEff[i],r.nueff[i]),t2);
      if(verbose)console.log(t2.padEnd(34),'exact',j.exact[i].toPrecision(6),r.exact[i].toPrecision(6),'| zct',j.models.zct[i].toPrecision(6),r.zct[i].toPrecision(6),'| EC',j.models.zctEC[i].toPrecision(6),r.zctec[i].toPrecision(6),'| EQ',j.models.eq[i].toPrecision(6),r.eq[i].toPrecision(6));
    });
  }
}
console.log(`\nJS vs Python: ${files.length} matched profiles, max relative difference per quantity`);
for(const [k,w] of Object.entries(worst))console.log('  '+k.padEnd(26)+(100*w.v).toExponential(2).padStart(11)+' %   at '+w.tag);
