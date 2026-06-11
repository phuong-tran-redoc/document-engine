#!/usr/bin/env node
// Pre-publish tarball-content gate. Runs `npm pack --dry-run --json` in a built package
// directory and FAILS if the would-be-published tarball contains sensitive files or has no
// LICENSE. This is the hard guarantee that secrets/junk never reach npm.
//
// Usage: node tools/security/verify-tarball.mjs <package-dir>
// Spec: .context/ops/security-legal-gate.md

import { execFileSync } from 'node:child_process';

const dir = process.argv[2];
if (!dir) {
  console.error('usage: verify-tarball.mjs <package-dir>');
  process.exit(2);
}

// Files that must never ship.
const DENY = /(^|\/)\.env|\.pem$|\.key$|(^|\/)\.npmrc$|id_rsa|(^|\/)\.git(\/|$)|\.local\./i;

let files;
try {
  const out = execFileSync('npm', ['pack', '--dry-run', '--json'], { cwd: dir, encoding: 'utf8' });
  files = JSON.parse(out)[0].files.map((f) => f.path);
} catch (err) {
  console.error(`[${dir}] failed to inspect tarball: ${err.message}`);
  process.exit(2);
}

const sensitive = files.filter((p) => DENY.test(p));
const hasLicense = files.some((p) => /(^|\/)LICENSE(\.md|\.txt)?$/i.test(p));

let failed = false;
if (sensitive.length) {
  console.error(`[${dir}] BLOCKED — tarball would publish sensitive files:`);
  sensitive.forEach((p) => console.error(`    ${p}`));
  failed = true;
}
if (!hasLicense) {
  console.error(`[${dir}] BLOCKED — no LICENSE file in the tarball`);
  failed = true;
}

console.log(`[${dir}] ${files.length} files, license=${hasLicense ? 'yes' : 'NO'}`);
process.exit(failed ? 1 : 0);
