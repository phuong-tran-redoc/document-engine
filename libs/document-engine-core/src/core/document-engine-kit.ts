import { Extension } from '@tiptap/core';
import Blockquote from '@tiptap/extension-blockquote';
import Bold from '@tiptap/extension-bold';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Image } from '@tiptap/extension-image';
import Italic from '@tiptap/extension-italic';
import Link, { LinkOptions } from '@tiptap/extension-link';
import { BulletList, ListItem, ListKeymap } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import Strike from '@tiptap/extension-strike';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Text } from '@tiptap/extension-text';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { CharacterCount, Dropcursor, Gapcursor, Placeholder, TrailingNode, UndoRedo } from '@tiptap/extensions';
import {
  ClearContent,
  CustomOrderedList,
  Indent,
  ResetFormat,
  ResetOnEnter,
  RestrictedEditing,
  StyledTableKit,
  TextCase,
} from '../extensions';
import { EditableRegion } from '../extensions/restricted-editing.extension';
import { DynamicField, NotumHeading, PageBreak } from '../nodes';
import { DocumentEngineConfig } from './document-engine-kit.type';

export const DocumentEngineKit = Extension.create<DocumentEngineConfig>({
  name: 'DocumentEngineKit',

  addExtensions() {
    // Default extensions
    const extensions = [
      Document,
      Paragraph,
      Text,
      Dropcursor,
      Gapcursor,
      HardBreak,
      HorizontalRule,
      TrailingNode,
      ResetOnEnter,
    ];

    const options = this.options;

    // Defaults centralized for readability
    const DEFAULT_LINK_OPTIONS: Partial<LinkOptions> = {
      openOnClick: false,
      defaultProtocol: 'https',
      enableClickSelection: true,
      shouldAutoLink: (url) =>
        url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:'),
    };
    const DEFAULT_TEXT_ALIGN = { types: ['paragraph', 'heading'] } as const;
    const DEFAULT_PLACEHOLDER = { placeholder: 'Type something...' } as const;
    const DEFAULT_TABLES = { table: { resizable: true } } as const;

    // Small helper to add a configurable extension
    const add = (opt: unknown, ext: unknown, defaultConfig?: object) => {
      if (opt === false || opt === undefined) return;

      if (typeof opt === 'object') {
        extensions.push((ext as any).configure(opt));
        return;
      }

      extensions.push(defaultConfig ? (ext as any).configure(defaultConfig) : (ext as any));
    };

    // RestrictedEditing
    if (options.restrictedEditing !== false && options.restrictedEditing !== undefined) {
      // Editable Region will always be added after RestrictedEditing
      extensions.push(EditableRegion);

      if (typeof options.restrictedEditing === 'object') {
        extensions.push(RestrictedEditing.configure(options.restrictedEditing));
      } else {
        extensions.push(RestrictedEditing.configure({ initialMode: 'standard' }));
      }
    }

    if (options.list !== false) {
      add(true, ListKeymap);
      add(true, ListItem);
      add(true, BulletList);
      add(true, CustomOrderedList);
    }

    // Configurable, with consistent defaults where applicable
    add(options.blockquote, Blockquote);
    add(options.bold, Bold);
    add(options.italic, Italic);
    add(options.underline, Underline);
    add(options.strike, Strike);
    add(options.link, Link, DEFAULT_LINK_OPTIONS);
    add(options.codeBlock, CodeBlock);
    add(options.code, Code);
    add(options.undoRedo, UndoRedo);
    add(options.textStyleKit, TextStyleKit);
    add(options.tables, StyledTableKit, DEFAULT_TABLES);
    add(options.characterCount, CharacterCount);
    add(options.subscript, Subscript);
    add(options.superscript, Superscript);
    add(options.textAlign, TextAlign, DEFAULT_TEXT_ALIGN);
    add(options.image, Image);
    add(options.placeholder, Placeholder, DEFAULT_PLACEHOLDER);
    add(options.pageBreak, PageBreak);
    add(options.resetFormat, ResetFormat);
    add(options.indent, Indent);
    add(options.clearContent, ClearContent);
    add(options.textCase, TextCase);
    add(options.heading, NotumHeading);
    add(options.dynamicField, DynamicField);

    return extensions;
  },
});
