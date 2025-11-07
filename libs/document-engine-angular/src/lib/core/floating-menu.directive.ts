import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Editor } from '@tiptap/core';
import { FloatingMenuPlugin, FloatingMenuPluginProps } from '@tiptap/extension-floating-menu';

@Directive({
  selector: 'tiptap-floating-menu[editor], [tiptapFloatingMenu][editor]',
})
export class TiptapFloatingMenuDirective implements OnInit, OnDestroy {
  constructor(private elRef: ElementRef<HTMLElement>) {}

  @Input() pluginKey: FloatingMenuPluginProps['pluginKey'] = 'TiptapFloatingMenu';
  @Input() editor!: Editor;
  @Input() options: FloatingMenuPluginProps['options'] = {};
  @Input() shouldShow?: FloatingMenuPluginProps['shouldShow'];

  ngOnInit(): void {
    const editor = this.editor;
    if (!editor) {
      throw new Error('Required: Input `editor`');
    }

    const floatingMenuElement = this.elRef.nativeElement;
    floatingMenuElement.style.visibility = 'hidden';
    floatingMenuElement.style.position = 'absolute';

    editor.registerPlugin(
      FloatingMenuPlugin({
        pluginKey: this.pluginKey,
        editor,
        element: floatingMenuElement,
        options: this.options,
        shouldShow: this.shouldShow,
      }),
    );
  }

  ngOnDestroy(): void {
    if (this.editor && this.pluginKey) {
      this.editor.unregisterPlugin(this.pluginKey);
    }
    window.requestAnimationFrame(() => {
      if (this.elRef.nativeElement.parentNode) {
        this.elRef.nativeElement.parentNode.removeChild(this.elRef.nativeElement);
      }
    });
  }
}
