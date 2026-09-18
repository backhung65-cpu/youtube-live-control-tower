import { spawnSync } from 'child_process';
import fs from 'fs';

console.log('📦 Production build starting...');
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
spawnSync(npxCmd, ['vite', 'build'], { stdio: 'inherit', shell: true });

if (fs.existsSync('./dist/index.html') && fs.existsSync('./dist/assets')) {
  console.log('\n✅ Production bundle successfully generated in ./dist!');
  process.exit(0);
} else {
  console.error('\n❌ Build failed: ./dist was not created.');
  process.exit(1);
}
