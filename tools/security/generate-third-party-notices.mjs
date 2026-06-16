#!/usr/bin/env node
/**
 * Generate THIRD-PARTY-NOTICES.txt for a published package.
 *
 *   node tools/security/generate-third-party-notices.mjs <distDir>
 *
 * The published `dist/` has no `node_modules`, so the authoritative production
 * closure is the hoisted workspace root (the same surface the security-gate
 * license allowlist already scans). We therefore enumerate the full production
 * closure once and ship the same notices in every package — this never
 * under-reports a bundled dependency (the legal concern), at the cost of a small
 * superset. MIT requires no NOTICE; Apache-2.0 §4(d) does, so we locate and
 * append any NOTICE file shipped by an Apache-2.0 dependency (e.g. rxjs).
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = process.argv[2];
if (!distDir) {
  console.error('usage: generate-third-party-notices.mjs <distDir>');
  process.exit(1);
}

const raw = execSync(
  'npx --yes license-checker-rseidelsohn --start . --production --excludePrivatePackages --json',
  { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
);

const entries = Object.entries(JSON.parse(raw))
  // exclude our own (private/self) packages — they carry their own LICENSE.md
  .filter(([name]) => !name.startsWith('@phuong-tran-redoc/'))
  .sort(([a], [b]) => a.localeCompare(b));

const lines = [
  'THIRD-PARTY SOFTWARE NOTICES',
  '',
  'The Document Engine packages bundle or depend on the third-party software listed',
  'below (the full production dependency closure). Each is distributed under its own',
  'license; the full license text ships within each package in node_modules and is',
  'available at the linked repository.',
  '',
  '='.repeat(78),
  '',
];

const apacheNotices = [];
for (const [name, info] of entries) {
  lines.push(name);
  lines.push(`  license: ${info.licenses || 'UNKNOWN'}`);
  if (info.repository) lines.push(`  repository: ${info.repository}`);
  if (info.publisher) lines.push(`  publisher: ${info.publisher}`);
  lines.push('');

  if (/Apache/i.test(info.licenses || '') && info.path && existsSync(info.path)) {
    const noticeFile = readdirSync(info.path).find((f) => /^NOTICE/i.test(f));
    if (noticeFile) {
      apacheNotices.push(`----- NOTICE from ${name} -----\n${readFileSync(join(info.path, noticeFile), 'utf8')}`);
    }
  }
}

if (apacheNotices.length) {
  lines.push('='.repeat(78));
  lines.push('APACHE-2.0 NOTICE FILES (required by Apache-2.0 §4(d))');
  lines.push('='.repeat(78));
  lines.push('');
  lines.push(apacheNotices.join('\n\n'));
  lines.push('');
}

const out = join(distDir, 'THIRD-PARTY-NOTICES.txt');
writeFileSync(out, lines.join('\n') + '\n');
console.log(`Wrote ${out} (${entries.length} third-party packages, ${apacheNotices.length} Apache NOTICE file(s))`);
