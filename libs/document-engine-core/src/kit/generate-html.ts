import type { Extensions, JSONContent } from '@tiptap/core';

import { defaultExtensions } from './default-extensions';

/**
 * Serialize a Tiptap/ProseMirror document (JSON) to an HTML string.
 *
 * Environment-aware and Node-safe. Tiptap ships two serializers and the wrong
 * one throws:
 * - `@tiptap/html` needs a real `document` (browser / jsdom).
 * - `@tiptap/html/server` is backed by happy-dom and runs headlessly in Node.
 *
 * The serializer is chosen at call time from whether a DOM is present, and
 * imported lazily — so the heavy happy-dom build is never pulled into a browser
 * editor bundle that only ever edits (and never serializes server-side), and
 * Node backends never touch the browser-only build. This is why the function is
 * async.
 *
 * @param doc        The document as ProseMirror JSON (a `doc` node).
 * @param extensions Schema to serialize against. Defaults to
 *                   {@link defaultExtensions} (the editor's canonical kit). Pass
 *                   a custom array when your documents use a different schema.
 * @returns Semantic HTML. Presentation styling and sanitization (e.g. DOMPurify)
 *          are the consumer's responsibility — this helper does neither.
 */
export async function generateHTML(doc: JSONContent, extensions: Extensions = defaultExtensions): Promise<string> {
  if (typeof document !== 'undefined') {
    // browser / jsdom: uses the ambient DOM
    const serializer = await import('@tiptap/html');
    return serializer.generateHTML(doc, extensions);
  }

  // Node: happy-dom backed, no real DOM needed. The specifier is built at runtime
  // (not a static string literal) and flagged for webpack/vite so browser
  // bundlers (esbuild/webpack/vite) can't statically resolve it and therefore
  // never pull happy-dom — and its Node built-ins — into a client bundle. The
  // `typeof document` guard means this branch never executes in a browser anyway.
  const serverEntry = ['@tiptap', 'html', 'server'].join('/');
  const serializer = await import(/* webpackIgnore: true */ /* @vite-ignore */ serverEntry);
  return serializer.generateHTML(doc, extensions);
}
