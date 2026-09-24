# Moonveil Icons

An open-source SVG icon set, authored once and distributed to many consumers (npm, frameworks, webfont, CDN, CLI, docs site), in the spirit of Boxicons.

## Language

**Icon**:
One named glyph (e.g. `heart`), which exists in one or more Styles.
_Avoid_: Symbol, glyph, asset

**Style**:
A visual treatment every Icon may be drawn in. Exactly two exist: `outline` and `solid`.
_Avoid_: Variant, theme, weight, type

**Icon source**:
The hand-authored SVG file for one Icon in one Style; the single source of truth everything else is generated from.
_Avoid_: Raw icon, original

**Surface**:
One way consumers receive the icons: the core package, React, Vue, Web Component, webfont + CSS, CDN, CLI, or the docs site.
_Avoid_: Target, platform, output, flavour
