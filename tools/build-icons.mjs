#!/usr/bin/env node
// Builds an SVG sprite containing only the Bootstrap Icons a project actually
// references, pulled from the full library shipped by the bootstrap-icons
// package. Any of the ~2,000 official names (icons.getbootstrap.com) works by
// referencing it in markup — no copy-pasting path data.
//
// The sprite is a per-project artefact, not a design-system one: two products
// on this system will reference different icons. So this scans the directory
// it is run from, not the package it lives in.
//
//   npx hobbs-icons                      # scan ./, write ./icons.svg
//   npx hobbs-icons --out src/public/icons.svg
//   npx hobbs-icons --scan app --scan lib --out public/icons.svg
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, extname, dirname, resolve, relative } from 'node:path';
import { createRequire } from 'node:module';

const argv = process.argv.slice(2);
const flag = (name) => {
  const out = [];
  for (let i = 0; i < argv.length; i++) if (argv[i] === `--${name}`) out.push(argv[++i]);
  return out;
};

const cwd = process.cwd();
const scanDirs = (flag('scan').length ? flag('scan') : ['.']).map((d) => resolve(cwd, d));
const outPath = resolve(cwd, flag('out')[0] ?? 'icons.svg');

// Resolve bootstrap-icons from the consuming project first, falling back to
// this package's own tree — so it works whether it is hoisted or nested.
const require = createRequire(join(cwd, 'noop.js'));
let spriteSrc;
for (const req of [require, createRequire(import.meta.url)]) {
  try { spriteSrc = req.resolve('bootstrap-icons/bootstrap-icons.svg'); break; } catch {}
}
if (!spriteSrc) {
  console.error('Could not resolve bootstrap-icons. Install it: npm i -D bootstrap-icons');
  process.exit(1);
}

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'vendor']);
const SCAN_EXTS = new Set(['.html', '.htm', '.css', '.js', '.mjs', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.php', '.md']);

function walk(dir, files = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return files; }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry) || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    // Never scan the sprite we are about to overwrite: its own symbol ids
    // would keep every icon alive forever once added.
    if (full === outPath) continue;
    if (stat.isDirectory()) walk(full, files);
    else if (SCAN_EXTS.has(extname(entry))) files.push(full);
  }
  return files;
}

const used = new Set();
for (const dir of scanDirs) {
  for (const file of walk(dir)) {
    for (const m of readFileSync(file, 'utf8').matchAll(/#bi-([a-z0-9]+(?:-[a-z0-9]+)*)/g)) used.add(m[1]);
  }
}

if (used.size === 0) {
  console.log('No #bi-{name} references found — nothing to build.');
  process.exit(0);
}

const symbols = new Map();
for (const m of readFileSync(spriteSrc, 'utf8').matchAll(/<symbol\b([^>]*)>([\s\S]*?)<\/symbol>/g)) {
  const id = m[1].match(/\bid="([a-z0-9-]+)"/);
  const viewBox = m[1].match(/\bviewBox="([^"]+)"/);
  if (id) symbols.set(id[1], { viewBox: viewBox ? viewBox[1] : '0 0 16 16', body: m[2].trim() });
}

const missing = [];
const found = [];
for (const name of [...used].sort()) {
  const symbol = symbols.get(name);
  if (!symbol) { missing.push(name); continue; }
  found.push(`  <symbol id="bi-${name}" viewBox="${symbol.viewBox}">${symbol.body}</symbol>`);
}

if (missing.length) {
  console.error(`Icon name(s) not found in bootstrap-icons: ${missing.join(', ')}`);
  console.error('Check the exact name at https://icons.getbootstrap.com');
  process.exit(1);
}

const output = `<!--
  icons.svg — Bootstrap Icons sprite (https://icons.getbootstrap.com/)
  MIT licensed, https://github.com/twbs/icons/blob/main/LICENSE.md

  GENERATED FILE — do not hand-edit. Rebuilt by \`npx hobbs-icons\`, which pulls
  only the icons referenced as #bi-{name} in this project's source.

  Usage: <svg class="icon" aria-hidden="true"><use href="/icons.svg#bi-arrow-right"><\\/use><\\/svg>

  (closing tags above are backslash-escaped on purpose: some dev servers,
  e.g. VS Code's Live Server, inject a reload script by naively matching
  the first literal closing tag anywhere in a response body, even inside
  a comment. An unescaped example here previously got spliced with that
  injected script, corrupting the real sprite below it.)

  To use a new icon: write the <use> tag with any name from
  icons.getbootstrap.com, then re-run the command.
-->
<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
${found.join('\n')}
</svg>
`;

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, output);
console.log(`Wrote ${found.length} icon(s) to ${relative(cwd, outPath)}: ${[...used].sort().join(', ')}`);
