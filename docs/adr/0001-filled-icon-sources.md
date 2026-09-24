# Icon sources are filled paths, never strokes

Every Icon source, in both the `outline` and `solid` Styles, is drawn as filled paths: designers run "Outline stroke" before exporting, and `scripts/lint-icons.mjs` rejects any `stroke` attribute. We chose this, like Boxicons, so that one set of sources can feed the webfont Surface directly, without a stroke-to-path build step that would add dependencies and a new way to fail.

## Consequences

- No `strokeWidth` prop on any Surface (unlike Lucide). Changing that later means re-exporting every Icon source as strokes.
- Components render with `fill="currentColor"`; recolouring works through CSS `color`.
