// USIT / instanton vs Table 1 of Upadhyayula & Pollak, J. Phys. Chem. Lett. 14, 9892 (2023): symmetric Eckart, V‡/(hbar omega) = 6/pi
const S = require('../semiclassical.js');
const pi = Math.PI, Vs = 6 / pi;                                  // energies in units of hbar*omega
const act = S.analyticAction((E) => 24 * (1 - Math.sqrt(E / Vs)), (E) => -12 / Math.sqrt(E * Vs), (E) => 6 / (E * Math.sqrt(E * Vs)), Vs, 0);
// [u, exact, usc_num, usc1, usc (eq 9), standard instanton]
const tab = [[0.5, 1.016, 1.004, 1.069, 0.570, NaN], [1, 1.064, 1.030, 1.055, 0.708, NaN], [2, 1.224, 1.149, 1.104, 0.906, NaN], [3, 1.525, 1.391, 1.278, 1.157, NaN], [4, 2.071, 1.839, 1.651, 1.581, NaN],
  [6, 5.198, 4.414, 4.257, 4.250, NaN], [8, 21.769, 17.973, 20.766, 20.766, 21.995], [10, 161.905, 132.174, 136.013, 136.013, 136.186], [12, 1973.338, 1606.829, 1613.027, 1613.004, 1613.149],
  [16, 7.404e5, 6.036e5, 6.037e5, 6.036e5, 6.036e5], [20, 5.343e8, 4.374e8, 4.374e8, 4.373e8, 4.373e8]];
let w = 0;
console.log('  u     usc,num (paper)      usc1 (paper)         usc eq9 (paper)      standard (paper)');
for (const [u, ex, num, u1, u0, st] of tab) {
  const r = S.kappaUSIT(act, u), s = S.kappaInstanton(act, u);
  const rel = (a, b) => (b ? a / b - 1 : NaN);
  [rel(r.kappaNum, num), rel(r.kappa1, u1), rel(r.kappa, u0), isNaN(st) ? 0 : rel(s.kappa, st)].forEach((e) => { if (Math.abs(e) > w) w = Math.abs(e); });
  console.log(String(u).padStart(4), r.kappaNum.toPrecision(5).padStart(10), '(' + num + ')', r.kappa1.toPrecision(5).padStart(10), '(' + u1 + ')', r.kappa.toPrecision(5).padStart(10), '(' + u0 + ')', isFinite(s.kappa) ? s.kappa.toPrecision(5) : ('n/a: ' + s.reason), '(' + st + ')');
}
console.log('max |rel| =', w.toExponential(2));
