#!/usr/bin/env node
/**
 * Generates tokens/base/color-reference.json — a Material 3 style reference
 * palette: 12 hues, evenly spaced 30° apart around the HCT hue wheel, each
 * expanded to the full M3 tonal scale (13 stops: 0/10/20/30/40/50/60/70/80/
 * 90/95/99/100) via Google's own material-color-utilities (HCT color space),
 * not hand-picked hex.
 *
 * These are unassigned raw values — no semantic or component token
 * references them yet. Regenerate with `npm run build:reference-palette`
 * after changing HUES or CHROMA below; commit the resulting JSON same as any
 * other token change.
 */

import { writeFileSync } from 'node:fs'
// Imported by relative file path, not the bare package specifier — the
// package's exports map only publishes ".", and its root index.js re-exports
// scheme/scheme_content.js, which has a broken extensionless internal import
// in material-color-utilities@0.4.0. TonalPalette/hexFromArgb don't need
// that module, and a relative path import bypasses the exports map entirely.
import { TonalPalette } from '../node_modules/@material/material-color-utilities/palettes/tonal_palette.js'
import { hexFromArgb } from '../node_modules/@material/material-color-utilities/utils/string_utils.js'

const CHROMA = 48 // M3 "vivid" chroma — matches Material Theme Builder's default vibrant seed
const TONES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100]

// 12 hues, 30° apart, starting at HCT hue 0 (red-leaning).
const HUES = [
  ['red', 0],
  ['orange', 30],
  ['amber', 60],
  ['yellow', 90],
  ['lime', 120],
  ['green', 150],
  ['teal', 180],
  ['cyan', 210],
  ['blue', 240],
  ['indigo', 270],
  ['violet', 300],
  ['purple', 330],
]

const reference = {}

for (const [name, hue] of HUES) {
  const palette = TonalPalette.fromHueAndChroma(hue, CHROMA)
  reference[name] = {}
  for (const tone of TONES) {
    reference[name][String(tone)] = {
      $value: hexFromArgb(palette.tone(tone)),
      $type: 'color',
    }
  }
}

const output = {
  color: {
    reference,
  },
}

const path = new URL('../tokens/base/color-reference.json', import.meta.url)
writeFileSync(path, JSON.stringify(output, null, 2) + '\n')
console.log(`Wrote ${HUES.length} hues × ${TONES.length} tones to tokens/base/color-reference.json`)
