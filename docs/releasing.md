# Releasing

All four packages (`moonveilicons`, `@moonveilicons/react`, `@moonveilicons/vue`, `@moonveilicons/web-components`) always share one version.

## Every release

From a clean `main`:

```bash
npm run release -- 1.2.0
```

This sets the version on every package, commits `Release v1.2.0`, tags `v1.2.0` and pushes. The tag starts [`.github/workflows/release.yml`](../.github/workflows/release.yml), which:

1. checks the tag matches the package versions,
2. builds and tests,
3. publishes each package not yet on npm, through Trusted Publishing (no token; provenance attached automatically),
4. purges the unpinned jsDelivr copies of the CSS and `icons.json`,
5. creates a GitHub Release with generated notes.

`npm run publish:packages` skips versions that are already on npm, so a failed run can simply be re-run.

## First release (owner, once)

npm only lets you set up Trusted Publishing on a package that already exists, so the first version goes out from your machine.

1. On npmjs.com, create the organization **`moonveilicons`** (free, public packages).
2. `npm login`
3. On a clean `main`: `npm run release -- 0.1.0 --no-push` (bumps, commits and tags locally).
4. `npm run build && npm run publish:packages`
5. For each of the four packages on npmjs.com: **Settings → Trusted Publisher → GitHub Actions**, with organization/user `nguucode`, repository `moonveilicons` and workflow `release.yml`. Then set **Publishing access** to *Require two-factor authentication and disallow tokens*.
6. `git push --follow-tags`. The workflow sees 0.1.0 is already on npm, skips publishing, and creates the GitHub Release.

Every later release is just `npm run release -- <version>`.
