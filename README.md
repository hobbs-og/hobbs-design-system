# @hobbs-og/design-system

The baseline layer behind [hobbs.design](https://hobbs.design): design tokens
and the CSS primitives built on them. Tokens, element defaults, atoms,
molecules, and a grid — the parts that are true of any product, extracted so
they stop being copied.

What is deliberately **not** here: page organisms, layouts, and content
components. Those belong to the product that renders them. A design system
that ships someone's hero section isn't a system, it's a theme.

```
tokens/base/*.json  ──▶  tokens/semantic/*.json  ──▶  tokens/component/*.json
subatomic                roles                        per-component
raw values               aliases only                 aliases only
        │
        └── Style Dictionary ──▶ dist/tokens.css · tokens.mjs · tokens.d.ts
                                          │
                                     styles/ consumes it
```

---

## Install

```bash
npm i -D github:hobbs-og/hobbs-design-system#v1.0.0
```

Pin the tag. `main` is where work happens; tags are what products build against.

`dist/` is committed on purpose — npm runs no build step when installing from a
git ref, so compiled tokens have to be in the tree or they arrive empty.

## Use

### Plain HTML / no bundler

Copy `styles/`, `dist/`, and `assets/` out of `node_modules` into a vendor
directory at build time, preserving the relative structure (`styles/base/fonts.css`
reaches `../../assets/fonts/`). Then one link tag:

```html
<link rel="stylesheet" href="/vendor/design-system/styles/index.css">
```

`styles/index.css` pulls in `dist/tokens.css` itself, so that is the only tag
you need.

### With a bundler

```js
import '@hobbs-og/design-system/styles'   // tokens + every primitive
```

Or take the pieces:

```js
import '@hobbs-og/design-system/tokens.css'
import '@hobbs-og/design-system/styles/atoms/button.css'
```

### Token values in JS

```js
import { colorBrandPrimary500, spaceMd } from '@hobbs-og/design-system'
```

Typed via `dist/tokens.d.ts`.

---

## Typefaces

**Every face is bundled.** There is no font service to wire and no kit id.

- **Inter** — base and display. Self-hosted variable font (weights 100–900,
  optical size 14–32), latin and latin-ext, from `assets/fonts/inter/`.
  With `font-optical-sizing: auto` (the default), text at 32px and up draws
  Inter's display cut and body sizes its text cut, so one family does the job
  the base/display pair used to.
- **JetBrains Mono** — mono. Latin subset, weight 400, 21KB, from
  `assets/fonts/`. Chosen by measurement: at the same nominal size its x-height
  is 1.008 and cap-height 1.003 of Inter's, so inline `<code>` needs no size
  correction to sit inside a sentence.

Both are under the SIL Open Font License; each licence sits beside its files.
The OFL permits embedding in generated documents such as PDFs.

Neue Haas Grotesk (Adobe Fonts) was the face through 1.2.0. It was removed in
1.3.0: a hosted kit meant a third-party request on every page, a CSP
exception, and a network wait inside headless PDF rendering.

To use a different face in a product, override the family tokens after the
stylesheet — and self-host it:

```css
:root {
  --text-family-base: 'Your Face', system-ui, sans-serif;
  --text-family-display: 'Your Face', system-ui, sans-serif;
}
```

---

## Icons

Bootstrap Icons, but no sprite ships here. Two products on this system
reference different icons, so the sprite is a per-project artefact — bundling
one product's would push dead weight to every other.

Write a `<use>` tag with any name from [icons.getbootstrap.com](https://icons.getbootstrap.com):

```html
<svg class="icon" aria-hidden="true">
  <use href="/icons.svg#bi-arrow-right"></use>
</svg>
```

Then generate a sprite holding only the icons your source actually references:

```bash
npx hobbs-icons --out public/icons.svg
```

It scans the directory it runs in (`--scan dir` to narrow it) and fails loudly
on a name that isn't in the library, rather than emitting a silently empty
symbol.

---

## Extending it

A product needs component tokens the system doesn't have. Don't fork, and don't
reach past the semantic layer — add your own component layer that aliases it.

Point your own Style Dictionary config at both token trees, but emit only your
own. The system's tokens are there so aliases resolve; they are already being
delivered by `dist/tokens.css`, so re-emitting them would ship every value
twice and let the two copies drift.

```js
// style-dictionary.config.mjs, in your product
const SYSTEM = 'node_modules/@hobbs-og/design-system/tokens'

export default {
  source: [
    `${SYSTEM}/base/*.json`,       // for alias resolution only
    `${SYSTEM}/semantic/*.json`,   // for alias resolution only
    'tokens/component/*.json',     // yours — the only layer emitted
  ],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [{
        destination: 'tokens.local.css',
        format: 'css/variables',
        filter: (token) => !token.filePath.startsWith(SYSTEM),
        options: { outputReferences: true },
      }],
    },
  },
}
```

Load `tokens.local.css` after the system stylesheet. hobbs.design does exactly
this — see its `style-dictionary.config.mjs` for a working copy.

---

## Rules

1. Everything below `base/` uses semantic tokens only. A raw hex or rem value
   outside `dist/tokens.css` is a bug.
2. The accent red is links and CTAs only.
3. Hierarchy comes from size and opacity, not hue or weight.
4. A component never reaches past the semantic layer. If a rule needs a value
   the semantic layer doesn't have, the layer is missing a role — that is not
   permission to use a primitive directly.
5. Dimensions compile to `rem` (÷16) so user font-size preferences scale the UI.
   Breakpoints stay `px`: media queries can't read custom properties, so those
   tokens document values that are duplicated by hand in CSS.

## Working on it

```bash
npm install
npm run build:tokens     # tokens/*.json -> dist/
npm run watch:tokens     # rebuild on change
```

Commit `dist/` with the token change that produced it — they are one change,
and consumers install the tree as-is.

### Releasing

```bash
npm run build:tokens
git commit -am "…"
git tag v1.1.0 && git push --follow-tags
```

Then bump the ref in each consuming product. Semver against the **public
surface**: custom property names, class names, and the JS export names.
Renaming or removing any of those is a major.

Deeper background on the token layers lives in [`docs/design-tokens.md`](docs/design-tokens.md).
