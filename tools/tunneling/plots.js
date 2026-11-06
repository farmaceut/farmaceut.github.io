/* Minimal dependency-free SVG plotting in the style of the figures of the manuscript (matplotlib-like, light grid, log axes with 10^n labels). MIT licence. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TunnelingPlots = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const THEMES = {
    light: { bg: '#ffffff', fg: '#1d1d24', axis: '#3a3a44', grid: '#e4e4ea', minor: '#f0f0f4', faint: '#8a8a96' },
    dark: { bg: '#151b30', fg: '#e7e7ee', axis: '#a8acc0', grid: '#2a3150', minor: '#1d2440', faint: '#8084a0' }
  };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  function fmtLogTick(v) {          // v = 10^k
    const k = Math.round(Math.log10(v));
    if (k === 0) return '1'; if (k === 1) return '10'; if (k === -1) return '0.1';
    return { k, sup: true };
  }
  function niceStep(span, target) {
    const raw = span / target, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
    return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
  }
  function linTicks(lo, hi, target = 6) {
    const st = niceStep(hi - lo, target), t = [];
    for (let v = Math.ceil(lo / st - 1e-9) * st; v <= hi + 1e-9 * st; v += st) t.push(Math.abs(v) < 1e-12 * st ? 0 : +v.toPrecision(12));
    return t;
  }
  function fmtLin(v, st) {
    if (v === 0) return '0';
    const a = Math.abs(v);
    if (a >= 1e5 || a < 1e-3) { const e = Math.floor(Math.log10(a)), m = v / Math.pow(10, e); return `${+m.toPrecision(3)}×10^${e}`; }
    const dec = st < 1 ? Math.min(6, Math.max(0, -Math.floor(Math.log10(st)))) : 0;
    return v.toFixed(dec).replace('-', '−');
  }

  class Chart {
    constructor(o = {}) {
      this.o = Object.assign({ w: 520, h: 360, xlog: false, ylog: false, legend: 'tr', margin: { l: 66, r: 16, t: 30, b: 52 }, title: '', xlabel: '', ylabel: '' }, o);
      this.series = []; this.lines = []; this.texts = []; this.bands = [];
    }
    add(s) { this.series.push(Object.assign({ color: '#444', width: 1.8, dash: null, marker: null, hollow: false, ms: 5 }, s)); return this; }
    vline(x, o = {}) { this.lines.push(Object.assign({ x, color: '#888', dash: '4 3', width: 1 }, o)); return this; }
    hline(y, o = {}) { this.lines.push(Object.assign({ y, color: '#888', dash: '4 3', width: 1 }, o)); return this; }
    band(ylo, yhi, color = '#7777aa22') { this.bands.push({ ylo, yhi, color }); return this; }
    text(x, y, str, o = {}) { this.texts.push(Object.assign({ x, y, str, size: 10.5, anchor: 'start' }, o)); return this; }
    _range() {
      const o = this.o; let xs = [], ys = [];
      for (const s of this.series) for (let i = 0; i < s.x.length; i++) {
        const x = s.x[i], y = s.y[i];
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
        if (o.xlog && x <= 0) continue; if (o.ylog && y <= 0) continue;
        xs.push(x); ys.push(y);
      }
      for (const l of this.lines) { if (l.x !== undefined && l.range !== false) xs.push(l.x); if (l.y !== undefined && l.range !== false && (!o.ylog || l.y > 0)) ys.push(l.y); }
      for (const b of this.bands) if (b.ylo !== undefined) { ys.push(b.ylo, b.yhi); }
      const ext = (a, log) => { if (!a.length) return log ? [1, 10] : [0, 1]; let lo = Math.min(...a), hi = Math.max(...a); if (lo === hi) { if (log) { lo /= 2; hi *= 2; } else { lo -= 0.5; hi += 0.5; } } return [lo, hi]; };
      let [x0, x1] = o.xcats ? [0.5, o.xcats.length + 0.5] : (o.xlim || ext(xs, o.xlog)), [y0, y1] = o.ylim || ext(ys, o.ylog);
      if (!o.xlim && !o.xcats) { if (o.xlog) { x0 = Math.pow(10, Math.floor(Math.log10(x0))); x1 = Math.pow(10, Math.ceil(Math.log10(x1) - 1e-9)); if (x1 <= x0) x1 = x0 * 10; } else { const p = 0.03 * (x1 - x0); x0 -= p; x1 += p; } }
      if (!o.ylim) { if (o.ylog) { y0 = Math.pow(10, Math.floor(Math.log10(y0))); y1 = Math.pow(10, Math.ceil(Math.log10(y1) - 1e-9)); if (y1 <= y0) y1 = y0 * 10; } else { const p = 0.06 * (y1 - y0); y0 -= p; y1 += p; } }
      return { x0, x1, y0, y1 };
    }
    render(theme = 'light') {
      const o = this.o, T = THEMES[theme] || THEMES.light, m = o.margin, W = o.w, H = o.h, pw = W - m.l - m.r, ph = H - m.t - m.b;
      const R = this._range(); this.range = R;
      const fx = (x) => m.l + pw * (o.xlog ? (Math.log(x) - Math.log(R.x0)) / (Math.log(R.x1) - Math.log(R.x0)) : (x - R.x0) / (R.x1 - R.x0));
      const fy = (y) => m.t + ph * (1 - (o.ylog ? (Math.log(y) - Math.log(R.y0)) / (Math.log(R.y1) - Math.log(R.y0)) : (y - R.y0) / (R.y1 - R.y0)));
      this.fx = fx; this.fy = fy;
      const out = [];
      const font = 'font-family="DejaVu Sans, Verdana, Helvetica, Arial, sans-serif"';
      out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" ${font} font-size="11" role="img" aria-label="${esc(o.title || o.ylabel)}">`);
      out.push(`<rect width="${W}" height="${H}" fill="${T.bg}"/>`);
      out.push(`<defs><clipPath id="c${this.id || 0}"><rect x="${m.l}" y="${m.t}" width="${pw}" height="${ph}"/></clipPath></defs>`);
      const ticksOf = (lo, hi, log, st) => {
        if (log) { const t = [], mi = []; for (let k = Math.ceil(Math.log10(lo) - 1e-9); k <= Math.floor(Math.log10(hi) + 1e-9); k++) t.push(Math.pow(10, k));
          for (let k = Math.floor(Math.log10(lo)); k <= Math.ceil(Math.log10(hi)); k++) for (const f of [2, 3, 4, 5, 6, 7, 8, 9]) { const v = f * Math.pow(10, k); if (v > lo && v < hi) mi.push(v); }
          return { major: t, minor: mi }; }
        return { major: linTicks(lo, hi, st), minor: [] };
      };
      const xt = o.xcats ? { major: o.xcats.map((_, i) => i + 1), minor: [] } : ticksOf(R.x0, R.x1, o.xlog, 7), yt = ticksOf(R.y0, R.y1, o.ylog, 6);
      // grid
      if (o.ylog && yt.major.length < 3) { /* few decades: label minor values 2 and 5 too */ yt.labelMinor = [2, 5]; }
      for (const v of yt.minor) out.push(`<line x1="${m.l}" x2="${m.l + pw}" y1="${fy(v)}" y2="${fy(v)}" stroke="${T.minor}" stroke-width="0.8"/>`);
      for (const v of xt.minor) out.push(`<line y1="${m.t}" y2="${m.t + ph}" x1="${fx(v)}" x2="${fx(v)}" stroke="${T.minor}" stroke-width="0.8"/>`);
      for (const v of yt.major) out.push(`<line x1="${m.l}" x2="${m.l + pw}" y1="${fy(v)}" y2="${fy(v)}" stroke="${T.grid}" stroke-width="1"/>`);
      for (const v of xt.major) out.push(`<line y1="${m.t}" y2="${m.t + ph}" x1="${fx(v)}" x2="${fx(v)}" stroke="${T.grid}" stroke-width="1"/>`);
      // bands
      out.push(`<g clip-path="url(#c${this.id || 0})">`);
      for (const b of this.bands) { const ya = fy(Math.max(b.ylo, o.ylog ? R.y0 : -Infinity)), yb = fy(b.yhi); out.push(`<rect x="${m.l}" y="${Math.min(ya, yb)}" width="${pw}" height="${Math.abs(ya - yb)}" fill="${b.color}"/>`); }
      for (const l of this.lines) {
        if (l.x !== undefined) out.push(`<line x1="${fx(l.x)}" x2="${fx(l.x)}" y1="${m.t}" y2="${m.t + ph}" stroke="${l.color}" stroke-width="${l.width}" ${l.dash ? `stroke-dasharray="${l.dash}"` : ''}/>`);
        else out.push(`<line y1="${fy(l.y)}" y2="${fy(l.y)}" x1="${m.l}" x2="${m.l + pw}" stroke="${l.color}" stroke-width="${l.width}" ${l.dash ? `stroke-dasharray="${l.dash}"` : ''}/>`);
      }
      for (const s of this.series) {
        const pts = [];
        for (let i = 0; i < s.x.length; i++) { const x = s.x[i], y = s.y[i]; if (!Number.isFinite(x) || !Number.isFinite(y) || (o.xlog && x <= 0) || (o.ylog && y <= 0)) { pts.push(null); continue; } pts.push([fx(x), fy(y)]); }
        if (s.width > 0 && !s.noLine) {
          let d = '', pen = false; for (const p of pts) { if (!p) { pen = false; continue; } d += (pen ? 'L' : 'M') + p[0].toFixed(2) + ' ' + p[1].toFixed(2); pen = true; }
          if (d) out.push(`<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width}" ${s.dash ? `stroke-dasharray="${s.dash}"` : ''} stroke-linejoin="round" stroke-linecap="round"/>`);
        }
        if (s.marker) for (const p of pts) if (p) out.push(this._marker(s, p[0], p[1], T));
      }
      out.push('</g>');
      for (const t of this.texts) { const px = t.xpx !== undefined ? t.xpx : fx(t.x), py = t.ypx !== undefined ? t.ypx : fy(t.y); out.push(`<text x="${px}" y="${py}" font-size="${t.size}" text-anchor="${t.anchor}" fill="${t.color || T.fg}">${esc(t.str)}</text>`); }
      // frame + ticks
      out.push(`<rect x="${m.l}" y="${m.t}" width="${pw}" height="${ph}" fill="none" stroke="${T.axis}" stroke-width="1"/>`);
      const tickLabel = (v, log, st) => log ? fmtLogTick(v) : fmtLin(v, st);
      const xs = xt.major.length > 1 ? Math.abs(xt.major[1] - xt.major[0]) : 1, ys2 = yt.major.length > 1 ? Math.abs(yt.major[1] - yt.major[0]) : 1;
      const labelSVG = (lab, x, y, anchor, extra = '') => {
        if (typeof lab === 'string') return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${T.fg}" ${extra}>${esc(lab)}</text>`;
        return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${T.fg}" ${extra}>10<tspan baseline-shift="super" font-size="8">${lab.k < 0 ? '−' + (-lab.k) : lab.k}</tspan></text>`;
      };
      for (const v of xt.major) { const x = fx(v); out.push(`<line x1="${x}" x2="${x}" y1="${m.t + ph}" y2="${m.t + ph + 4}" stroke="${T.axis}"/>`); if (o.xcats) out.push(`<text x="${x}" y="${m.t + ph + 15}" text-anchor="${o.xrot ? 'end' : 'middle'}" fill="${T.fg}" font-size="10" ${o.xrot ? `transform="rotate(${-o.xrot} ${x} ${m.t + ph + 15})"` : ''}>${esc(o.xcats[v - 1])}</text>`); else out.push(labelSVG(tickLabel(v, o.xlog, xs), x, m.t + ph + 17, 'middle')); }
      for (const v of yt.major) { const y = fy(v); out.push(`<line y1="${y}" y2="${y}" x1="${m.l - 4}" x2="${m.l}" stroke="${T.axis}"/>`); out.push(labelSVG(tickLabel(v, o.ylog, ys2), m.l - 7, y + 3.5, 'end')); }
      if (yt.labelMinor) for (const v of yt.minor) { const k = Math.pow(10, Math.floor(Math.log10(v))), f = Math.round(v / k); if (yt.labelMinor.includes(f)) out.push(`<text x="${m.l - 7}" y="${fy(v) + 3.5}" text-anchor="end" fill="${T.faint}" font-size="9">${+v.toPrecision(2)}</text>`); }
      if (o.xtickLabels) { /* custom categorical labels */ }
      if (o.title) out.push(`<text x="${m.l}" y="${m.t - 10}" font-size="11.5" fill="${T.fg}">${esc(o.title)}</text>`);
      if (o.xlabel) out.push(`<text x="${m.l + pw / 2}" y="${H - 10}" text-anchor="middle" fill="${T.fg}">${esc(o.xlabel)}</text>`);
      if (o.ylabel) out.push(`<text transform="translate(14 ${m.t + ph / 2}) rotate(-90)" text-anchor="middle" fill="${T.fg}">${esc(o.ylabel)}</text>`);
      // legend
      const leg = this.series.filter((s) => s.label);
      if (leg.length && o.legend) {
        const lh = 15, lw = Math.max(...leg.map((s) => s.label.length)) * 6.2 + 34, bh = leg.length * lh + 6;
        const pos = o.legend, lx = pos.includes('l') ? m.l + 8 : m.l + pw - lw - 4, ly = pos.includes('t') ? m.t + 6 : m.t + ph - bh - 4;
        out.push(`<rect x="${lx - 4}" y="${ly - 3}" width="${lw + 6}" height="${bh}" fill="${T.bg}" fill-opacity="0.82" rx="3"/>`);
        leg.forEach((s, i) => {
          const y = ly + i * lh + 8;
          if (s.width > 0 && !s.noLine) out.push(`<line x1="${lx}" x2="${lx + 22}" y1="${y}" y2="${y}" stroke="${s.color}" stroke-width="${s.width}" ${s.dash ? `stroke-dasharray="${s.dash}"` : ''}/>`);
          if (s.marker) out.push(this._marker(s, lx + 11, y, T));
          out.push(`<text x="${lx + 28}" y="${y + 3.5}" fill="${T.fg}" font-size="10.5">${esc(s.label)}</text>`);
        });
      }
      out.push('</svg>');
      return out.join('');
    }
    _marker(s, x, y, T) {
      const r = s.ms, st = s.color, fill = s.hollow ? 'none' : s.color, sw = s.hollow ? 1.5 : 1;
      switch (s.marker) {
        case 's': return `<rect x="${x - r}" y="${y - r}" width="${2 * r}" height="${2 * r}" fill="${fill}" stroke="${st}" stroke-width="${sw}"/>`;
        case 'x': return `<path d="M${x - r} ${y - r}L${x + r} ${y + r}M${x - r} ${y + r}L${x + r} ${y - r}" stroke="${st}" stroke-width="1.8" fill="none"/>`;
        case '+': return `<path d="M${x - r} ${y}L${x + r} ${y}M${x} ${y - r}L${x} ${y + r}" stroke="${st}" stroke-width="1.8" fill="none"/>`;
        case '^': return `<path d="M${x} ${y - r}L${x + r} ${y + r}L${x - r} ${y + r}Z" fill="${fill}" stroke="${st}" stroke-width="${sw}"/>`;
        default: return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${st}" stroke-width="${sw}"/>`;
      }
    }
  }
  return { Chart, THEMES, linTicks };
});
