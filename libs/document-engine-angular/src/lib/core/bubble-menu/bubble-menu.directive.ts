import { Directive, ElementRef, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { Editor, BubbleMenuPlugin, BubbleMenuPluginProps } from '@phuong-tran-redoc/document-engine-core';
import { BubbleMenuProps } from './bubble-menu.type';

@Directive({
  selector: 'tiptap-bubble-menu[editor], [tiptapBubbleMenu][editor]',
  standalone: true,
})
export class TiptapBubbleMenuDirective implements OnInit, OnDestroy {
  private elRef = inject<ElementRef<HTMLElement>>(ElementRef);

  @Input() props!: BubbleMenuProps;
  @Input() editor!: Editor;
  @Input() mountTo?: BubbleMenuPluginProps['getReferencedVirtualElement'];
  @Input() shouldShow?: BubbleMenuPluginProps['shouldShow'];

  ngOnInit(): void {
    const editor = this.editor;
    if (!editor) throw new Error('Required: Input `editor`');

    const bubbleMenuElement = this.elRef.nativeElement;
    bubbleMenuElement.style.visibility = 'hidden';
    bubbleMenuElement.style.position = 'absolute';

    // Prevent editor blur when interacting with the bubble content
    // bubbleMenuElement.addEventListener('mousedown', this.preventDefault);

    const { pluginKey, appendTo, updateDelay, resizeDelay, options } = this.props;

    editor.registerPlugin(
      BubbleMenuPlugin({
        pluginKey,
        appendTo,
        updateDelay,
        resizeDelay,
        editor,
        element: bubbleMenuElement,
        options: this.getFloatingUiOptions(options ?? {}, bubbleMenuElement),
        shouldShow: this.shouldShow,
        getReferencedVirtualElement: this.mountTo,
      })
    );
  }

  ngOnDestroy(): void {
    if (this.editor && this.props?.pluginKey) {
      this.editor.unregisterPlugin(this.props.pluginKey);
    }

    window.requestAnimationFrame(() => {
      if (this.elRef.nativeElement.parentNode) {
        this.elRef.nativeElement.parentNode.removeChild(this.elRef.nativeElement);
      }
    });

    this.elRef.nativeElement.removeEventListener('mousedown', this.preventDefault);
  }

  preventDefault(event: MouseEvent): void {
    // Allow default behavior for focusable elements so inputs can receive focus
    const target = event.target as HTMLElement | null;
    if (target) {
      const tag = target.tagName;
      const isFocusableTag = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
      if (isFocusableTag) return;
    }

    event.preventDefault();
  }

  private getFloatingUiOptions(
    userOptions: Partial<Record<string, unknown>>,
    element: HTMLElement
  ): BubbleMenuPluginProps['options'] {
    // Find arrow element if it exists
    // const arrowElement = element.querySelector('[data-arrow]') as HTMLElement | null;

    // Merge with default Floating UI options
    const defaultOptions: BubbleMenuPluginProps['options'] = {
      placement: 'bottom',
      flip: {
        fallbackPlacements: ['top', 'bottom', 'bottom-start', 'top-end', 'bottom-end'],
        padding: 8,
      },
      // Enable shift middleware to keep bubble within viewport
      shift: { padding: 8 },
      // Add offset to create space between selection and bubble
      offset: 10,
      // Configure arrow if element exists
      // arrow: arrowElement ? { element: arrowElement } : false,
    };

    return { ...defaultOptions, ...userOptions };
  }
}
