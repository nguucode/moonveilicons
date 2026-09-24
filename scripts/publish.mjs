// Publishes every package whose current version is not on npm yet, so re-running is safe.
// CI runs it with Trusted Publishing (provenance is automatic); the owner can run it locally after `npm login`.
import { readFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';

const PACKAGES = ['packages/core', 'packages/react', 'packages/vue', 'packages/web-components'];
const versions = new Set();

for (const dir of PACKAGES) {
  const { name, version } = JSON.parse(readFileSync(`${dir}/package.json`, 'utf8'));
  versions.add(version);
  const published = spawnSync('npm', ['view', `${name}@${version}`, 'version'], { encoding: 'utf8' }).stdout.trim();
  if (published === version) {
    console.log(`skip ${name}@${version} (already on npm)`);
    continue;
  }
  execFileSync('npm', ['publish', '--workspace', dir, '--access', 'public'], { stdio: 'inherit' });
}

if (versions.size !== 1) {
  console.error(`Packages are not in lockstep: ${[...versions].join(', ')}`);
  process.exit(1);
}
