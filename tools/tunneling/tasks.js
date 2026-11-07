/* Heavy computations shared by the Web Worker and the main-thread fallback. MIT licence. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./core.js'), require('./semiclassical.js'));
  else root.TunnelingTasks = factory(root.TunnelingCore, root.TunnelingSC);
})(typeof self !== 'undefined' ? self : this, function (C, SC) {
  'use strict';

  function profilePath(p, rho) {
    const L = C.boxFor(p), n = L < 30 ? 8001 : 16001, s = new Float64Array(n), V = new Float64Array(n);
    for (let i = 0; i < n; i++) { const x = -L + 2 * L * i / (n - 1); s[i] = x; V[i] = p.V(x); }
    return new C.PathModel(s, V, { nu: p.nuAct, massRatio: rho || 1 });
  }
  function pathModels(pm, Ts) {
    const o = { zct: [], zctWKB: [], zctEC: [], eq: [], nuEff: [], eckart: [] };
    for (const T of Ts) {
      const kz = pm.kappa(T, 'kemble'); o.zct.push(kz); o.zctWKB.push(pm.kappa(T, 'wkb'));
      o.zctEC.push(C.kappaZCTEC(pm, T, kz));
      const e = C.kappaEQFREQ(pm, T, kz); o.eq.push(e.kappa); o.nuEff.push(e.nuEff);
      o.eckart.push(C.kappaEckart(pm.V1, pm.V2, pm.nu, T));
    }
    return o;
  }
  function sampleProfile(p, rho) {
    const sr = Math.sqrt(rho || 1), L = Math.max(2.5 * p.w, 0.8), xs = [], Vs = [];
    for (let i = 0; i <= 240; i++) { const x = -L + 2 * L * i / 240; xs.push(x * sr); Vs.push(p.V(x)); }
    return { xs, Vs };
  }

  /** args: {V1, dE, nu, Ts, families:[keys], rho (heavy/light, or 1), iso:bool, fine:bool} */
  function runProfiles(args, progress) {
    const out = { families: [], errors: [] };
    const fams = args.families, Ts = args.Ts;
    fams.forEach((key, fi) => {
      const rep = (f) => progress && progress((fi + f) / fams.length, `exact 1D: ${C.FAMILIES[key].label}`);
      try {
        const p = C.matchProfile(key, args.V1, args.dE, args.nu);
        const res = { key, label: C.FAMILIES[key].label, dev: C.FAMILIES[key].dev, V0: p.V0, w: p.w, nProfMax: p.countMaxima() };
        const ex = C.exactForProfile(p);
        const r = ex.kappa(Ts, { fine: args.fine, progress: (f) => rep(0.9 * f) });
        Object.assign(res, { V1: ex.V1, V2: ex.V2, dE: ex.dE, nu: p.nuAct, exact: r.kappa, fsub: r.fsub });
        res.profile = sampleProfile(p, 1);
        const pm = profilePath(p, 1);
        res.models = pathModels(pm, Ts); res.pmValid = pm.valid; res.nuPath = pm.nuPath;
        if (SC && args.sc !== false) { try { res.sc = SC.profileMethods(p, Ts); } catch (e) { res.scError = e.message; } }
        // P(E) samples
        const Es = [], nE = 140, E0 = Math.max(0, ex.dE);
        for (let i = 0; i <= nE; i++) Es.push(E0 + (ex.V1 + 6 - E0) * (0.0005 + i / nE));
        ex.prepare(Es[Es.length - 1] + 1);
        res.PE = { E: Es, exact: Es.map((E) => Math.exp(ex.lnT(E))), eckart: C.eckartPE(ex.V1, ex.V2, p.nuAct, Es), zct: Es.map((E) => pm.PE(E)) };
        if (args.iso && args.rho > 1) {
          const exh = C.exactForProfile(p, { massRatio: args.rho });
          const rh = exh.kappa(Ts, { fine: args.fine });
          const pmh = profilePath(p, args.rho);
          res.iso = { exactH: rh.kappa, models: pathModels(pmh, Ts), nuH: p.nuAct / Math.sqrt(args.rho) };
        }
        out.families.push(res);
      } catch (e) { out.errors.push({ key, message: e.message }); }
      rep(1);
    });
    return out;
  }

  /** args: {s:[], V:[], nu (optional), V1target (optional), Ts, exact:bool, rho, iso:bool, flip:bool} */
  function runPath(args, progress) {
    let s = Array.from(args.s), V = Array.from(args.V);
    if (args.flip) { const n = s.length; s = s.map((v, i) => -s[n - 1 - i]); V = V.map((v, i) => V[n - 1 - i]); }
    const pm = new C.PathModel(s, V, { nu: args.nu || null, V1target: args.V1target || null });
    const out = { V1: pm.V1, V2: pm.V2, dE: pm.dE, nu: pm.nu, nuPath: pm.nuPath, nuGiven: pm.nuGiven, valid: pm.valid, topAtEdge: pm.topAtEdge, rescale: pm.rescale, sTop: pm.sTop,
      s0: pm.s0, sN: pm.sN, curve: { s: Array.from(pm.sRaw), V: Array.from(pm.VRaw) } };
    // intermediate wells / extra humps on the dense path
    const Vd = pm.Vd, n = Vd.length; let maxima = 0, minima = 0, wellDepth = 0;
    { const step = Math.max(1, Math.floor(n / 800)); const w = []; for (let i = 0; i < n; i += step) w.push(Vd[i]);
      const span = Math.max(...w) - Math.min(...w), thr = 0.02 * span; let lastExt = w[0], dir = 0, lastMaxV = null;
      for (let i = 1; i < w.length; i++) { const d = w[i] - lastExt;
        if (dir >= 0 && w[i] > lastExt) { lastExt = w[i]; dir = 1; }
        else if (dir >= 0 && lastExt - w[i] > thr) { if (dir === 1) { maxima++; lastMaxV = lastExt; } dir = -1; lastExt = w[i]; }
        else if (dir <= 0 && w[i] < lastExt) { lastExt = w[i]; dir = -1; }
        else if (dir <= 0 && w[i] - lastExt > thr) { if (dir === -1) { minima++; if (lastMaxV !== null) wellDepth = Math.max(wellDepth, lastMaxV - lastExt); } dir = 1; lastExt = w[i]; } }
    }
    out.maxima = maxima; out.minima = minima; out.wellDepth = wellDepth;
    if (!pm.valid) { out.models = null; return out; }
    out.models = pathModels(pm, args.Ts);
    out.PE = (() => { const Es = [], nE = 140, E0 = Math.max(0, pm.dE); for (let i = 0; i <= nE; i++) Es.push(E0 + (pm.V1 + 6 - E0) * (0.0005 + i / nE)); return { E: Es, zct: Es.map((E) => pm.PE(E)), eckart: C.eckartPE(pm.V1, pm.V2, pm.nu, Es) }; })();
    if (args.exact) {
      progress && progress(0.1, 'exact 1D on the path');
      const ex = C.exactForPath(pm); const r = ex.kappa(args.Ts, { progress: (f) => progress && progress(0.1 + 0.8 * f, 'exact 1D on the path') });
      out.exact = r.kappa; out.fsub = r.fsub; out.exactV1 = ex.V1;
      if (out.PE) { const Es = out.PE.E; ex.prepare(Es[Es.length - 1] + 1); out.PE.exact = Es.map((E) => Math.exp(ex.lnT(E))); }
    }
    if (args.iso && args.rho > 1) {
      const pmh = new C.PathModel(s, V, { nu: args.nu || null, V1target: args.V1target || null, massRatio: args.rho });
      out.iso = { models: pathModels(pmh, args.Ts), nuH: pmh.nu };
      if (args.exact) { const exh = C.exactForPath(pmh); out.iso.exactH = exh.kappa(args.Ts).kappa; }
    }
    progress && progress(1, 'done');
    return out;
  }

  /** validation self-test shown on the About tab (fast analytic checks only) */
  function selfTest() {
    const rows = [];
    const add = (name, got, ref, tol) => rows.push({ name, got, ref, ok: Math.abs(got / ref - 1) < tol });
    add('Eckart κ, V1=12, V2=17, 1800 cm⁻¹, 298.15 K', C.kappaEckart(12, 17, 1800, 298.15), 76.398, 1e-4);
    add('Eckart κ, V1=12, ΔE=−5, 1500 cm⁻¹ (Table 9)', C.kappaEckart(12, 17, 1500, 298.15), 18.7, 2e-3);
    add('Eckart κ, V1=12, ΔE=−5, 2000 cm⁻¹ (Table 9)', C.kappaEckart(12, 17, 2000, 298.15), 200, 3e-3);
    add('Wigner κ, 1616 cm⁻¹, 298.15 K (CH₄+OH)', C.kappaWigner(1616, 298.15), 3.53, 2e-3);
    add('Truncated parabola, CH₄+OH, 298.15 K', C.kappaParabola(6.4, 19.7, 1615.7, 298.15), 36.80, 2e-3);
    add('Eckart κ, CH₄+OH, 200 K', C.kappaEckart(6.4, 19.7, 1615.7, 200), 464, 2e-3);
    return rows;
  }
  return { runProfiles, runPath, selfTest, profilePath, pathModels };
});
