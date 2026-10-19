// Compila la app y publica dist/ en la rama gh-pages del remoto "origin".
import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';

const run = (cmd, opts = {}) => execSync(cmd, { stdio: 'inherit', ...opts });
const remote = execSync('git remote get-url origin').toString().trim();

run('npm run build');
rmSync('dist/.git', { recursive: true, force: true });
const git = (cmd) => run(`git ${cmd}`, { cwd: 'dist' });
git('init -q -b gh-pages');
git('add -A');
git(`-c user.name="${execSync('git config user.name').toString().trim()}" -c user.email="${execSync('git config user.email').toString().trim()}" commit -q -m "Deploy ${new Date().toISOString()}"`);
git(`push -f ${remote} gh-pages`);
rmSync('dist/.git', { recursive: true, force: true });
console.log('\nPublicado en la rama gh-pages.');
