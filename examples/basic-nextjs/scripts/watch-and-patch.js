const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const mapFile = path.join(__dirname, '..', '.sitecore', 'component-map.ts');
let lastMtime = 0;

try {
  lastMtime = fs.statSync(mapFile).mtimeMs;
} catch {}

const child = spawn('npx', ['sitecore-tools', 'project', 'component', 'generate-map', '--watch'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  shell: true,
});

const interval = setInterval(() => {
  try {
    const currentMtime = fs.statSync(mapFile).mtimeMs;
    if (currentMtime > lastMtime) {
      lastMtime = currentMtime;
      execSync('node scripts/patch-component-map.js', {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit',
      });
    }
  } catch {}
}, 2000);

child.on('exit', () => {
  clearInterval(interval);
  process.exit();
});

process.on('SIGTERM', () => {
  child.kill();
  clearInterval(interval);
});
process.on('SIGINT', () => {
  child.kill();
  clearInterval(interval);
});
