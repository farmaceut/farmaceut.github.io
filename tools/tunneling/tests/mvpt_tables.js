// mVPT2 / mYF vs Table 2 (asymmetric Eckart) and Table 1 (symmetric Eckart) of Upadhyayula & Pollak, J. Phys. Chem. A 128, 3434 (2024)
const S = require('../semiclassical.js'), C = require('../core.js'); const { Jet } = S; const pi = Math.PI;
function derivs(fJet, q0) { const f = fJet(Jet.variable(q0)); const d = []; for (let k = 0; k <= 8; k++) d.push(f.deriv(k)); return d; }
function numericAction(Vnum, q0, Vs, Vprod) {           // theta(E) = S/2, hbar = m = 1, E in (Vprod, Vs)
  return (E) => {
    const g = (q) => Vnum(q0 + q) - E;
    let a = 0, b = -0.25; while (g(b) > 0 && b > -80) { a = b; b -= 0.25; } const qL = C.brent(g, b, a, 1e-14);
    a = 0; b = 0.25; while (g(b) > 0 && b < 80) { a = b; b += 0.25; } const qR = C.brent(g, a, b, 1e-14);
    const N = 160, half = 0.5 * (qR - qL), mid = 0.5 * (qR + qL); let s = 0;
    for (let k = 1; k <= N; k++) { const th = k * pi / (N + 1); s += Math.sin(th) * Math.sqrt(Math.max(2 * (Vnum(q0 + mid + half * Math.cos(th)) - E), 0)); }
    return half * pi / (N + 1) * s;                     // S/2 = integral sqrt(2(V-E)) dq
  };
}
const v1 = 32 / pi ** 2, v2 = 4 * v1, q0a = 0.5 * Math.log(v1 / v2);
const VA = (q) => (v1 - v2) / (1 + Math.exp(-q)) + (Math.sqrt(v1) + Math.sqrt(v2)) ** 2 / (4 * Math.cosh(q / 2) ** 2);
const fA = (x) => x.scale(-1).exp().add(1).recip().scale(v1 - v2).add(x.scale(0.5).cosh().square().recip().scale((Math.sqrt(v1) + Math.sqrt(v2)) ** 2 / 4));
const tabA = [[2, 1.195, 1.196, 1.195], [4, 2.015, 2.025, 2.015], [6, 5.322, 5.401, 5.322], [8, 26.097, 26.989, 26.095], [10, 251.558, 267.471, 251.570], [12, 4067.815, 4460.496, 4069.390], [16, 2.445e6, 2.848e6, 2.450e6], [20, 2.476e9, 3.069e9, 2.489e9]];
const Vsy = 18 / pi ** 2;
const VS = (q) => Vsy / Math.cosh(q / 2) ** 2;
const fS = (x) => x.scale(0.5).cosh().square().recip().scale(Vsy);
// Table 1 (symmetric Eckart): exact, mYF ... (only exact-column check of the structure; mVPT2 = SVPT2 for the symmetric Eckart barrier)
for (const [name, Vf, fj, q0, Vprod, tab] of [['asymmetric Eckart', VA, fA, q0a, v1 - v2, tabA]]) {
  const d = derivs(fj, q0), w = Math.sqrt(-d[2]), c = S.cleanCoefs(S.svptCoefs(d, w), 1);
  const th = numericAction(Vf, q0, d[0], Vprod);
  const act = S.makeAction(th, d[0], Math.max(0, Vprod));
  console.log(name, ' E0 = G0 =', c.G0.toFixed(5), ' dS = 2 pi G0/w =', (2 * pi * c.G0 / w).toFixed(4), '(paper: dS = -0.0685 for the asymmetric barrier, x_FF = X0 =', c.X0.toFixed(5) + ')');
  let worst = 0;
  for (const [u, ex, mv, myf] of tab) {
    const beta = u / w, r = S.kappaHbar2(act, c.G0 / w, c.X0 / w, w, beta, Vprod);
    worst = Math.max(worst, Math.abs(r.mVPT2 / mv - 1), Math.abs(r.mYF / myf - 1));
    console.log('  u=' + String(u).padStart(2), 'mVPT2', r.mVPT2.toPrecision(6), '(paper', mv + ')', ' mYF', r.mYF.toPrecision(6), '(paper', myf + ')', ' exact(paper)', ex);
  }
  console.log('  max |rel| =', worst.toExponential(2));
}
