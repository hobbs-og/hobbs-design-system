# @hobbs-og/design-system — reference

The baseline layer for every product Mark Hobbs builds: design tokens and the
CSS primitives built on them. **This file is the complete reference.** If you
are consuming this system in another project, you should not need to open
anything else — not the source, not GitHub, not the web.

> **Reading this from a consuming project?** This file ships inside the
> package. It is always at:
> ```
> node_modules/@hobbs-og/design-system/CLAUDE.md
> ```
> The compiled custom properties you can grep for real values are at
> `node_modules/@hobbs-og/design-system/dist/tokens.css`, and the stylesheets
> are under `styles/`. Everything is local — no network needed.

**What this is not:** a component library for pages. No organisms, no layouts,
no content components. Those belong to the product that renders them. A design
system that ships someone's hero section is a theme, not a system.

---

## Install

```bash
npm i -D github:hobbs-og/hobbs-design-system#v1.0.0
```

Pin the tag. `main` is where work happens; tags are what products build against.

### Consume — bundler

```js
import '@hobbs-og/design-system/styles'      // tokens + every primitive
import { spaceMd, colorBrandPrimary600 } from '@hobbs-og/design-system'
```

### Consume — plain HTML, no bundler

Copy `styles/`, `dist/` and `assets/` out of `node_modules` into a vendor
directory, **preserving the relative structure** — `styles/base/fonts.css`
reaches `../../assets/fonts/`, and `styles/index.css` reaches `../dist/`.

```html
<link rel="stylesheet" href="/vendor/design-system/styles/index.css">
```

`styles/index.css` imports `dist/tokens.css` itself. One tag is enough.

---

## Invariants — do not break these

1. **`dist/` is committed on purpose.** Installing from a git ref runs no build
   step, so uncommitted output arrives empty. Never add `dist/` to
   `.gitignore`. This is the single most expensive mistake available here.
2. **Never edit a vendored copy.** Changes to `vendor/design-system/` are
   silently reverted by the next vendor run. Fix it upstream, tag, re-install.
3. **Never fork to change a value.** Change the token, or add the missing
   semantic role. A fork is how one system becomes four.
4. **Neue Haas Grotesk is not bundled** — it is a licensed Typekit face and
   cannot be redistributed. Consumers load their own kit or override
   `--text-family-base` / `--text-family-display`. JetBrains Mono *is* bundled,
   under the OFL that sits beside it in `assets/fonts/`.
5. **Semver is against the public surface**: custom property names, class
   names, JS export names. Renaming or removing any of those is a major.

---

## Principles

1. **One direction of dependency.** base → semantic → component. Never
   backwards, never skipping.
2. **Only `tokens/base/` may hold a raw value.** A hex or rem literal anywhere
   else — any stylesheet, any product — is a bug.
3. **A component never reaches past the semantic layer.** If a rule needs a
   value the semantic layer doesn't have, the layer is missing a role. That is
   a change to make upstream, not permission to use a primitive.
4. **The accent red is links and CTAs only.** Not borders, not icons, not
   decoration. One sanctioned exception, below.
5. **Hierarchy comes from size and opacity, not hue or weight.**
6. **Spacing is a strict 8px grid.** No 4s, no 12s. If a gap isn't divisible by
   eight, it isn't in the system.
7. **No inline styles, ever.** A rule needs a class in a stylesheet.
8. **Dimensions compile to rem** (÷16) so user font-size preferences scale the
   UI. Breakpoints stay px-authored-as-rem: media queries can't read custom
   properties, so those tokens document values duplicated by hand in CSS.

---

## Token architecture

```
tokens/base/*.json  ──▶  tokens/semantic/*.json  ──▶  tokens/component/*.json
subatomic                roles                        per-component
raw values               aliases only                 aliases only
        │
        └── Style Dictionary v4 ──▶ dist/tokens.css · tokens.mjs · tokens.d.ts
```

Authored as W3C-format JSON (`$value` / `$type`). Semantic vars emit as
`var()` chains, so the layer structure stays inspectable in DevTools — you can
trace `--text-color-link` back to `--color-brand-primary-600` in the inspector.

Semantic names read **element-property-role**: `--text-color-link` is what it
styles, which property, in what job.

```bash
npm run build:tokens     # tokens/*.json -> dist/
npm run watch:tokens
```

Commit `dist/` with the token change that produced it. They are one change.

---

## Reference — which token to reach for

### Text color

| Token | Job |
|---|---|
| `--text-color-heading` | Headings. The near-black. |
| `--text-color-default` | Default body-adjacent text |
| `--text-color-body` | Body copy (70% black) |
| `--text-color-subtle` | Muted text (60% black — passes AA) |
| `--text-color-disabled` | Disabled only. 40% black, **fails AA** — WCAG exempts it. Never use for live text. |
| `--text-color-knockout` | Text on an inverse surface |
| `--text-color-knockout-muted` | Muted text on an inverse surface |
| `--text-color-link` | Body-size links (`primary-600`, 5.9:1) |
| `--text-color-link-hover` | Link hover (`primary-700`) |
| `--text-color-link-large` | Links ≥24px only (`primary-500`, 4.36:1 — passes at large scale, fails at body size) |

### Surface

`--surface-color-page` · `--surface-color-alt` · `--surface-color-card` ·
`--surface-color-inverse` · `--surface-color-overlay` ·
`--surface-color-highlight` · `--surface-color-raise`

### Border

`--border-color-hairline` · `--border-color-default` · `--border-color-strong` ·
`--border-color-focus`
Widths: `--border-width-hairline` · `-medium` · `-thick` · `-focus`

### Action (links + CTAs only)

`--action-color-default` (600) · `--action-color-hover` (700) ·
`--action-color-active` (800) · `--action-color-accent` (500, large scale) ·
`--action-color-subtle` (100)

### Feedback

`--feedback-color-{success,warning,error}` plus `-bg` and `-text` variants.

### Type scale

| Token | Size |
|---|---|
| `--text-size-display` | 80px |
| `--text-size-heading-xl` | 56px |
| `--text-size-display-sm` | 40px |
| `--text-size-heading-lg` | 32px |
| `--text-size-heading-md` | 24px |
| `--text-size-body-lg` | 24px |
| `--text-size-body` | 16px |
| `--text-size-ui` | 14px |
| `--text-size-caption` | 12px |

Every size has a matching `--text-line-height-*`. Line heights are all 8px
multiples. Tracking is never manipulated: `--text-tracking-default` is 0.

Families: `--text-family-base` · `--text-family-display` · `--text-family-mono`
Weights: `--text-weight-{body,heading,display,emphasis,brand,editorial}`

### Space scale (strict 8px)

| Token | Value |
|---|---|
| `--space-xs` | 8px |
| `--space-sm` | 16px |
| `--space-md` | 24px |
| `--space-lg` | 32px |
| `--space-xl` | 48px |
| `--space-2xl` | 64px |
| `--space-3xl` | 96px |
| `--space-4xl` | 128px |

Layout: `--space-section-x` / `--space-section-y`,
`--space-grid-column-gap` / `--space-grid-row-gap`,
`--space-stack-tight` (8) / `--space-stack-default` (24) / `--space-stack-loose` (48),
`--layout-container-max`, `--container-gutter` (3rem).

### Breakpoints

`--breakpoint-sm` 48rem · `--breakpoint-md` 64rem · `--breakpoint-lg` 80rem.
Media queries are authored in **rem** so layout responds to text zoom, not just
viewport width.

### Motion

`--motion-duration-{ui,enter,sheet,toggle}` · `--motion-easing-{ui,enter,sheet}`

The sheet easing is `cubic-bezier(0.32, 0.72, 0, 1)` — the iOS sheet
presentation curve: fast start, long settle.

**Nothing needs a reduced-motion variant.** `base/reset.css` already collapses
every transition under `prefers-reduced-motion: reduce`. Animate normally.

### Radii

`--radius-none` · `--radius-sm` · `--radius-md` · `--radius-round`

---

## Accessibility contract

These are encoded in the values, not left to the consumer:

- **Muted text is 60% black, not 40%.** 40% measures ~2.6:1 and fails AA. It
  survives only as `disabled`, which WCAG exempts.
- **Body links use `primary-600` (#C11406, 5.9:1).** The brand `#E12A09`
  measures 4.36:1 — under the 4.5:1 AA line for normal text. It remains
  available as `--text-color-link-large` / `--action-color-accent` for type
  ≥24px, where the 3:1 threshold applies.
- **Focus is a token pair.** `--border-color-focus` + `--border-width-focus`
  drive one global `:focus-visible` outline in `styles/base/global.css`. Never
  remove an outline without replacing it.
- Every page gets a skip link (`.skip-link`, styled in `base/global.css`) and
  has `.visually-hidden` available for screen-reader-only text.
- Dark mode is automatic via `prefers-color-scheme` — 39 token overrides. There
  is no toggle and components need no dark-specific rules; they repaint because
  they alias semantic roles.

---

## What ships

**Base** — `fonts.css` (JetBrains Mono @font-face), `reset.css`,
`global.css` (element defaults, focus, skip link, `.visually-hidden`).

**Atoms** — `typography.css`, `link.css`, `button.css`, `chip.css`,
`icon.css`, `media.css` (`.img-frame`).

**Molecules** — `field.css`, `stat.css`, `section-header.css`,
`link-list.css`.

**Layout** — `grid.css`: `.container`, `.section`, `.grid` (12-col),
`.grid--baseline`, `.align` (subgrid), `.span-1` through `.span-12` (every
value, no gaps), `.stack` / `.stack--tight`.

Responsive behaviour is built in — **never hand-roll a grid or add a
breakpoint beside this one.** Below 64rem, spans 1–4 pair up to half a row and
5–11 take the full width; below 48rem everything collapses to a single track.
A hand-rolled grid inherits none of that.

**Component tokens** — button, chip, field, stat. The consumption pattern is in
`button.css`: **variants swap custom properties, never rules.** Most components
ship no component tokens at all, because none of their values needed a
component-level name. That is the test for whether a component earns a token
file.

### The one sanctioned accent exception

The two-color brand rule (`.stat-band__rule`) — a continuous 2px bar, accent
then onyx, changing color on a column boundary. It carries brand identity
rather than decoration. Exposed as `--stat-color-rule-lead` /
`--stat-color-rule-trail`. Any future use aliases those rather than reaching
for the accent, so the exception stays one named thing instead of a loophole.

---

## Extending it in a product

A product needs component tokens the system doesn't have. Don't fork, and don't
reach past the semantic layer. Add your own component layer that aliases it,
and emit **only your own** — the system's values already arrive via its
stylesheet, and emitting them twice lets the two copies drift.

```js
// style-dictionary.config.mjs, in your product
const SYSTEM = 'node_modules/@hobbs-og/design-system/tokens'

export default {
  source: [
    `${SYSTEM}/base/*.json`,       // alias resolution only
    `${SYSTEM}/semantic/*.json`,   // alias resolution only
    'tokens/component/*.json',     // yours — the only layer emitted
  ],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [{
        destination: 'tokens.local.css',
        format: 'css/variables',
        filter: (token) => !token.filePath.includes('@hobbs-og/design-system'),
        options: { outputReferences: true },
      }],
    },
  },
}
```

Load `tokens.local.css` **after** the system stylesheet. Style Dictionary warns
"filtered out token references were found" — that warning is the filter doing
its job.

hobbs.design does exactly this for nav, sheet, case-hero and project-row.

---

## Icons

Bootstrap Icons. **No sprite ships** — two products reference different icons,
so the sprite is a per-project artefact.

```html
<svg class="icon" aria-hidden="true">
  <use href="/icons.svg#bi-arrow-right"></use>
</svg>
```

```bash
npx hobbs-icons --out public/icons.svg     # --scan dir to narrow
```

Scans the project it runs in, pulls only the referenced symbols out of
`bootstrap-icons`, and exits 1 on a name that isn't in the library. Any of the
~2,000 names at icons.getbootstrap.com works. The output is generated — don't
hand-edit it.

Arrows and non-letterform glyphs always go through icons, never literal
unicode (→ ↓ ↗).

**Gotcha:** `reset.css` sets `svg { display: block }`, so `icon.css` forces
`.icon { display: inline-block }`. Any *new* inline SVG usage needs the same,
or it generates its own block box and wraps onto its own line. Also don't rely
on incidental whitespace for the gap next to an icon — browsers collapse it.
`.button` uses `inline-flex` + `gap` for exactly this reason.

---

## Release

```bash
npm run build:tokens
git commit -am "…"
git tag v1.1.0 && git push --follow-tags
```

`--follow-tags` matters: consumers pin a tag, and a tag that never reaches the
remote fails their install confusingly.

Then in each product: bump the ref, `npm install`, re-vendor if it vendors,
commit the result.

---

## Known rough edges

Honest notes, not tasks. **Do not "fix" these without asking Mark** — several
are breaking changes to the public surface, and design decisions are his.

- **Duplicate semantic aliases** survive from an earlier rename, both live:
  `--radius-*` / `--border-radius-*`, `--control-toggle*` / `--control-size-toggle*`,
  `--duration-*` / `--motion-duration-*`, `--blur-subtle` / `--effect-blur-subtle`,
  `--container-max-width` / `--layout-container-max`, `--section-padding` /
  `--space-section-*`. Prefer the longer, role-named form. Removing the short
  ones is a major version.
- **`--xray-color-*` tokens ship here** but the `.xray` CSS that uses them
  stayed in the portfolio. Either the tokens should follow, or the overlay
  should come here as a dev utility.
- The Typekit dependency means a fresh consumer sees fallback sans until they
  wire a kit. There is no build-time warning for this.
