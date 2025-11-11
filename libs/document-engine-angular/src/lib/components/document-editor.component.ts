import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { DocumentEngineConfig, DocumentEngineKit, EditorCapabilities } from '@phuong-tran-redoc/document-engine-core';
import { ToolbarComponent } from '../ui/toolbar';
import { FooterComponent } from '../ui/footer';
import { Editor } from '@tiptap/core';

/**
 * Document Editor Component
 * High-level wrapper that encapsulates TiptapEditor and DocumentEngineKit
 * Provides a simple API for consumers without exposing internal dependencies
 *
 * Usage:
 * <document-engine-editor
 *   #editor
 *   [config]="editorConfig"
 *
 *   (editorReady)="editor = docEditor.editor"
 * >
 *   <tiptap-editor
 *     [editor]="docEditor.editor"
 *     [(ngModel)]="content"
 *   ></tiptap-editor>
 * </document-engine-editor>
 */
@Component({
  selector: 'document-engine-editor',
  standalone: true,
  imports: [CommonModule, ToolbarComponent, FooterComponent],
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
export class DocumentEditorComponent implements OnInit, OnChanges, OnDestroy {
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

  // Capabilities instance for toolbar
  capabilities!: EditorCapabilities;

  private updateCapabilities(): void {
    this.capabilities = new EditorCapabilities(this.mergedConfig);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] || changes['editable']) {
      if (this._mergedConfig) {
        this._mergedConfig = this.getMergedConfig();
        this.updateCapabilities();
      }
    }
  }

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
        // Create capabilities instance after editor is initialized
        this.updateCapabilities();
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

      blockquote: false,
      heading: false,
      bold: false,
      italic: false,
      underline: false,
      strike: false,
      list: false,
      codeBlock: false,
      code: false,
      undoRedo: false,

      // Text style for colors
      textStyleKit: false,

      // Tables with resizing
      tables: false,

      // Character count
      characterCount: false,

      // Subscript and Superscript
      subscript: false,
      superscript: false,

      // Text alignment
      textAlign: false,

      // Image support
      image: false,

      // Placeholder
      placeholder: false,

      // Custom extensions - all enabled
      pageBreak: false,
      resetFormat: false,
      indent: false,
      clearContent: false,
      textCase: false,
      dynamicField: false,
      specialCharacters: false,

      // UI components
      showFooter: false,
      fontSize: false,
      lineHeight: false,
    };

    // Merge user config with defaults
    // If user provides a property, use it; otherwise use default
    return {
      link: this.config?.link ?? defaultConfig.link,
      blockquote: this.config?.blockquote ?? defaultConfig.blockquote,
      heading: this.config?.heading ?? defaultConfig.heading,
      bold: this.config?.bold ?? defaultConfig.bold,
      italic: this.config?.italic ?? defaultConfig.italic,
      underline: this.config?.underline ?? defaultConfig.underline,
      strike: this.config?.strike ?? defaultConfig.strike,
      list: this.config?.list ?? defaultConfig.list,
      codeBlock: this.config?.codeBlock ?? defaultConfig.codeBlock,
      code: this.config?.code ?? defaultConfig.code,
      undoRedo: this.config?.undoRedo ?? defaultConfig.undoRedo,
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
      indent: this.config?.indent ?? defaultConfig.indent,
      clearContent: this.config?.clearContent ?? defaultConfig.clearContent,
      textCase: this.config?.textCase ?? defaultConfig.textCase,
      dynamicField: this.config?.dynamicField ?? defaultConfig.dynamicField,
      restrictedEditing: this.config?.restrictedEditing ?? false,
      dynamicFieldsCategories: this.config?.dynamicFieldsCategories ?? defaultConfig.dynamicFieldsCategories,
      templates: this.config?.templates ?? defaultConfig.templates,
      showFooter: this.config?.showFooter ?? defaultConfig.showFooter,
      fontSize: this.config?.fontSize ?? defaultConfig.fontSize,
      lineHeight: this.config?.lineHeight ?? defaultConfig.lineHeight,
      specialCharacters: this.config?.specialCharacters ?? defaultConfig.specialCharacters,
    };
  }
}
