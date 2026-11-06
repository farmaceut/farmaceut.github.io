// JS vs the Python package (methods/lawrence.py): exact-WKB hbar^2 / hbar^4 transmission of Lawrence (2025) on six matched model profiles;
// reference values: tests/pyref/law_ref.json (generated with analysis/benchmark_v3.box and validation.shapes.matched_barrier).
const fs = require('fs'), path = require('path'); const C = require('../core.js'), S = require('../semiclassical.js');
const ref = JSON.parse(fs.readFileSync(path.join(__dirname, 'pyref', 'law_ref.json')));
const worst = { law2: 0, law4: 0 }; const only = process.argv[2];
for (const r of ref) {
  if (only && !only.split(',').includes(r.fam)) continue;
  const t0 = Date.now(), p = C.matchProfile(r.fam, r.V1, r.dE, r.nu), js = S.profileMethods(p, r.T);
  const line = [];
  for (const k of ['law2', 'law4']) r.T.forEach((T, i) => {
    const a = js[k][i], b = r.py[k][i] === null ? NaN : r.py[k][i];
    if (!Number.isFinite(a) || !Number.isFinite(b)) { if (Number.isFinite(a) !== Number.isFinite(b)) console.log('  defined only in one code:', r.fam, T, k, a, b); return; }
    const e = Math.abs(a / b - 1); if (e > worst[k]) worst[k] = e; line.push(e.toExponential(1));
  });
  console.log(r.fam.padEnd(9), 'ok=' + js.lawOk, ((Date.now() - t0) / 1000).toFixed(1) + ' s', line.join(' '));
}
console.log('max |JS/Python - 1|: law2 ' + (100 * worst.law2).toExponential(2) + ' %, law4 ' + (100 * worst.law4).toExponential(2) + ' %');
if (worst.law2 > 2e-3 || worst.law4 > 2e-3) { console.log('FAIL'); process.exit(1); }
