// systematic comparison: literature semiclassical theories vs ZCT-EC / EQ-FREQ against the exact 1D benchmark (5 parameter sets x 6 profiles x T)
const Tk = require('./../tasks.js');
const sets = [[10, 4, 1500], [12, -8, 1800], [15, -10, 1200], [6.4, -13.3, 1616], [8, 0, 1500]];
const fams = ['gauss', 'lorentz', 'sech2', 'sech4', 'lorentz2', 'shoulder'];
const Ts = [200, 250, 298.15, 350, 400, 500, 600];
const keys = ['zctEC', 'eq', 'zct', 'usit', 'usit1', 'usitNum', 'svpt2', 'svpt4', 'msvpt4', 'mvpt2', 'myf', 'inst'];
const acc = {}; keys.forEach((k) => (acc[k] = { n: 0, nan: 0, lg: [] }));
const rows = [];
for (const [V1, dE, nu] of sets) {
  const res = Tk.runProfiles({ V1, dE, nu, Ts, families: fams, rho: 1, iso: false, fine: false });
  for (const r of res.families) {
    for (let i = 0; i < Ts.length; i++) {
      const ex = r.exact[i]; const put = (k, v) => { if (Number.isFinite(v) && v > 0) acc[k].lg.push(Math.abs(Math.log10(v / ex))); else acc[k].nan++; acc[k].n++; };
      put('zctEC', r.models.zctEC[i]); put('eq', r.models.eq[i]); put('zct', r.models.zct[i]);
      if (r.sc) for (const k of keys.slice(3)) put(k, r.sc[k][i]);
    }
  }
  console.log('done set', V1, dE, nu);
}
const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : NaN; };
console.log('method     n   undefined  median|log10|  90%     max   -> median factor / 90% factor');
for (const k of keys) { const a = acc[k]; console.log(k.padEnd(9), String(a.n).padStart(4), String(a.nan).padStart(6), q(a.lg, .5).toFixed(3).padStart(10), q(a.lg, .9).toFixed(3).padStart(8), Math.max(...a.lg).toFixed(3).padStart(8), '   x' + Math.pow(10, q(a.lg, .5)).toFixed(2), ' x' + Math.pow(10, q(a.lg, .9)).toFixed(2)); }
