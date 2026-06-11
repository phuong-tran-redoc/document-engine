# Security Policy

## Supported versions

This project follows semantic versioning. Security fixes are released against the **latest published minor
line** of each package. Older versions are not maintained — upgrade to the latest release to receive fixes.

| Package | Supported |
|---|---|
| `@phuong-tran-redoc/document-engine-core` | latest release |
| `@phuong-tran-redoc/document-engine-angular` | latest release |

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Report privately via one of:

- GitHub **Private vulnerability reporting** (Security tab → "Report a vulnerability") on
  <https://github.com/phuong-tran-redoc/document-engine>, or
- Email **tdp99.business@gmail.com** with subject `SECURITY: document-engine`.

Please include: affected package(s) and version(s), a description of the issue, reproduction steps or a
proof-of-concept, and the impact you foresee.

### What to expect

- **Acknowledgement** within 5 business days.
- An assessment and, if confirmed, a coordinated fix and release.
- Credit in the release notes if you'd like it (let us know).

Please give us a reasonable window to release a fix before any public disclosure.

## Supply-chain & provenance

Published packages are built and published from CI using **OIDC Trusted Publishing** (no long-lived npm
tokens) with **Sigstore build provenance** (`--provenance`). Consumers can verify what they install:

```bash
npm audit signatures
```

Releases pass a pre-publish gate that includes dependency vulnerability scanning, secret scanning,
license compliance, and tarball-content verification before any package reaches the registry.
