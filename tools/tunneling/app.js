/* UI of the tunneling correction calculator. Depends on core.js, irc.js, plots.js, tasks.js (and worker.js). MIT licence. */
(function () {
  'use strict';
  const C = TunnelingCore, Tk = TunnelingTasks, I = TunnelingIRC, P = TunnelingPlots;
  const CFG = Object.assign({ paperCitation: '', paperUrl: '', repoUrl: '', homeUrl: '../../' }, window.TNL_CONFIG || {});
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const R_KCAL = C.CONST.R_KCAL;

  // ------------------------------------------------------------------ helpers
  const SUPD = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const sup = (n) => String(n).split('').map((c) => (c === '-' ? '⁻' : SUPD[+c])).join('');
  function fmtK(x) {
    if (x === undefined || x === null || !Number.isFinite(x)) return '—';
    const a = Math.abs(x);
    if (a >= 1e5) { const e = Math.floor(Math.log10(a)), m = x / Math.pow(10, e); return `${m.toFixed(2)}×10${sup(e)}`; }
    if (a >= 1000) return x.toFixed(0);
    if (a >= 100) return x.toFixed(1);
    if (a >= 10) return x.toFixed(2);
    return x.toFixed(3);
  }
  const f2 = (x, d = 2) => (Number.isFinite(x) ? x.toFixed(d) : '—');
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const num = (id) => parseFloat($(id).value);
  function download(name, text, type = 'text/plain') {
    const url = URL.createObjectURL(new Blob([text], { type })), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function svgToPng(svg, name) {
    const img = new Image(), url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    img.onload = () => { const c = document.createElement('canvas'); c.width = img.width * 2.5; c.height = img.height * 2.5; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => { const u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 1000); }); URL.revokeObjectURL(url); };
    img.src = url;
  }
  const safeLS = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } } };

  // ------------------------------------------------------------------ theme
  // own choice first; otherwise follow the main site's day/night setting (key 'sp_theme'), else the system
  const siteTheme = safeLS.get('sp_theme');
  let themePref = safeLS.get('tnl-theme') || (siteTheme === 'night' ? 'dark' : siteTheme === 'day' ? 'light' : 'auto');
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  const theme = () => (themePref === 'auto' ? (mq && mq.matches ? 'dark' : 'light') : themePref);
  function applyTheme() {
    if (themePref === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', themePref);
    $('#themeBtn').textContent = 'theme: ' + themePref; redrawAll();
  }
  $('#themeBtn').addEventListener('click', () => { themePref = themePref === 'auto' ? 'light' : themePref === 'light' ? 'dark' : 'auto'; safeLS.set('tnl-theme', themePref); applyTheme(); });
  if (mq && mq.addEventListener) mq.addEventListener('change', () => { if (themePref === 'auto') redrawAll(); });

  // ------------------------------------------------------------------ plots registry
  const MODEL = {
    wigner: { name: 'Wigner', color: ['#6b6f7d', '#a3a8b8'], dash: '1.5 3', width: 2.2 },
    parabola: { name: 'truncated parabola', color: ['#7c3aed', '#b197fc'], dash: '7 4', width: 1.9 },
    eckart: { name: 'Eckart', color: ['#e8590c', '#ff922b'], dash: null, width: 2 },
    eckartSym: { name: 'Eckart (symmetric)', color: ['#c2a000', '#ffd43b'], dash: '8 3 2 3', width: 1.5 },
    exact: { name: 'exact 1D', color: ['#111111', '#f4f4f8'], dash: null, width: 2.6 },
    zct: { name: 'ZCT-MEP', color: ['#2f9e44', '#69db7c'], dash: null, width: 1.8 },
    zctWKB: { name: 'ZCT-MEP (WKB)', color: ['#74b816', '#c0eb75'], dash: '6 3', width: 1.5 },
    zctEC: { name: 'ZCT-EC', color: ['#d6336c', '#f783ac'], dash: null, width: 2 },
    eq: { name: 'EQ-FREQ', color: ['#0b7285', '#3bc9db'], dash: '5 2', width: 2 }
  };
  // semiclassical theories from the literature (semiclassical.js)
  const SCM = [
    { k: 'inst', name: 'standard instanton', col: ['#868e96', '#adb5bd'], dash: '2 3', note: 'Miller/Affleck; undefined above its crossover temperature' },
    { k: 'usit', name: 'USIT (steepest descent)', col: ['#1864ab', '#74c0fc'], dash: null, note: 'uniform instanton, eq 9' },
    { k: 'usit1', name: 'USIT + high-energy correction', col: ['#0c8599', '#66d9e8'], dash: null, note: 'eq 23' },
    { k: 'usitNum', name: 'Kemble integral, same action', col: ['#5f3dc4', '#b197fc'], dash: '6 3', note: 'numerically integrated uniform-semiclassical κ: the ceiling of any steepest-descent USIT' },
    { k: 'svpt2', name: 'SVPT2', col: ['#e67700', '#ffc078'], dash: '5 3', note: 'second-order vibrational perturbation theory (with zero-point shift)' },
    { k: 'svpt4', name: 'SVPT4', col: ['#c92a2a', '#ff8787'], dash: null, note: 'fourth order; exact to ħ⁴' },
    { k: 'mvpt2', name: 'mVPT2', col: ['#2b8a3e', '#8ce99a'], dash: '5 3', note: 'modified VPT2 (Euclidean action shifted by E₀)' },
    { k: 'myf', name: 'mYF', col: ['#087f5b', '#63e6be'], dash: null, note: 'modified Yasumori–Fueki' },
    { k: 'msvpt4', name: 'mSVPT4', col: ['#a61e4d', '#faa2c1'], dash: '8 3 2 3', note: 'modified SVPT4 (action on a modified potential)' },
    { k: 'law2', name: 'Lawrence ħ² (exact WKB)', col: ['#364fc7', '#91a7ff'], dash: null, note: 'P = 1/(1+exp(W/ħ)), W = W₀ + ħ²W₂ (Lawrence 2025, eqs 4.1, 4.9); loop integrals in the complex plane' },
    { k: 'law4', name: 'Lawrence ħ⁴ (exact WKB)', col: ['#862e9c', '#e599f7'], dash: '4 2', note: 'W = W₀ + ħ²W₂ + ħ⁴W₄ (eq B1); asymptotic series, unreliable when ħω/V₁ ≳ 0.5' }
  ];
  const FAMCOL = { gauss: '#1f77b4', lorentz: '#ff7f0e', sech2: '#2ca02c', sech4: '#d62728', lorentz2: '#9467bd', shoulder: '#8c564b', double: '#e377c2', path: '#1f77b4' };
  const famCol = (k, th) => { const c = FAMCOL[k] || '#1f77b4'; return th === 'dark' ? lighten(c) : c; };
  function lighten(hex) { const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255, f = (v) => Math.round(v + (255 - v) * 0.35); return '#' + ((1 << 24) | (f(r) << 16) | (f(g) << 8) | f(b)).toString(16).slice(1); }
  const mc = (key, th) => MODEL[key].color[th === 'dark' ? 1 : 0];
  function mser(key, x, y, label, th, extra) { const m = MODEL[key]; return Object.assign({ x, y, label: label === undefined ? m.name : label, color: mc(key, th), dash: m.dash, width: m.width }, extra || {}); }

  const registry = { params: [], path: [], about: [] };
  let plotSeq = 0;
  function addPlot(group, container, title, caption, build) {
    const el = document.createElement('div'); el.className = 'tnl-card tnl-plot';
    const id = 'pl' + (++plotSeq);
    el.innerHTML = `<div class="bar"><span class="cap">${caption || ''}</span><span class="btns"><button class="mini" data-a="svg" type="button">SVG</button><button class="mini" data-a="png" type="button">PNG</button></span></div><div class="host"></div>`;
    container.appendChild(el);
    const rec = { el, build, id, title };
    const draw = () => { const ch = build(theme()); ch.id = id; el.querySelector('.host').innerHTML = ch.render(theme()); };
    rec.draw = draw; draw();
    el.addEventListener('click', (ev) => {
      const a = ev.target.getAttribute && ev.target.getAttribute('data-a'); if (!a) return;
      const ch = build('light'); ch.id = id; const svg = ch.render('light'), base = 'tunneling_' + title.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40);
      if (a === 'svg') download(base + '.svg', svg, 'image/svg+xml'); else svgToPng(svg, base + '.png');
    });
    registry[group].push(rec); return rec;
  }
  function redrawAll() { for (const g of Object.keys(registry)) for (const r of registry[g]) r.draw(); }

  // ------------------------------------------------------------------ worker
  let worker = null, workerBroken = false, jobId = 0; const pending = new Map();
  function runTask(task, args, onProgress) {
    return new Promise((resolve, reject) => {
      const sync = () => setTimeout(() => { try { resolve(task === 'profiles' ? Tk.runProfiles(args, onProgress) : Tk.runPath(args, onProgress)); } catch (e) { reject(e); } }, 30);
      if (workerBroken || typeof Worker === 'undefined') return sync();
      const id = ++jobId;
      try {
        if (!worker) {
          worker = new Worker('worker.js');
          worker.onmessage = (ev) => { const d = ev.data, p = pending.get(d.id); if (!p) return; if (d.progress !== undefined) { p.onProgress && p.onProgress(d.progress, d.msg); return; } pending.delete(d.id); d.error ? p.reject(new Error(d.error)) : p.resolve(d.result); };
          worker.onerror = () => { workerBroken = true; worker = null; const jobs = Array.from(pending.values()); pending.clear(); jobs.forEach((j) => j.fallback()); };
        }
        pending.set(id, { resolve, reject, onProgress, fallback: sync });
        worker.postMessage({ id, task, args });
      } catch (e) { workerBroken = true; sync(); }
    });
  }
  function progressUI(prefix) {
    const bar = $(`#${prefix}-prog`), fill = bar.firstElementChild, st = $(`#${prefix}-status`);
    return { start(msg) { bar.style.display = 'block'; fill.style.width = '2%'; st.textContent = msg || 'computing…'; }, set(f, msg) { fill.style.width = Math.max(2, 100 * f).toFixed(0) + '%'; if (msg) st.textContent = msg; }, done(msg) { bar.style.display = 'none'; st.textContent = msg || ''; } };
  }

  // ------------------------------------------------------------------ tabs
  function showTab(name) {
    for (const t of ['params', 'path', 'about']) { const on = t === name; $('#tab-' + t).hidden = !on; $('#tab-b-' + t).setAttribute('aria-selected', on ? 'true' : 'false'); }
    safeLS.set('tnl-tab', name);
  }
  ['params', 'path', 'about'].forEach((t) => $('#tab-b-' + t).addEventListener('click', () => showTab(t)));
  const tabs = $$('.tnl-tabs button');
  $('.tnl-tabs').addEventListener('keydown', (ev) => { const i = tabs.indexOf(document.activeElement); if (i < 0) return; if (ev.key === 'ArrowRight') { tabs[(i + 1) % 3].focus(); tabs[(i + 1) % 3].click(); } if (ev.key === 'ArrowLeft') { tabs[(i + 2) % 3].focus(); tabs[(i + 2) % 3].click(); } });

  // ------------------------------------------------------------------ shared rendering
  const Tgrid = (T0, T1, n, Tstar) => { let T = C.linspace(T0, T1, n); T.push(Tstar); T = Array.from(new Set(T.map((x) => +x.toFixed(6)))).sort((a, b) => a - b); return T; };
  function analytic(V1, dE, nu, Ts) {
    const V2 = V1 - dE;
    return { wig: Ts.map((T) => C.kappaWigner(nu, T)), par: Ts.map((T) => C.kappaParabola(V1, V2, nu, T)), eck: Ts.map((T) => C.kappaEckart(V1, V2, nu, T)), eckSym: Ts.map((T) => C.kappaEckartSym(V1, nu, T)) };
  }
  const idxOf = (Ts, T) => Ts.findIndex((t) => Math.abs(t - T) < 1e-6);
  const chip = (txt, cls) => `<span class="tnl-chip ${cls || ''}">${txt}</span>`;
  const dgOf = (a, b, T) => (Number.isFinite(a) && Number.isFinite(b) && a > 0 && b > 0 ? C.dG(a, b, T) : NaN);

  function summaryChips(b) {
    const T = b.Tstar, u = C.uStar(b.nu, T), Tc = C.Tcross(b.nu);
    const sens = (C.kappaEckart(b.V1, b.V2, b.nu * 1.01, T) / C.kappaEckart(b.V1, b.V2, b.nu * 0.99, T));
    const dlog = Math.log(sens) / Math.log(1.01 / 0.99);
    let h = chip(`V₂ = <b>${f2(b.V2)}</b> kcal/mol`) + chip(`u‡ = <b>${f2(u)}</b>`, u <= 2 ? 'ok' : 'warn') + chip(`T<sub>c</sub> = <b>${f2(Tc, 0)}</b> K`) + chip(`T/T<sub>c</sub> = <b>${f2(T / Tc)}</b>`, T / Tc < 1 ? 'warn' : '') + chip(`∂lnκ<sub>Eckart</sub>/∂ln|ν‡| = <b>${f2(dlog, 1)}</b>`);
    return `<div class="tnl-chips">${h}</div>` + (u > 2 ? `<p class="hint">u‡ = ${f2(u)} &gt; 2: outside the conventional range of the Wigner expansion; ${T < Tc ? 'T is below T<sub>c</sub> (deep-tunneling regime of the parabolic model).' : ''}</p>` : '');
  }

  function tableThree(b, refEntry) {
    const k = idxOf(b.Ts, b.Tstar), T = b.Tstar, hasEx = refEntries(b).length > 0;
    const rows = [['Wigner', b.an.wig[k]], ['Truncated parabola', b.an.par[k]], ['Eckart', b.an.eck[k]]]; if (!b.simple) rows.push(['Eckart (symmetric, V₂ := V₁)', b.an.eckSym[k]]);
    const exs = refEntries(b);
    if (b.simple) {
      let t = '<div class="tnl-scroll"><table class="tnl-table"><caption class="sr">Tunneling correction</caption><thead><tr><th>model</th><th>κ(' + f2(T, 2) + ' K)</th></tr></thead><tbody>';
      for (const [name, v] of rows) t += `<tr><td>${name}</td><td>${fmtK(v)}</td></tr>`;
      return t + '</tbody></table></div>';
    }
    let h = `<div class="tnl-scroll"><table class="tnl-table"><caption class="sr">Three-number models</caption><thead><tr><th>model (V₁, ΔE, ν‡ only)</th><th>κ(${f2(T, 2)} K)</th><th>|ΔΔG‡| vs Eckart (kcal/mol)</th>${hasEx ? '<th>κ/κ<sub>exact</sub> over profiles</th><th>|ΔΔG‡| vs exact (max)</th>' : ''}</tr></thead><tbody>`;
    for (const [name, v] of rows) {
      let extra = '';
      if (hasEx) { const rs = exs.map((e) => v / e.exact[k]); const dg = Math.max(...exs.map((e) => dgOf(v, e.exact[k], T))); extra = `<td>${rs.length > 1 ? `${fmtK(Math.min(...rs))} – ${fmtK(Math.max(...rs))}` : fmtK(rs[0])}</td><td>${f2(dg, 2)}</td>`; }
      h += `<tr><td>${name}</td><td>${fmtK(v)}</td><td>${name === 'Eckart' ? '—' : f2(dgOf(v, b.an.eck[k], T), 2)}</td>${extra}</tr>`;
    }
    return h + '</tbody></table></div>';
  }
  const refEntries = (b) => b.entries.filter((e) => e.exact);
  function tableShape(b) {
    if (!b.entries.length) return '';
    const k = idxOf(b.Ts, b.Tstar), T = b.Tstar, ents = b.entries, hasEx = ents.some((e) => e.exact);
    const den = (e) => (e.exact ? e.exact[k] : b.an.eck[k]);
    const cell = (v, e) => (Number.isFinite(v) ? `${fmtK(v)} <span class="hint">(${(v / den(e)).toFixed(2)})</span>` : '—');
    let h = `<div class="tnl-scroll"><table class="tnl-table"><caption class="sr">Shape-dependent models</caption><thead><tr><th>${hasEx ? 'κ at T = ' + f2(T) + ' K  (ratio to exact)' : 'κ at T = ' + f2(T) + ' K  (ratio to Eckart)'}</th>${ents.map((e) => `<th>${esc(e.label)}</th>`).join('')}</tr></thead><tbody>`;
    const row = (name, fn) => `<tr><td>${name}</td>${ents.map((e) => `<td>${fn(e)}</td>`).join('')}</tr>`;
    if (ents[0].V1seen !== undefined) h += row('V₁ / V₂ / |ν‡| seen by the solver', (e) => `${f2(e.V1seen, 3)} / ${f2(e.V2seen, 3)} / ${f2(e.nuSeen, 1)}`);
    if (hasEx) h += row('<b>exact 1D</b>', (e) => (e.exact ? fmtK(e.exact[k]) : '—'));
    h += row('Eckart', (e) => cell(e.eckartSeen ? e.eckartSeen[k] : b.an.eck[k], e));
    h += row('ZCT-MEP (Kemble)', (e) => cell(e.m.zct[k], e)) + row('ZCT-MEP (WKB)', (e) => cell(e.m.zctWKB[k], e)) + row('ZCT-EC', (e) => cell(e.m.zctEC[k], e)) + row('EQ-FREQ', (e) => cell(e.m.eq[k], e));
    h += row('ν<sub>eff</sub> of EQ-FREQ (cm⁻¹)', (e) => f2(e.m.nuEff[k], 0));
    if (hasEx) h += row('f<sub>sub</sub> (exact)', (e) => (e.fsub ? f2(e.fsub[k], 3) : '—'));
    return h + '</tbody></table></div>';
  }
  function tableIso(b) {
    if (!(b.rho > 1)) return '';
    const k = idxOf(b.Ts, b.Tstar), T = b.Tstar, nuH = b.nuH;
    const e0 = b.entries[b.ref || 0];
    const rows = [['Wigner', b.an.wig[k], b.isoAn.wig[k]], ['Truncated parabola', b.an.par[k], b.isoAn.par[k]], ['Eckart', b.an.eck[k], b.isoAn.eck[k]]];
    if (e0 && e0.iso) {
      if (e0.exact && e0.iso.exactH) rows.push([`exact 1D (${esc(e0.label)})`, e0.exact[k], e0.iso.exactH[k]]);
      rows.push(['ZCT-EC', e0.m.zctEC[k], e0.iso.models.zctEC[k]], ['EQ-FREQ', e0.m.eq[k], e0.iso.models.eq[k]]);
    }
    let h = `<h3>Isotope: tunneling-only Q = κ<sub>light</sub>/κ<sub>heavy</sub> at ${f2(T)} K (mass ratio ${f2(b.rho, 4)}, |ν‡|<sub>heavy</sub> = ${f2(nuH, 0)} cm⁻¹ for the three-number models)</h3><div class="tnl-scroll"><table class="tnl-table"><thead><tr><th>model</th><th>κ light</th><th>κ heavy</th><th>Q</th></tr></thead><tbody>`;
    for (const [n, a, c] of rows) h += `<tr><td>${n}</td><td>${fmtK(a)}</td><td>${fmtK(c)}</td><td>${f2(a / c, 2)}</td></tr>`;
    return h + '</tbody></table></div><p class="hint">Mass scaling of a one-dimensional profile (the substituted atom carries the whole mass-weighted coordinate); not a calculated kinetic isotope effect.</p>';
  }

  // ---- charts ------------------------------------------------------

  function tableSC(b) {
    const ents = b.entries.filter((e) => e.sc); if (!ents.length) return '';
    const k = idxOf(b.Ts, b.Tstar), T = b.Tstar, hasEx = ents.some((e) => e.exact);
    const cell = (v, e) => (Number.isFinite(v) ? `${fmtK(v)} <span class="hint">(${(v / e.exact[k]).toFixed(2)})</span>` : '—');
    let h = `<h3>Semiclassical theories from the literature (same profiles)</h3><p class="hint">κ at T = ${f2(T)} K (ratio to exact). One-dimensional theories of the same kind as the benchmark: they need the action S(E) (instanton family) or the derivatives V₂…V₈ of the potential at the barrier top (VPT family), so they are available for the model profiles, not for a tabulated IRC. “—”: the theory is undefined at this temperature (standard instanton above its crossover; divergent SVPT4 series).</p>`;
    h += `<div class="tnl-scroll"><table class="tnl-table"><caption class="sr">Semiclassical theories</caption><thead><tr><th>theory</th>${ents.map((e) => `<th>${esc(e.label)}</th>`).join('')}</tr></thead><tbody>`;
    if (hasEx) h += `<tr><td><b>exact 1D</b></td>${ents.map((e) => `<td>${e.exact ? fmtK(e.exact[k]) : '—'}</td>`).join('')}</tr>`;
    for (const m of SCM) h += `<tr><td title="${esc(m.note)}">${m.name}</td>${ents.map((e) => `<td>${cell(e.sc[m.k][k], e)}${m.k === 'msvpt4' && e.sc.msvpt4mod[k] > 0.5 && Number.isFinite(e.sc.msvpt4[k]) ? ' <span class="bad-t" title="the ħ²-modification of the potential is large (see the last row): result not reliable">⚠</span>' : ''}</td>`).join('')}</tr>`;
    h += `<tr><td>mSVPT4: max. relative change of V used</td>${ents.map((e) => `<td>${f2(e.sc.msvpt4mod[k], 2)}</td>`).join('')}</tr>`;
    h += '</tbody></table></div>';
    h += `<p class="hint">The VPT-type theories are asymptotic in ħ: they are accurate when the derivatives V₃…V₈ describe the barrier over the whole tunnelling region. For the held-out and asymmetric profiles this fails at low T (see the ratio plot). mSVPT4 acts on a potential modified by ħ²-terms; a “max. relative change” well above ~0.3 means that the modification is not small and the result should not be trusted.</p>`;
    return h;
  }
  function chartSC(b, refIdx, group) {
    return (th) => {
      const e = b.entries[refIdx()]; const ch = new P.Chart({ xlabel: 'T (K)', ylabel: 'log₁₀(κ_theory / κ_exact)', legend: 'br' });
      if (!e || !e.sc || !e.exact) return ch;
      ch.band(Math.log10(0.75), Math.log10(1.25), th === 'dark' ? '#6d7bff26' : '#5c6bc022');
      for (const m of SCM) {
        if (m.k === 'inst' || m.k === 'svpt2') continue;
        const x = [], y = []; b.Ts.forEach((T, i) => { const v = e.sc[m.k][i]; if (Number.isFinite(v) && v > 0 && !(m.k === 'msvpt4' && e.sc.msvpt4mod[i] > 0.5)) { x.push(T); y.push(Math.log10(v / e.exact[i])); } });
        if (x.length) ch.add({ x, y, label: m.name, color: th === 'dark' ? m.col[1] : m.col[0], dash: m.dash, width: 1.9 });
      }
      { const x = [], y = []; b.Ts.forEach((T, i) => { const v = e.sc.inst[i]; if (Number.isFinite(v) && v > 0) { x.push(T); y.push(Math.log10(v / e.exact[i])); } });
        if (x.length) ch.add({ x, y, label: 'standard instanton', color: th === 'dark' ? '#adb5bd' : '#868e96', dash: '2 3', width: 1.8 }); }
      ch.add(mser('zctEC', b.Ts, e.m.zctEC.map((v, i) => Math.log10(v / e.exact[i])), undefined, th)).add(mser('eq', b.Ts, e.m.eq.map((v, i) => Math.log10(v / e.exact[i])), undefined, th));
      ch.hline(0, { color: th === 'dark' ? '#777' : '#999', range: false });
      ch.o.ylim = [-1.6, 1.2];
      return ch;
    };
  }
  function chartKappa(b, refIdx) {
    return (th) => {
      const ch = new P.Chart({ xlabel: 'T (K)', ylabel: 'κ(T)', ylog: true, legend: 'tr' });
      ch.add(mser('wigner', b.Ts, b.an.wig, undefined, th)).add(mser('parabola', b.Ts, b.an.par, undefined, th)).add(mser('eckart', b.Ts, b.an.eck, undefined, th));
      const e = b.entries[refIdx()];
      if (e) {
        if (e.exact) ch.add(mser('exact', b.Ts, e.exact, 'exact 1D (' + shortLabel(e) + ')', th));
        ch.add(mser('zct', b.Ts, e.m.zct, undefined, th)).add(mser('zctEC', b.Ts, e.m.zctEC, undefined, th)).add(mser('eq', b.Ts, e.m.eq, undefined, th));
      }
      ch.vline(b.Tstar, { color: th === 'dark' ? '#6a6b78' : '#b9b9c4', dash: '2 3', range: false });
      const Tc = C.Tcross(b.nu); if (Tc > b.Ts[0] && Tc < b.Ts[b.Ts.length - 1]) { ch.vline(Tc, { color: th === 'dark' ? '#7c8dff' : '#5c6bc0', dash: '5 4', range: false }); ch.text(Tc, 0, 'T_c', { ypx: 44, color: th === 'dark' ? '#9aa8ff' : '#3f51b5', size: 10 }); }
      return ch;
    };
  }
  const shortLabel = (e) => e.label.replace(/ \(.*\)/, '');
  function chartProfiles(b) {
    return (th) => {
      const ch = new P.Chart({ xlabel: 'x (Å, m = 1 amu)', ylabel: 'V (kcal mol⁻¹)', legend: 'tr' });
      b.entries.forEach((e) => ch.add({ x: e.profile.xs, y: e.profile.Vs, label: e.label, color: famCol(e.key, th), width: 2, dash: e.dev ? null : '6 3' }));
      ch.hline(0, { color: th === 'dark' ? '#555' : '#aaa', range: false });
      return ch;
    };
  }
  function chartBars(b, which) {
    return (th) => {
      const k = which === 'low' ? 0 : idxOf(b.Ts, b.Tstar), T = b.Ts[k];
      const ents = b.entries, cats = ents.map((e) => shortLabel(e).replace('(held out)', '*'));
      const xs = ents.map((_, i) => i + 1);
      const ch = new P.Chart({ xlabel: '', ylabel: `κ at ${f2(T)} K`, ylog: true, xcats: cats, xrot: 30, legend: 'tr', margin: { l: 66, r: 16, t: 30, b: 78 } });
      ch.add({ x: xs, y: ents.map((e) => e.exact && e.exact[k]), label: 'exact', color: mc('exact', th), marker: 'o', width: 0, ms: 5 });
      ch.add({ x: xs.map((x) => x), y: ents.map((e) => (e.eckartSeen ? e.eckartSeen[k] : b.an.eck[k])), label: 'Eckart', color: mc('eckart', th), marker: 's', hollow: true, width: 0, ms: 6 });
      ch.add({ x: xs, y: ents.map((e) => e.m.zct[k]), label: 'ZCT-MEP', color: mc('zct', th), marker: '^', hollow: true, width: 0, ms: 5 });
      ch.add({ x: xs, y: ents.map((e) => e.m.zctEC[k]), label: 'ZCT-EC', color: mc('zctEC', th), marker: 'x', width: 0, ms: 5 });
      ch.add({ x: xs, y: ents.map((e) => e.m.eq[k]), label: 'EQ-FREQ', color: mc('eq', th), marker: '+', width: 0, ms: 5 });
      return ch;
    };
  }
  function refKappa(b, e) { return e.exact || null; }
  function chartRatio(b, refIdx) {
    return (th) => {
      const e = b.entries[refIdx()] || null, hasEx = !!(e && e.exact);
      const den = hasEx ? e.exact : b.an.eck;
      const lg = (arr) => arr.map((v, i) => Math.log10(v / den[i]));
      const ch = new P.Chart({ xlabel: 'T (K)', ylabel: hasEx ? 'log₁₀(κ_model / κ_exact)' : 'log₁₀(κ_model / κ_Eckart)', legend: 'br' });
      ch.band(Math.log10(0.75), Math.log10(1.25), th === 'dark' ? '#6d7bff26' : '#5c6bc022');
      ch.add(mser('wigner', b.Ts, lg(b.an.wig), undefined, th)).add(mser('parabola', b.Ts, lg(b.an.par), undefined, th));
      if (hasEx) ch.add(mser('eckart', b.Ts, lg(b.an.eck), undefined, th));
      if (e) ch.add(mser('zct', b.Ts, lg(e.m.zct), undefined, th)).add(mser('zctEC', b.Ts, lg(e.m.zctEC), undefined, th)).add(mser('eq', b.Ts, lg(e.m.eq), undefined, th));
      ch.hline(0, { color: th === 'dark' ? '#777' : '#999', range: false });
      ch.o.ylim = [-2.5, 2.5];
      return ch;
    };
  }
  function chartErrTc(b, which) {
    return (th) => {
      const ents = b.entries.filter((e) => e.exact);
      const Tc = C.Tcross(b.nu), x = b.Ts.map((T) => T / Tc);
      const ch = new P.Chart({ xlabel: 'T / T_c', ylabel: 'RT ln(κ/κ_exact) (kcal/mol)', xlog: true, legend: ents.length > 1 || which === 'ec' ? 'tr' : null });
      const rt = (i) => R_KCAL * b.Ts[i];
      for (const e of ents) {
        const col = famCol(e.key, th);
        if (which === 'eck') ch.add({ x, y: b.Ts.map((T, i) => rt(i) * Math.log((e.eckartSeen ? e.eckartSeen[i] : b.an.eck[i]) / e.exact[i])), label: shortLabel(e), color: col, width: 1.8, marker: 'o', ms: 2.5 });
        else { ch.add({ x, y: b.Ts.map((T, i) => rt(i) * Math.log(e.m.zctEC[i] / e.exact[i])), label: shortLabel(e) + ' ZCT-EC', color: col, width: 1.8 });
          ch.add({ x, y: b.Ts.map((T, i) => rt(i) * Math.log(e.m.eq[i] / e.exact[i])), label: ents.length > 1 ? null : 'EQ-FREQ', color: col, width: 1.5, dash: '5 3' }); }
      }
      ch.hline(0, { color: th === 'dark' ? '#777' : '#999', range: false }); ch.vline(1, { color: th === 'dark' ? '#7c8dff' : '#5c6bc0', dash: '5 4', range: false });
      return ch;
    };
  }
  function chartFsub(b) {
    return (th) => {
      const ents = b.entries.filter((e) => e.fsub), Tc = C.Tcross(b.nu), x = b.Ts.map((T) => T / Tc);
      const ch = new P.Chart({ xlabel: 'T / T_c', ylabel: 'f_sub (exact)', xlog: true, legend: ents.length > 1 ? 'bl' : null, ylim: [0, 1.02] });
      for (const e of ents) ch.add({ x, y: e.fsub, label: shortLabel(e), color: famCol(e.key, th), width: 2 });
      ch.vline(1, { color: th === 'dark' ? '#7c8dff' : '#5c6bc0', dash: '5 4', range: false });
      return ch;
    };
  }
  function chartNuEff(b) {
    return (th) => {
      const ch = new P.Chart({ xlabel: 'T (K)', ylabel: 'ν_eff(T) / |ν‡|', legend: b.entries.length > 1 ? 'tr' : null });
      b.entries.forEach((e) => ch.add({ x: b.Ts, y: e.m.nuEff.map((v) => v / b.nu), label: shortLabel(e), color: famCol(e.key, th), width: 2 }));
      ch.hline(1, { color: th === 'dark' ? '#777' : '#999', range: false });
      return ch;
    };
  }
  function chartPE(b, refIdx) {
    return (th) => {
      const e = b.entries[refIdx()], pe = e.PE, T = b.Tstar, beta = 1 / (R_KCAL * T);
      const ch = new P.Chart({ xlabel: 'E (kcal mol⁻¹, from the reactant asymptote)', ylabel: 'P(E)', ylog: true, legend: 'br', ylim: [1e-10, 2] });
      if (pe.exact) ch.add(mser('exact', pe.E, pe.exact, 'exact 1D', th));
      ch.add(mser('eckart', pe.E, pe.eckart, undefined, th)).add(mser('zct', pe.E, pe.zct, 'ZCT-MEP (Kemble)', th));
      // energy of the integrand maximum for the reference model
      const src = pe.exact || pe.eckart; let ib = 0, best = -Infinity;
      pe.E.forEach((E, i) => { const v = Math.log(src[i]) - beta * E; if (v > best) { best = v; ib = i; } });
      ch.vline(e.V1seen !== undefined ? e.V1seen : b.V1, { color: th === 'dark' ? '#8a8a96' : '#888', dash: '4 3', range: false });
      ch.vline(pe.E[ib], { color: th === 'dark' ? '#ffa94d' : '#d9480f', dash: '2 3', range: false });
      ch.text(pe.E[ib], 0, 'integrand max', { ypx: 44, color: th === 'dark' ? '#ffa94d' : '#d9480f', size: 10, anchor: pe.E[ib] > (pe.E[0] + pe.E[pe.E.length - 1]) / 2 ? 'end' : 'start' });
      return ch;
    };
  }
  function chartSensNu(b) {
    return (th) => {
      const T = b.Tstar, f = C.linspace(0.6, 1.4, 41), nus = f.map((x) => x * b.nu);
      const ch = new P.Chart({ xlabel: '|ν‡| (cm⁻¹)', ylabel: `κ_Eckart at ${f2(T)} K`, ylog: true, legend: null });
      ch.add({ x: nus, y: nus.map((n) => C.kappaEckart(b.V1, b.V2, n, T)), color: mc('eckart', th), width: 2 });
      const k0 = C.kappaEckart(b.V1, b.V2, b.nu, T);
      for (const s of [0.9, 1.1]) { const k = C.kappaEckart(b.V1, b.V2, b.nu * s, T); ch.add({ x: [b.nu * s], y: [k], color: mc('eckart', th), marker: 'o', width: 0, ms: 4.5 }); ch.text(b.nu * s, k, (k / k0 - 1 > 0 ? '+' : '−') + Math.abs((k / k0 - 1) * 100).toFixed(0) + '%', { size: 10, xpx: ch.o.margin.l + 10 + (s > 1 ? 150 : 40), ypx: s > 1 ? 70 : 90 }); }
      return ch;
    };
  }
  function chartSensV1(b) {
    return (th) => {
      const T = b.Tstar, lo = Math.max(0.3 * b.V1, Math.max(0, b.dE) + 0.3), v1s = C.linspace(lo, 1.7 * b.V1, 41);
      const ch = new P.Chart({ xlabel: 'V₁ (kcal mol⁻¹), ΔE fixed', ylabel: `κ at ${f2(T)} K`, ylog: true, legend: 'tr' });
      ch.add(mser('eckart', v1s, v1s.map((v) => C.kappaEckart(v, v - b.dE, b.nu, T)), undefined, th));
      ch.add(mser('parabola', v1s, v1s.map((v) => C.kappaParabola(v, v - b.dE, b.nu, T)), undefined, th));
      ch.vline(b.V1, { color: th === 'dark' ? '#8a8a96' : '#888', dash: '4 3', range: false });
      return ch;
    };
  }
  function chartIso(b, refIdx) {
    return (th) => {
      const ch = new P.Chart({ xlabel: 'T (K)', ylabel: 'Q = κ_light / κ_heavy', ylog: true, legend: 'tr' });
      const q = (a, c) => a.map((v, i) => v / c[i]);
      ch.add(mser('wigner', b.Ts, q(b.an.wig, b.isoAn.wig), undefined, th)).add(mser('parabola', b.Ts, q(b.an.par, b.isoAn.par), undefined, th)).add(mser('eckart', b.Ts, q(b.an.eck, b.isoAn.eck), undefined, th));
      const e = b.entries[refIdx()];
      if (e && e.iso) { if (e.exact && e.iso.exactH) ch.add(mser('exact', b.Ts, q(e.exact, e.iso.exactH), 'exact 1D (' + shortLabel(e) + ')', th)); ch.add(mser('zctEC', b.Ts, q(e.m.zctEC, e.iso.models.zctEC), undefined, th)).add(mser('eq', b.Ts, q(e.m.eq, e.iso.models.eq), undefined, th)); }
      return ch;
    };
  }

  // ---- results assembly -------------------------------------------
  function buildEntry(res, Ts) {
    const e = { key: res.key, label: res.label, dev: res.dev, exact: res.exact, fsub: res.fsub, m: res.models, PE: res.PE, profile: res.profile, iso: res.iso, sc: res.sc,
      V1seen: res.V1, V2seen: res.V2, nuSeen: res.nu, eckartSeen: res.models.eckart };
    return e;
  }
  function simpleNote(b) {
    const u = C.uStar(b.nu, b.Tstar);
    return `<p class="hint">Tunneling correction only, not a rate constant.${u > 2 ? ` Wigner is valid only for u‡ &lt; 2 (here u‡ = ${f2(u, 1)}).` : ''}</p>`;
  }
  function renderResults(group, container, b) {
    registry[group].length = 0; container.innerHTML = '';
    const wrap = document.createElement('div'); container.appendChild(wrap);
    const ents = b.entries; let refIdx = 0;
    const getRef = () => refIdx;
    let html = `<div class="tnl-card" style="margin-top:14px"><h2>${b.simple ? 'κ' : 'Results'} at T = ${f2(b.Tstar)} K</h2>${b.simple ? '' : summaryChips(b)}`;
    if (b.warnings && b.warnings.length) html += b.warnings.map((w) => `<div class="notice ${w.cls || ''}">${w.text}</div>`).join('');
    html += tableThree(b) + (b.simple ? simpleNote(b) : (ents.length ? '<h3>Shape-dependent models</h3>' : '') + tableShape(b) + tableSC(b) + tableIso(b));
    if (ents.length > 1) html += `<div class="row"><label class="f" style="min-width:220px;max-width:300px">Reference profile for the single-profile plots<select id="${group}-ref">${ents.map((e, i) => `<option value="${i}">${esc(e.label)}</option>`).join('')}</select></label></div>`;
    html += '</div><div class="tnl-plots" id="' + group + '-plots"></div>';
    wrap.innerHTML = html;
    const pl = $('#' + group + '-plots', wrap);
    addPlot(group, pl, 'kappa_T', (b.simple ? 'κ(T) from V₁, ΔE and |ν‡|' : 'κ(T): three-number models and path-based models' + (ents.length ? ` for the reference profile` : '')), chartKappa(b, getRef));
    if (b.simple) return wrap;
    if (b.mode === 'params' && ents.length) {
      addPlot(group, pl, 'profiles', '(a) matched profiles, same V₁, V₂, |ν‡| (dashed: held out / other)', chartProfiles(b));
      addPlot(group, pl, 'kappa_low', `(b) κ at ${f2(b.Ts[0])} K by profile`, chartBars(b, 'low'));
      addPlot(group, pl, 'kappa_star', `(c) κ at ${f2(b.Tstar)} K by profile`, chartBars(b, 'star'));
    }
    if (b.mode === 'path') addPlot(group, pl, 'path_V', 'V(s) from the file; the curve is the cubic spline used by the path models', chartPathV(b), true);
    addPlot(group, pl, 'ratio', ents.some((e) => e.exact) ? 'log₁₀(κ_model/κ_exact) for the reference profile; band: ±25 %' : 'log₁₀(κ_model/κ_Eckart); band ±25 %', chartRatio(b, getRef));
    if (b.mode === 'params' && ents.some((e) => e.sc && e.exact)) addPlot(group, pl, 'semiclassical', 'literature semiclassical theories (USIT, SVPT, mVPT2, mYF…) vs ZCT-EC and EQ-FREQ, reference profile, log₁₀(κ/κ_exact); band ±25 %', chartSC(b, getRef));
    if (ents.some((e) => e.exact)) {
      addPlot(group, pl, 'err_eckart', '(a) Eckart error in energy units vs T/T_c', chartErrTc(b, 'eck'));
      addPlot(group, pl, 'err_ec', '(b) ZCT-EC (solid) and EQ-FREQ (dashed) error vs T/T_c', chartErrTc(b, 'ec'));
      addPlot(group, pl, 'fsub', 'sub-barrier share of the thermal integral', chartFsub(b));
    }
    if (ents.length) {
      addPlot(group, pl, 'nu_eff', 'EQ-FREQ effective frequency (solved at each temperature)', chartNuEff(b));
      addPlot(group, pl, 'PE', 'transmission probability; dotted orange: maximum of the thermal integrand', chartPE(b, getRef));
    }
    addPlot(group, pl, 'sens_nu', 'sensitivity of the Eckart κ to |ν‡| (±10 % marked)', chartSensNu(b));
    addPlot(group, pl, 'sens_V1', 'sensitivity to the barrier height', chartSensV1(b));
    if (b.rho > 1) addPlot(group, pl, 'isotope_Q', 'tunneling-only isotope ratio Q (one-dimensional mass scaling)', chartIso(b, getRef));
    const sel = $('#' + group + '-ref', wrap);
    if (sel) sel.addEventListener('change', () => { refIdx = +sel.value; registry[group].forEach((r) => r.draw()); });
    return wrap;
  }
  function chartPathV(b) {
    return (th) => {
      const p = b.pathCurve, ch = new P.Chart({ xlabel: 's (Å amu^½), reactant → product', ylabel: 'V (kcal mol⁻¹)', legend: 'tr' });
      ch.add({ x: p.s, y: p.V, label: 'path (spline)', color: mc('eckart', th), width: 2 });
      if (p.sRaw) ch.add({ x: p.sRaw, y: p.VRaw, label: `${p.sRaw.length} points`, color: mc('eckart', th), marker: 'o', width: 0, ms: 2.2 });
      ch.vline(p.sTop, { color: th === 'dark' ? '#8a8a96' : '#888', dash: '4 3', range: false });
      ch.hline(b.V1, { color: th === 'dark' ? '#8a8a96' : '#888', dash: '2 3', range: false }); ch.hline(b.dE, { color: th === 'dark' ? '#8a8a96' : '#888', dash: '2 3', range: false });
      return ch;
    };
  }

  // ---- CSV ---------------------------------------------------------
  function toCSV(b) {
    const cols = [['T_K', b.Ts], ['u', b.Ts.map((T) => C.uStar(b.nu, T))], ['T_over_Tc', b.Ts.map((T) => T / C.Tcross(b.nu))], ['wigner', b.an.wig], ['parabola', b.an.par], ['eckart', b.an.eck], ['eckart_symmetric', b.an.eckSym]];
    for (const e of b.entries) { const n = e.key; if (e.exact) cols.push([`exact_${n}`, e.exact], [`fsub_${n}`, e.fsub]); cols.push([`zct_mep_${n}`, e.m.zct], [`zct_mep_wkb_${n}`, e.m.zctWKB], [`zct_ec_${n}`, e.m.zctEC], [`eq_freq_${n}`, e.m.eq], [`nu_eff_${n}`, e.m.nuEff]); if (e.sc) for (const m of SCM) cols.push([`sc_${m.k}_${n}`, e.sc[m.k]]); }
    let s = `# V1=${b.V1} kcal/mol, dE=${b.dE} kcal/mol, V2=${b.V2}, |nu|=${b.nu} cm-1; kappa = tunneling correction only; one-dimensional models\n`;
    s += cols.map((c) => c[0]).join(',') + '\n';
    for (let i = 0; i < b.Ts.length; i++) s += cols.map((c) => { const v = c[1][i]; return Number.isFinite(v) ? (+v).toPrecision(8) : ''; }).join(',') + '\n';
    return s;
  }

  // ------------------------------------------------------------------ PARAMS mode
  const PRESETS = {
    fig4a: { V1: 12, dE: -5, nu: 1800 }, fig4b: { V1: 15, dE: -10, nu: 1200 }, tab2: { V1: 12, dE: -8, nu: 1800 },
    ch4oh: { V1: 6.4, dE: -13.3, nu: 1616 }, sym: { V1: 8, dE: 0, nu: 1500 }
  };
  $('#p-preset').addEventListener('change', (ev) => { const p = PRESETS[ev.target.value]; if (!p) return; $('#p-V1').value = p.V1; $('#p-dE').value = p.dE; $('#p-nu').value = p.nu; symFromValue(); runParams(false); });
  $('#p-iso').addEventListener('change', () => { $('#p-isoCustomWrap').hidden = $('#p-iso').value !== 'custom'; });
  // ---- simple / advanced mode
  let mode = safeLS.get('tnl-mode') === 'adv' ? 'adv' : 'simple';
  function setMode(m, quiet) {
    mode = m === 'adv' ? 'adv' : 'simple'; safeLS.set('tnl-mode', mode);
    document.querySelector('.tnl-wrap').setAttribute('data-mode', mode);
    if (mode === 'simple') showTab('params');
    $('#mode-simple').setAttribute('aria-pressed', mode === 'simple' ? 'true' : 'false'); $('#mode-adv').setAttribute('aria-pressed', mode === 'adv' ? 'true' : 'false');
    $('#p-run').textContent = mode === 'simple' ? 'Calculate κ' : 'Calculate (with exact reference)';
    if (!quiet) runParams(false);
  }
  $('#mode-simple').addEventListener('click', () => setMode('simple'));
  $('#mode-adv').addEventListener('click', () => setMode('adv'));
  let dEmemo = '-5';
  function syncSym() {
    const sym = $('#p-sym'), dE = $('#p-dE');
    if (sym.checked) { if (dE.value !== '0') dEmemo = dE.value; dE.value = '0'; dE.disabled = true; } else { dE.disabled = false; if (dE.value === '0' && dEmemo !== '0') dE.value = dEmemo; }
  }
  $('#p-sym').addEventListener('change', () => { syncSym(); runParams(false); });
  function symFromValue() { const sym = $('#p-sym'); sym.checked = num('#p-dE') === 0; $('#p-dE').disabled = sym.checked; }
  // ---- helper: V1 and dE from absolute energies of reactants, TS, products
  const UNIT_TO_KCAL = { Eh: 627.5094740631, kcal: 1, kJ: 1 / 4.184, eV: 96.48533212 / 4.184 };
  function parseSum(str) {
    const parts = String(str || '').trim().split(/\s*;\s*|\s+\+\s+/).filter((x) => x.length);
    if (!parts.length) return NaN;
    let sum = 0; for (const p of parts) { const v = Number(p.replace(',', '.')); if (!Number.isFinite(v)) return NaN; sum += v; }
    return sum;
  }
  function energiesToBarrier() {
    const f = UNIT_TO_KCAL[$('#en-unit').value], opt = (id) => { const t = $(id).value.trim(); return t ? parseSum(t) : 0; };
    const R = parseSum($('#en-R').value), TS = parseSum($('#en-TS').value), P = parseSum($('#en-P').value), zR = opt('#en-zR'), zTS = opt('#en-zTS'), zP = opt('#en-zP');
    if (![R, TS, P, zR, zTS, zP].every(Number.isFinite)) return { err: 'Fill in E(reactants), E(TS) and E(products) with numbers (several species: “a + b”).' };
    const V1 = ((TS + zTS) - (R + zR)) * f, dE = ((P + zP) - (R + zR)) * f;
    return { V1, dE };
  }
  $('#en-use').addEventListener('click', () => {
    const st = $('#en-status'), r = energiesToBarrier();
    if (r.err) { st.textContent = r.err; st.className = 'tnl-status bad-t'; return; }
    const warn = [];
    if (r.V1 <= 0) warn.push('E(TS) is not above the reactants: V₁ ≤ 0. Use the pre-reactive complex as the reference for reactants and products (same reference for both), or the barrier is submerged and tunneling models do not apply.');
    else if (r.V1 - r.dE <= 0) warn.push('V₂ = V₁ − ΔE ≤ 0: the transition state is not above the products; check the product energy (or use the post-reactive complex).');
    if (r.V1 > 60) warn.push('V₁ > 60 kcal/mol: check the unit and that all energies are from the same level of theory.');
    $('#p-V1').value = (+r.V1.toFixed(4)); $('#p-dE').value = (+r.dE.toFixed(4)); $('#p-sym').checked = false; $('#p-dE').disabled = false; symFromValue();
    st.textContent = `V₁ = ${f2(r.V1, 2)} kcal/mol, ΔE = ${f2(r.dE, 2)} kcal/mol, V₂ = ${f2(r.V1 - r.dE, 2)} kcal/mol` + (warn.length ? ' — ' + warn.join(' ') : ''); st.className = 'tnl-status ' + (warn.length ? 'bad-t' : 'ok-t');
    runParams(false);
  });
  let lastParams = null;
  function readParams() {
    const V1 = num('#p-V1'), dE = num('#p-dE'), nu = Math.abs(num('#p-nu')), T = num('#p-T'), Tmin = num('#p-Tmin'), Tmax = num('#p-Tmax'), nT = Math.round(num('#p-nT'));
    const err = [];
    const needAll = mode === 'simple' ? [V1, dE, nu, T] : [V1, dE, nu, T, Tmin, Tmax, nT];
    if (!needAll.every(Number.isFinite)) err.push('Fill in all numeric fields.');
    if (V1 <= 0) err.push('V₁ must be positive.');
    if (V1 - dE <= 0) err.push('V₂ = V₁ − ΔE must be positive (ΔE &lt; V₁).');
    if (nu <= 0) err.push('|ν‡| must be positive.');
    if (T <= 0 || (mode === 'adv' && (Tmin <= 0 || Tmax <= Tmin))) err.push('Temperatures must be positive with T<sub>to</sub> &gt; T<sub>from</sub>.');
    let rho = $('#p-iso').value === 'custom' ? num('#p-isoRho') : parseFloat($('#p-iso').value);
    if (!(rho >= 1)) rho = 1;
    const nuHin = num('#p-nuH'), nuH = Number.isFinite(nuHin) && nuHin > 0 ? nuHin : nu / Math.sqrt(rho);
    let families = $$('#p-fams input:checked').map((x) => x.value);
    if (mode === 'simple') {       // four numbers only: fixed temperature range, closed-form models
      families = []; rho = 1;
      return { V1, dE, nu, T, Tmin: Math.min(200, T), Tmax: Math.max(600, T), nT: 21, rho: 1, nuH: nu, families, fine: false, err, simple: true };
    }
    return { V1, dE, nu, T, Tmin, Tmax, nT: Math.max(3, Math.min(80, nT || 21)), rho, nuH, families, fine: $('#p-fine').checked, err };
  }
  function hashFromParams(p) { return `#V1=${p.V1}&dE=${p.dE}&nu=${p.nu}&T=${p.T}&Tmin=${p.Tmin}&Tmax=${p.Tmax}&n=${p.nT}&iso=${p.rho}&fam=${p.families.join(',')}`; }
  function applyHash() {
    if (!location.hash || location.hash.length < 3) return false;
    const q = new URLSearchParams(location.hash.slice(1)); if (!q.has('V1')) return false;
    const set = (id, k) => { if (q.has(k)) $(id).value = q.get(k); };
    set('#p-V1', 'V1'); set('#p-dE', 'dE'); set('#p-nu', 'nu'); set('#p-T', 'T'); set('#p-Tmin', 'Tmin'); set('#p-Tmax', 'Tmax'); set('#p-nT', 'n');
    if (q.has('iso')) { const r = parseFloat(q.get('iso')), sel = $('#p-iso'); const opt = Array.from(sel.options).find((o) => Math.abs(parseFloat(o.value) - r) < 1e-4); if (opt) sel.value = opt.value; else { sel.value = 'custom'; $('#p-isoRho').value = r; $('#p-isoCustomWrap').hidden = false; } }
    if (q.has('fam')) setMode('adv', true);
    if (q.has('fam')) { const f = q.get('fam').split(','); $$('#p-fams input').forEach((c) => { c.checked = f.includes(c.value); }); }
    symFromValue(); return true;
  }
  let runningParams = false;
  async function runParams(withExact) {
    if (mode === 'simple') withExact = false;
    const p = readParams(), out = $('#p-out'), st = $('#p-status');
    if (p.err.length) { out.innerHTML = `<div class="notice bad" style="margin-top:14px">${p.err.join('<br>')}</div>`; return; }
    if (runningParams) return;
    lastParams = p;
    const Ts = Tgrid(p.Tmin, p.Tmax, p.nT, p.T), V2 = p.V1 - p.dE;
    const an = analytic(p.V1, p.dE, p.nu, Ts), isoAn = p.rho > 1 ? analytic(p.V1, p.dE, p.nuH, Ts) : null;
    const base = { mode: 'params', simple: !!p.simple, V1: p.V1, dE: p.dE, V2, nu: p.nu, Ts, Tstar: p.T, an, isoAn, rho: p.rho, nuH: p.nuH, entries: [], warnings: [] };
    if (!withExact || !p.families.length) {
      if (withExact && !p.families.length && !p.simple) base.warnings.push({ text: 'No model profile selected: only the three-number models are shown. Tick at least one profile for the exact 1D reference.' });
      renderResults('params', out, base); lastB = base; $('#p-csv').disabled = false; return;
    }
    runningParams = true; $('#p-run').disabled = true; const pr = progressUI('p'); pr.start('exact 1D reference…');
    try {
      const res = await runTask('profiles', { V1: p.V1, dE: p.dE, nu: p.nu, Ts, families: p.families, iso: p.rho > 1, rho: p.rho, fine: p.fine }, (f, m) => pr.set(f, m));
      base.entries = res.families.map((r) => buildEntry(r, Ts));
      if (res.errors.length) base.warnings.push({ cls: 'bad', text: res.errors.map((e) => `Profile “${esc(e.key)}” could not be constructed: ${esc(e.message)}`).join('<br>') });
      for (const r of res.families) {
        if (r.nProfMax > 1 && r.key !== 'double') base.warnings.push({ text: `${esc(r.label)}: the matched profile has ${r.nProfMax} maxima.` });
        if (r.key === 'double') base.warnings.push({ text: 'Double hump: V₁, V₂ and |ν‡| are read from the profile and differ from the typed values (V₁ = ' + f2(r.V1, 2) + ', |ν‡| = ' + f2(r.nu, 0) + '); the intermediate dip creates resonances; only the shallow 2d/w = 2.4 profile is converged in the manuscript.' });
        if (r.key === 'lorentz' || r.key === 'lorentz2') base.warnings.push({ cls: '', text: 'Lorentzian-type profiles have algebraic tails: the exact κ depends on the box size at the ~1 % level.' });
      }
      renderResults('params', out, base); lastB = base; $('#p-csv').disabled = false;
      pr.done('done');
      try { history.replaceState(null, '', hashFromParams(p)); } catch (e) { /* ignore */ }
    } catch (e) { pr.done(''); out.innerHTML = `<div class="notice bad" style="margin-top:14px">Calculation failed: ${esc(e.message)}</div>`; }
    runningParams = false; $('#p-run').disabled = false;
  }
  let lastB = null;
  $('#p-run').addEventListener('click', () => runParams(mode === 'adv'));
  ['#p-V1', '#p-dE', '#p-nu', '#p-T', '#p-Tmin', '#p-Tmax', '#p-nT', '#p-iso', '#p-isoRho', '#p-nuH'].forEach((id) => $(id).addEventListener('change', () => runParams(false)));
  $('#p-csv').addEventListener('click', () => { if (lastB) download('tunneling_kappa.csv', toCSV(lastB), 'text/csv'); });
  $('#p-share').addEventListener('click', async () => { const p = readParams(); if (p.err.length) return; const url = location.href.split('#')[0] + hashFromParams(p); try { await navigator.clipboard.writeText(url); $('#p-status').textContent = 'link copied'; } catch (e) { $('#p-status').textContent = url; } });

  // ------------------------------------------------------------------ PATH mode
  let pathData = null, lastPathB = null, runningPath = false;
  const rstat = (m, cls) => { $('#r-status').textContent = m; $('#r-status').className = 'tnl-status ' + (cls || ''); };
  async function readFiles(files) {
    const list = Array.from(files); if (!list.length) return;
    const texts = await Promise.all(list.map(async (f) => ({ name: f.name, text: await f.text() })));
    const isTable = !texts.some((f) => /\.xyz$/i.test(f.name)) && !/Summary of reaction path following|NET REACTION COORDINATE|Gaussian, Inc|Entering Gaussian/i.test(texts[0].text);
    $('#r-tableopts').hidden = !isTable; $('#r-orcaopts').hidden = !texts.some((f) => /\.xyz$/i.test(f.name));
    lastTexts = texts; ingest(texts, isTable);
  }
  let lastTexts = null;
  $('#r-masses').addEventListener('change', () => { if (lastTexts && pathData && pathData.source === 'ORCA') ingest(lastTexts, false); });
  function ingest(texts, isTable) {
    try {
      const d = I.detectAndParse(texts, { sUnit: $('#r-sUnit').value, eUnit: $('#r-eUnit').value, massSet: $('#r-masses').value });
      pathData = d; pathData.raw = texts; pathData.isTable = isTable;
      rstat(`${d.source}: ${d.n} points (${d.note})`, 'ok-t'); $('#r-run').disabled = false; previewPath();
    } catch (e) { pathData = null; $('#r-run').disabled = true; rstat(e.message, 'bad-t'); $('#r-out').innerHTML = ''; }
  }
  $('#r-file').addEventListener('change', (ev) => readFiles(ev.target.files));
  ['#r-sUnit', '#r-eUnit'].forEach((id) => $(id).addEventListener('change', () => { if (pathData && pathData.isTable) readFiles2(); }));
  async function readFiles2() { if (!pathData) return; try { const d = I.tablePath(pathData.raw[0].text, { sUnit: $('#r-sUnit').value, eUnit: $('#r-eUnit').value }); Object.assign(pathData, d); previewPath(); } catch (e) { rstat(e.message, 'bad-t'); } }
  const dz = $('#r-drop');
  ['dragenter', 'dragover'].forEach((t) => dz.addEventListener(t, (e) => { e.preventDefault(); dz.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((t) => dz.addEventListener(t, (e) => { e.preventDefault(); dz.classList.remove('over'); }));
  dz.addEventListener('drop', (e) => { if (e.dataTransfer && e.dataTransfer.files.length) readFiles(e.dataTransfer.files); });
  $('#r-freq').addEventListener('change', async (ev) => { const f = ev.target.files[0]; if (!f) return; const nu = I.imaginaryFrequency(await f.text()); if (nu) { $('#r-nu').value = nu.toFixed(2); rstat(`imaginary frequency ${nu.toFixed(1)} cm⁻¹ read from ${f.name}`, 'ok-t'); } else rstat('no imaginary frequency found in ' + f.name, 'bad-t'); });
  $('#r-demo').addEventListener('click', () => {
    const V1 = 12, V2 = 17, nu = 1800, A = V1 - V2, B = Math.pow(Math.sqrt(V1) + Math.sqrt(V2), 2), t = (A + B) / (2 * B), l = Math.sqrt(2 * B) * t * (1 - t), K = nu / C.CONST.NUCONST, s = [], V = [];
    for (let i = 0; i < 121; i++) { const xi = -9 + 18 * i / 120, tt = 1 / (1 + Math.exp(-xi)); V.push(A * tt + B * tt * (1 - tt)); s.push(xi * l / K); }
    pathData = { s, V, n: s.length, source: 'demo', note: 'Eckart model path V₁ = 12, V₂ = 17, |ν‡| = 1800 cm⁻¹', raw: [], isTable: false }; $('#r-nu').value = '1800'; $('#r-run').disabled = false; rstat('demo path loaded', 'ok-t'); previewPath();
  });
  function orientPath() {
    let s = pathData.s.slice(), V = pathData.V.slice(), side = $('#r-side').value; const n = s.length;
    const first = V[0], last = V[n - 1];
    const flip = side === 'last' || (side === 'auto' && first < last);
    if (flip) { s = s.map((_, i) => -pathData.s[n - 1 - i]); V = V.map((_, i) => pathData.V[n - 1 - i]); }
    return { s, V, flip };
  }
  function previewPath() {
    if (!pathData) return;
    try {
      const { s, V, flip } = orientPath(), nuIn = num('#r-nu'), V1t = num('#r-V1');
      const pm = new C.PathModel(s, V, { nu: Number.isFinite(nuIn) ? nuIn : null, V1target: Number.isFinite(V1t) && V1t > 0 ? V1t : null });
      const out = $('#r-out'); registry.path.length = 0;
      let w = `<p class="hint">Reactant side: ${flip ? 'last' : 'first'} point of the file. V₁ = ${f2(pm.V1)}, V₂ = ${f2(pm.V2)}, ΔE = ${f2(pm.dE)} kcal/mol; |ν‡| from the path curvature = ${f2(pm.nuPath, 0)} cm⁻¹. Press “Calculate”.</p>`;
      out.innerHTML = `<div class="tnl-card" style="margin-top:14px"><h2>Path preview</h2>${w}</div><div class="tnl-plots" id="r-prev"></div>`;
      const dense = []; const sd = [], vd = []; for (let i = 0; i < 400; i++) { const ss = pm.s0 + (pm.sN - pm.s0) * i / 399; sd.push(ss); vd.push(pm.spline.at(ss)); }
      const bb = { V1: pm.V1, dE: pm.dE, pathCurve: { s: sd, V: vd, sRaw: Array.from(pm.sRaw), VRaw: Array.from(pm.VRaw), sTop: pm.sTop } };
      addPlot('path', $('#r-prev'), 'path_V_preview', 'V(s) from the file', chartPathV(bb));
    } catch (e) { $('#r-out').innerHTML = `<div class="notice bad" style="margin-top:14px">${esc(e.message)}</div>`; }
  }
  ['#r-nu', '#r-V1', '#r-side'].forEach((id) => $(id).addEventListener('change', () => { previewPath(); }));
  async function runPathMode() {
    if (!pathData || runningPath) return;
    const T = num('#r-T'), Tmin = num('#r-Tmin'), Tmax = num('#r-Tmax'), nT = Math.max(3, Math.min(80, Math.round(num('#r-nT')) || 21));
    const out = $('#r-out');
    if (![T, Tmin, Tmax].every((x) => x > 0) || Tmax <= Tmin) { out.innerHTML = '<div class="notice bad" style="margin-top:14px">Check the temperatures (positive, T to &gt; T from).</div>'; return; }
    const { s, V, flip } = orientPath(), nuIn = num('#r-nu'), V1t = num('#r-V1'), rho = Math.max(1, parseFloat($('#r-iso').value) || 1), exact = $('#r-exact').checked;
    const Ts = Tgrid(Tmin, Tmax, nT, T);
    runningPath = true; $('#r-run').disabled = true; const pr = progressUI('r'); pr.start('path models…');
    try {
      const res = await runTask('path', { s, V, nu: Number.isFinite(nuIn) ? nuIn : null, V1target: Number.isFinite(V1t) && V1t > 0 ? V1t : null, Ts, exact, rho, iso: rho > 1 }, (f, m) => pr.set(f, m));
      const warnings = [];
      if (!res.valid) {
        const why = res.topAtEdge ? 'the barrier maximum lies at the end of the path (the path does not extend over both sides of the TS)' : (res.V2 <= 0 ? 'the reverse barrier V₂ is not positive for the chosen reactant side (barrierless or reversed direction)' : 'no valid |ν‡| (flat or non-concave top)');
        out.innerHTML = `<div class="notice bad" style="margin-top:14px">The path cannot be used: ${why}. Try the other reactant side or give |ν‡| explicitly.</div>`; pr.done(''); runningPath = false; $('#r-run').disabled = false; return;
      }
      if (res.minima > 0 || res.maxima > 1) warnings.push({ cls: 'bad', text: `The path has ${res.maxima} maxima and ${res.minima} interior minimum(a) (deepest well ≈ ${f2(res.wellDepth)} kcal/mol). With an intermediate well the one-dimensional problem has resonances; ZCT-MEP, the calibrations and especially the exact 1D reference are not validated for deep wells.` });
      if (res.nuGiven && Number.isFinite(res.nuPath) && Math.abs(res.nuPath / res.nu - 1) > 0.15) warnings.push({ text: `The |ν‡| you typed (${f2(res.nu, 0)} cm⁻¹) differs from the curvature of the path (${f2(res.nuPath, 0)} cm⁻¹) by more than 15 %; ZCT-MEP uses the typed value only for the parabolic continuation above the top and the Eckart-based corrections use it as the Eckart curvature. A discontinuity at the barrier top means the path was computed at a different level.` });
      if (!res.nuGiven) warnings.push({ text: 'No |ν‡| given: it is estimated from the curvature of the interpolated path. A frequency from the Hessian of the transition state is preferable.' });
      if (res.rescale !== 1) warnings.push({ cls: 'ok', text: `Path rescaled by c = ${res.rescale.toFixed(4)} (V → cV, s → √c s) to the requested V₁; ΔE is scaled by the same factor.` });
      if (exact) warnings.push({ text: 'The exact 1D curve solves the Schrödinger equation on this path with constant potential continued beyond both ends; it is exact for this one-dimensional model only.' });
      const an = analytic(res.V1, res.dE, res.nu, Ts), isoAn = rho > 1 ? analytic(res.V1, res.dE, res.nu / Math.sqrt(rho), Ts) : null;
      const entry = { key: 'path', label: 'IRC path', dev: true, exact: res.exact, fsub: res.fsub, m: res.models, PE: res.PE, iso: res.iso, profile: null, eckartSeen: res.models.eckart };
      const b = { mode: 'path', V1: res.V1, dE: res.dE, V2: res.V2, nu: res.nu, Ts, Tstar: T, an, isoAn, rho, nuH: res.nu / Math.sqrt(rho), entries: [entry], warnings, pathCurve: null };
      const sd = [], vd = []; { const pm = new C.PathModel(s, V, { nu: res.nu, V1target: Number.isFinite(V1t) && V1t > 0 ? V1t : null }); for (let i = 0; i < 400; i++) { const ss = pm.s0 + (pm.sN - pm.s0) * i / 399; sd.push(ss); vd.push(pm.spline.at(ss)); } b.pathCurve = { s: sd, V: vd, sRaw: res.curve.s, VRaw: res.curve.V, sTop: res.sTop }; }
      renderResults('path', out, b); lastPathB = b; $('#r-csv').disabled = false; pr.done('done');
    } catch (e) { pr.done(''); out.innerHTML = `<div class="notice bad" style="margin-top:14px">Calculation failed: ${esc(e.message)}</div>`; }
    runningPath = false; $('#r-run').disabled = false;
  }
  $('#r-run').addEventListener('click', runPathMode);
  $('#r-csv').addEventListener('click', () => { if (lastPathB) download('tunneling_path_kappa.csv', toCSV(lastPathB), 'text/csv'); });

  // ------------------------------------------------------------------ ABOUT: self test, Table 2
  function renderSelfTest() {
    const tb = $('#selftest tbody'); tb.innerHTML = '';
    for (const r of Tk.selfTest()) tb.insertAdjacentHTML('beforeend', `<tr><td>${esc(r.name)}</td><td>${fmtK(r.got)}</td><td>${fmtK(r.ref)}</td><td class="${r.ok ? 'ok-t' : 'bad-t'}">${r.ok ? '✓' : '✗'}</td></tr>`);
  }
  const TAB2 = { gauss: [54.5, 81.1, 48.6, 55.2, 54.8, 1720], lorentz: [37.5, 81.0, 32.6, 37.0, 36.5, 1637], sech2: [63.4, 81.1, 56.0, 63.7, 63.4, 1750], sech4: [97.5, 81.1, 85.7, 97.4, 97.7, 1838], lorentz2: [63.4, 81.1, 55.7, 63.3, 63.0, 1749] };
  $('#t2-run').addEventListener('click', async () => {
    const st = $('#t2-status'); $('#t2-run').disabled = true; st.textContent = 'computing…';
    try {
      const res = await runTask('profiles', { V1: 12, dE: -8, nu: 1800, Ts: [298.15], families: Object.keys(TAB2), iso: false, rho: 1, sc: false }, (f) => { st.textContent = `computing… ${(100 * f).toFixed(0)} %`; });
      let h = '<table class="tnl-table"><thead><tr><th>profile</th><th>V₁ / V₂ seen</th><th>exact</th><th>Eckart</th><th>ZCT-MEP</th><th>ZCT-EC</th><th>EQ-FREQ</th><th>ν<sub>eff</sub></th><th>max dev. from the manuscript</th></tr></thead><tbody>';
      for (const r of res.families) { const ref = TAB2[r.key], got = [r.exact[0], r.models.eckart[0], r.models.zct[0], r.models.zctEC[0], r.models.eq[0], r.models.nuEff[0]];
        const dev = Math.max(...got.map((g, i) => Math.abs(g / ref[i] - 1)));
        h += `<tr><td>${esc(r.label)}</td><td>${f2(r.V1, 3)} / ${f2(r.V2, 3)}</td>${got.map((g, i) => `<td>${i === 5 ? f2(g, 0) : f2(g, 1)} <span class="hint">(${i === 5 ? ref[i] : ref[i].toFixed(1)})</span></td>`).join('')}<td class="${dev < 0.01 ? 'ok-t' : 'warn-t'}">${(100 * dev).toFixed(2)} %</td></tr>`; }
      $('#t2-out').innerHTML = h + '</tbody></table><p class="hint">V₁ = 12, V₂ = 20 kcal/mol, 1800 cm⁻¹, 298.15 K. In brackets: values printed in Table 2 of the manuscript (rounded to the printed digits).</p>'; st.textContent = '';
    } catch (e) { st.textContent = 'failed: ' + e.message; }
    $('#t2-run').disabled = false;
  });

  // ------------------------------------------------------------------ init
  (function init() {
    if (CFG.homeUrl) $('#homeLink').href = CFG.homeUrl;
    let cite = esc(CFG.paperCitation || '');
    if (CFG.paperUrl) cite += ` <a href="${esc(CFG.paperUrl)}" rel="noopener">[article]</a>`;
    if (CFG.repoUrl) cite += ` <a href="${esc(CFG.repoUrl)}" rel="noopener">[code]</a>`;
    $('#cite').innerHTML = cite || 'Please cite the accompanying article.';
    renderSelfTest(); applyTheme();
    const had = applyHash();
    const tab = had ? 'params' : (safeLS.get('tnl-tab') || 'params'); showTab(['params', 'path', 'about'].includes(tab) ? tab : 'params');
    setMode(mode, true); symFromValue();
    runParams(had && mode === 'adv');   // closed-form results immediately; exact reference when a shared link carries advanced settings
  })();
})();
