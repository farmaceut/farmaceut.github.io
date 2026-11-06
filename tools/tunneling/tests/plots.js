const P=require('../plots.js'); const fs=require('fs');
const c=new P.Chart({title:'(a) test',xlabel:'T (K)',ylabel:'κ(T)',ylog:true});
const T=[...Array(30)].map((_,i)=>200+i*10);
c.add({x:T,y:T.map(t=>1+Math.exp(15-t/25)),label:'Eckart',color:'#1f77b4'}).add({x:T,y:T.map(t=>1+Math.exp(17-t/25)),label:'parabola',color:'#7a4fd6',dash:'6 3'}).add({x:T,y:T.map(t=>1+(t/50)**-2),label:'Wigner',color:'#555',dash:'1 3',width:2});
fs.writeFileSync('/tmp/claude-0/work/t7.svg',c.render());
console.log('ok');
