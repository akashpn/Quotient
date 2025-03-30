#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting frontend server...');
console.log('NOTE: Make sure the js-server is running in another terminal!');

// Run vite with the --port 5000 flag
const viteProcess = spawn('npx', ['vite', '--port', '5000'], {
  stdio: 'inherit',
  cwd: __dirname
});

viteProcess.on('close', (code) => {
  console.log(`Frontend server exited with code ${code}`);
});