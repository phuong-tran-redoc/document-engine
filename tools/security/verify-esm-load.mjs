#!/usr/bin/env node
// Node-ESM runtime load gate (DE-014). Packs a built package, installs the tarball into a
// throwaway dir with its real production deps, and imports it under the BARE Node ESM loader.
// FAILS on any resolution/load error — most importantly `ERR_UNSUPPORTED_DIR_IMPORT`, the
// class of bug that shipped in core ≤0.1.1 (swc transpiled `export * from './constants'`
// verbatim into a `"type":"module"` package with no `exports` map, so Node's strict loader
// rejected the extensionless directory re-exports at runtime).
//
// Why this exists and publint/attw did NOT catch it:
//   - publint validates package.json wiring (exports/main/types point at files that exist,
//     format consistency). It never resolves or executes the module's INTERNAL relative
//     imports, so `export * from './constants'` (a directory) passed.
//   - attw validates TYPE (.d.ts) resolution. Its `internal-resolution-error` rule would have
//     flagged the extensionless .d.ts re-exports — but the gate ignores that rule (the barrels
//     are bundler-resolvable and we target ESM/bundler consumers). It also checks types, not
//     the runtime JS graph.
//   Neither tool loads the JS under bare Node, so the runtime crash went unseen until a
//   Node consumer (the portfolio API) hit it. This check closes that gap.
//
// It also runs the CKEditor compatibility layer headlessly (createCkDomParser + happy-dom), the way
// a backend would, when the package exports it.
//
// Usage: node tools/security/verify-esm-load.mjs <built-package-dir>
// Background: docs/decisions.md (ADR-007) and the core ESM packaging fix released in 0.1.2.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const dir = process.argv[2];
if (!dir) {
  console.error('usage: verify-esm-load.mjs <built-package-dir>');
  process.exit(2);
}

const name = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).name;

const CK_PROBE = `
const core = await import(__NAME__);
if (!core.createCkDomParser) process.exit(0);
const { generateJSON } = await import('@tiptap/html/server');
const source =
  '<div class="ck ck-content ck-print"><p style="text-align:center;margin-left:36pt;line-height:14.0pt;">Dear ' +
  '<span class="red-dynamic-field inline-field redr-handlebar-field red-dynamic-field--has-value" id="red-dynamic-field__name" ' +
  'name="Name" background="false" dynamicfieldname="Name" value="Name" type="textbox:text">{{name}}</span>,</p>' +
  '<figure class="table" style="width:100%;"><table class="ck-table-resized"><colgroup><col style="width:40%;"><col style="width:60%;">' +
  '</colgroup><tbody><tr><td style="border:1px solid hsl(0, 0%, 0%);">a</td><td>&nbsp;</td></tr></tbody></table></figure>' +
  '<p><i>b</i></p></div>';
const extensions = [...core.defaultExtensions, core.Indent, core.CkCompat];
const domParser = await core.createCkDomParser();
const { html, wrapperClass } = core.fromCkHtml(source, { domParser });
const saved = core.toCkHtml(await core.generateHTML(generateJSON(html, extensions), extensions), { wrapperClass, domParser });
if (saved !== source) {
  console.error('CKEditor round-trip differs under Node:\\n  expected ' + source + '\\n  actual   ' + saved);
  process.exit(1);
}
console.log('CKEditor round-trip OK under Node');
`;
const tmp = mkdtempSync(join(tmpdir(), 'esm-load-'));

try {
  // Pack the built package exactly as it would publish.
  const packed = JSON.parse(execFileSync('npm', ['pack', '--json'], { cwd: dir, encoding: 'utf8' }));
  const tarball = resolve(dir, packed[0].filename);

  // Fresh consumer: install the tarball + its real prod deps, no lifecycle scripts.
  writeFileSync(join(tmp, 'package.json'), JSON.stringify({ name: 'esm-load-probe', private: true }));
  execFileSync('npm', ['install', '--omit=dev', '--ignore-scripts', '--no-audit', '--no-fund', tarball], {
    cwd: tmp,
    stdio: 'inherit',
  });

  // Import under the bare Node ESM loader — the moment of truth. Any dir-import / resolution
  // failure throws here and fails the gate.
  execFileSync(
    process.execPath,
    ['--input-type=module', '-e', `await import(${JSON.stringify(name)}); console.log('ok');`],
    { cwd: tmp, stdio: 'inherit' }
  );

  // Backend use of the CKEditor compatibility layer: no global DOM, the parser comes from
  // createCkDomParser() (happy-dom, installed alongside @tiptap/html). HTML -> editor JSON -> HTML
  // must come back byte-identical, which exercises happy-dom's parsing, serialization and CSS.
  writeFileSync(join(tmp, 'ck-probe.mjs'), CK_PROBE.replace('__NAME__', JSON.stringify(name)));
  execFileSync(process.execPath, ['ck-probe.mjs'], { cwd: tmp, stdio: 'inherit' });

  console.log(`[${name}] Node-ESM load OK`);
} catch (err) {
  console.error(`[${name}] BLOCKED — package does not load under bare Node ESM: ${err.message}`);
  process.exit(1);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
