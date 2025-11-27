import { InjectionToken } from '@angular/core';

/**
 * Type definition for HTML preprocessor function.
 * Allows clients to transform HTML content before it's set into the editor.
 *
 * @param html - The raw HTML string to be processed
 * @returns The processed HTML string that will be set into the editor
 *
 * @example
 * ```typescript
 * const myPreprocessor: EditorHtmlPreprocessor = (html: string) => {
 *   // Remove all script tags for security
 *   return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
 * };
 * ```
 */
export type EditorHtmlPreprocessor = (html: string) => string;

/**
 * Injection token for HTML preprocessor function.
 * Use this token to provide a custom function that processes HTML content
 * before it's set into the TipTap editor.
 *
 * This is optional - if not provided, the editor will use the HTML content as-is.
 *
 * @example
 * ```typescript
 * // In your component or module providers
 * {
 *   provide: EDITOR_HTML_PREPROCESSOR,
 *   useValue: (html: string) => {
 *     // Your custom preprocessing logic
 *     return html.replace(/old/g, 'new');
 *   }
 * }
 * ```
 */
export const EDITOR_HTML_PREPROCESSOR = new InjectionToken<EditorHtmlPreprocessor>('EDITOR_HTML_PREPROCESSOR');
