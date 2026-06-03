const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Use the script directory as the frontend root so the script can be invoked from repo root
const rootDir = path.resolve(__dirname);
const out = fs.openSync(path.join(rootDir,'frontend.out.log'),'a');
const err = fs.openSync(path.join(rootDir,'frontend.err.log'),'a');

// Prefer the platform-correct vite binary. On Windows the .bin wrapper may be a shell script
// that Node can't execute directly; require the package's main executable.
let vitePath;
try {
  vitePath = require.resolve('vite/cli.js', { paths: [process.cwd()] });
} catch (err) {
  // Try known Vite JS entry locations, fallback to npx execution if not present
  const maybe1 = path.join(rootDir,'node_modules','vite','dist','node','cli.js');
  const maybe2 = path.join(rootDir,'node_modules','vite','bin','vite.js');
  if (fs.existsSync(maybe1)) vitePath = maybe1;
  else if (fs.existsSync(maybe2)) vitePath = maybe2;
  else vitePath = null;
}
let child;
if (vitePath) {
  // Launch the discovered JS entry using node
  child = spawn(process.execPath, [vitePath, '--host'], {
    detached: true,
    stdio: ['ignore', out, err],
    cwd: rootDir,
    env: Object.assign({}, process.env)
  });
} else {
  // As a last resort try the system npx (may fail if not available)
  child = spawn('npx', ['vite','--host'], {
    detached: true,
    stdio: ['ignore', out, err],
    cwd: rootDir,
    env: Object.assign({}, process.env)
  });
}
child.unref();
try{ fs.writeFileSync(path.join(rootDir,'frontend.pid'), String(child.pid)); }catch(e){}
console.log('started frontend pid', child.pid);
