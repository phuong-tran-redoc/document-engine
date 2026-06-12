/**
 * The result a consumer's media picker resolves to.
 *
 * Returned by the async `image.onPick` config hook. The shape is intentionally
 * minimal and presentation-light: `id` is the opaque media reference (inserted as
 * an `image-ref` node when that node is enabled), `url` is the resolved address
 * (used for a plain image fallback), and `alt` is an optional text hint.
 */
export interface MediaResult {
  /** Opaque media id — inserted as an `image-ref` node when available. */
  id: string;
  /** Resolved image URL — used for a plain `<img>` fallback. */
  url: string;
  /** Optional alternative text. */
  alt?: string;
}

/**
 * Async hook a consumer provides via `image.onPick` to supply images from its own
 * media library. Resolving `null`/`undefined` (or rejecting) is treated as a
 * cancel — the editor inserts nothing and stays usable.
 */
export type ImagePickHook = () => Promise<MediaResult | null | undefined>;
