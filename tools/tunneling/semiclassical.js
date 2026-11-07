/* Semiclassical transmission-probability theories for a one-dimensional barrier (reference implementations of published equations):
 *   - standard (Miller / Affleck) instanton                      [Upadhyayula & Pollak, J. Phys. Chem. Lett. 14, 9892 (2023), eq 4]
 *   - uniform semiclassical instanton (USIT), with and without the high-energy correction     [same, eqs 7-10, 17-23]
 *   - numerically integrated uniform-semiclassical (Kemble) kappa on the same action          [same, "T_usc,num"]
 *   - modified VPT2 and modified Yasumori-Fueki (mVPT2, mYF)       [Upadhyayula & Pollak, J. Phys. Chem. A 128, 3434 (2024)]
 *   - SVPT2 / SVPT4 and modified SVPT4 (hbar^4 theory)             [Pollak & Upadhyayula, J. Chem. Phys. 160, 184110 (2024)]
 *   - exact-WKB transmission P = 1/(1+exp(W/hbar)), W = W0 + hbar^2 W2 + hbar^4 W4 (1D part)  [Lawrence, J. Chem. Phys. 163, 234119 (2025), eqs 3.4, 4.9, B1]
 *     (loop integrals on an ellipse in the complex plane; needs V, V', V'' at complex q, i.e. closed-form profiles)
 * Everything here needs only the barrier profile of ONE coordinate (action S(E) for the instanton family, derivatives V2..V8 of the
 * potential at the barrier top for the VPT family).  Taylor derivatives at the top come from truncated power-series ("jet") arithmetic,
 * so they are exact for the closed-form model profiles; they are NOT available for a tabulated IRC.  MIT licence.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./core.js'));
  else root.TunnelingSC = factory(root.TunnelingCore);
})(typeof self !== 'undefined' ? self : this, function (C) {
  'use strict';
  const { HNU, R_KCAL, CTHETA } = C.CONST;
  const TWO_PI = 2 * Math.PI;

  // ------------------------------------------------------------------ truncated power series (jets)
  const NJ = 9;                                   // coefficients 0..8
  class Jet {
    constructor(c) { this.c = c; }
    static variable(x0) { const c = new Array(NJ).fill(0); c[0] = x0; c[1] = 1; return new Jet(c); }
    static constant(a) { const c = new Array(NJ).fill(0); c[0] = a; return new Jet(c); }
    static lift(a) { return a instanceof Jet ? a : Jet.constant(a); }
    add(b) { b = Jet.lift(b); return new Jet(this.c.map((v, i) => v + b.c[i])); }
    sub(b) { b = Jet.lift(b); return new Jet(this.c.map((v, i) => v - b.c[i])); }
    scale(k) { return new Jet(this.c.map((v) => v * k)); }
    mul(b) {
      b = Jet.lift(b); const o = new Array(NJ).fill(0);
      for (let i = 0; i < NJ; i++) for (let j = 0; i + j < NJ; j++) o[i + j] += this.c[i] * b.c[j];
      return new Jet(o);
    }
    recip() {
      const a = this.c, b = new Array(NJ).fill(0); b[0] = 1 / a[0];
      for (let k = 1; k < NJ; k++) { let s = 0; for (let j = 1; j <= k; j++) s += a[j] * b[k - j]; b[k] = -s * b[0]; }
      return new Jet(b);
    }
    div(b) { return this.mul(Jet.lift(b).recip()); }
    exp() {
      const a = this.c, b = new Array(NJ).fill(0); b[0] = Math.exp(a[0]);
      for (let k = 1; k < NJ; k++) { let s = 0; for (let j = 1; j <= k; j++) s += j * a[j] * b[k - j]; b[k] = s / k; }
      return new Jet(b);
    }
    cosh() { const e = this.exp(), f = this.scale(-1).exp(); return e.add(f).scale(0.5); }
    sinh() { const e = this.exp(), f = this.scale(-1).exp(); return e.sub(f).scale(0.5); }
    tanh() { return this.sinh().div(this.cosh()); }
    square() { return this.mul(this); }
    /** k-th derivative = k! c_k */
    deriv(k) { let f = 1; for (let i = 2; i <= k; i++) f *= i; return this.c[k] * f; }
  }

  /** jet versions of the profile families of core.js (argument: Jet of x/w) */
  const JET_F = {
    gauss: (x) => x.square().scale(-0.5).exp(),
    lorentz: (x) => x.square().add(1).recip(),
    sech2: (x) => x.cosh().square().recip(),
    sech4: (x) => x.cosh().square().square().recip(),
    lorentz2: (x) => x.square().add(1).square().recip(),
    shoulder: (x) => x.square().scale(-0.5).exp().add(x.sub(1.7).square().scale(-0.5 / 0.64).exp().scale(0.45)),
    double: (x) => x.sub(1.2).square().scale(-0.5).exp().add(x.add(1.2).square().scale(-0.5).exp())
  };

  /** physical derivatives V_k (kcal/mol, A, 1 amu) at the top of a core.Profile; k = 0..8 */
  function profileDerivs(p) {
    const f = JET_F[p.family]; if (!f) throw new Error('no jet for family ' + p.family);
    const t = Jet.variable(p.xMax);
    const V = f(t.scale(1 / p.w)).scale(p.V0).add(t.scale(2 / p.w).tanh().add(1).scale(0.5 * p.dE));
    const d = []; for (let k = 0; k <= 8; k++) d.push(V.deriv(k));
    return d;
  }

  // ------------------------------------------------------------------ reduced units (hbar = m = 1, energies in units of hbar*omega)
  /** physical (kcal/mol, A, amu) derivatives -> reduced.  d[0] = V at the top (relative to the reactant asymptote). */
  function reduceDerivs(d, hw) {
    const l = Math.sqrt(2 / (CTHETA * CTHETA * hw));           // oscillator length: hbar^2/m = 2/CTHETA^2 (kcal/mol A^2)
    const r = [d[0] / hw, 0];
    for (let k = 2; k <= 8; k++) r.push(d[k] * Math.pow(l, k) / hw);
    return { Vs: r[0], V: r, ell: l };
  }

  // ------------------------------------------------------------------ SVPT4 coefficients (eqs 2.18-2.24, M = hbar = 1)
  function svptCoefs(V, w) {
    const V2 = V[2], V3 = V[3], V4 = V[4], V5 = V[5], V6 = V[6], V7 = V[7], V8 = V[8];
    const w2 = w * w, w3 = w2 * w, w4 = w2 * w2;
    const G0 = -w2 / 64 * (V4 / V2 ** 2 - 7 / 9 * V3 ** 2 / V2 ** 3);
    const G1 = w4 / (64 * 256) * (V8 / V2 ** 4 - 7 * V4 * V6 / V2 ** 5 + 57 / 8 * V4 ** 3 / V2 ** 6 + 1211 / 81 * V3 ** 2 * V6 / V2 ** 6
      + 1889 / 45 * V3 * V4 * V5 / V2 ** 6 - 44 / 9 * V3 * V7 / V2 ** 5)
      + w4 / (64 * 256) * (-(V5 ** 2) / V2 ** 5 * 123 / 25 - 14777 / 405 * V3 ** 3 * V5 / V2 ** 7 - V3 ** 2 * V4 ** 2 / V2 ** 7 * 40261 / (18 * 36)
        + 43939 / (36 * 18) * V4 * V3 ** 4 / V2 ** 8 - 101479 / 5832 * V3 ** 6 / V2 ** 9);
    const W0 = -w2 / (24 * 16) * (5 / 3 * V6 / V2 ** 3 - 67 / 24 * V4 ** 2 / V2 ** 4 + 51 / 4 * V3 ** 2 * V4 / V2 ** 5 - V3 ** 4 / V2 ** 6 * 385 / 72 - 19 / 3 * V3 * V5 / V2 ** 4);
    const X0 = -w2 / 16 * (V4 / V2 ** 2 - 5 / 3 * V3 ** 2 / V2 ** 3);
    const X1 = -w4 / (24 ** 2 * 32) * (59 * V4 * V6 / V2 ** 5 - 569 / 8 * V4 ** 3 / V2 ** 6 - 7 * V8 / V2 ** 4 - 569 / 3 * V3 ** 2 * V6 / V2 ** 6
      - 489 * V3 * V4 * V5 / V2 ** 6 + 52 * V3 * V7 / V2 ** 5)
      - w4 / (24 ** 2 * 32) * (V5 ** 2 / V2 ** 5 * 217 / 5 + 1591 / 3 * V3 ** 3 * V5 / V2 ** 7 + 20671 / 24 * V3 ** 2 * V4 ** 2 / V2 ** 7
        - 26665 / 24 * V4 * V3 ** 4 / V2 ** 8 + 69685 / 216 * V3 ** 6 / V2 ** 9);
    const Y = w3 / 96 * (17 / 24 * V4 ** 2 / V2 ** 4 - 1 / 3 * V6 / V2 ** 3 - 25 / 4 * V3 ** 2 * V4 / V2 ** 5 + V3 ** 4 / V2 ** 6 * 235 / 72 + 7 / 3 * V3 * V5 / V2 ** 4);
    const Z = w4 / 96 ** 2 * (125 / 8 * V4 ** 3 / V2 ** 6 + V8 / V2 ** 4 - 11 * V4 * V6 / V2 ** 5 + 181 / 3 * V3 ** 2 * V6 / V2 ** 6
      + 161 * V3 * V4 * V5 / V2 ** 6 - 12 * V3 * V7 / V2 ** 5)
      + w4 / 96 ** 2 * (-(V5 ** 2) / V2 ** 5 * 63 / 5 - 217 * V3 ** 3 * V5 / V2 ** 7 - 8315 / 24 * V3 ** 2 * V4 ** 2 / V2 ** 7
        + 12925 / 24 * V4 * V3 ** 4 / V2 ** 8 - 38585 / 216 * V3 ** 6 / V2 ** 9);
    return { G0, G1, W0, X0, X1, Y, Z };
  }
  /** clean round-off zeros (exactly symmetric potentials give ~1e-18 instead of 0, which would make exp(+beta*Z*theta^4) blow up) */
  function cleanCoefs(c, scale) {
    const o = {}; for (const k in c) o[k] = Math.abs(c[k]) < 1e-11 * scale ? 0 : c[k]; return o;
  }

  /** E(theta) of eq 2.17 with S = 2 theta (hbar = 1), reduced energies, omega = w */
  function energyOfTheta(c, Vs, w, order) {
    const G = order === 2 ? c.G0 : c.G0 + c.G1;
    const W0 = order === 2 ? 0 : c.W0, X1 = order === 2 ? 0 : c.X1, Y = order === 2 ? 0 : c.Y, Z = order === 2 ? 0 : c.Z;
    return (th) => { const s = th / Math.PI; return Vs + G - w * (1 + W0) * s - (c.X0 + X1) * s * s + Y * s ** 3 + Z * s ** 4; };
  }
  function logsumexpIntegral(g, a, b, n) {         // integral of exp(g(x)) with g given in log form: composite Simpson on n panels
    const h = (b - a) / n; let mx = -Infinity; const v = new Float64Array(n + 1);
    for (let i = 0; i <= n; i++) { v[i] = g(a + i * h); if (v[i] > mx) mx = v[i]; }
    let s = 0; for (let i = 0; i <= n; i++) s += (i === 0 || i === n ? 1 : i % 2 ? 4 : 2) * Math.exp(v[i] - mx);
    return { ln: mx + Math.log(s * h / 3) };
  }
  /** SVPT2 / SVPT4 thermal transmission coefficient (eq 2.25); u = hbar*omega/kT; reduced coefficients c, Vs, w. */
  function kappaSVPT(c, Vs, w, u, order) {
    const E = energyOfTheta(c, Vs, w, order), beta = u;           // reduced: energy unit hbar*omega
    const L = 40;
    // divergence guard: exp(-beta*E) must decay at both ends
    const gl = (th) => -beta * (E(th) - Vs) - 2 * Math.log(Math.cosh(th));
    if (gl(L) > gl(0) + 5 || gl(-L) > gl(0) + 5) return NaN;
    const r = logsumexpIntegral(gl, -L, L, 8000);
    return 0.5 * Math.exp(r.ln);
  }

  // ------------------------------------------------------------------ modified potential of the modified SVPT4 theory (Sec. III)
  /** U31, U41 from the conditions of Sec. III.B (derived and linearised in hbar^2; U41 from the symmetric limit as in the paper) */
  function modParams(V, w, Vs) {
    const c = svptCoefs(V, w);
    const Ve = V.slice(); Ve[3] = 0; Ve[5] = 0; Ve[7] = 0;
    const cs = svptCoefs(Ve, w);
    const V2 = V[2], V3 = V[3], V4 = V[4], w2 = w * w;
    const U41 = 12 * V2 * cs.W0 * w2 / Vs + 5 * V4 * cs.W0 + 48 * cs.W0 * cs.X0 * w2 - 16 * cs.X1 * w2;
    let U31 = 0;
    if (Math.abs(V3) > 1e-12 * Math.abs(V2) ** 1.5)
      U31 = 3 * w2 / (10 * V3) * (-U41 + 12 * V2 * c.W0 * w2 / Vs + 35 * V3 * V3 * c.W0 / (3 * w2) + 5 * V4 * c.W0 + 48 * c.W0 * c.X0 * w2 - 16 * c.X1 * w2);
    return { c, U31, U41 };
  }
  /** kappa of the modified SVPT4 theory.  Vred(q): reduced potential (q measured from the top, reduced length, V(-inf) = 0). */
  function kappaMSVPT4(Vred, V, w, Vs, u, Vprod) {
    const { c, U31, U41 } = modParams(V, w, Vs);
    const f2 = -w * w * c.W0 / Vs, f3 = U31 / (6 * Vs), f4 = U41 / (24 * Vs);
    const poly = (q) => 1 + f2 * q * q + f3 * q ** 3 + f4 * q ** 4;
    const U = (q) => Vred(q) * poly(q);
    let maxMod = 0;                              // largest relative change of the potential at the turning points that were used
    const dE = c.G0 + c.G1, beta = u;
    const NCH = 96, nodes = [];
    for (let k = 1; k <= NCH; k++) { const th = k * Math.PI / (NCH + 1); nodes.push([Math.cos(th), Math.sin(th)]); }
    function action(eps) {                       // S/hbar on U at energy eps
      if (eps >= Vs) return 0;
      const g = (q) => U(q) - eps;
      let step = 0.25, a = 0, b = -step; while (g(b) > 0 && b > -60) { a = b; b -= step; }
      const qL = C.brent(g, b, a, 1e-13);
      a = 0; b = step; while (g(b) > 0 && b < 60) { a = b; b += step; }
      const qR = C.brent(g, a, b, 1e-13);
      if (!Number.isFinite(qL) || !Number.isFinite(qR)) throw new Error('no turning point on the modified potential');   // as in the Python package: mSVPT4 is then not defined (NaN)
      if (!(qR > qL)) return 0;
      maxMod = Math.max(maxMod, Math.abs(poly(qL) - 1), Math.abs(poly(qR) - 1));
      const half = 0.5 * (qR - qL), mid = 0.5 * (qR + qL); let s = 0;
      for (const [cs, sn] of nodes) s += sn * Math.sqrt(Math.max(2 * (U(mid + half * cs) - eps), 0));
      return 2 * half * Math.PI / (NCH + 1) * s;
    }
    const Elo = Math.max(0, (Vprod || 0) + dE) + 1e-9, Ehi = Vs + dE;
    let k1 = 0;
    if (Ehi > Elo) {
      const f = (E) => { const S = action(E - dE); return Math.exp(-beta * (E - Vs) - Math.log1p(Math.exp(S))); };
      k1 = beta * C.qags(f, Elo, Ehi, 0, 1e-10, 400).result;       // QUADPACK QAGS, as scipy.integrate.quad in the Python package
    }
    // above the (shifted) top: SVPT4 energy-action relation, eq 3.25
    const E = energyOfTheta(c, Vs, w, 4);
    const gl = (th) => -beta * (E(th) - Vs) - 2 * Math.log(Math.cosh(th));
    if (gl(-40) > gl(0) + 5) return { kappa: NaN, maxMod };            // the series is not usable here (as in the Python package)
    const r = logsumexpIntegral(gl, -40, 0, 4000);
    if (r.ln > 700) return { kappa: NaN, maxMod };
    const k2 = 0.5 * Math.exp(-beta * dE) + 0.5 * Math.exp(r.ln);
    return { kappa: k1 + k2, U31, U41, dE, maxMod };
  }

  // ------------------------------------------------------------------ action functions (physical units; S = 2 theta, hbar = 1)
  function erf(x) {
    const ax = Math.abs(x);
    if (ax < 3) { let t = ax, s = ax; for (let n = 1; n < 80; n++) { t *= -ax * ax / n; const a = t / (2 * n + 1); s += a; if (Math.abs(a) < 1e-17 * Math.abs(s)) break; } return Math.sign(x) * 2 / Math.sqrt(Math.PI) * s; }
    const x2 = ax * ax; let ser = 1, term = 1;
    for (let n = 1; n < 12; n++) { term *= -(2 * n - 1) / (2 * x2); ser += term; }
    return Math.sign(x) * (1 - Math.exp(-x2) / (ax * Math.sqrt(Math.PI)) * ser);
  }
  const log1pexp = (z) => (z > 0 ? z + Math.log1p(Math.exp(-z)) : Math.log1p(Math.exp(z)));
  const sigmoid = (z) => (z > 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)));

  /** Action object from a function theta(E) valid on [E0, V1) (core.PathModel.theta or an analytic one).
   *  Above Em = V1 - frac*(V1-E0) the action is continued by its quadratic Taylor polynomial at Em (the analytic continuation to above-barrier
   *  energies that the uniform-semiclassical theories need). Derivatives by central differences of theta. */
  function makeAction(theta, V1, E0, opts = {}) {
    const frac = opts.frac === undefined ? 0.03 : opts.frac;
    const Em = V1 - frac * (V1 - E0), span = V1 - E0;
    const Sraw = (E) => 2 * theta(E);
    const d1 = (E, h) => (-Sraw(E + 2 * h) + 8 * Sraw(E + h) - 8 * Sraw(E - h) + Sraw(E - 2 * h)) / (12 * h);
    const d2 = (E, h) => (-Sraw(E + 2 * h) + 16 * Sraw(E + h) - 30 * Sraw(E) + 16 * Sraw(E - h) - Sraw(E - 2 * h)) / (12 * h * h);
    const hh = (E) => Math.min(2e-3 * span, 0.08 * (E - E0));
    const Sm = Sraw(Em), S1m = d1(Em, 2e-3 * span * 0.5), S2m = d2(Em, 2e-3 * span * 0.5);
    const S = (E) => (E <= Em ? Sraw(E) : Sm + S1m * (E - Em) + 0.5 * S2m * (E - Em) ** 2);
    const dS = (E) => (E <= Em ? d1(E, hh(E)) : S1m + S2m * (E - Em));
    const ddS = (E) => (E <= Em ? d2(E, hh(E)) : S2m);
    return { S, dS, ddS, V1, E0, Em, S1m, S2m };
  }
  /** action object of an analytic function S(E), S'(E), S''(E) on all energies (for tests: Eckart) */
  function analyticAction(S, dS, ddS, V1, E0) { return { S, dS, ddS, V1, E0, Em: V1 }; }

  /** standard (Miller/Affleck) instanton, eq 4.  Returns {kappa, Ebeta} or {kappa: NaN, reason} above the standard crossover. */
  function kappaInstanton(act, beta) {
    const g = (E) => beta + act.dS(E);
    const lo = act.E0 + 1e-6 * (act.V1 - act.E0), hi = act.Em;
    if (!(g(lo) > 0 || g(lo) < 0)) return { kappa: NaN, reason: 'derivative undefined' };
    if (g(lo) >= 0) return { kappa: NaN, reason: 'saddle below the integration range (deep tunnelling, endpoint dominated)' };
    if (g(hi) <= 0) return { kappa: NaN, reason: 'above the crossover temperature (no instanton)' };
    const Eb = C.brent(g, lo, hi, 1e-12), S2 = act.ddS(Eb);
    if (!(S2 > 0)) return { kappa: NaN, reason: 'S2 <= 0' };
    const lnk = Math.log(beta) + beta * act.V1 + 0.5 * Math.log(TWO_PI / S2) - beta * Eb - act.S(Eb);
    return { kappa: Math.exp(lnk), Ebeta: Eb };
  }

  /** uniform instanton (USIT): eq 9; with the high-energy correction: eq 23.  Also the numerically integrated Kemble kappa on the same action. */
  function kappaUSIT(act, beta) {
    const Phi = (E) => beta * E + log1pexp(act.S(E));
    const g = (E) => beta + act.dS(E) * sigmoid(act.S(E));
    const lo = act.E0 + 1e-6 * (act.V1 - act.E0);
    let hi = act.V1 + 60 / beta; while (g(hi) <= 0 && hi < act.V1 + 1e4 / beta) hi += 60 / beta;
    const out = { kappaNum: NaN, kappa: NaN, kappa1: NaN };
    // numerically exact uniform-semiclassical kappa (Kemble) on this action (E >= E0, up to top + 80/beta)
    {
      const f = (E) => Math.exp(-beta * (E - act.V1) - log1pexp(act.S(E)));
      const split = act.V1;
      out.kappaNum = beta * (C.quadGK(f, act.E0 + 1e-9, split, 1e-10, 32) + C.quadGK(f, split, split + 80 / beta, 1e-10, 16));
    }
    if (g(lo) >= 0) { out.reason = 'saddle below the integration range (endpoint dominated)'; return out; }
    if (g(hi) <= 0) { out.reason = 'no saddle found'; return out; }
    const Eb = C.brent(g, lo, hi, 1e-12);
    const S = act.S(Eb), dS = act.dS(Eb), ddS = act.ddS(Eb), sg = sigmoid(S);
    const Phi2 = ddS * sg + dS * dS * sg * (1 - sg);
    if (!(Phi2 > 0)) { out.reason = 'Phi2 <= 0'; return out; }
    const Pb = Phi(Eb);
    out.Ebeta = Eb; out.Phi2 = Phi2;
    out.kappa = Math.exp(Math.log(beta) + beta * act.V1 + 0.5 * Math.log(TWO_PI / Phi2) - Pb);
    // eq 23
    const arg = beta / Math.sqrt(2 * Phi2);
    const erfTerm = 1 + erf(arg);
    out.kappa1 = Math.exp(beta * act.V1 - Pb) * (beta * Math.sqrt(TWO_PI / Phi2) * 0.5 * erfTerm + Math.exp(-beta * beta / (2 * Phi2)));
    return out;
  }

  // ------------------------------------------------------------------ modified VPT2 and modified Yasumori-Fueki (hbar^2 theory)
  /** act: action object (physical); G0, X0: reduced coefficients; hw: hbar*omega (kcal/mol); Vprod: product asymptote (kcal/mol). Returns {mVPT2, mYF}. */
  function kappaHbar2(act, G0, X0, hw, beta, Vprod) {
    const V1 = act.V1, E0s = G0 * hw;                      // energy shift (kcal/mol)
    // S_VPT2 / sigma in reduced form (omega = 1): 2 pi xr - 2 pi X0 xr^2 with xr = x/hw, x = (centre energy) - E
    const Sv = (x) => { const xr = x / hw; return TWO_PI * xr - TWO_PI * X0 * xr * xr; };
    const Vp = Math.max(0, Vprod || 0);
    const integ = (T_ln1pexp, Elo, Esplit) => {
      const f = (E) => Math.exp(-beta * (E - V1) - T_ln1pexp(E));
      let s = 0;
      if (Esplit > Elo) s += C.quadGK(f, Elo, Esplit, 1e-10, 32);
      s += C.quadGK(f, Math.max(Elo, Esplit), Math.max(Elo, Esplit) + 80 / beta, 1e-10, 16);
      return beta * s;
    };
    const out = {};
    // mVPT2
    {
      const Elo = Math.max(0, Vp + E0s) + 1e-9;
      if (X0 <= 0) {
        const top = V1 + E0s;
        out.mVPT2 = integ((E) => log1pexp(E <= top ? act.S(E - E0s) : Sv(top - E)), Elo, top);
      } else {
        const DeltaSigma = act.S(V1 - E0s) - Sv(E0s);                    // eq 2.18: S(V1-E0) - sigma(V1-E0), sigma(V1-E0) = Sv at x = E0
        out.mVPT2 = integ((E) => log1pexp(E <= V1 ? act.S(E - E0s) : Sv(V1 + E0s - E) + DeltaSigma), Elo, V1);
      }
    }
    // mYF
    {
      const dS = TWO_PI * G0;                              // 2 pi E0 / omega (reduced)
      const Elo = Math.max(0, Vp) + 1e-9;
      if (X0 <= 0) {
        const top = V1 + E0s, Sstar = act.S(top) + dS;
        out.mYF = integ((E) => log1pexp(E <= top ? act.S(E) + dS : Sv(top - E) + Sstar), Elo, top);
      } else {
        const sgm = (E) => { const xr = (V1 - E) / hw; return TWO_PI * xr - TWO_PI * X0 * xr * xr; };
        out.mYF = integ((E) => log1pexp(E <= V1 ? act.S(E) + dS : sgm(E) + dS), Elo, V1);
      }
    }
    return out;
  }


  // ------------------------------------------------------------------ exact-WKB transmission of Lawrence (hbar^2 and hbar^4)
  /* J. E. Lawrence, J. Chem. Phys. 163, 234119 (2025), arXiv:2510.06447:  P(E) = 1/(1 + exp(W/hbar)),  W = W0 + hbar^2 W2 + hbar^4 W4,
   *   W0 = oint p0 dq,  W2 = (1/8) oint V'^2/p0^5 dq,  W4 = (1/128) oint [-4 V''^2/p0^7 + 380 V'^2 V''/p0^9 - 1105 V'^4/p0^11] dq,
   *   p0 = sqrt(2 (V - E)), loop around the two turning points (eqs 3.4, 4.9, B1).  The loop integrals are evaluated on an ellipse in the
   *   complex plane (trapezoid rule on the periodic analytic integrand); this needs V, V', V'' at complex q, obtained by complex jets of
   *   the closed-form profile families.  Units: kcal/mol, A, 1 amu, hbar = sqrt(2)/CTHETA.  Mirrors methods/lawrence.py of the Python package. */
  const HBAR_U = Math.SQRT2 / CTHETA;
  // complex jets of order 2: { r: [r0,r1,r2], i: [i0,i1,i2] }
  const cjet = {
    variable(re, im) { return { r: [re, 1, 0], i: [im, 0, 0] }; },
    cst(a) { return { r: [a, 0, 0], i: [0, 0, 0] }; },
    lift(a) { return typeof a === 'number' ? cjet.cst(a) : a; },
    add(a, b) { b = cjet.lift(b); return { r: a.r.map((v, k) => v + b.r[k]), i: a.i.map((v, k) => v + b.i[k]) }; },
    sub(a, b) { b = cjet.lift(b); return { r: a.r.map((v, k) => v - b.r[k]), i: a.i.map((v, k) => v - b.i[k]) }; },
    scale(a, k) { return { r: a.r.map((v) => v * k), i: a.i.map((v) => v * k) }; },
    mul(a, b) {
      b = cjet.lift(b); const r = [0, 0, 0], im = [0, 0, 0];
      for (let p = 0; p < 3; p++) for (let q = 0; p + q < 3; q++) {
        r[p + q] += a.r[p] * b.r[q] - a.i[p] * b.i[q]; im[p + q] += a.r[p] * b.i[q] + a.i[p] * b.r[q];
      }
      return { r, i: im };
    },
    recip(a) {
      const d = a.r[0] * a.r[0] + a.i[0] * a.i[0];
      const b0r = a.r[0] / d, b0i = -a.i[0] / d;
      const cm = (xr, xi, yr, yi) => [xr * yr - xi * yi, xr * yi + xi * yr];
      const t1 = cm(a.r[1], a.i[1], b0r, b0i), b1 = cm(-b0r, -b0i, t1[0], t1[1]);
      const u1 = cm(a.r[1], a.i[1], b1[0], b1[1]), u2 = cm(a.r[2], a.i[2], b0r, b0i);
      const b2 = cm(-b0r, -b0i, u1[0] + u2[0], u1[1] + u2[1]);
      return { r: [b0r, b1[0], b2[0]], i: [b0i, b1[1], b2[1]] };
    },
    exp(a) {
      const m = Math.exp(a.r[0]), b0r = m * Math.cos(a.i[0]), b0i = m * Math.sin(a.i[0]);
      const cm = (xr, xi, yr, yi) => [xr * yr - xi * yi, xr * yi + xi * yr];
      const b1 = cm(a.r[1], a.i[1], b0r, b0i);
      const t1 = cm(a.r[1], a.i[1], b1[0], b1[1]), t2 = cm(a.r[2], a.i[2], b0r, b0i);
      return { r: [b0r, b1[0], 0.5 * t1[0] + t2[0]], i: [b0i, b1[1], 0.5 * t1[1] + t2[1]] };
    },
    cosh(a) { return cjet.scale(cjet.add(cjet.exp(a), cjet.exp(cjet.scale(a, -1))), 0.5); },
    sinh(a) { return cjet.scale(cjet.sub(cjet.exp(a), cjet.exp(cjet.scale(a, -1))), 0.5); },
    tanh(a) { return cjet.mul(cjet.sinh(a), cjet.recip(cjet.cosh(a))); }
  };
  const CJ_F = {
    gauss: (u) => cjet.exp(cjet.scale(cjet.mul(u, u), -0.5)),
    lorentz: (u) => cjet.recip(cjet.add(cjet.mul(u, u), 1)),
    sech2: (u) => { const c = cjet.cosh(u); return cjet.recip(cjet.mul(c, c)); },
    sech4: (u) => { const c = cjet.cosh(u), c2 = cjet.mul(c, c); return cjet.recip(cjet.mul(c2, c2)); },
    lorentz2: (u) => { const q = cjet.add(cjet.mul(u, u), 1); return cjet.recip(cjet.mul(q, q)); },
    shoulder: (u) => { const v = cjet.sub(u, 1.7); return cjet.add(cjet.exp(cjet.scale(cjet.mul(u, u), -0.5)), cjet.scale(cjet.exp(cjet.scale(cjet.mul(v, v), -0.5 / 0.64)), 0.45)); },
    double: (u) => { const a = cjet.sub(u, 1.2), b = cjet.add(u, 1.2); return cjet.add(cjet.exp(cjet.scale(cjet.mul(a, a), -0.5)), cjet.exp(cjet.scale(cjet.mul(b, b), -0.5))); }
  };
  /** (V, V', V'') at complex q = qr + i qi of a core.Profile (profile family + tanh step), relative to the reference energy y0 */
  function profileJet(p, y0) {
    const f = CJ_F[p.family]; if (!f) throw new Error('no complex jet for family ' + p.family);
    return (qr, qi) => {
      const t = cjet.variable(qr, qi);
      const sh = f(cjet.scale(t, 1 / p.w));
      const step = cjet.scale(cjet.add(cjet.tanh(cjet.scale(t, 2 / p.w)), 1), 0.5 * p.dE);
      const J = cjet.add(cjet.scale(sh, p.V0), step);
      return { V: [J.r[0] - y0, J.i[0]], V1: [J.r[1], J.i[1]], V2: [2 * J.r[2], 2 * J.i[2]] };
    };
  }
  const csqrt = (re, im) => { const m = Math.hypot(re, im), a = Math.sqrt(Math.max(0, (m + re) / 2)), b = Math.sqrt(Math.max(0, (m - re) / 2)); return [a, im < 0 ? -b : b]; };
  /** (I0, I2, I4, closed) on the counter-clockwise ellipse centre + a cos t + i b sin t; branch of p0 followed by continuity from t = pi/2 */
  function loopIntegrals(Vd, E, centre, a, b, n) {
    const sr = new Float64Array(n), si = new Float64Array(n), dqr = new Float64Array(n), dqi = new Float64Array(n);
    const v1r = new Float64Array(n), v1i = new Float64Array(n), v2r = new Float64Array(n), v2i = new Float64Array(n);
    const k0 = n >> 2; let pr = 0, pi_ = 0, ok = true, s0r = 0, s0i = 0, lr = 0, li = 0;
    for (let kk = 0; kk < n; kk++) {
      const k = (k0 + kk) % n, t = TWO_PI * k / n;
      const qr = centre + a * Math.cos(t), qi = b * Math.sin(t);
      dqr[k] = -a * Math.sin(t); dqi[k] = b * Math.cos(t);
      const J = Vd(qr, qi);
      v1r[k] = J.V1[0]; v1i[k] = J.V1[1]; v2r[k] = J.V2[0]; v2i[k] = J.V2[1];
      let [xr, xi] = csqrt(2 * (J.V[0] - E), 2 * J.V[1]);
      if (kk > 0 && (xr * pr + xi * pi_) < 0) { xr = -xr; xi = -xi; }          // continuity: Re(s_k / s_{k-1}) < 0 -> flip
      sr[k] = xr; si[k] = xi; pr = xr; pi_ = xi;
      if (kk === 0) { s0r = xr; s0i = xi; }
      lr = xr; li = xi;
    }
    ok = (s0r * lr + s0i * li) > 0;
    const w = TWO_PI / n; let I0 = 0, I2 = 0, I4 = 0;
    const cm = (xr, xi, yr, yi) => [xr * yr - xi * yi, xr * yi + xi * yr];
    let i0i = 0;
    for (let k = 0; k < n; k++) {
      const d = sr[k] * sr[k] + si[k] * si[k], ir = sr[k] / d, ii = -si[k] / d;                   // 1/s
      const i2 = cm(ir, ii, ir, ii), i4 = cm(i2[0], i2[1], i2[0], i2[1]);
      const i5 = cm(i4[0], i4[1], ir, ii), i7 = cm(i5[0], i5[1], i2[0], i2[1]), i9 = cm(i7[0], i7[1], i2[0], i2[1]), i11 = cm(i9[0], i9[1], i2[0], i2[1]);
      const V1sq = cm(v1r[k], v1i[k], v1r[k], v1i[k]), V2sq = cm(v2r[k], v2i[k], v2r[k], v2i[k]);
      const V1q = cm(V1sq[0], V1sq[1], V1sq[0], V1sq[1]), V1sV2 = cm(V1sq[0], V1sq[1], v2r[k], v2i[k]);
      const t2 = cm(V1sq[0], V1sq[1], i5[0], i5[1]);
      const a4 = cm(V2sq[0], V2sq[1], i7[0], i7[1]), b4 = cm(V1sV2[0], V1sV2[1], i9[0], i9[1]), c4 = cm(V1q[0], V1q[1], i11[0], i11[1]);
      const f4r = -4 * a4[0] + 380 * b4[0] - 1105 * c4[0], f4i = -4 * a4[1] + 380 * b4[1] - 1105 * c4[1];
      I0 += sr[k] * dqr[k] - si[k] * dqi[k]; i0i += sr[k] * dqi[k] + si[k] * dqr[k];
      I2 += t2[0] * dqr[k] - t2[1] * dqi[k];
      I4 += f4r * dqr[k] - f4i * dqi[k];
    }
    return { I0: I0 * w, I0i: i0i * w, I2: I2 * w / 8, I4: I4 * w / 128, closed: ok };
  }
  /** W0, W2, W4 at E (< V top) from loop integrals between the real turning points; two different loops must agree. null on failure. */
  function hbarSeriesOfLoop(Vd, E, xm, xp, W0ref, scale, n) {
    const c0 = 0.5 * (xp + xm), a0 = 0.5 * (xp - xm);
    const shapes = [[0.8, 0.9], [0.6, 0.7], [0.45, 0.5], [0.3, 0.35], [0.2, 0.25]];
    let good = [];
    for (const [fb, fd] of shapes) {
      const a = 1.15 * a0 + fd * scale, b = fb * scale;
      for (const nn of [n, 2 * n]) {
        const r = loopIntegrals(Vd, E, c0, a, b, nn);
        if (!r.closed) break;
        const sg = r.I0 < 0 ? -1 : 1;
        if (Math.abs(sg * r.I0 - W0ref) < 1e-7 * Math.abs(W0ref) && Math.abs(r.I0i) < 1e-7 * Math.abs(W0ref)) { good.push([sg * r.I0, sg * r.I2, sg * r.I4]); break; }
      }
      if (good.length === 2) {
        const [g1, g2] = good;
        if (Math.abs(g1[1] - g2[1]) <= 1e-6 * Math.abs(g1[1]) && Math.abs(g1[2] - g2[2]) <= 1e-5 * Math.abs(g1[2])) return g1;
        good = good.slice(1);
      }
    }
    return null;
  }
  /** Lawrence kappa for a core.Profile p (analysed) with the action `act` of makeAction; returns { law2: f(beta), law4: f(beta), ok, nfail } */
  function lawrenceActions(p, act, y0, L, m = 72) {
    const Vd = profileJet(p, y0), Vr = (x) => p.V(x) - y0;
    const turning = (E) => {
      const g = (x) => Vr(x) - E;
      let a = p.xMax, b = p.xMax - 0.2; while (g(b) > 0 && b > -L) { a = b; b -= 0.2; }
      const xl = g(b) > 0 ? -L : C.brent(g, b, a, 1e-13);
      a = p.xMax; b = p.xMax + 0.2; while (g(b) > 0 && b < L) { a = b; b += 0.2; }
      const xr = g(b) > 0 ? L : C.brent(g, a, b, 1e-13);
      return [xl, xr];
    };
    const theta = (E, xl, xr) => {                                          // Gauss-Chebyshev (2nd kind), 96 nodes, analytic profile
      const N = 96, half = 0.5 * (xr - xl), mid = 0.5 * (xr + xl); let sum = 0;
      for (let k = 1; k <= N; k++) { const t = k * Math.PI / (N + 1); sum += Math.sin(t) * Math.sqrt(Math.max(Vr(mid + half * Math.cos(t)) - E, 0)); }
      return CTHETA * half * Math.PI / (N + 1) * sum;
    };
    const Em = act.Em, E0 = act.E0, Elo = E0 + 0.02 * (act.V1 - E0);
    const g = [], W2 = [], W4 = [];
    for (let i = 0; i < m; i++) {
      const u = i / (m - 1), E = Em - (Em - Elo) * (1 - u) * (1 - u);
      const [xl, xr] = turning(E);
      const W0 = 2 * HBAR_U * theta(E, xl, xr);
      const r = hbarSeriesOfLoop(Vd, E, xl, xr, W0, p.w, 2048);
      if (r) { g.push(E); W2.push(r[1]); W4.push(r[2]); }
    }
    const ok = g.length >= Math.floor(0.9 * m) && g[g.length - 1] > Em - 1e-9 * Math.abs(Em) && g.length > 8;
    const out = { ok, nfail: m - g.length };
    if (!ok) return out;
    const X = Float64Array.from(g), s2 = C.cubicSpline(X, Float64Array.from(W2), 'notaknot'), s4 = C.cubicSpline(X, Float64Array.from(W4), 'notaknot');
    const h = 1e-5 * (Em - Elo);
    const tay = (sp) => [sp.at(Em), (sp.at(Em + h) - sp.at(Em - h)) / (2 * h), sp.d2(Em)];
    const t2 = tay(s2), t4 = tay(s4), lo2 = s2.at(Elo), lo4 = s4.at(Elo);
    const ev = (sp, t, lo, E) => (E < Elo ? lo : E <= Em ? sp.at(E) : t[0] + t[1] * (E - Em) + 0.5 * t[2] * (E - Em) * (E - Em));
    out.Elo = Elo;
    out.S = (E, order) => act.S(E) + (order >= 2 ? HBAR_U * ev(s2, t2, lo2, E) : 0) + (order >= 4 ? Math.pow(HBAR_U, 3) * ev(s4, t4, lo4, E) : 0);
    out.W2 = (E) => ev(s2, t2, lo2, E); out.W4 = (E) => ev(s4, t4, lo4, E);
    return out;
  }
  function kappaLawrence(la, act, beta, order) {
    if (!la.ok) return NaN;
    const f = (E) => Math.exp(-beta * (E - act.V1) - log1pexp(la.S(E, order)));
    let pts = [act.E0 + 1e-9, la.Elo, act.Em, act.V1, act.V1 + 80 / beta].filter((x) => x >= act.E0 + 1e-9).sort((a, b) => a - b);
    pts = pts.filter((x, i) => i === 0 || x > pts[i - 1]);
    let tot = 0; for (let i = 0; i + 1 < pts.length; i++) tot += C.quadGK(f, pts[i], pts[i + 1], 1e-10, 16);
    return beta * tot;
  }

  // ------------------------------------------------------------------ driver for a core.Profile
  /** Everything for one matched profile p (core.Profile with analyse() done) at temperatures Ts. Returns arrays aligned with Ts. */
  function profileMethods(p, Ts, opts = {}) {
    const hw = HNU * p.nuAct, d = profileDerivs(p), rd = reduceDerivs(d, hw);
    const w = Math.sqrt(-rd.V[2]);
    const c = cleanCoefs(svptCoefs(rd.V, w), 1);
    const info = { hw, ell: rd.ell, Vs: rd.Vs, omega_red: w, coefs: c, derivs: d.slice(2), reducedDerivs: rd.V.slice(2) };
    // action from the profile: path model of the sampled profile
    const LW = { lorentz: 40, lorentz2: 15 }[p.family] || 0;             // same solver box as the manuscript benchmark (algebraic tails)
    const n = 8001, L = Math.max(12, 9 * p.w, LW * p.w), s = new Float64Array(n), Vv = new Float64Array(n);
    for (let i = 0; i < n; i++) { const x = -L + 2 * L * i / (n - 1); s[i] = x; Vv[i] = p.V(x); }
    const pm = new C.PathModel(s, Vv, { nu: p.nuAct });
    const E0 = Math.max(0, pm.dE);
    const act = makeAction((E) => pm.theta(E), pm.V1, E0);
    const Vred = (q) => (p.V(p.xMax + rd.ell * q) - Vv[0]) / hw;       // measured from the reactant asymptote at the box edge, as in the Python package
    const res = { info, T: Ts.slice(), inst: [], usit: [], usit1: [], usitNum: [], svpt2: [], svpt4: [], msvpt4: [], msvpt4mod: [], mvpt2: [], myf: [], Ebeta: [], law2: [], law4: [], lawOk: false };
    let la = null;
    if (opts.lawrence !== false) { try { la = lawrenceActions(p, act, Vv[0], L); res.lawOk = la.ok; } catch (e) { la = null; } }
    for (const T of Ts) {
      const beta = 1 / (R_KCAL * T), u = beta * hw;
      const ki = kappaInstanton(act, beta); res.inst.push(ki.kappa);
      const ku = kappaUSIT(act, beta); res.usit.push(ku.kappa); res.usit1.push(ku.kappa1); res.usitNum.push(ku.kappaNum); res.Ebeta.push(ku.Ebeta);
      res.svpt2.push(kappaSVPT(c, rd.Vs, w, u, 2));
      res.svpt4.push(kappaSVPT(c, rd.Vs, w, u, 4));
      let m4 = NaN, mm = NaN; try { const r = kappaMSVPT4(Vred, rd.V, w, rd.Vs, u, pm.dE / hw); m4 = r.kappa; mm = r.maxMod; } catch (e) { m4 = NaN; }
      res.msvpt4.push(m4); res.msvpt4mod.push(mm);
      const h2 = kappaHbar2(act, c.G0, c.X0, hw, beta, pm.dE); res.mvpt2.push(h2.mVPT2); res.myf.push(h2.mYF);
      res.law2.push(la ? kappaLawrence(la, act, beta, 2) : NaN); res.law4.push(la ? kappaLawrence(la, act, beta, 4) : NaN);
    }
    return res;
  }

  return { Jet, JET_F, profileDerivs, reduceDerivs, svptCoefs, cleanCoefs, kappaSVPT, modParams, kappaMSVPT4, makeAction, analyticAction,
    kappaInstanton, kappaUSIT, kappaHbar2, profileMethods, erf, cjet, CJ_F, profileJet, loopIntegrals, hbarSeriesOfLoop, lawrenceActions, kappaLawrence };
});
