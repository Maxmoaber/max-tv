const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const out = fs.openSync(path.join(process.cwd(),'server.out.log'),'a');
const err = fs.openSync(path.join(process.cwd(),'server.err.log'),'a');

const child = spawn(process.execPath, ['src/server.js'], {
  detached: true,
  stdio: ['ignore', out, err],
  cwd: process.cwd(),
  env: Object.assign({}, process.env, { PORT: '4001' })
});
child.unref();
fs.writeFileSync('server_4001.pid', String(child.pid));
console.log('started backend on port 4001, pid', child.pid);
