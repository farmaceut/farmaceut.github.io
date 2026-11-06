// SVPT4 / mSVPT4 vs Tables I-III of Pollak & Upadhyayula, J. Chem. Phys. 160, 184110 (2024) (dimensionless units hbar = M = 1)
const S = require('../semiclassical.js'); const { Jet } = S;
const pi = Math.PI;
function derivs(fJet, q0) { const f = fJet(Jet.variable(q0)); const d = []; for (let k = 0; k <= 8; k++) d.push(f.deriv(k)); return d; }
const cases = [
  { name: 'symmetric Eckart', Vs: 18 / pi ** 2, q0: 0,
    f: (x) => x.scale(0.5).cosh().square().recip().scale(18 / pi ** 2), Vnum: (q) => 18 / pi ** 2 / Math.cosh(q / 2) ** 2, Vprod: 0,
    // [u, kappa_ex, SVPT4, mSVPT4] from Table I
    tab: [[2, 1.22386, 1.22387, 1.22393], [4, 2.07134, 2.07145, 2.07166], [8, 21.7693, 21.7761, 21.8163], [12, 1973.35, 1975.70, 2003.76], [16, 740436, 743031, 774284], [20, 5.34360e8, 5.38635e8, 5.83249e8]] },
  { name: 'Gaussian', Vs: 72 / pi ** 2, q0: 0,
    f: (x) => x.square().scale(-1).exp().scale(72 / pi ** 2), Vnum: (q) => 72 / pi ** 2 * Math.exp(-q * q), Vprod: 0,
    tab: [[2, 1.21675, 1.21669, 1.21665], [4, 2.09622, 2.09594, 2.09541], [8, 29.4861, 29.7792, 29.3506], [12, 5353.38, 6144.13, 5347.00], [16, 3.64374e6, 5.76512e6, 3.78836e6], [20, 3.98552e9, 9.98947e9, 4.42194e9]] },
  (() => {
    const v1 = 32 / pi ** 2, v2 = 4 * v1, q0 = 0.5 * Math.log(v1 / v2);
    const Vnum = (q) => (v1 - v2) / (1 + Math.exp(-q)) + (Math.sqrt(v1) + Math.sqrt(v2)) ** 2 / (4 * Math.cosh(q / 2) ** 2);
    return { name: 'asymmetric Eckart (v2=4v1)', Vs: v1, q0, Vnum, Vprod: v1 - v2,
      f: (x) => x.scale(-1).exp().add(1).recip().scale(v1 - v2).add(x.scale(0.5).cosh().square().recip().scale((Math.sqrt(v1) + Math.sqrt(v2)) ** 2 / 4)),
      tab: [[2, 1.19504, 1.19508, 1.19501], [4, 2.01472, 2.01534, 2.01435], [8, 26.0970, 26.4837, 26.0305], [12, 4067.82, 4579.31, 4031.10], [16, 2.44532e6, 3.39012e6, 2.41641e6], [20, 2.47674e9, 4.51254e9, 2.45524e9]] };
  })()
];
let worst = { s4: 0, m4: 0 };
for (const c of cases) {
  const d = derivs(c.f, c.q0), w = Math.sqrt(-d[2]);
  const coefs = S.cleanCoefs(S.svptCoefs(d, w), 1);
  console.log(c.name, ' V‡ =', d[0].toFixed(6), ' omega =', w.toFixed(6), ' V‡/omega =', (d[0] / w).toFixed(6), '(6/pi = ' + (6 / pi).toFixed(6) + ')');
  for (const [u, kex, k4p, m4p] of c.tab) {
    const kk = S.kappaSVPT(coefs, d[0], w, u * 1.0 / 1, 4);
    // u = omega*beta; our reduced beta = u / w (energy unit: hbar*omega=w)
    const k4 = S.kappaSVPT(coefs, d[0], w, u / w, 4);
    const Vq = (q) => c.Vnum(c.q0 + q);
    const mm = S.kappaMSVPT4(Vq, d, w, d[0], u / w, c.Vprod).kappa;
    const e4 = k4 / k4p - 1, em = mm / m4p - 1;
    worst.s4 = Math.max(worst.s4, Math.abs(e4)); worst.m4 = Math.max(worst.m4, Math.abs(em));
    console.log('  u=' + String(u).padStart(2), 'SVPT4', k4.toPrecision(6), 'paper', k4p, 'rel', e4.toExponential(1), '| mSVPT4', mm.toPrecision(6), 'paper', m4p, 'rel', em.toExponential(1));
  }
}
console.log('max |rel| SVPT4 =', worst.s4.toExponential(2), ' mSVPT4 =', worst.m4.toExponential(2));
