/* Tunneling corrections kappa(T): browser/Node port of the Python package accompanying
 *   M. Spiegel, "One-dimensional tunneling corrections in computational kinetics" (Theor. Chem. Acc., in preparation).
 * Models: Wigner, truncated parabola (Skodje-Truhlar), Eckart (Brown parametrisation, log domain),
 *         ZCT-MEP (static MEP-based path model, Kemble / WKB), ZCT-EC, EQ-FREQ, exact 1D reference.
 * Units: energies kcal/mol, frequencies cm^-1, s in Angstrom*sqrt(amu), T in K.  MIT licence.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TunnelingCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ------------------------------------------------------------------ constants (CODATA 2018)
  const h = 6.62607015e-34, cLight = 2.99792458e10, kB = 1.380649e-23, NA = 6.02214076e23;
  const amu = 1.66053906660e-27, kcalJ = 4184.0;
  const hbar = h / (2 * Math.PI);
  const uE = kcalJ / NA;                                   // J per molecule per kcal/mol
  const HC_OVER_K = h * cLight / kB;                       // K cm
  const R_KCAL = kB * NA / kcalJ;                          // kcal/mol/K
  const HNU = h * cLight * NA / kcalJ;                     // kcal/mol per cm^-1
  const CTHETA = Math.sqrt(2 * uE * amu) * 1e-10 / hbar;   // 4.55495 (kcal/mol)^-1/2 (A amu^1/2)^-1
  const NUCONST = Math.sqrt(uE / (amu * 1e-20)) / (2 * Math.PI * cLight);  // 108.5914
  const TC_PER_CM = HC_OVER_K / (2 * Math.PI);             // 0.2290 K per cm^-1
  const HARTREE_KCAL = 627.5094740631;
  const BOHR_ANG = 0.529177210903;
  const LN2 = Math.LN2;
  const CONST = { HC_OVER_K, R_KCAL, HNU, CTHETA, NUCONST, TC_PER_CM, HARTREE_KCAL, BOHR_ANG };

  const uStar = (nu, T) => HC_OVER_K * Math.abs(nu) / T;
  const Tcross = (nu) => TC_PER_CM * Math.abs(nu);
  const dG = (k1, k2, T) => R_KCAL * T * Math.abs(Math.log(k1 / k2));   // |ddG|, kcal/mol

  // ------------------------------------------------------------------ numerics
  const GK_X = [0.991455371120812639206854697526329, 0.949107912342758524526189684047851,
    0.864864423359769072789712788640926, 0.741531185599394439863864773280788,
    0.586087235467691130294144838258730, 0.405845151377397166906606412076961,
    0.207784955007898467600689403773245, 0.0];
  const GK_WK = [0.022935322010529224963732008058970, 0.063092092629978553290700663189204,
    0.104790010322250183839876322541518, 0.140653259715525918745189590510238,
    0.169004726639267902826583426598550, 0.190350578064785409913256402421014,
    0.204432940075298892414161999234649, 0.209482141084727828012999174891714];
  const GK_WG = [0.129484966168869693270611432679082, 0.279705391489276667901467771423780,
    0.381830050505118944950369775488975, 0.417959183673469387755102040816327];

  function gk15(f, a, b) {
    const c = 0.5 * (a + b), hl = 0.5 * (b - a);
    const fc = f(c);
    let rk = fc * GK_WK[7], rg = fc * GK_WG[3];
    for (let j = 0; j < 7; j++) {
      const dx = hl * GK_X[j];
      const s = f(c - dx) + f(c + dx);
      rk += GK_WK[j] * s;
      if (j % 2 === 1) rg += GK_WG[(j - 1) / 2] * s;
    }
    return [rk * hl, Math.abs((rk - rg) * hl)];
  }
  /** adaptive Gauss-Kronrod on [a,b] with nInit initial panels */
  function quadGK(f, a, b, tol = 1e-10, nInit = 16, maxIter = 4000) {
    if (!(b > a)) return 0;
    let panels = [];
    for (let i = 0; i < nInit; i++) {
      const x0 = a + (b - a) * i / nInit, x1 = a + (b - a) * (i + 1) / nInit;
      const [v, e] = gk15(f, x0, x1);
      panels.push({ a: x0, b: x1, v, e });
    }
    for (let it = 0; it < maxIter; it++) {
      let tot = 0, err = 0, worst = 0;
      for (let i = 0; i < panels.length; i++) {
        tot += panels[i].v; err += panels[i].e;
        if (panels[i].e > panels[worst].e) worst = i;
      }
      if (err <= tol * Math.abs(tot) || err < 1e-300) return tot;
      const p = panels[worst], m = 0.5 * (p.a + p.b);
      const [v1, e1] = gk15(f, p.a, m), [v2, e2] = gk15(f, m, p.b);
      panels.splice(worst, 1, { a: p.a, b: m, v: v1, e: e1 }, { a: m, b: p.b, v: v2, e: e2 });
    }
    let tot = 0; for (const p of panels) tot += p.v; return tot;
  }

  const _glCache = {};
  function gaussLegendre(n) {
    if (_glCache[n]) return _glCache[n];
    const x = new Float64Array(n), w = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      let z = Math.cos(Math.PI * (i + 0.75) / (n + 0.5)), pp = 0;
      for (let it = 0; it < 100; it++) {
        let p1 = 1, p2 = 0;
        for (let j = 0; j < n; j++) { const p3 = p2; p2 = p1; p1 = ((2 * j + 1) * z * p2 - j * p3) / (j + 1); }
        pp = n * (z * p1 - p2) / (z * z - 1);
        const dz = p1 / pp; z -= dz; if (Math.abs(dz) < 1e-15) break;
      }
      x[i] = z; w[i] = 2 / ((1 - z * z) * pp * pp);
    }
    return (_glCache[n] = { x, w });
  }

  function brent(f, a, b, tol = 1e-12, maxit = 200) {
    let fa = f(a), fb = f(b);
    if (fa === 0) return a; if (fb === 0) return b;
    if (fa * fb > 0) return NaN;
    let c = a, fc = fa, d = b - a, e = d;
    for (let i = 0; i < maxit; i++) {
      if (fb * fc > 0) { c = a; fc = fa; d = b - a; e = d; }
      if (Math.abs(fc) < Math.abs(fb)) { a = b; b = c; c = a; fa = fb; fb = fc; fc = fa; }
      const tol1 = 2 * 2.2e-16 * Math.abs(b) + 0.5 * tol, xm = 0.5 * (c - b);
      if (Math.abs(xm) <= tol1 || fb === 0) return b;
      if (Math.abs(e) >= tol1 && Math.abs(fa) > Math.abs(fb)) {
        let p, q, r; const s = fb / fa;
        if (a === c) { p = 2 * xm * s; q = 1 - s; }
        else { q = fa / fc; r = fb / fc; p = s * (2 * xm * q * (q - r) - (b - a) * (r - 1)); q = (q - 1) * (r - 1) * (s - 1); }
        if (p > 0) q = -q; p = Math.abs(p);
        if (2 * p < Math.min(3 * xm * q - Math.abs(tol1 * q), Math.abs(e * q))) { e = d; d = p / q; }
        else { d = xm; e = d; }
      } else { d = xm; e = d; }
      a = b; fa = fb;
      b += Math.abs(d) > tol1 ? d : (xm > 0 ? tol1 : -tol1);
      fb = f(b);
    }
    return b;
  }

  function lsinh(x) { return x < 20 ? Math.log(Math.sinh(x)) : x + Math.log1p(-Math.exp(-2 * x)) - LN2; }
  function lcosh(x) { x = Math.abs(x); return x + Math.log1p(Math.exp(-2 * x)) - LN2; }
  function logistic(z) { return z > 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)); }
  function lnKemble(theta) { return theta > 0 ? -(2 * theta + Math.log1p(Math.exp(-2 * theta))) : -Math.log1p(Math.exp(2 * theta)); }

  // ------------------------------------------------------------------ Wigner, truncated parabola
  function kappaWigner(nu, T) { const u = uStar(nu, T); return 1 + u * u / 24; }

  function kappaParabolaNumeric(Veff, nu, T) {
    if (!(Veff > 0)) return 1;
    const beta = 1 / (R_KCAL * T), hnu = HNU * Math.abs(nu), alpha = 2 * Math.PI / hnu;
    const f = (eps) => { const E = Veff + eps / beta; return Math.exp(-eps) / (1 + Math.exp(alpha * (Veff - E))); };
    return quadGK(f, -beta * Veff, 60, 1e-11, 32);
  }
  function kappaParabola(V1, V2, nu, T) {
    const Vp = Math.min(V1, V2);
    if (!(Vp > 0)) return 1;
    const r = uStar(nu, T) / (2 * Math.PI);
    if (Math.abs(r - 1) < 1e-6) return kappaParabolaNumeric(Vp, nu, T);
    const ex = Math.exp((1 - 1 / r) * Vp / (R_KCAL * T));
    if (r < 1) return Math.PI * r / Math.sin(Math.PI * r) - r / (1 - r) * ex;
    return r / (r - 1) * (ex - 1);
  }

  // ------------------------------------------------------------------ Eckart (Brown parametrisation)
  /** ln of the transmission probability of the Eckart barrier; E from the reactant asymptote */
  function eckartLnT(E, V1, V2, hnu) {
    const A = V1 - V2;
    if (!(E > Math.max(0, A))) return -Infinity;
    const S = 1 / Math.sqrt(V1) + 1 / Math.sqrt(V2);
    const a = 4 * Math.PI * Math.sqrt(E) / (hnu * S), b = 4 * Math.PI * Math.sqrt(E - A) / (hnu * S);
    const P = a + b;
    const d2 = 16 * V1 * V2 / (hnu * hnu) - 1, D = Math.PI * Math.sqrt(Math.abs(d2));
    const lnNum = LN2 + lsinh(a) + lsinh(b);
    const lcP = lcosh(P);
    let lden;
    if (d2 >= 0) { const lcD = lcosh(D); const m = Math.max(lcP, lcD); lden = m + Math.log(Math.exp(lcP - m) + Math.exp(lcD - m)); }
    else lden = lcP + Math.log1p(Math.cos(D) * Math.exp(-lcP));
    return lnNum - lden;
  }
  /** thermal integral of an energy-resolved ln T(E): kappa = int beta e^{-beta(E-V1)} T dE, E in [E0, V1+epsMax kT] */
  function thermalIntegral(lnTfun, V1, E0, T, epsMax) {
    const beta = 1 / (R_KCAL * T), Emax = V1 + epsMax / beta;
    const U = Math.sqrt(Math.max(Emax - E0, 0));
    const g = (u) => {
      if (u <= 0) return 0;
      const E = E0 + u * u, lt = lnTfun(E);
      if (lt === -Infinity) return 0;
      return Math.exp(lt - beta * (E - V1) + Math.log(beta) + Math.log(2 * u));
    };
    return quadGK(g, 0, U, 1e-11, 48);
  }
  function kappaEckart(V1, V2, nu, T, epsMax = 60) {
    if (!(V1 > 0) || !(V2 > 0)) return 1;
    const hnu = HNU * Math.abs(nu), E0 = Math.max(0, V1 - V2);
    return thermalIntegral((E) => eckartLnT(E, V1, V2, hnu), V1, E0, T, epsMax);
  }
  /** symmetric variant: V2 := V1, integral from E = 0 */
  function kappaEckartSym(V1, nu, T) { return kappaEckart(V1, V1, nu, T); }

  /** sub-barrier share of the thermal integral for an arbitrary ln T(E) */
  function fsubFromLnT(lnTfun, V1, E0, T) {
    const beta = 1 / (R_KCAL * T);
    const mk = (a, b) => quadGK((u) => { if (u <= 0) return 0; const E = E0 + u * u, lt = lnTfun(E); return lt === -Infinity ? 0 : Math.exp(lt - beta * (E - V1) + Math.log(beta) + Math.log(2 * u)); }, Math.sqrt(a - E0), Math.sqrt(b - E0), 1e-10, 24);
    const sub = mk(E0, V1), above = mk(V1, V1 + 60 / beta);
    return sub / (sub + above);
  }

  // ------------------------------------------------------------------ Eckart model path: analytic WKB action
  /** action theta(E) on the Eckart barrier below the top, continued parabolically above (as in ZCT-MEP) */
  function thetaEckart(E, V1, V2, hnu) {
    if (E >= V1) return Math.PI * (V1 - E) / hnu;
    const A = V1 - V2, B = Math.pow(Math.sqrt(V1) + Math.sqrt(V2), 2), sB = Math.sqrt(B);
    const Ee = Math.max(E, Math.max(0, A));
    return 2 * Math.PI * Math.sqrt(V1 * V2) / (hnu * sB) * (sB - Math.sqrt(Ee) - Math.sqrt(Math.max(Ee - A, 0)));
  }
  function lnPfromTheta(theta, variant) {
    if (variant === 'wkb') return theta > 0 ? -2 * theta : 0;
    return lnKemble(theta);
  }
  /** ZCT-MEP kappa evaluated on the Eckart(V1,V2,nu) model path (analytic action) */
  function kappaZCTonEckart(V1, V2, nu, T, variant = 'kemble') {
    if (!(V1 > 0) || !(V2 > 0)) return 1;
    const hnu = HNU * Math.abs(nu), E0 = Math.max(0, V1 - V2);
    const lnTf = (E) => lnPfromTheta(thetaEckart(E, V1, V2, hnu), variant);
    return thermalIntegral(lnTf, V1, E0, T, 60);
  }

  // ------------------------------------------------------------------ cubic spline
  /** cubic spline; bc = 'natural' (M0 = M(n-1) = 0) or 'notaknot' (continuous third derivative at x1 and x(n-2); scipy's default) */
  function cubicSpline(x, y, bc) {
    const n = x.length, m = new Float64Array(n);
    if (bc === 'notaknot' && n >= 5) {
      const a = new Float64Array(n), b = new Float64Array(n), c = new Float64Array(n), d = new Float64Array(n);
      for (let i = 1; i < n - 1; i++) {
        const h0 = x[i] - x[i - 1], h1 = x[i + 1] - x[i];
        a[i] = h0; b[i] = 2 * (h0 + h1); c[i] = h1;
        d[i] = 6 * ((y[i + 1] - y[i]) / h1 - (y[i] - y[i - 1]) / h0);
      }
      { const h0 = x[1] - x[0], h1 = x[2] - x[1]; b[1] = h0 * (1 + h0 / h1) + 2 * (h0 + h1); c[1] = h1 - h0 * h0 / h1; a[1] = 0; }
      { const hl = x[n - 2] - x[n - 3], hr = x[n - 1] - x[n - 2]; a[n - 2] = hl - hr * hr / hl; b[n - 2] = 2 * (hl + hr) + hr * (1 + hr / hl); c[n - 2] = 0; }
      for (let i = 2; i <= n - 2; i++) { const w = a[i] / b[i - 1]; b[i] -= w * c[i - 1]; d[i] -= w * d[i - 1]; }
      m[n - 2] = d[n - 2] / b[n - 2];
      for (let i = n - 3; i >= 1; i--) m[i] = (d[i] - c[i] * m[i + 1]) / b[i];
      { const h0 = x[1] - x[0], h1 = x[2] - x[1]; m[0] = m[1] * (1 + h0 / h1) - m[2] * h0 / h1; }
      { const hl = x[n - 2] - x[n - 3], hr = x[n - 1] - x[n - 2]; m[n - 1] = m[n - 2] * (1 + hr / hl) - m[n - 3] * hr / hl; }
    } else if (n > 2) {
      const a = new Float64Array(n), b = new Float64Array(n), c = new Float64Array(n), d = new Float64Array(n);
      b[0] = 1; b[n - 1] = 1;
      for (let i = 1; i < n - 1; i++) {
        const h0 = x[i] - x[i - 1], h1 = x[i + 1] - x[i];
        a[i] = h0; b[i] = 2 * (h0 + h1); c[i] = h1;
        d[i] = 6 * ((y[i + 1] - y[i]) / h1 - (y[i] - y[i - 1]) / h0);
      }
      for (let i = 1; i < n; i++) { const w = a[i] / b[i - 1]; b[i] -= w * c[i - 1]; d[i] -= w * d[i - 1]; }
      m[n - 1] = d[n - 1] / b[n - 1];
      for (let i = n - 2; i >= 0; i--) m[i] = (d[i] - c[i] * m[i + 1]) / b[i];
    }
    const evalAt = (xx) => {
      let lo = 0, hi = n - 1;
      if (xx <= x[0]) { lo = 0; } else if (xx >= x[n - 1]) { lo = n - 2; } else {
        while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (x[mid] > xx) hi = mid; else lo = mid; }
      }
      const hh = x[lo + 1] - x[lo], A = (x[lo + 1] - xx) / hh, B = (xx - x[lo]) / hh;
      return A * y[lo] + B * y[lo + 1] + ((A * A * A - A) * m[lo] + (B * B * B - B) * m[lo + 1]) * hh * hh / 6;
    };
    const d2At = (xx) => {
      let lo = 0, hi = n - 1;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (x[mid] > xx) hi = mid; else lo = mid; }
      const hh = x[lo + 1] - x[lo], A = (x[lo + 1] - xx) / hh, B = (xx - x[lo]) / hh;
      return A * m[lo] + B * m[lo + 1];
    };
    return { at: evalAt, d2: d2At };
  }
  function naturalSpline(x, y) { return cubicSpline(x, y, 'natural'); }

  // ------------------------------------------------------------------ ZCT-MEP path model
  class PathModel {
    /** s: mass-weighted coordinate (A amu^1/2, increasing or not), V: kcal/mol (any zero); the first point (smaller s)
     *  is the reactant side. opts: nu (cm^-1; default: estimated from the path curvature), V1target (rescale V->cV, s->sqrt(c) s),
     *  nDense, massRatio (rho = m_heavy/m_light: s->sqrt(rho) s, nu->nu/sqrt(rho)) */
    constructor(s, V, opts = {}) {
      const idx = Array.from(s.keys ? s.keys() : s, (_, i) => i).sort((a, b) => s[a] - s[b]);
      let xs = [], ys = [];
      for (const i of idx) { if (xs.length && s[i] - xs[xs.length - 1] < 1e-9) continue; xs.push(s[i]); ys.push(V[i]); }
      if (xs.length < 5) throw new Error('path needs at least 5 distinct points');
      const y0 = ys[0]; ys = ys.map(v => v - y0);
      let scale = 1;
      if (opts.V1target) { const mx = Math.max(...ys); scale = opts.V1target / mx; ys = ys.map(v => v * scale); xs = xs.map(v => v * Math.sqrt(scale)); }
      this.rescale = scale;
      const rho = opts.massRatio || 1;
      if (rho !== 1) xs = xs.map(v => v * Math.sqrt(rho));
      this.sRaw = Float64Array.from(xs); this.VRaw = Float64Array.from(ys);
      const sp = cubicSpline(this.sRaw, this.VRaw, opts.spline || 'natural');
      this.spline = sp;
      const n = opts.nDense || 8001; this.n = n;
      this.s0 = xs[0]; this.sN = xs[xs.length - 1]; this.ds = (this.sN - this.s0) / (n - 1);
      this.Vd = new Float64Array(n);
      let ip = 0;
      for (let i = 0; i < n; i++) { const v = sp.at(this.s0 + i * this.ds); this.Vd[i] = v; if (v > this.Vd[ip]) ip = i; }
      // anchor end points to the data
      this.Vd[0] = this.VRaw[0]; this.Vd[n - 1] = this.VRaw[this.VRaw.length - 1];
      this.ip = ip;
      // refine top by parabolic interpolation
      let Vtop = this.Vd[ip], sTop = this.s0 + ip * this.ds;
      if (opts.refineTop !== false && ip > 0 && ip < n - 1) {
        const a = this.Vd[ip - 1], b = this.Vd[ip], c = this.Vd[ip + 1], den = a - 2 * b + c;
        if (den < 0) { const dx = 0.5 * (a - c) / den; sTop += dx * this.ds; Vtop = b - 0.25 * (a - c) * dx; }
      }
      this.sTop = sTop; this.V1 = Vtop; this.dE = this.Vd[n - 1] - this.Vd[0]; this.V2 = this.V1 - this.dE;
      const k2 = -sp.d2(Math.min(Math.max(sTop, this.s0), this.sN));       // kcal/mol/A^2/amu
      this.nuPath = k2 > 0 ? NUCONST * Math.sqrt(k2) : NaN;
      this.nu = opts.nu ? opts.nu / Math.sqrt(rho) : (this.nuPath);
      this.nuGiven = !!opts.nu;
      this.topAtEdge = ip < 3 || ip > n - 4;
    }
    get valid() { return this.V1 > 0 && this.V2 > 0 && this.nu > 0 && !this.topAtEdge; }
    theta(E) {            // E < V1, E >= E0 : Gauss-Chebyshev (2nd kind) quadrature between the turning points
      const Vd = this.Vd, n = this.n, ds = this.ds, sp = this.spline;
      let iL = this.ip; while (iL > 0 && Vd[iL] > E) iL--;
      let iR = this.ip; while (iR < n - 1 && Vd[iR] > E) iR++;
      const f = (s) => sp.at(s) - E;
      let sL, sR;
      if (Vd[iL] > E) sL = this.s0;      // no crossing: integrate to the boundary
      else sL = brent(f, this.s0 + iL * ds, this.s0 + (iL + 1) * ds, 1e-13);
      if (Vd[iR] > E) sR = this.sN;
      else sR = brent(f, this.s0 + (iR - 1) * ds, this.s0 + iR * ds, 1e-13);
      if (!(sR > sL)) return 0;
      const N = 96, half = 0.5 * (sR - sL), mid = 0.5 * (sR + sL);
      let sum = 0;
      for (let k = 1; k <= N; k++) {
        const th = k * Math.PI / (N + 1), v = sp.at(mid + half * Math.cos(th)) - E;
        sum += Math.sin(th) * Math.sqrt(Math.max(v, 0));
      }
      return CTHETA * half * Math.PI / (N + 1) * sum;
    }
    /** action on an energy grid E_i = E0 + (V1-E0) i/nE (i = 0..nE) */
    actionGrid(nE = 1600) {
      if (this._ag && this._ag.nE === nE) return this._ag;
      const E0 = Math.max(0, this.dE), th = new Float64Array(nE + 1), E = new Float64Array(nE + 1);
      for (let i = 0; i <= nE; i++) { E[i] = E0 + (this.V1 - E0) * i / nE; th[i] = i === nE ? 0 : this.theta(Math.min(E[i], this.V1 - 1e-12)); }
      return (this._ag = { nE, E, th, E0 });
    }
    kappa(T, variant = 'kemble', nE = 1600) {
      if (!this.valid) return 1;
      const ag = this.actionGrid(nE), beta = 1 / (R_KCAL * T), hnu = HNU * this.nu;
      const g = new Float64Array(nE + 1);
      for (let i = 0; i <= nE; i++) g[i] = Math.exp(lnPfromTheta(ag.th[i], variant) - beta * (ag.E[i] - this.V1) + Math.log(beta));
      const dE = (this.V1 - ag.E0) / nE;
      let s = g[0] + g[nE];
      for (let i = 1; i < nE; i++) s += (i % 2 ? 4 : 2) * g[i];
      const below = s * dE / 3;
      const above = quadGK((x) => beta * Math.exp(-beta * x) * logistic(2 * Math.PI * x / hnu), 0, 60 / beta, 1e-11, 8);
      return below + above;
    }
    /** exact-ish Kemble P(E) for plotting */
    PE(E, variant = 'kemble') {
      const E0 = Math.max(0, this.dE);
      if (E <= E0) return 0;
      const th = E >= this.V1 ? Math.PI * (this.V1 - E) / (HNU * this.nu) : this.theta(E);
      return Math.exp(lnPfromTheta(th, variant));
    }
    lnPfun(variant = 'kemble') {
      const E0 = Math.max(0, this.dE);
      return (E) => (E <= E0 ? -Infinity : lnPfromTheta(E >= this.V1 ? Math.PI * (this.V1 - E) / (HNU * this.nu) : this.theta(E), variant));
    }
  }

  // ------------------------------------------------------------------ ZCT-EC and EQ-FREQ
  function kappaZCTEC(pm, T, kPath) {
    if (!pm.valid) return 1;
    const kp = kPath !== undefined ? kPath : pm.kappa(T);
    const ke = kappaEckart(pm.V1, pm.V2, pm.nu, T), kz = kappaZCTonEckart(pm.V1, pm.V2, pm.nu, T);
    return kp * ke / kz;
  }
  function effectiveFrequency(pm, T, kPath) {
    if (!pm.valid) return { nuEff: NaN, root: false };
    const kp = kPath !== undefined ? kPath : pm.kappa(T), lt = Math.log(kp);
    const f = (nu) => Math.log(kappaZCTonEckart(pm.V1, pm.V2, nu, T)) - lt;
    const nuEff = brent(f, 0.15 * pm.nu, 6 * pm.nu, 1e-10);
    return { nuEff, root: Number.isFinite(nuEff) };
  }
  function kappaEQFREQ(pm, T, kPath) {
    const { nuEff, root } = effectiveFrequency(pm, T, kPath);
    if (!root) return { kappa: NaN, nuEff: NaN };
    return { kappa: kappaEckart(pm.V1, pm.V2, nuEff, T), nuEff };
  }

  /** all models for a set of temperatures; pm may be null (then only the three-number models) */
  function allModels(V1, dE, nu, Ts, pm) {
    const V2 = V1 - dE, out = [];
    for (const T of Ts) {
      const r = { T, u: uStar(nu, T), Tc: Tcross(nu), TTc: T / Tcross(nu) };
      r.wigner = kappaWigner(nu, T);
      r.parabola = kappaParabola(V1, V2, nu, T);
      r.eckart = kappaEckart(V1, V2, nu, T);
      r.eckartSym = kappaEckartSym(V1, nu, T);
      if (pm && pm.valid) {
        r.zct = pm.kappa(T, 'kemble'); r.zctWKB = pm.kappa(T, 'wkb');
        r.zctEC = kappaZCTEC(pm, T, r.zct);
        const eq = kappaEQFREQ(pm, T, r.zct); r.eqfreq = eq.kappa; r.nuEff = eq.nuEff;
      }
      out.push(r);
    }
    return out;
  }

  // ------------------------------------------------------------------ model profiles (matched V1, V2, nu)
  const FAMILIES = {
    gauss:    { label: 'Gaussian',      f: (x) => Math.exp(-0.5 * x * x), dev: true },
    lorentz:  { label: 'Lorentzian',    f: (x) => 1 / (1 + x * x), dev: true },
    sech2:    { label: 'sech²',         f: (x) => { const c = Math.cosh(x); return 1 / (c * c); }, dev: true },
    sech4:    { label: 'sech⁴ (held out)', f: (x) => { const c = Math.cosh(x); return 1 / (c * c * c * c); }, dev: false },
    lorentz2: { label: 'Lorentzian² (held out)', f: (x) => { const q = 1 + x * x; return 1 / (q * q); }, dev: false },
    shoulder: { label: 'Shoulder (asymmetric)', f: (x) => Math.exp(-0.5 * x * x) + 0.45 * Math.exp(-0.5 * (x - 1.7) * (x - 1.7) / 0.64), dev: false },
    double:   { label: 'Double hump (2d/w = 2.4)', f: (x) => Math.exp(-0.5 * (x - 1.2) * (x - 1.2)) + Math.exp(-0.5 * (x + 1.2) * (x + 1.2)), dev: false, nominal: true }
  };

  class Profile {
    constructor(family, V0, w, dE) { this.family = family; this.V0 = V0; this.w = w; this.dE = dE; this.f = FAMILIES[family].f; }
    V(x) { return this.V0 * this.f(x / this.w) + 0.5 * this.dE * (1 + Math.tanh(x / (0.5 * this.w))); }
    /** locate the global maximum and the curvature there (x in A, m = 1 amu) */
    analyse() {
      const w = this.w; let xb = 0, vb = -Infinity;
      const N = 1600;
      for (let i = 0; i <= N; i++) { const x = -4 * w + 8 * w * i / N, v = this.V(x); if (v > vb) { vb = v; xb = x; } }
      let a = xb - 8 * w / N, b = xb + 8 * w / N; const gr = 0.6180339887498949;
      let c = b - gr * (b - a), d = a + gr * (b - a), fc = this.V(c), fd = this.V(d);
      for (let i = 0; i < 80; i++) { if (fc > fd) { b = d; d = c; fd = fc; c = b - gr * (b - a); fc = this.V(c); } else { a = c; c = d; fc = fd; d = a + gr * (b - a); fd = this.V(d); } }
      xb = 0.5 * (a + b); vb = this.V(xb);
      const e = 1e-3 * w;
      const d2 = (-this.V(xb + 2 * e) + 16 * this.V(xb + e) - 30 * vb + 16 * this.V(xb - e) - this.V(xb - 2 * e)) / (12 * e * e);
      const VL = this.V(-60 * w), VR = this.V(60 * w);
      this.xMax = xb; this.Vmax = vb; this.k2 = -d2;
      this.nuAct = d2 < 0 ? NUCONST * Math.sqrt(-d2) : NaN;
      this.V1 = vb - 0; this.V2 = vb - this.dE;
      return this;
    }
    /** number of local maxima in [-4w, 4w] */
    countMaxima() {
      let n = 0, N = 2400, prev = this.V(-4 * this.w), cur = this.V(-4 * this.w + 8 * this.w / N), dirUp = cur > prev;
      for (let i = 2; i <= N; i++) { const nxt = this.V(-4 * this.w + 8 * this.w * i / N); const up = nxt > cur; if (dirUp && !up) n++; dirUp = up; cur = nxt; }
      return n;
    }
  }
  function f2zero(f) { const e = 1e-3; return (-f(2 * e) + 16 * f(e) - 30 * f(0) + 16 * f(-e) - f(-2 * e)) / (12 * e * e); }

  /** solve (V0, w) so that the maximum is V1 above the reactant asymptote and the curvature gives nu. For the 'double' family V1 is not a target (V0 is). */
  function matchProfile(family, V1, dE, nu) {
    const K = nu / NUCONST;
    const fam = FAMILIES[family];
    if (fam.nominal) {                      // V0 given (V1 argument), w from nominal curvature
      let g = (lw) => { const p = new Profile(family, V1, Math.exp(lw), dE).analyse(); return Math.log(p.nuAct / nu); };
      const lw = brent(g, Math.log(0.05), Math.log(4), 1e-12);
      if (!Number.isFinite(lw)) throw new Error('could not match the double-hump width');
      return new Profile(family, V1, Math.exp(lw), dE).analyse();
    }
    const curv = -f2zero(fam.f);
    let p = [Math.log(V1), Math.log(Math.sqrt(V1 * Math.abs(curv || 1)) / K)];
    const res = (q) => { const pr = new Profile(family, Math.exp(q[0]), Math.exp(q[1]), dE).analyse(); return [(pr.Vmax - V1) / V1, (pr.nuAct - nu) / nu]; };
    for (let it = 0; it < 60; it++) {
      const r = res(p); if (!(Math.abs(r[0]) > 1e-11 || Math.abs(r[1]) > 1e-11)) break;
      if (!Number.isFinite(r[0] + r[1])) throw new Error('profile matching diverged');
      const dlt = 1e-6, J = [[0, 0], [0, 0]];
      for (let j = 0; j < 2; j++) { const q = p.slice(); q[j] += dlt; const rj = res(q); J[0][j] = (rj[0] - r[0]) / dlt; J[1][j] = (rj[1] - r[1]) / dlt; }
      const det = J[0][0] * J[1][1] - J[0][1] * J[1][0];
      if (!Number.isFinite(det) || Math.abs(det) < 1e-14) throw new Error('profile matching is singular');
      let d0 = -(J[1][1] * r[0] - J[0][1] * r[1]) / det, d1 = -(-J[1][0] * r[0] + J[0][0] * r[1]) / det;
      const m = Math.max(Math.abs(d0), Math.abs(d1)); if (m > 0.5) { d0 *= 0.5 / m; d1 *= 0.5 / m; }
      p = [p[0] + d0, p[1] + d1];
    }
    const prof = new Profile(family, Math.exp(p[0]), Math.exp(p[1]), dE).analyse();
    if (Math.abs(prof.Vmax / V1 - 1) > 1e-6 || Math.abs(prof.nuAct / nu - 1) > 1e-6) throw new Error('profile matching did not converge');
    return prof;
  }

  // ------------------------------------------------------------------ exact 1D reference
  /** Riccati-type (transfer-matrix with exact cosh/sinh steps) propagation, Richardson extrapolation of ln T in h^2.
   *  Vfun(s): kcal/mol, s in A amu^1/2.  ctx precomputes the midpoint potentials for the three step sizes. */
  class ExactSolver {
    constructor(Vfun, sL, sR, opts = {}) {
      this.Vfun = Vfun; this.sL = sL; this.sR = sR;
      this.VL = Vfun(sL); this.VR = Vfun(sR);
      // scan for the maximum
      let vm = -Infinity; const nscan = 4000; this.sTop = sL;
      for (let i = 0; i <= nscan; i++) { const s = sL + (sR - sL) * i / nscan, v = Vfun(s); if (v > vm) { vm = v; this.sTop = s; } }
      { // refine the maximum (golden section around the scan optimum)
        const stp = (sR - sL) / nscan; let a = this.sTop - stp, b = this.sTop + stp; const gr = 0.6180339887498949;
        let c = b - gr * (b - a), d = a + gr * (b - a), fc = Vfun(c), fd = Vfun(d);
        for (let i = 0; i < 60; i++) { if (fc > fd) { b = d; d = c; fd = fc; c = b - gr * (b - a); fc = Vfun(c); } else { a = c; c = d; fc = fd; d = a + gr * (b - a); fd = Vfun(d); } }
        const sm = 0.5 * (a + b), vv = Vfun(sm); if (vv > vm) { vm = vv; this.sTop = sm; }
      }
      this.Vtop = vm;
      this.V1 = vm - this.VL; this.dE = this.VR - this.VL; this.V2 = this.V1 - this.dE;
      let vmin = Infinity; for (let i = 0; i <= nscan; i++) vmin = Math.min(vmin, Vfun(sL + (sR - sL) * i / nscan));
      this.Vmin = vmin;
      this.hScale = opts.hScale || 1;
      this.Emax = null; this.levels = null;
    }
    prepare(Emax) {
      const qmax = CTHETA * Math.sqrt(Math.max(this.Vtop - this.Vmin, Emax - this.Vmin));
      let h0 = 0.6 / qmax * this.hScale;
      const N0 = Math.max(200, Math.ceil((this.sR - this.sL) / h0));
      if (this.levels && this.levels[0].N === N0) return;
      this.levels = [];
      for (let l = 0; l < 3; l++) {
        const N = N0 * (1 << l), hh = (this.sR - this.sL) / N, Vm = new Float64Array(N);
        for (let i = 0; i < N; i++) Vm[i] = this.Vfun(this.sL + (i + 0.5) * hh);
        this.levels.push({ N, h: hh, Vm });
      }
    }
    _lnT1(E, lev) {
      const { N, h, Vm } = lev;
      const k1sq = CTHETA * CTHETA * (E - this.VL), k2sq = CTHETA * CTHETA * (E - this.VR);
      if (k1sq <= 0 || k2sq <= 0) return -Infinity;
      const k1 = Math.sqrt(k1sq), k2 = Math.sqrt(k2sq);
      let pr = 1, pi = 0, qr = 0, qi = k2, lnScale = 0;          // psi = 1, psi' = i k2
      const C2 = CTHETA * CTHETA;
      for (let i = N - 1; i >= 0; i--) {
        const q = C2 * (Vm[i] - E);
        let c, sk;         // psi(s-h) = c psi - sk psi'  ; psi'(s-h) = -q*sk psi + c psi'
        if (q > 1e-12) { const kk = Math.sqrt(q), x = kk * h; c = Math.cosh(x); sk = Math.sinh(x) / kk; }
        else if (q < -1e-12) { const kk = Math.sqrt(-q), x = kk * h; c = Math.cos(x); sk = Math.sin(x) / kk; }
        else { c = 1; sk = h; }
        const npr = c * pr - sk * qr, npi = c * pi - sk * qi;
        const nqr = -q * sk * pr + c * qr, nqi = -q * sk * pi + c * qi;
        pr = npr; pi = npi; qr = nqr; qi = nqi;
        const m = Math.abs(pr) + Math.abs(pi) + Math.abs(qr) / k1 + Math.abs(qi) / k1;
        if (m > 1e100) { const f = 1e-100; pr *= f; pi *= f; qr *= f; qi *= f; lnScale += Math.log(1e100); }
      }
      const re = pr + qi / k1, im = pi - qr / k1;
      return Math.log(4 * k2 / k1) - Math.log(re * re + im * im) - 2 * lnScale;     // psi(R)=1 -> scale: |a|^2 grows with scale
    }
    /** ln of the transmission probability at E (kcal/mol, absolute potential zero), Richardson-extrapolated */
    lnT(E) {
      const L = this.levels.map((lev) => this._lnT1(E, lev));
      if (L.some((v) => !Number.isFinite(v))) return L[2];
      const R1 = (4 * L[1] - L[0]) / 3, R2 = (4 * L[2] - L[1]) / 3;
      return (16 * R2 - R1) / 15;
    }
    /** energy nodes for the thermal integral over temperatures Ts (E >= E0, E0 = max(VL, VR)) */
    nodes(Ts, opts = {}) {
      const E0 = Math.max(this.VL, this.VR), Tmin = Math.min(...Ts), Tmax = Math.max(...Ts);
      const kTmin = R_KCAL * Tmin, kTmax = R_KCAL * Tmax;
      const hnuEst = HNU * (this.nuEst || 1500);
      const scale = Math.min(kTmin, hnuEst / (4 * Math.PI));
      const fine = (opts.fine ? 0.5 : 1) * 0.8 * scale;
      const Eend = this.Vtop + 45 * kTmax;
      const nodes = [], gl = gaussLegendre(8);
      const push = (a, b, sqrtMap) => {
        for (let j = 0; j < 8; j++) {
          const t = 0.5 * (gl.x[j] + 1);
          if (sqrtMap) { const ua = Math.sqrt(a - E0), ub = Math.sqrt(b - E0), u = ua + (ub - ua) * t; nodes.push({ E: E0 + u * u, w: 0.5 * gl.w[j] * (ub - ua) * 2 * u }); }
          else nodes.push({ E: a + (b - a) * t, w: 0.5 * gl.w[j] * (b - a) });
        }
      };
      const d0 = Math.min(1.0, 0.25 * Math.max(this.Vtop - E0, 0.2));
      for (let i = 0; i < 3; i++) push(E0 + d0 * i / 3, E0 + d0 * (i + 1) / 3, true);
      let E = E0 + d0; const Etop = this.Vtop, wide = 1.5 * kTmin;
      while (E < Eend - 1e-12) {
        const width = E < Etop + 8 * scale ? fine : Math.min(wide, 4 * fine + 0.3 * (E - Etop - 8 * scale));
        const nxt = Math.min(Eend, E + Math.max(width, 1e-4)); push(E, nxt, false); E = nxt;
      }
      return nodes;
    }
    /** exact thermal kappa for each T plus sampled P(E); Ts array; returns {kappa[], f_sub[], E[], P[]} */
    kappa(Ts, opts = {}) {
      const nodes = this.nodes(Ts, opts), Emax = nodes[nodes.length - 1].E + 1;
      this.prepare(Emax);
      const lnT = new Float64Array(nodes.length);
      for (let i = 0; i < nodes.length; i++) { lnT[i] = this.lnT(nodes[i].E); if (opts.progress && i % 40 === 0) opts.progress(i / nodes.length); }
      const V1 = this.V1, shift = this.VL;
      const out = { kappa: [], fsub: [], nodes, lnT, V1, V2: this.V2, dE: this.dE };
      for (const T of Ts) {
        const beta = 1 / (R_KCAL * T); let tot = 0, sub = 0;
        for (let i = 0; i < nodes.length; i++) {
          if (!Number.isFinite(lnT[i])) continue;
          const val = nodes[i].w * beta * Math.exp(lnT[i] - beta * (nodes[i].E - shift - V1));
          tot += val; if (nodes[i].E < this.Vtop) sub += val;
        }
        out.kappa.push(tot); out.fsub.push(tot > 0 ? sub / tot : NaN);
      }
      return out;
    }
  }

  /** exact solver for a matched model profile (x in A with m = 1 amu; massRatio rho scales s = sqrt(rho) x) */
  function exactForProfile(prof, opts = {}) {
    const rho = opts.massRatio || 1, sr = Math.sqrt(rho);
    const L = Math.max(14, 14 * prof.w) * (opts.boxScale || 1);
    const solver = new ExactSolver((s) => prof.V(s / sr), -L * sr, L * sr, { hScale: opts.hScale });
    solver.nuEst = prof.nuAct / sr;
    return solver;
  }
  /** exact solver for a tabulated path (PathModel): V extended by constants beyond the ends */
  function exactForPath(pm, opts = {}) {
    const pad = Math.max(1.0, 0.25 * (pm.sN - pm.s0)) * (opts.boxScale || 1);
    const Vf = (s) => pm.spline.at(Math.min(Math.max(s, pm.s0), pm.sN));
    const solver = new ExactSolver(Vf, pm.s0 - pad, pm.sN + pad, { hScale: opts.hScale });
    solver.nuEst = pm.nu;
    return solver;
  }

  // ------------------------------------------------------------------ helpers for the application
  function linspace(a, b, n) { const o = []; for (let i = 0; i < n; i++) o.push(n === 1 ? a : a + (b - a) * i / (n - 1)); return o; }
  function eckartPE(V1, V2, nu, Es) { const hnu = HNU * nu; return Es.map((E) => Math.exp(eckartLnT(E, V1, V2, hnu))); }

  return {
    CONST, uStar, Tcross, dG, quadGK, brent, gaussLegendre,
    kappaWigner, kappaParabola, kappaParabolaNumeric, kappaEckart, kappaEckartSym, eckartLnT, thetaEckart, kappaZCTonEckart, fsubFromLnT,
    PathModel, kappaZCTEC, effectiveFrequency, kappaEQFREQ, allModels,
    FAMILIES, Profile, matchProfile, ExactSolver, exactForProfile, exactForPath, naturalSpline, cubicSpline, linspace, eckartPE, lnPfromTheta
  };
});
