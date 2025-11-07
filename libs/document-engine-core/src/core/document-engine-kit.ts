import { Extension } from '@tiptap/core';
import { DocumentEngineConfig } from './document-engine-kit.type';
import StarterKit, { StarterKitOptions } from '@tiptap/starter-kit';
import { assign } from 'lodash-es';
import { CharacterCount, Placeholder } from '@tiptap/extensions';
import { Image } from '@tiptap/extension-image';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
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
import { DynamicField, NotumHeading, PageBreak } from '../nodes';
import { EditableRegion } from '../extensions/restricted-editing.extension';

export const DocumentEngineKit = Extension.create<DocumentEngineConfig>({
  name: 'DocumentEngineKit',

  addExtensions() {
    const extensions = [];
    const options = this.options;

    // Defaults centralized for readability
    const DEFAULT_LINK_OPTIONS: Partial<StarterKitOptions>['link'] = {
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

    // StarterKit
    if (options.starterKit !== false && options.starterKit !== undefined) {
      let mergedStarterKitOptions: Partial<StarterKitOptions> = {
        link: DEFAULT_LINK_OPTIONS,
        heading: false,
        orderedList: false,
      };

      if (typeof options.starterKit !== 'boolean') {
        mergedStarterKitOptions = assign({}, mergedStarterKitOptions, options.starterKit);
      }

      extensions.push(StarterKit.configure(mergedStarterKitOptions));
    }

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

    // Configurable, with consistent defaults where applicable
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
    add(options.resetOnEnter, ResetOnEnter);
    add(options.indent, Indent);
    add(options.clearContent, ClearContent);
    add(options.textCase, TextCase);
    add(options.heading, NotumHeading);
    add(options.dynamicField, DynamicField);
    add(options.orderedList, CustomOrderedList);

    return extensions;
  },
});
