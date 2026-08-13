#!/usr/bin/env node
/**
 * CSS portability gate — `pnpm gate:css`
 *
 * DE-016 fixed a class of defect that is invisible in this repo: the published
 * libraries looked correct in `apps/document-engine` while being broken in any
 * consumer app, because the demo's own `tailwind.config.js` happened to define
 * every theme key the library's templates reached for, and the demo is
 * light-mode and full-page. The demo cannot catch a portability defect by
 * construction, so these three rules are the guard instead.
 *
 * 1. NO HOST-THEME UTILITIES — a library template must not use a Tailwind
 *    utility whose existence depends on the *host* app extending its theme
 *    (`bg-card`, `border-border`, `shadow-elevation-2`, `z-30`, `hidden`, …).
 *    In an app without those keys the class name generates no rule at all, so
 *    panels render with no background, no border and no stacking order.
 *
 * 2. NO HARDCODED THEME COLOUR IN VIEW STYLESHEETS — every colour in
 *    `views/**\/*.scss` must resolve from a CSS custom property, or a dark-mode
 *    consumer gets near-black text on a near-black panel.
 *
 * 3. EVERY TOKEN IS DOCUMENTED — a `var(--x)` the library reads must appear in
 *    `docs/THEMING.md`, which is the published theming contract. An undocumented
 *    token is one a consumer cannot know to define.
 *
 * Usage: node tools/check-css-portability.mjs
 * Exit code 1 on any violation.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const LIB_DIRS = [
  join(ROOT, 'libs/document-engine-angular/src'),
  join(ROOT, 'libs/document-engine-core/src'),
];
const CONTRACT = join(ROOT, 'docs/THEMING.md');

/** Utilities that only exist if the HOST app extends its Tailwind theme. */
const HOST_THEME_UTILITIES = [
  // Colour keys the demo app happens to define in theme.extend.colors
  /\bbg-(?:card|popover|background|muted|accent|primary|secondary|destructive|sidebar)\b/,
  /\btext-(?:card|popover|accent|primary|secondary|sidebar|muted|destructive)-foreground\b/,
  /\bborder-(?:border|input|card|popover|sidebar)\b/,
  /\bring-ring\b/,
  // Elevation keys the demo app defines in theme.extend.boxShadow
  /\bshadow-elevation-[123]\b/,
  // Utilities that are load-bearing for layout/visibility rather than looks:
  // a missing `hidden` leaves a closed panel's box in the flow, and a missing
  // z-index puts a floating panel behind the content it floats over.
  /\bz-\d+\b/,
  /(?:^|["'\s:])hidden(?:["'\s]|$)/,
];

/** Documented exception: an alpha checkerboard is a pattern, not a theme colour. */
const CHECKERBOARD = /repeating-conic-gradient\(/;

const HEX_COLOUR = /#[0-9a-fA-F]{3,8}\b/;

const violations = [];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = LIB_DIRS.flatMap((d) => walk(d));
const rel = (f) => relative(ROOT, f);

// ---------------------------------------------------------------- rule 1
for (const file of files) {
  if (!/\.(ts|html)$/.test(file) || /\.spec\.ts$/.test(file)) continue;
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    // Only class attributes / class bindings can carry utilities.
    if (!/\bclass\b|\[class\./.test(line)) return;
    for (const pattern of HOST_THEME_UTILITIES) {
      const m = line.match(pattern);
      if (m) {
        violations.push(
          `${rel(file)}:${i + 1}  host-theme utility "${m[0].trim()}" — ` +
            `resolves to nothing in an app that does not extend its Tailwind theme. ` +
            `Ship the style in the library's own CSS instead.`,
        );
      }
    }
  });
}

// ---------------------------------------------------------------- rule 2
for (const file of files) {
  if (!/\/views\/.*\.scss$/.test(file)) continue;
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (CHECKERBOARD.test(line)) return;
      const m = line.match(HEX_COLOUR);
      if (m) {
        violations.push(
          `${rel(file)}:${i + 1}  hardcoded colour "${m[0]}" — ` +
            `use a token, e.g. var(--border, hsl(214.3 31.8% 91.4%)). ` +
            `Hardcoded light hex is unreadable on a dark surface.`,
        );
      }
    });
}

// ---------------------------------------------------------------- rule 3
const contract = readFileSync(CONTRACT, 'utf8');
const documented = new Set([...contract.matchAll(/--[a-z0-9-]+/g)].map((m) => m[0]));
const undocumented = new Map(); // token -> first location

for (const file of files) {
  if (!/\.(scss|css|ts|html)$/.test(file) || /\.spec\.ts$/.test(file)) continue;
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      for (const m of line.matchAll(/var\((--[a-z0-9-]+)/g)) {
        const token = m[1];
        if (documented.has(token) || undocumented.has(token)) continue;
        undocumented.set(token, `${rel(file)}:${i + 1}`);
      }
    });
}
for (const [token, where] of undocumented) {
  violations.push(
    `${where}  token "${token}" is read by the library but is not listed in ` +
      `docs/THEMING.md — a consumer has no way to know it must define it.`,
  );
}

// ---------------------------------------------------------------- report
if (violations.length) {
  console.error(`\n✗ CSS portability gate: ${violations.length} violation(s)\n`);
  for (const v of violations) console.error(`  ${v}`);
  console.error('\nContract: docs/THEMING.md\n');
  process.exit(1);
}

console.log('✓ CSS portability gate: no host-theme utilities, no hardcoded view colours, all tokens documented.');
