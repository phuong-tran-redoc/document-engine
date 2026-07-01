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
// Usage: node tools/security/verify-esm-load.mjs <built-package-dir>
// Spec: .context/tasks/de-014-core-esm-packaging-fix.md

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
    { cwd: tmp, stdio: 'inherit' },
  );

  console.log(`[${name}] Node-ESM load OK`);
} catch (err) {
  console.error(`[${name}] BLOCKED — package does not load under bare Node ESM: ${err.message}`);
  process.exit(1);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
