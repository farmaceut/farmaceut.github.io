// profile pipeline: all semiclassical methods vs the exact 1D benchmark on matched profiles
const C = require('../core.js'), S = require('../semiclassical.js');
const V1 = +process.argv[2] || 12, dE = process.argv[3] !== undefined ? +process.argv[3] : -8, nu = +process.argv[4] || 1800;
const Ts = [200, 250, 298.15, 400, 600];
const fams = (process.argv[5] || 'gauss,sech2,lorentz,sech4').split(',');
for (const fam of fams) {
  const t0 = Date.now();
  const p = C.matchProfile(fam, V1, dE, nu);
  const ex = C.exactForProfile(p).kappa(Ts, {}).kappa;
  const r = S.profileMethods(p, Ts);
  console.log(`\n${fam}: V‡=${p.Vmax.toFixed(3)} dE=${p.dE} nu=${p.nuAct.toFixed(1)}  coefs(red): G0=${r.info.coefs.G0.toFixed(4)} X0=${r.info.coefs.X0.toFixed(4)} Z=${r.info.coefs.Z.toExponential(2)}  (${Date.now() - t0} ms)`);
  const rows = [['T', 'exact', 'inst', 'USIT', 'USIT1', 'Kemble*', 'SVPT2', 'SVPT4', 'mSVPT4', 'mVPT2', 'mYF']];
  Ts.forEach((T, i) => rows.push([T, ex[i], r.inst[i], r.usit[i], r.usit1[i], r.usitNum[i], r.svpt2[i], r.svpt4[i], r.msvpt4[i], r.mvpt2[i], r.myf[i]]));
  rows.forEach((row, i) => console.log(row.map((v) => (typeof v === 'number' ? (isFinite(v) ? (v > 1e4 ? v.toExponential(2) : v.toFixed(3)) : 'NaN') : v).toString().padStart(9)).join('')));
  console.log('  ratio to exact:');
  Ts.forEach((T, i) => console.log(String(T).padStart(9), ['inst', 'usit', 'usit1', 'usitNum', 'svpt2', 'svpt4', 'msvpt4', 'mvpt2', 'myf'].map((k) => (isFinite(r[k][i]) ? (r[k][i] / ex[i]).toFixed(3) : 'NaN').padStart(8)).join('')));
}
