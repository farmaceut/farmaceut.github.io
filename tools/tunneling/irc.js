/* Readers for reaction-path data: ORCA IRC trajectories (*_trj.xyz), Gaussian IRC output (.log/.out), plain two-column tables,
 * and the imaginary frequency from ORCA/Gaussian output.  Returns s (A amu^1/2) and V (kcal/mol, arbitrary zero).  MIT licence. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TunnelingIRC = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const HARTREE_KCAL = 627.5094740631, BOHR = 0.529177210903, EV_KCAL = 23.060547830619, KJ_KCAL = 1 / 4.184;
  // most-abundant-isotope masses (amu); D and T are accepted as symbols
  const MASS = { H: 1.00782503223, D: 2.01410177812, T: 3.0160492779, He: 4.00260325413, Li: 7.0160034366, Be: 9.012183065, B: 11.00930536, C: 12.0, N: 14.00307400443,
    O: 15.99491461957, F: 18.99840316273, Ne: 19.9924401762, Na: 22.989769282, Mg: 23.985041697, Al: 26.98153853, Si: 27.97692653465, P: 30.97376199842,
    S: 31.9720711744, Cl: 34.968852682, Ar: 39.9623831237, K: 38.9637064864, Ca: 39.962590863, Fe: 55.93493633, Co: 58.93319429, Ni: 57.93534241,
    Cu: 62.92959772, Zn: 63.92914201, Br: 78.9183376, I: 126.9044719, Pd: 105.9034804, Pt: 194.9647917, Ru: 101.9043441, Mn: 54.93804391, Ti: 47.94794198,
    V: 50.94395704, Cr: 51.94050623, Mo: 97.90540482, Ag: 106.9050916, Au: 196.9665688, Sn: 119.9022016, Se: 79.9165218, As: 74.9215946, Ge: 73.921177761 };
  // standard atomic weights (the table of the Python package parse_orca.py); other elements fall back to the isotope masses above
  const MASS_STD = { H: 1.00794, D: 2.014102, He: 4.002602, Li: 6.941, B: 10.811, C: 12.0107, N: 14.0067, O: 15.9994, F: 18.9984, Na: 22.98977, Mg: 24.305, Si: 28.0855,
    P: 30.97376, S: 32.065, Cl: 35.453, K: 39.0983, Br: 79.904, I: 126.90447 };
  const Z2SYM = ['', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca'];

  function parseXYZ(text) {
    const lines = text.split(/\r?\n/), frames = [];
    let i = 0;
    while (i < lines.length) {
      if (!lines[i].trim()) { i++; continue; }
      const n = parseInt(lines[i].trim(), 10);
      if (!(n > 0) || !/^\s*\d+\s*$/.test(lines[i])) { i++; continue; }
      const comment = lines[i + 1] || '';
      const sym = [], xyz = new Float64Array(3 * n);
      let ok = true;
      for (let a = 0; a < n; a++) {
        const t = (lines[i + 2 + a] || '').trim().split(/\s+/);
        if (t.length < 4) { ok = false; break; }
        sym.push(t[0].replace(/[^A-Za-z]/g, '')); xyz[3 * a] = +t[1]; xyz[3 * a + 1] = +t[2]; xyz[3 * a + 2] = +t[3];
      }
      if (!ok) break;
      const m = /(?:\bE\s+|energy\s*[=:]?\s*|E=\s*)(-?\d+\.\d+)/i.exec(comment);
      frames.push({ sym, xyz, comment, energy: m ? parseFloat(m[1]) : null });
      i += 2 + n;
    }
    return frames;
  }

  function jacobi4(A) {         // eigen-decomposition of a symmetric 4x4 matrix; returns {val, vec[col]}
    const n = 4, a = A.map((r) => r.slice()), v = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
    for (let sweep = 0; sweep < 60; sweep++) {
      let off = 0; for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += a[p][q] * a[p][q];
      if (off < 1e-30) break;
      for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p][q]) < 1e-300) continue;
        const th = (a[q][q] - a[p][p]) / (2 * a[p][q]), t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (let k = 0; k < n; k++) { const akp = a[k][p], akq = a[k][q]; a[k][p] = c * akp - s * akq; a[k][q] = s * akp + c * akq; }
        for (let k = 0; k < n; k++) { const apk = a[p][k], aqk = a[q][k]; a[p][k] = c * apk - s * aqk; a[q][k] = s * apk + c * aqk; }
        for (let k = 0; k < n; k++) { const vkp = v[k][p], vkq = v[k][q]; v[k][p] = c * vkp - s * vkq; v[k][q] = s * vkp + c * vkq; }
      }
    }
    return { val: [a[0][0], a[1][1], a[2][2], a[3][3]], vec: v };
  }
  /** mass-weighted optimal rotation (Horn): returns the coordinates of Q rotated onto P (both already centred) */
  function rotateOnto(Q, P, m, n) {
    const S = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (let i = 0; i < n; i++) for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) S[a][b] += m[i] * Q[3 * i + a] * P[3 * i + b];
    const N = [[S[0][0] + S[1][1] + S[2][2], S[1][2] - S[2][1], S[2][0] - S[0][2], S[0][1] - S[1][0]],
      [S[1][2] - S[2][1], S[0][0] - S[1][1] - S[2][2], S[0][1] + S[1][0], S[2][0] + S[0][2]],
      [S[2][0] - S[0][2], S[0][1] + S[1][0], -S[0][0] + S[1][1] - S[2][2], S[1][2] + S[2][1]],
      [S[0][1] - S[1][0], S[2][0] + S[0][2], S[1][2] + S[2][1], -S[0][0] - S[1][1] + S[2][2]]];
    const { val, vec } = jacobi4(N); let k = 0; for (let i = 1; i < 4; i++) if (val[i] > val[k]) k = i;
    const [q0, q1, q2, q3] = [vec[0][k], vec[1][k], vec[2][k], vec[3][k]];
    const R = [[q0 * q0 + q1 * q1 - q2 * q2 - q3 * q3, 2 * (q1 * q2 - q0 * q3), 2 * (q1 * q3 + q0 * q2)],
      [2 * (q1 * q2 + q0 * q3), q0 * q0 - q1 * q1 + q2 * q2 - q3 * q3, 2 * (q2 * q3 - q0 * q1)],
      [2 * (q1 * q3 - q0 * q2), 2 * (q2 * q3 + q0 * q1), q0 * q0 - q1 * q1 - q2 * q2 + q3 * q3]];
    const out = new Float64Array(3 * n);
    for (let i = 0; i < n; i++) for (let a = 0; a < 3; a++) out[3 * i + a] = R[a][0] * Q[3 * i] + R[a][1] * Q[3 * i + 1] + R[a][2] * Q[3 * i + 2];
    return out;
  }
  function centred(xyz, m, n) {
    let M = 0, c = [0, 0, 0]; for (let i = 0; i < n; i++) { M += m[i]; for (let a = 0; a < 3; a++) c[a] += m[i] * xyz[3 * i + a]; }
    const o = new Float64Array(3 * n); for (let i = 0; i < n; i++) for (let a = 0; a < 3; a++) o[3 * i + a] = xyz[3 * i + a] - c[a] / M; return o;
  }
  /** mass-weighted arc length along a list of frames (successive Kabsch alignment); opts.masses overrides atom masses (amu) */
  function arcLength(frames, opts = {}) {
    const n = frames[0].sym.length;
    const m = opts.masses || frames[0].sym.map((s) => { const k = (opts.massSet === 'std' && MASS_STD[s]) || MASS[s] || MASS[s[0]]; if (!k) throw new Error('unknown element ' + s); return k; });
    const s = [0]; let prev = centred(frames[0].xyz, m, n);
    for (let f = 1; f < frames.length; f++) {
      const cur = centred(frames[f].xyz, m, n), rot = rotateOnto(cur, prev, m, n);
      let d2 = 0; for (let i = 0; i < n; i++) for (let a = 0; a < 3; a++) { const dd = rot[3 * i + a] - prev[3 * i + a]; d2 += m[i] * dd * dd; }
      s.push(s[f - 1] + Math.sqrt(d2)); prev = rot;
    }
    return s;
  }
  /** ORCA IRC trajectory(ies). files: [{name,text}]. A *_Full_trj.xyz is used alone; otherwise B (reversed) + F. */
  function orcaPath(files, opts = {}) {
    let frames = null, note = '';
    const parsed = files.map((f) => ({ name: f.name, frames: parseXYZ(f.text) }));
    for (const p of parsed) if (!p.frames.length) throw new Error('no frames found in ' + p.name);
    const full = parsed.find((p) => /full/i.test(p.name)), F = parsed.find((p) => /(_F|forward)[_.]/i.test(p.name) && !/full/i.test(p.name)), B = parsed.find((p) => /(_B|backward)[_.]/i.test(p.name));
    if (full) { frames = full.frames; note = 'Full IRC trajectory'; }
    else if (F && B) {
      const bb = B.frames.slice().reverse(), ff = F.frames.slice();
      // B starts at the TS and runs to the reactant side (reversed -> reactant ... TS); F starts at TS
      frames = bb.concat(ff.slice(1)); note = 'backward (reversed) + forward IRC';
    } else if (parsed.length === 1) { frames = parsed[0].frames; note = parsed[0].name; }
    else throw new Error('could not decide how to combine the files (use one *_IRC_Full_trj.xyz, or a pair *_IRC_B_trj.xyz and *_IRC_F_trj.xyz)');
    if (frames.some((f) => f.energy === null)) throw new Error('energies not found on the comment line of the frames (expected "... E <Hartree>")');
    const s = arcLength(frames, opts), E0 = frames[0].energy;
    return { s, V: frames.map((f) => (f.energy - E0) * HARTREE_KCAL), n: frames.length, source: 'ORCA', note, atoms: frames[0].sym.length };
  }

  /** Gaussian IRC output */
  function gaussianPath(text) {
    const lines = text.split(/\r?\n/);
    // (a) summary table(s)
    const rows = [];
    for (let i = 0; i < lines.length; i++) {
      if (/Summary of reaction path following/i.test(lines[i])) {
        let seen = 0;
        for (let j = i + 1; j < Math.min(lines.length, i + 4000); j++) {
          const mm = /^\s*(\d+)\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)\s*$/.exec(lines[j]);
          if (mm) { rows.push({ E: parseFloat(mm[2]), rx: parseFloat(mm[3]) }); seen++; }
          else if (seen > 0 && lines[j].trim() === '') break;
          else if (seen > 0 && !/^\s*\d/.test(lines[j])) break;
        }
      }
    }
    if (rows.length >= 5) {
      rows.sort((a, b) => a.rx - b.rx);
      const uniq = []; for (const r of rows) { if (uniq.length && Math.abs(r.rx - uniq[uniq.length - 1].rx) < 1e-6) continue; uniq.push(r); }
      const E0 = uniq[0].E;
      return { s: uniq.map((r) => r.rx * BOHR), V: uniq.map((r) => (r.E - E0) * HARTREE_KCAL), n: uniq.length, source: 'Gaussian', note: 'summary of reaction path following (RxCoord in bohr amu^1/2)' };
    }
    // (b) fallback: Point Number / Path Number / NET REACTION COORDINATE with the last SCF energy
    let lastE = null, pt = null, path = 1; const pts = [];
    for (const ln of lines) {
      let m;
      if ((m = /SCF Done:\s+E\([^)]*\)\s*=\s*(-?\d+\.\d+)/.exec(ln))) lastE = parseFloat(m[1]);
      else if ((m = /Point Number:\s*(\d+)\s+Path Number:\s*(\d+)/i.exec(ln))) { pt = +m[1]; path = +m[2]; }
      else if ((m = /NET REACTION COORDINATE UP TO THIS POINT\s*=\s*(-?\d+\.\d+)/i.exec(ln)) && lastE !== null) pts.push({ rx: (path === 2 ? -1 : 1) * parseFloat(m[1]), E: lastE });
    }
    if (pts.length >= 5) {
      pts.sort((a, b) => a.rx - b.rx);
      const E0 = pts[0].E;
      return { s: pts.map((r) => r.rx * BOHR), V: pts.map((r) => (r.E - E0) * HARTREE_KCAL), n: pts.length, source: 'Gaussian', note: 'NET REACTION COORDINATE + SCF energies (path 2 taken as the negative direction)' };
    }
    throw new Error('no IRC data recognised in the Gaussian output');
  }

  /** two-column numeric table: s, V.  opts.sUnit: 'A' | 'bohr'; opts.eUnit: 'kcal' | 'kJ' | 'eV' | 'Eh' */
  function tablePath(text, opts = {}) {
    const sUnit = opts.sUnit || 'A', eUnit = opts.eUnit || 'kcal';
    const rows = [];
    for (const ln of text.split(/\r?\n/)) {
      const t = ln.trim(); if (!t || /^[#%!]/.test(t)) continue;
      const parts = t.split(/[\s,;]+/).filter(Boolean).map(Number);
      if (parts.length >= 2 && parts.slice(0, 2).every(Number.isFinite)) rows.push(parts);
    }
    if (rows.length < 5) throw new Error('need at least 5 numeric rows with two columns (s, V)');
    const sf = sUnit === 'bohr' ? BOHR : 1, ef = { kcal: 1, kJ: KJ_KCAL, eV: EV_KCAL, Eh: HARTREE_KCAL }[eUnit];
    rows.sort((a, b) => a[0] - b[0]);
    return { s: rows.map((r) => r[0] * sf), V: rows.map((r) => r[1] * ef), n: rows.length, source: 'table', note: 'two-column table' };
  }

  /** imaginary frequency (cm^-1, returned positive) from Gaussian/ORCA output or an ORCA .hess file; null if none */
  function imaginaryFrequency(text) {
    let m;
    const g = /Frequencies --\s+(-\d+\.\d+)/.exec(text); if (g) return Math.abs(parseFloat(g[1]));
    const o = /\n\s*\d+:\s+(-\d+\.\d+)\s+cm\*\*-1\s+\*\*\*imaginary mode\*\*\*/.exec(text); if (o) return Math.abs(parseFloat(o[1]));
    const hi = text.indexOf('$vibrational_frequencies');
    if (hi >= 0) { const rest = text.slice(hi).split(/\r?\n/).slice(2, 400); for (const ln of rest) { if (ln.startsWith('$')) break; if ((m = /^\s*\d+\s+(-\d+\.\d+)/.exec(ln))) return Math.abs(parseFloat(m[1])); } }
    return null;
  }

  function detectAndParse(files, opts = {}) {
    const f0 = files[0];
    if (files.every((f) => /\.xyz$/i.test(f.name) || /^\s*\d+\s*\n[^\n]*\n\s*[A-Z][a-z]?\s+-?\d/.test(f.text))) return orcaPath(files, opts);
    if (/Summary of reaction path following|NET REACTION COORDINATE|Gaussian, Inc\.|Entering Gaussian System/i.test(f0.text)) return gaussianPath(f0.text);
    return tablePath(f0.text, opts);
  }

  return { MASS, parseXYZ, arcLength, orcaPath, gaussianPath, tablePath, imaginaryFrequency, detectAndParse, HARTREE_KCAL, BOHR };
});
