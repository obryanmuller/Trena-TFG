import { spawn } from 'node:child_process';
const children = [
  spawn(process.execPath, ['--watch', 'server/index.mjs'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      DEMO_SEED: process.env.DEMO_SEED ?? '1',
      DEV_CLIENT_ORIGIN: 'http://127.0.0.1:5173',
    },
  }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js'], { stdio: 'inherit' }),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  children.forEach((child) => child.kill());
  process.exit(code);
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
children.forEach((child) => child.on('exit', (code) => stop(code || 0)));
