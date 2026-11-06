// JS vs the Python package (methods/semiclassical.py) on matched profiles of the manuscript benchmark; reference: tests/pyref/sc_ref.json
const fs = require('fs'), path = require('path'); const C = require('../core.js'), S = require('../semiclassical.js');
const ref = JSON.parse(fs.readFileSync(path.join(__dirname, 'pyref', 'sc_ref.json')));
const map = { inst: 'inst', usit: 'usit', usit1: 'usit1', usit_num: 'usitNum', svpt2: 'svpt2', svpt4: 'svpt4', msvpt4: 'msvpt4', mvpt2: 'mvpt2', myf: 'myf' };
const worst = {};
const only = process.argv[2]; for (const r of ref) { if (only && !only.split(',').includes(r.fam)) continue;
  const p = C.matchProfile(r.fam, r.V1, r.dE, r.nu), js = S.profileMethods(p, r.T);
  for (const k in map) r.T.forEach((T, i) => {
    const a = js[map[k]][i], b = r.py[k][i] === null ? NaN : r.py[k][i]; if (!Number.isFinite(a) || !Number.isFinite(b)) { if (Number.isFinite(a) !== Number.isFinite(b)) console.log('  defined only in one code:', r.fam, T, k, a, b); return; }
    const e = Math.abs(a / b - 1); if (!(worst[k] > e)) worst[k] = e;
  });
}
console.log('max |JS/Python - 1| per method:'); for (const k in worst) console.log('  ' + k.padEnd(9), (100 * worst[k]).toExponential(2), '%');
