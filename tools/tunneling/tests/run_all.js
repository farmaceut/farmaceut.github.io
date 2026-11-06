// Runs every test script of this folder and reports the last line of each; a non-zero exit code of any script is reported as FAIL.
const { spawnSync } = require('child_process'), fs = require('fs'), path = require('path');
const skip = new Set(['run_all.js', 'genexamples.js']);
let bad = 0;
for (const f of fs.readdirSync(__dirname).filter(n => n.endsWith('.js') && !skip.has(n)).sort()) {
  const r = spawnSync('node', [path.join(__dirname, f)], { encoding: 'utf8', timeout: 280000 });
  const last = (r.stdout || '').trim().split('\n').pop().slice(0, 110);
  const ok = r.status === 0; if (!ok) bad++;
  console.log((ok ? 'ok   ' : 'FAIL ') + f.padEnd(40) + last);
}
process.exit(bad ? 1 : 0);
