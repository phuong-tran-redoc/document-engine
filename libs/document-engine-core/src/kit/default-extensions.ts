import type { Extensions } from '@tiptap/core';
import Blockquote from '@tiptap/extension-blockquote';
import Bold from '@tiptap/extension-bold';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Image } from '@tiptap/extension-image';
import Italic from '@tiptap/extension-italic';
import Link from '@tiptap/extension-link';
import { BulletList, ListItem } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import Strike from '@tiptap/extension-strike';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Text } from '@tiptap/extension-text';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';

import { CustomOrderedList } from '../extensions/ordered-list.extension';
import { StyledTableKit } from '../extensions/table-style.extension';
import { DynamicField } from '../nodes/dynamic-field.node';
import { NotumHeading } from '../nodes/heading.node';
import { PageBreak } from '../nodes/page-break.node';

/**
 * Canonical default extension list for headless (Node-safe) serialization.
 *
 * This is the schema half of the editor's runtime kit (`DocumentEngineKit` in
 * the Angular wrapper): every node, mark, and HTML-affecting attribute the
 * editor can persist, so {@link generateHTML} can turn stored document JSON back
 * into HTML without a browser.
 *
 * It deliberately omits editing-only plugins (history/undo-redo, drop/gap
 * cursors, placeholder, character count, list keymaps, trailing node). Those
 * shape the live editing experience but contribute nothing to serialized
 * output, and some attach view-level behavior that has no meaning headless.
 *
 * Only `renderHTML` is exercised during serialization — node views (which touch
 * the DOM, e.g. `DynamicField.addNodeView`) are never invoked here, so this list
 * is safe to import and run in Node.
 *
 * Callers needing a different schema (e.g. restricted-editing regions, or a
 * trimmed set) should pass their own array to {@link generateHTML} instead.
 */
export const defaultExtensions: Extensions = [
  // Structure
  Document,
  Paragraph,
  Text,
  NotumHeading,
  HardBreak,
  HorizontalRule,
  Blockquote,
  CodeBlock,

  // Lists
  BulletList,
  ListItem,
  CustomOrderedList,

  // Marks
  Bold,
  Italic,
  Underline,
  Strike,
  Code,
  Link,
  Subscript,
  Superscript,
  TextStyleKit,

  // Block-level alignment (emits `text-align` only when explicitly set).
  // NOTE: `Indent` is intentionally excluded — its `renderHTML` emits an empty
  // `style=""` on every block even when unset, which pollutes otherwise-semantic
  // output. Consumers that persist indentation can pass a custom extension array.
  TextAlign.configure({ types: ['paragraph', 'heading'] }),

  // Content nodes
  Image,
  PageBreak,
  DynamicField,

  // Tables (table / row / header / cell nodes)
  StyledTableKit,
];
