const { spawn } = require('child_process');
const fs = require('fs');

const out = fs.openSync('server.out.log','a');
const err = fs.openSync('server.err.log','a');

const child = spawn(process.execPath, ['src/server.js'], {
  detached: true,
  stdio: ['ignore', out, err],
  cwd: process.cwd()
});
child.unref();
fs.writeFileSync('server.pid', String(child.pid));
console.log('started', child.pid);
