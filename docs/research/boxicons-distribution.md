# How Boxicons distributes its icons

Researched 2026-09-24. Goal: describe Boxicons' distribution model precisely enough that moonveilicons can copy it for its two Styles, `outline` and `solid`.

**Method.** Sources were the npm registry (`npm view`, plus the published tarballs unpacked with `npm pack`), the `box-icons` GitHub org (read via `gh api`), the docs site source (`box-icons/boxicons-docs`), and live CDN requests made with `curl`. Every fact cites its source. Anything I inferred rather than read directly is marked **[inferred]**, and anything I could not check is marked **[unverified]**.

---

## 0. TL;DR: two generations

| | **v2 (legacy)** | **v3 (current)** |
|---|---|---|
| npm | a single package, `boxicons@2.1.4` (last published 2022-09-19) | scoped packages: `@boxicons/core`, `/js`, `/react`, `/vue`, `/svelte`, `/cli` (first published Jan–Feb 2026) |
| Source repo | `box-icons/boxicons`, `master` branch (formerly `atisawd/boxicons`) | one repo per package in the `box-icons` org, apparently mirrored from a private monorepo **[inferred]** |
| Styles | regular / solid / logos | basic / filled / brands (Pro adds duotone, duotone-solid, duotone-mix, the rounded and sharp styles, and thin/bold weights) |
| Font generator | IcoMoon | svg2ttf (Fontello toolchain); the wrapper is likely fantasticon **[inferred]** |
| Web Component | `<box-icon>`, which fetches SVGs from unpkg at runtime | **none**. It was replaced by `@boxicons/js` (a Lucide-style `data-bx` DOM replacer) |
| React/Vue | community packages only | official, one component per icon, with a `pack` prop that chooses the style |
| CLI | none | `@boxicons/cli`, an interactive installer wizard |
| CDN | unpkg / jsDelivr from npm | a first-party CDN at `cdn.boxicons.com/{version}/...` (Cloudflare) |
| Docs | website at v2.boxicons.com | docs.boxicons.com (Nextra + Pagefind); the icon browser at boxicons.com is a separate Next.js app |

npm itself steers users to v3. The `@boxicons/core` SKILL.md says: "Do NOT recommend `boxicons` (legacy)" ([SKILL.md](https://unpkg.com/@boxicons/core@1.0.6/SKILL.md)).

---

## 1. npm packages

### v2: `boxicons`
- Version `2.1.4`, license `(CC-BY-4.0 OR OFL-1.1 OR MIT)`, `main: ./dist/boxicons.js`. It has no `exports`, `module` or `types` field ([npm](https://www.npmjs.com/package/boxicons/v/2.1.4); `npm view boxicons`).
- Tarball contents: `svg/regular` (814), `svg/solid` (665), `svg/logos` (155), plus `css/{boxicons,boxicons.min,animations,transformations}.css`, `fonts/boxicons.{eot,svg,ttf,woff,woff2}`, `dist/boxicons.js` (the web component as a UMD bundle), `src/box-icon-element.js` and `iconjar/boxicons.iconjar.zip` ([unpkg file listing](https://unpkg.com/browse/boxicons@2.1.4/)).
- The build is webpack, which produces a UMD bundle with `library: 'BoxIconElement'`. An `optimize-svg` script runs svgo over each folder ([webpack.config.js](https://unpkg.com/boxicons@2.1.4/webpack.config.js), [package.json](https://unpkg.com/boxicons@2.1.4/package.json)).
- The runtime `dependencies` wrongly include react, react-dom and react-router, which are left over from the website build ([package.json](https://unpkg.com/boxicons@2.1.4/package.json)). This is a mistake worth avoiding.

### v3: the `@boxicons/*` scope

| Package | Latest | Contents | Entry points |
|---|---|---|---|
| `@boxicons/core` | 1.0.6 (2026-03-01) | `svg/{basic,filled,brands}/bx-{name}.svg` (1884 / 1884 / 295), `fonts/{basic,filled,brands}/` (css, min.css, html preview, json codepoint map, ttf, woff, woff2), `fonts/{animations,transformations}(.min).css`, `icons.json`, `index.js`, `SKILL.md` | CJS only: `main: index.js`, no `exports` |
| `@boxicons/react` | 1.0.3 | generated TS output: `dist/{esm,cjs,types}/icons/{Pascal}.js` (about 2180 icons) | `exports`: `"."` and `"./*"` → `dist/{esm,cjs,types}/icons/*`; `sideEffects: false`; peer `react >=16.8` |
| `@boxicons/vue` | 1.0.1 | same layout as react | same exports; peer `vue >=3` |
| `@boxicons/svelte` | 1.0.1 | `dist/icons/*.svelte` built with `svelte-package` | `exports` with a `svelte` condition; peer `svelte >=4` |
| `@boxicons/js` | 1.0.1 | `dist/{esm,cjs,types}` + `icons/*` + `auto` | `exports`: `"."`, `"./icons/*"`, `"./auto"`; `sideEffects` lists only `auto.js` |
| `@boxicons/cli` | 1.0.1 | `index.js` (inquirer + chalk) | `bin: { boxicons: index.js }` |

Sources: `npm view <pkg> exports main module types sideEffects peerDependencies bin` for each package ([core](https://www.npmjs.com/package/@boxicons/core), [react](https://www.npmjs.com/package/@boxicons/react), [vue](https://www.npmjs.com/package/@boxicons/vue), [svelte](https://www.npmjs.com/package/@boxicons/svelte), [js](https://www.npmjs.com/package/@boxicons/js), [cli](https://www.npmjs.com/package/@boxicons/cli)), plus the unpacked tarballs.

- **JSON metadata.** `icons.json` is `{ total, packs: {basic, filled, brands}, icons: [sorted unique names], details: {basic:[], filled:[], brands:[]} }`. It lists names only: there are no tags, categories or codepoints ([generate-metadata.js](https://github.com/box-icons/boxicons-core/blob/main/scripts/generate-metadata.js)). `index.js` exports `{ icons, metadata, getPath(name, pack='basic') }` ([index.js](https://unpkg.com/@boxicons/core@1.0.6/index.js)).
- **Codepoints.** The codepoint map ships as `fonts/<pack>/boxicons*.json`, mapping name to a decimal codepoint ([boxicons.json](https://unpkg.com/@boxicons/core@1.0.6/fonts/basic/boxicons.json)).
- **Framework packages build from core.** They generate their code from core's SVGs at build time. Each one's `scripts/generate-icons.js` reads `require.resolve('@boxicons/core/package.json')/svg` ([react generate-icons.js](https://github.com/box-icons/boxicons-react/blob/main/scripts/generate-icons.js)). Core is a **devDependency** declared as `"file:../boxicons-core"`, so the published framework packages have no runtime dependency on core (`npm view @boxicons/react devDependencies`). The `file:../` path and workflow paths such as `packages/free/boxicons-core` ([update-skill.yml](https://github.com/box-icons/boxicons-core/blob/main/.github/workflows/update-skill.yml)) suggest a private monorepo that is split into public repos **[inferred]**.
- **Versioning is not lockstep.** At the time of writing core is at 1.0.6, react at 1.0.3, and vue/svelte/js/cli at 1.0.1. The icon-set version, 3.0.8, is a separate number used on the CDN and docs (`icon_version: "3.0.8"` in [docs package.json](https://github.com/box-icons/boxicons-docs/blob/main/package.json)). Each repo has its own Changesets config ([.changeset/config.json](https://github.com/box-icons/boxicons-core/blob/main/.changeset/config.json)). For contrast, Lucide (`lucide`, `lucide-react`, `lucide-static` all at 1.48.0) and Tabler (`@tabler/icons`, `@tabler/icons-webfont` at 3.48.0) *are* lockstep (`npm view`).
- **Pro packages** live on a private registry, `@boxicons-pro:registry=https://npm.boxicons.com/`, which needs an auth token. They come as a monolithic `@boxicons-pro/{framework}` package or as individual `@boxicons-pro/{framework}-{pack}-{style}[-{weight}]` packages ([docs cli.mdx](https://github.com/box-icons/boxicons-docs/blob/main/src/content/cli.mdx)).

---

## 2. Webfont + CSS classes

### v2
- **Classes.** Every icon takes the base class `bx` plus one prefixed class: `bx-{name}` (regular), `bxs-{name}` (solid) or `bxl-{name}` (logos). For example, `<i class='bx bx-heart'>`, `.bxs-heart:before`, `.bxl-github:before` ([boxicons.css](https://unpkg.com/boxicons@2.1.4/css/boxicons.css)).
- **One font for all three sets.** A single font, `boxicons`, holds regular, solid and logos, in eot, woff2, woff, ttf and svg ([boxicons.css @font-face](https://unpkg.com/boxicons@2.1.4/css/boxicons.css)).
- **Generator.** The font was generated by **IcoMoon**. Its SVG font metadata says "Font generated by IcoMoon." ([fonts/boxicons.svg](https://unpkg.com/boxicons@2.1.4/fonts/boxicons.svg)).
- **Utility classes** are shipped in the same CSS: `bx-ul`, `bx-spin`, `bx-tada`, `bx-flashing`, `bx-burst`, `bx-fade-*`, `bx-rotate-*`, `bx-flip-*`, `bx-border(-circle)`, `bx-pull-*` and `bx-xs|sm|md|lg` ([boxicons.css](https://unpkg.com/boxicons@2.1.4/css/boxicons.css)).

### v3
- **Base class picks the style; name class picks the glyph.** This is a "shared Unicode" model: the same codepoint sits in several fonts, and the base class selects which font renders it. Examples are `<i class="bx bx-user">` (basic), `<i class="bxf bx-user">` (filled) and `<i class="bxl bx-github">` (brands) ([SKILL.md §2](https://unpkg.com/@boxicons/core@1.0.6/SKILL.md), [docs font/usage.mdx](https://github.com/box-icons/boxicons-docs/blob/main/src/content/font/usage.mdx)).
- **Base selectors.** The CSS matches `[class^="bx"], [class*=" bx"], .bx` to set `font-family: boxicons`. The filled CSS matches `[class^="bxf"]…` to set `font-family: boxicons-filled` ([basic css](https://unpkg.com/@boxicons/core@1.0.6/fonts/basic/boxicons.css), [filled css](https://unpkg.com/@boxicons/core@1.0.6/fonts/filled/boxicons-filled.css)).
- **Load order matters.** The docs say the basic stylesheet must come before the others when several are loaded ([usage.mdx](https://github.com/box-icons/boxicons-docs/blob/main/src/content/font/usage.mdx)). The likely reason is that the broad `[class^="bx"]` selector would otherwise win **[inferred]**.
- **Full class matrix (including Pro).** `bx`, `bxr` and `bxs` are basic in regular, rounded and sharp; `bxf`, `bxrf` and `bxsf` are the filled equivalents; the `bxd*`, `bxds*` and `bxdm*` families cover the duotones; `bxl` is brands ([usage.mdx table](https://github.com/box-icons/boxicons-docs/blob/main/src/content/font/usage.mdx)).
- **The v2 → v3 change is breaking.** In v2, `bxs-` meant *solid*. In v3, `bxs` means basic/**sharp**, and solid is now `bxf` (same source).
- **Font formats** are ttf, woff and woff2 only; eot and svg were dropped. The URLs are cache-busted with `?<md5>` ([basic css](https://unpkg.com/@boxicons/core@1.0.6/fonts/basic/boxicons.css)). Note that the docs page for core still describes a `dist/fonts/` folder containing eot and svg files, which does not match the package ([core.mdx](https://github.com/box-icons/boxicons-docs/blob/main/src/content/core.mdx) versus the tarball).
- **Generator.** The TTF name table says "Generated by svg2ttf from Fontello project." (read from `fonts/basic/boxicons.ttf` in the tarball). The output set of `.css`, `.html` preview, `.json` codepoint map and `?hash` URLs matches **fantasticon**'s defaults **[inferred, unverified]**. The TTF also has a GSUB table, and the CSS defines `variable-selector-NN` classes, so some ligature or variation-selector trick may be in play **[unverified]**.
- **Utilities** are split into separate files, `fonts/animations.css` and `fonts/transformations.css`. Transformations include `bx-rotate-{45..315}`, `bx-flip-*`, sizes from `bx-xs` to `bx-5xl`, `bx-fw`, `bx-pull-*` and `bx-border(-circle|-squircle)` ([transformations.css](https://unpkg.com/@boxicons/core@1.0.6/fonts/transformations.css)).

### Stroke vs fill
Both generations are **fill-only**. None of the 4063 v3 SVGs and none of the 1634 v2 SVGs contain a `stroke` attribute (`grep -l stroke` across both tarballs). Outline icons are pre-expanded outlines: the v3 basic `bx-heart` is a filled compound path with a hole ([svg/basic/bx-heart.svg](https://unpkg.com/@boxicons/core@1.0.6/svg/basic/bx-heart.svg)). That is what lets them go through a webfont generator unchanged. **Implication for moonveilicons:** stroke-based `outline` sources must be outlined (stroke-to-path) before font generation.

---

## 3. Web Component

### v2: `<box-icon>`
- **Attributes.** It observes `type, name, color, size, rotate, flip, animation, border, pull` ([box-icon-element.js](https://unpkg.com/boxicons@2.1.4/src/box-icon-element.js)).
  - `type` is `regular` (default), `solid` or `logo`.
  - `size` is `xs|sm|md|lg` or any CSS size.
  - `rotate` is `90|180|270`.
  - `flip` is `horizontal|vertical`.
  - `border` is `square|circle`.
  - `animation` is `spin|tada|flashing|burst|fade-left|fade-right`, each also available as a `-hover` variant.
  - `pull` is `left|right`.

  The full list is in the [README](https://unpkg.com/boxicons@2.1.4/README.md).
- **Loading is a runtime fetch.** The component requests `//unpkg.com/boxicons@${VERSION}/svg/{regular|solid|logos}/{bx|bxs|bxl}-{name}.svg` with XMLHttpRequest and caches the result in a module-level map of promises. The static getter `cdnUrl` and method `getIconSvg` can be overridden to self-host ([box-icon-element.js](https://unpkg.com/boxicons@2.1.4/src/box-icon-element.js)).
- **Styling.** The animation and transformation CSS is inlined into the shadow DOM template.
- **Usage:** `<script src="https://unpkg.com/boxicons@2.1.3/dist/boxicons.js">` ([README](https://unpkg.com/boxicons@2.1.4/README.md)).

### v3: no web component
There is no `customElements.define` anywhere in `@boxicons/js` or the framework packages (grep over the dists). The replacement, `@boxicons/js`, is described as "Inspired by Lucide" ([README](https://unpkg.com/@boxicons/js@1.0.1/README.md)). It works like this:
- You write `<i data-bx="menu">`, then call `getIcons({ icons: { Menu }, nameAttr, attrs, root, inTemplates })`. It supports shadow roots.
- `createElement(Icon, opts)` and `createSvgString(Icon, opts)` build icons directly.
- `@boxicons/js/auto` offers `scanAndReplace()` and a MutationObserver-based `observe()`, but it imports every icon.
- Icons are **bundled** as data objects of the form `{ name, defaultPack, packs: { basic: {viewBox, content}, filled: {...} } }`, so nothing is fetched at runtime ([dist/esm/icons/Heart.js](https://unpkg.com/@boxicons/js@1.0.1/dist/esm/icons/Heart.js)).
- The README's CDN example (`<script src="https://unpkg.com/@boxicons/js@latest">` followed by `boxicons.getIcons(...)`) looks **broken**. unpkg resolves that URL to `dist/cjs/index.js`, a CommonJS file that calls `require`, and no UMD or IIFE build ships (checked with `curl -L`).

---

## 4. React / Vue / Svelte

- **v2.** There were no official packages. Community options include `boxicons-react`, `react-boxicons`, `svelte-boxicons`, `@styled-icons/boxicons-*` and the Iconify sets `bx`, `bxs` and `bxl` (`npm search boxicons`).
- **v3 is official**, with packages `@boxicons/react`, `@boxicons/vue` and `@boxicons/svelte`. Their shared API ([types.d.ts](https://unpkg.com/@boxicons/react@1.0.3/dist/types/types.d.ts), [utils.js](https://unpkg.com/@boxicons/react@1.0.3/dist/esm/utils.js)):
  - **One component per icon**, in PascalCase: `bx-alarm-clock` becomes `AlarmClock`. A name that starts with a digit gets an `Icon` prefix, and a name that collides with a reserved word such as `Map` or `Set` gets an `Icon` suffix ([generate-icons.js](https://github.com/box-icons/boxicons-react/blob/main/scripts/generate-icons.js)).
  - **Style is chosen with a prop**, not by importing a different component: `pack?: 'basic' | 'filled' | 'brands'`. The component file bundles the path data for **every pack that icon has**, and the unused style is not tree-shaken ([Heart.js](https://unpkg.com/@boxicons/react@1.0.3/dist/esm/icons/Heart.js)).
  - **Other props:**
    - `fill` defaults to `currentColor`.
    - `opacity`.
    - `size` is a preset: `xs`=16, `sm`=20, `base`=24, `md`=36, `lg`=48, `xl`=64, `2xl`=96, `3xl`=128, `4xl`=256, `5xl`=512.
    - `width` and `height` override `size`.
    - `flip` renders as the SVG transform `scale(-1,1)`.
    - `rotate` takes degrees.
    - `removePadding` changes the viewBox to `2 2 20 20`.
    - Everything else is forwarded to the `<svg>`.
  - **Rendering.** React uses `forwardRef` and `dangerouslySetInnerHTML`; Vue uses `defineComponent` and `h()` ([vue Heart.js](https://unpkg.com/@boxicons/vue@1.0.1/dist/esm/icons/Heart.js)).
  - **Tree-shaking** works through `sideEffects: false` plus one module per icon. Deep imports go through `"./*"`.
  - **Deep-import mismatch.** The README shows `@boxicons/react/icons/Alarm`, but the exports map resolves `./*` to `dist/esm/icons/*.js`, so the working path is `@boxicons/react/Alarm` ([README](https://unpkg.com/@boxicons/react@1.0.3/README.md) versus the exports map). **[inferred from the exports map, not runtime-tested]**
  - **Svelte export concern.** `@boxicons/svelte` maps `./*` to `dist/icons/*.js`, but the folder contains `.svelte` files, so deep imports may fail **[unverified]**.
- **Build.** Each framework package's `generate-icons.js` writes `src/icons/*`, then separate `tsc` configs emit ESM, CJS and types (`npm view @boxicons/react scripts`).

---

## 5. CLI

- **v2** had no CLI.
- **v3** ships `@boxicons/cli`, which installs the `boxicons` bin. It is **an interactive installer, not an icon tool**, and it runs through these steps ([cli.mdx](https://github.com/box-icons/boxicons-docs/blob/main/src/content/cli.mdx), [index.js](https://unpkg.com/@boxicons/cli@1.0.1/index.js)):
  1. Choose FREE or PRO.
  2. For FREE, pick one of core, js, react, vue or svelte, and it runs `npm install`.
  3. For PRO, it prompts for an API key and writes or appends the `@boxicons-pro` registry and `_authToken` lines to `./.npmrc`. It then asks for a main or individual package, and for an individual package it asks framework, pack, style and weight.
  4. It optionally copies `SKILL.md` to `.cursor/skills/boxicons/`, `.claude/skills/boxicons/` or `.well-known/skills/default/`.

  There are no `add`, `search` or `export` commands.
- **Comparable libraries.** `lucide`, `lucide-react`, `lucide-static`, `@tabler/icons`, `heroicons`, `@heroicons/react`, `@iconify/tools` and `@iconify/json` declare **no `bin`** (`npm view <pkg> bin`). Their distribution is purely packages plus a website. Iconify's `@iconify/tools` is a build-time library rather than a CLI. From memory and **[unverified]**: the shadcn-style "copy the icon source into my repo" CLI pattern mostly comes from third parties, not from these icon vendors.

---

## 6. CDN

| What | URL | Checked |
|---|---|---|
| v2 CSS | `https://cdn.jsdelivr.net/npm/boxicons@latest/css/boxicons.min.css`, or the same path on `unpkg.com/boxicons@latest` ([README](https://unpkg.com/boxicons@2.1.4/README.md)) | 200 for `@2.1.4` |
| v2 web component | `https://unpkg.com/boxicons@2.1.4/dist/boxicons.js` | 200 |
| v3 fonts | `https://cdn.boxicons.com/{VERSION}/fonts/basic/boxicons.min.css`, `…/fonts/filled/boxicons-filled.min.css`, `…/fonts/brands/boxicons-brands.min.css` ([usage.mdx](https://github.com/box-icons/boxicons-docs/blob/main/src/content/font/usage.mdx)) | 200 for 3.0.8; served by Cloudflare |
| v3 raw SVG | `https://cdn.boxicons.com/{VERSION}/svg/{basic\|filled\|brands}/bx-{name}.svg` | 200 |
| v3 via npm CDNs | `https://cdn.jsdelivr.net/npm/@boxicons/core@1.0.6/fonts/basic/boxicons.min.css` | 200, byte-identical in size (78205 B) to cdn.boxicons.com 3.0.8 |

- The first-party CDN is versioned by **icon-set version** (3.0.8), not by npm package version (core 1.0.6).
- The CDN serves *different SVG bytes* from npm. The CDN `bx-heart.svg` has a `viewBox` and a license comment (`<!--Boxicons v3.0.8 https://boxicons.com | License …-->`). The npm copy has no viewBox and no comment. So a separate CDN build step exists (compare `curl` of the CDN file with the tarball).
- Pro users generate a per-project CDN link from the "Usage" page on boxicons.com ([usage.mdx](https://github.com/box-icons/boxicons-docs/blob/main/src/content/font/usage.mdx)).

---

## 7. Docs site

- **docs.boxicons.com** ([CNAME](https://github.com/box-icons/boxicons-docs/blob/main/CNAME)):
  - It is built with **Next.js 16 + Nextra 4 (nextra-theme-docs) + Tailwind 4** and exported statically.
  - **Search** is **Pagefind**, run as a `postbuild` step (`pagefind --site .next/server/app`). The search box opens with Ctrl+K.
  - It is deployed to **GitHub Pages** by a stock `nextjs.yml` workflow ([package.json](https://github.com/box-icons/boxicons-docs/blob/main/package.json), [nextjs.yml](https://github.com/box-icons/boxicons-docs/blob/main/.github/workflows/nextjs.yml)).
  - Content lives in `src/content/**.mdx`. Sections cover intro, license (free, pro, brand), cli, core, font (usage, styling, animation), figma, framer, and `{react,vue,svelte,javascript}/{free,pro}/{install,individual,styling/*}` ([repo tree](https://github.com/box-icons/boxicons-docs/tree/main/src/content)).
  - The docs have **no per-icon pages**.
- **The icon browser is boxicons.com**, a separate Next.js app (its HTML references `_next/static`, per `curl`). According to the fetched landing page, it offers:
  - "Search 50k+ Icons" (Ctrl+K)
  - filters for packs, styles and 40+ categories
  - a per-icon viewer with copy SVG, export to **SVG, PNG, WEBP and React**, and live controls for color, padding, flip, rotate and animation
  - a "Usage" link

  Source: [boxicons.com](https://boxicons.com/). **[unverified detail: this comes from a WebFetch summary; I did not click through the UI]**
- **The v2 site** is a static Next.js export at v2.boxicons.com, with index, cheatsheet and usage pages ([boxicons_web_v2](https://github.com/box-icons/boxicons_web_v2)).

---

## 8. Icon metadata (tags, categories, aliases)

- **v3 npm packages carry no tags, categories or aliases.** `icons.json` holds only names and pack membership ([generate-metadata.js](https://github.com/box-icons/boxicons-core/blob/main/scripts/generate-metadata.js)). The categories on boxicons.com come from a backend that is not public **[inferred]**.
- **v2 metadata lived in the website's database**, not in the npm package. The v2 site's static data (`_next/data/.../index.json`) has 1634 icons of the form `{ _id (MongoDB ObjectId), name, slug: "castle-solid", category_id, type_of_icon: REGULAR|SOLID|LOGO, term: ["fort","secure"] }` plus a `categories` list such as `{name:"Accessibility", id:94}`. Only 295 of the 1634 have non-empty `term` tags ([index.json](https://github.com/box-icons/boxicons_web_v2/blob/main/_next/data/DNHfRjsQaNmPABrOMCg7E/index.json)). v2 also shipped an IconJar archive (`iconjar/boxicons.iconjar.zip`).
- **Neither generation has aliases or deprecated-name maps.**
- **Takeaway for moonveilicons.** Boxicons is a weak model here. Lucide's per-icon `icons/<name>.json` files, which hold tags, categories and aliases, are a better one to copy **[unverified: not re-checked in this session]**.

---

## 9. Release pipeline

- **v2 had no CI release workflow.** Commits on `master` are named after versions (for example "2.1.4" on 2022-09-19), which suggests manual `npm publish` **[inferred]** ([commits](https://github.com/box-icons/boxicons/commits/master)).
- **v3 per-repo workflows** (identical in core, react and js):
  - `release.yml` runs `changesets/action@v1` on pushes to `main` with only `version: npx changeset version`. That creates a **"Version Packages" PR**, but there is **no `publish:` step**, so npm publishing is manual or happens elsewhere, most likely `prepublishOnly` followed by `npm publish` from the private monorepo **[inferred]** ([release.yml](https://github.com/box-icons/boxicons-core/blob/main/.github/workflows/release.yml)).
  - Changelogs use `@changesets/cli/changelog` ([config.json](https://github.com/box-icons/boxicons-core/blob/main/.changeset/config.json)). No GitHub Releases or tags exist on `box-icons/boxicons` (`gh api .../releases` and `/tags` both return empty).
  - `ci.yml` (react) runs `npm install` and `npm run build`, but **every failure is swallowed** by `|| echo "..."` ([ci.yml](https://github.com/box-icons/boxicons-react/blob/main/.github/workflows/ci.yml)).
  - `optimize.yml` (core) runs `calibreapp/svgo-action@v3` on PRs. Its svgo config keeps the viewBox, removes dimensions and adds `viewBox="0 0 24 24"` ([optimize.yml](https://github.com/box-icons/boxicons-core/blob/main/.github/workflows/optimize.yml), [svgo.config.js](https://github.com/box-icons/boxicons-core/blob/main/svgo.config.js)).
  - The published SVGs **do not meet that standard**. All 4063 have `width="24"`, and 1755 have no `viewBox` (grep over the tarball). The SVGO step clearly did not run on what was published.
  - `update-skill.yml` regenerates SKILL.md stats on push and auto-commits with `git-auto-commit-action` ([update-skill.yml](https://github.com/box-icons/boxicons-core/blob/main/.github/workflows/update-skill.yml)).

---

## What to copy / what to avoid (for moonveilicons)

**Copy:**
- A core package of raw SVGs + fonts + `icons.json`, with framework packages generated from it at build time and core as a devDependency only.
- Per-icon ESM/CJS modules with `sideEffects: false` and a `"./*"` export.
- One base class per Style for the webfont: moonveilicons equivalents would be something like `mv` for outline and `mvs` for solid, plus `mv-{name}`.
- A versioned first-party CDN path, `/{version}/svg/{style}/{name}.svg`.
- Shipping an agent-facing SKILL.md.

**Avoid:**
- Style as a runtime prop that bundles both styles into every icon; per-style components or entry points tree-shake better.
- Versions that drift between packages when they share one icon set (Lucide and Tabler use lockstep).
- CI that swallows errors.
- SVG standards that are documented but not enforced.
- A CDN script example with no UMD build.
- Docs that disagree with the package layout.

**Decide:**
- Web component, yes or no. v3 dropped it, and its v2 version depended on a runtime CDN fetch.
- Where tags and categories live. Boxicons never shipped them.
