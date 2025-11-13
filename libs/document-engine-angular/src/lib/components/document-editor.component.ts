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
import { DocumentEngineConfig } from '../core/kit/kit.type';
import { DocumentEngineKit } from '../core/kit/kit';
import { EditorCapabilities } from '../core/capability.model';
import { Editor } from '@tiptap/core';
import { DefaultEditorConfig } from '../configs/editor.config';
import { FooterComponent } from '../ui/footer/footer.component';
import { ToolbarComponent } from '../ui/toolbar/toolbar.component';

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
    if (!changes['config']) return;

    if (!this.editor) return;

    this._mergedConfig = this.getMergedConfig();
    this.updateCapabilities();
    this.editor.setEditable(this._mergedConfig.editable ?? true);
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
        editable: this._mergedConfig.editable,
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
    // Merge user config with defaults, preferring user config when provided
    return this.mergeConfig(DefaultEditorConfig, this.config);
  }

  /**
   * Merge two config objects, preferring userConfig values when provided
   */
  private mergeConfig(
    defaultConfig: Partial<DocumentEngineConfig>,
    userConfig?: Partial<DocumentEngineConfig>
  ): Partial<DocumentEngineConfig> {
    if (!userConfig) return defaultConfig;

    const merged: Record<string, unknown> = { ...defaultConfig };
    const keys = Object.keys(userConfig) as Array<keyof DocumentEngineConfig>;

    for (const key of keys) {
      const value = userConfig[key];
      if (value !== undefined) merged[key] = value;
    }

    return merged;
  }
}
