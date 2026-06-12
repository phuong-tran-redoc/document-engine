/**
 * Type shim for the `@tiptap/html/server` subpath.
 *
 * `@tiptap/html` only exposes its Node-safe (`/server`) entry through the
 * package `exports` map. This library compiles under `moduleResolution: node10`,
 * which ignores `exports` for type resolution, so TypeScript cannot find the
 * subpath's declarations on its own. The runtime (Jest/Node) resolves `/server`
 * via the exports map fine — this declaration only satisfies the type checker by
 * pointing it at the same public types as the bare package.
 */
declare module '@tiptap/html/server' {
  export * from '@tiptap/html';
}
