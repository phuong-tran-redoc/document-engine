import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { DocumentEngineConfig, DocumentEngineKit } from '@redoc/document-engine-core';
import { ToolbarComponent } from '../ui/toolbar';
import { Editor } from '@tiptap/core';

/**
 * Document Editor Component
 * High-level wrapper that encapsulates TiptapEditor and DocumentEngineKit
 * Provides a simple API for consumers without exposing internal dependencies
 *
 * Usage:
 * <document-engine-document-editor
 *   #docEditor
 *   [config]="editorConfig"
 *


 *   (editorReady)="editor = docEditor.editor"
 * >
 *   <tiptap-editor
 *     [editor]="docEditor.editor"
 *     [(ngModel)]="content"
 *   ></tiptap-editor>
 * </document-engine-document-editor>
 */
@Component({
  selector: 'document-engine-document-editor',
  standalone: true,
  imports: [CommonModule, ToolbarComponent],
  templateUrl: './document-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'no-twp',
  },
  styles: [
    `
      :host ::ng-deep {
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }
      }
    `,
  ],
})
export class DocumentEditorComponent implements OnInit, OnDestroy {
  private readonly ngZone = inject(NgZone);

  @Input() showToolbar = true;
  @Input() editable = true;
  @Input() config?: Partial<DocumentEngineConfig>;

  @Output() editorReady = new EventEmitter<Editor>();

  // Expose editor property for external access (re-export)
  editor!: Editor;

  // Store merged config for toolbar and helper methods
  get mergedConfig(): Partial<DocumentEngineConfig> {
    return this._mergedConfig ?? this.getMergedConfig();
  }

  private _mergedConfig?: Partial<DocumentEngineConfig>;

  ngOnInit(): void {
    this.initializeEditor();
  }

  ngOnDestroy(): void {
    if (this.editor) this.editor.destroy();
  }

  // Internal methods
  private initializeEditor(): void {
    // Run editor initialization outside Angular zone for better performance
    // Editor operations (especially typing) don't need to trigger Angular change detection
    this.ngZone.runOutsideAngular(() => {
      // Merge user config with default full-featured config
      this._mergedConfig = this.getMergedConfig();

      // Initialize editor with config
      // Initial content will be set by TiptapEditorDirective via writeValue
      this.editor = new Editor({
        editable: this.editable,
        extensions: [DocumentEngineKit.configure(this._mergedConfig)],
      });

      // Emit editorReady event back inside Angular zone
      this.ngZone.run(() => {
        this.editorReady.emit(this.editor);
      });
    });
  }

  /**
   * Get merged config with all extensions enabled by default
   * User config will override defaults
   */
  private getMergedConfig(): Partial<DocumentEngineConfig> {
    // Default config that enables ALL extensions
    const defaultConfig: Partial<DocumentEngineConfig> = {
      // StarterKit with link enabled
      starterKit: {
        link: {
          openOnClick: false,
          defaultProtocol: 'https',
          enableClickSelection: true,
          shouldAutoLink: (url) =>
            url.startsWith('http://') ||
            url.startsWith('https://') ||
            url.startsWith('mailto:') ||
            url.startsWith('tel:'),
        },
        heading: false, // Using custom NotumHeading instead
        orderedList: false, // Using CustomOrderedList instead
      },

      // Text style for colors
      textStyleKit: true,

      // Tables with resizing
      tables: {
        table: {
          resizable: true,
        },
      },

      // Character count
      characterCount: true,

      // Subscript and Superscript
      subscript: true,
      superscript: true,

      // Text alignment
      textAlign: {
        types: ['paragraph', 'heading'],
      },

      // Image support
      image: true,

      // Placeholder
      placeholder: {
        placeholder: 'Type something...',
      },

      // Custom extensions - all enabled
      pageBreak: true,
      resetFormat: true,
      resetOnEnter: true,
      indent: true,
      clearContent: true,
      textCase: true,
      heading: true, // Custom NotumHeading
      dynamicField: true,
      orderedList: true, // Custom CustomOrderedList
    };

    // Merge user config with defaults
    // If user provides a property, use it; otherwise use default
    return {
      starterKit: this.config?.starterKit ?? defaultConfig.starterKit,
      textStyleKit: this.config?.textStyleKit ?? defaultConfig.textStyleKit,
      tables: this.config?.tables ?? defaultConfig.tables,
      characterCount: this.config?.characterCount ?? defaultConfig.characterCount,
      subscript: this.config?.subscript ?? defaultConfig.subscript,
      superscript: this.config?.superscript ?? defaultConfig.superscript,
      textAlign: this.config?.textAlign ?? defaultConfig.textAlign,
      image: this.config?.image ?? defaultConfig.image,
      placeholder: this.config?.placeholder ?? defaultConfig.placeholder,
      pageBreak: this.config?.pageBreak ?? defaultConfig.pageBreak,
      resetFormat: this.config?.resetFormat ?? defaultConfig.resetFormat,
      resetOnEnter: this.config?.resetOnEnter ?? defaultConfig.resetOnEnter,
      indent: this.config?.indent ?? defaultConfig.indent,
      clearContent: this.config?.clearContent ?? defaultConfig.clearContent,
      textCase: this.config?.textCase ?? defaultConfig.textCase,
      heading: this.config?.heading ?? defaultConfig.heading,
      dynamicField: this.config?.dynamicField ?? defaultConfig.dynamicField,
      orderedList: this.config?.orderedList ?? defaultConfig.orderedList,
      restrictedEditing: this.config?.restrictedEditing ?? false,
      dynamicFieldsCategories: this.config?.dynamicFieldsCategories ?? defaultConfig.dynamicFieldsCategories,
      templates: this.config?.templates ?? defaultConfig.templates,
    };
  }

  // Public API methods
  getHTML(): string {
    return this.editor?.getHTML() || '';
  }

  getJSON(): Record<string, unknown> {
    return this.editor?.getJSON() || {};
  }

  getText(): string {
    return this.editor?.getText() || '';
  }

  setContent(content: string): void {
    if (this.editor) {
      this.editor.commands.setContent(content);
    }
  }

  focus(): void {
    if (this.editor) {
      this.editor.commands.focus();
    }
  }

  blur(): void {
    if (this.editor) {
      this.editor.commands.blur();
    }
  }

  clear(): void {
    if (this.editor) {
      this.editor.commands.clearContent();
    }
  }
}
