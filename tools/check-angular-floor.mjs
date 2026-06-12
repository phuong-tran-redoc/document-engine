#!/usr/bin/env node
/**
 * Angular peer-floor guard (static / layer 1).
 *
 * The published `@phuong-tran-redoc/document-engine-angular` declares an Angular
 * peer floor of `>=16.0.0` (see ADR-006). The workspace, however, develops on
 * Angular 20 — so it is easy to accidentally use syntax/APIs newer than the floor
 * (signal inputs, built-in control flow, …) which would break consumers on older
 * Angular even though the lib builds fine here.
 *
 * This script scans the lib source for a denylist of post-16 APIs and exits
 * non-zero on any hit. It runs locally (`pnpm guard:ng-floor`) and as a BLOCKING
 * step in `security-gate.yml`, which `publish.yml` requires — so a violation blocks
 * both PRs and publish.
 *
 * `standalone: true` is intentionally NOT banned: it works on Angular 16 (the floor).
 * The heavier real-floor-Angular compile job (layer 2, pinned Angular 16) is what
 * authoritatively proves installability, including standalone and the APF
 * partial-declaration linker version.
 *
 * Usage: node tools/check-angular-floor.mjs [scanRoot]
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SCAN_ROOT = process.argv[2] ?? 'libs/document-engine-angular/src';
const SCAN_EXT = ['.ts', '.html'];
const SKIP_FILE = /\.(spec|test)\.ts$/;

/**
 * Each rule: a regex that matches *real usage* (not prose), the API, and the Angular
 * version that introduced it. Calibrated to the floor (>=16): Angular-16 APIs
 * (signals, `@Input({…})`, `takeUntilDestroyed`, rxjs-interop) are ALLOWED; only
 * APIs newer than the floor (17+: signal inputs/queries, built-in control flow) are
 * banned. If the floor changes, recalibrate this list + the ng-floor-compat fixture.
 */
const RULES = [
  { re: /=\s*input\s*(\.\s*required)?\s*[(<]/, api: 'signal input()', since: '17.1' },
  { re: /=\s*output\s*[(<]/, api: 'signal output()', since: '17.3' },
  { re: /=\s*model\s*(\.\s*required)?\s*[(<]/, api: 'model()', since: '17.2' },
  { re: /=\s*(viewChild|viewChildren|contentChild|contentChildren)\s*(\.\s*required)?\s*[(<]/, api: 'signal query (viewChild/contentChild)', since: '17.2' },
  // Built-in control flow (also catches inline templates inside .ts template literals).
  { re: /@(if|for|switch|defer|let)\b/, api: 'control flow @if/@for/@switch/@defer/@let', since: '17.0' },
];

/** Blank out comments while preserving line count, so prose mentioning a banned API never trips a rule. */
function stripComments(src) {
  const blankKeepNewlines = (m) => m.replace(/[^\n]/g, ' ');
  src = src.replace(/\/\*[\s\S]*?\*\//g, blankKeepNewlines); // /* block */
  src = src.replace(/<!--[\s\S]*?-->/g, blankKeepNewlines); //  <!-- html -->
  return src
    .split('\n')
    .map((line) => {
      const m = line.match(/^(.*?)(?<!:)\/\/.*$/); // // line comment, but keep http(s)://
      return m ? m[1] : line;
    })
    .join('\n');
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (SCAN_EXT.some((ext) => entry.endsWith(ext)) && !SKIP_FILE.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const violations = [];
for (const file of walk(SCAN_ROOT)) {
  const lines = stripComments(readFileSync(file, 'utf8')).split('\n');
  lines.forEach((line, i) => {
    for (const rule of RULES) {
      if (rule.re.test(line)) {
        violations.push({ file: relative(process.cwd(), file), line: i + 1, api: rule.api, since: rule.since });
      }
    }
  });
}

if (violations.length === 0) {
  console.log(`✓ angular-floor guard: no Angular APIs newer than the >=16 peer floor in ${SCAN_ROOT}`);
  process.exit(0);
}

console.error(`\n✘ angular-floor guard: ${violations.length} use(s) of Angular APIs newer than the declared peer floor (>=16):\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  — ${v.api} (Angular ${v.since}+)`);
}
console.error(
  `\nThe lib is published with peer \`@angular/* >=16.0.0\`. Either rewrite the above using\n` +
    `Angular-16-compatible syntax, or (deliberately) raise the peer floor + update ADR-006.\n`,
);
process.exit(1);
