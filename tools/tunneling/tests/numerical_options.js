const C=require('../core.js');
const p=C.matchProfile('gauss',12,-8,1800);
for(const o of [{}, {fine:true},{hScale:0.5},{boxScale:1.5}]){
  const ex=C.exactForProfile(p,o); const r=ex.kappa([298.15,200],o);
  console.log(JSON.stringify(o), r.kappa.map(v=>v.toPrecision(7)).join(' '), 'V1',ex.V1, 'nodes',r.nodes.length);
}
