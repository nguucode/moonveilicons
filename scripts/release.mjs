// Usage: npm run release -- <version> [--no-push]
// Sets every published package to <version> (lockstep), commits, tags v<version> and pushes.
// Pushing the tag runs .github/workflows/release.yml, which publishes to npm.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const [version, flag] = process.argv.slice(2);
const run = (cmd, ...args) => execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
const fail = (msg) => { console.error(msg); process.exit(1); };

if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version ?? '')) fail('Usage: npm run release -- <x.y.z> [--no-push]');
if (run('git', 'status', '--porcelain')) fail('Working tree is not clean.');
if (run('git', 'branch', '--show-current') !== 'main') fail('Release from main.');
if (run('git', 'tag', '--list', `v${version}`)) fail(`Tag v${version} already exists.`);

const PACKAGES = ['packages/core', 'packages/react', 'packages/vue', 'packages/web-components'];
for (const dir of PACKAGES) {
  const file = `${dir}/package.json`;
  const pkg = JSON.parse(readFileSync(file, 'utf8'));
  pkg.version = version;
  writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
}
run('npm', 'install', '--package-lock-only', '--ignore-scripts');
run('git', 'add', 'package-lock.json', ...PACKAGES.map((d) => `${d}/package.json`));
run('git', 'commit', '-m', `Release v${version}`);
run('git', 'tag', '-a', `v${version}`, '-m', `v${version}`);

if (flag === '--no-push') console.log(`Tagged v${version} locally. Push with: git push --follow-tags`);
else {
  run('git', 'push', '--follow-tags');
  console.log(`Pushed v${version}; the release workflow publishes it.`);
}
