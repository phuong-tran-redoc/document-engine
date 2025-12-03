import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  forwardRef,
  inject,
  Input,
  OnInit,
  Renderer2,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Content, Editor, type EditorEvents } from '@tiptap/core';
import { EDITOR_CONTENT_WRAPPER_CLASS, EDITOR_HTML_PREPROCESSOR } from './editor-tokens';

@Directive({
  selector: 'tiptap[editor], [tiptap][editor], tiptap-editor[editor], [tiptapEditor][editor]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TiptapEditorDirective),
      multi: true,
    },
  ],
  standalone: true,
  host: {
    ['class']: 'tiptap-editor no-twp',
  },
})
export class TiptapEditorDirective implements OnInit, AfterViewInit, ControlValueAccessor {
  protected elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected renderer = inject(Renderer2);
  protected changeDetectorRef = inject(ChangeDetectorRef);

  protected htmlPreprocessor = inject(EDITOR_HTML_PREPROCESSOR, { optional: true });
  protected contentWrapperClass = inject(EDITOR_CONTENT_WRAPPER_CLASS, { optional: true });

  private _editor?: Editor;
  private initialEditableState?: boolean;

  @Input()
  set editor(editor: Editor) {
    this._editor = editor;
    // Store initial editable state immediately when editor is set
    // This ensures we capture the state before any Forms API calls
    if (this.initialEditableState === undefined && editor) {
      this.initialEditableState = editor.isEditable;
    }
  }

  get editor(): Editor {
    if (!this._editor) {
      throw new Error('Editor must be set before use.');
    }
    return this._editor;
  }

  @Input() outputFormat: 'json' | 'html' = 'html';

  protected onChange: (value: Content) => void = () => {
    /** */
  };
  protected onTouched: () => void = () => {
    /** */
  };

  // Writes a new value to the element.
  // This methods is called when programmatic changes from model to view are requested.
  writeValue(value: Content): void {
    // Apply preprocessor if value is a string (HTML) and preprocessor is available
    let processedValue = value;
    if (typeof value === 'string' && this.htmlPreprocessor) {
      processedValue = this.htmlPreprocessor(value);
    }
    this.editor.chain().setContent(processedValue, { emitUpdate: false }).run();
  }

  // Registers a callback function that is called when the control's value changes in the UI.
  registerOnChange(fn: () => void): void {
    this.onChange = fn;
  }

  // Registers a callback function that is called by the forms API on initialization to update the form model on blur.
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Called by the forms api to enable or disable the element
  setDisabledState(isDisabled: boolean): void {
    // Ensure we have captured the initial state (fallback in case setter wasn't called)
    if (this.initialEditableState === undefined && this.editor) {
      this.initialEditableState = this.editor.isEditable;
    }

    // Only apply disabled state if editor was initially editable
    // If editor was configured as readonly (editable: false), preserve that state
    if (this.initialEditableState === true) {
      this.editor.setEditable(!isDisabled);
    }
    // If initialEditableState === false, do nothing - preserve readonly state

    this.renderer.setProperty(this.elRef.nativeElement, 'disabled', isDisabled);
  }

  protected handleChange = ({ editor, transaction }: EditorEvents['transaction']): void => {
    if (!transaction.docChanged) return;

    // Needed for ChangeDetectionStrategy.OnPush to get notified about changes
    this.changeDetectorRef.markForCheck();

    if (this.outputFormat === 'html') {
      const htmlContent = editor.getHTML();

      let finalContent = htmlContent;

      if (this.contentWrapperClass) {
        finalContent = `<div class="${this.contentWrapperClass}">${htmlContent}</div>`;
      }

      this.onChange(finalContent);
      return;
    }

    this.onChange(editor.getJSON());
  };

  ngOnInit(): void {
    const editor = this.editor;

    // take the inner contents and clear the block
    const { innerHTML } = this.elRef.nativeElement;
    this.elRef.nativeElement.innerHTML = '';

    // insert the editor in the dom
    this.elRef.nativeElement.append(
      ...Array.from((editor.options.element as HTMLElement | undefined)?.childNodes || [])
    );

    // update the options for the editor
    editor.setOptions({ element: this.elRef.nativeElement });

    // update content to the editor
    if (innerHTML) {
      // Apply preprocessor to initial content if available
      const processedContent = this.htmlPreprocessor ? this.htmlPreprocessor(innerHTML) : innerHTML;
      editor.chain().setContent(processedContent, { emitUpdate: false }).run();
    }

    // register blur handler to update `touched` property
    editor.on('blur', () => {
      this.onTouched();
    });

    // register update handler to listen to changes on update
    editor.on('update', this.handleChange);

    // Needed for ChangeDetectionStrategy.OnPush to get notified
    editor.on('selectionUpdate', () => this.changeDetectorRef.markForCheck());
  }

  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
  }
}
