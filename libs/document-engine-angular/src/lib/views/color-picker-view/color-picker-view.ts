import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Color, normalizeColor } from '@phuong-tran-redoc/document-engine-core';
import { Editor } from '@tiptap/core';
import { BubbleMenuViewContent } from '../../core';
import { COLORS } from '../../constants/color.constant';
import { ButtonDirective } from '../../ui/button';
import { ColorPickerComponent } from '../../ui/color-picker';

/**
 * Color picker view for bubble menu
 * Shows color palette for text and background colors
 */
@Component({
  selector: 'document-engine-color-picker-view',
  standalone: true,
  imports: [CommonModule, ButtonDirective, ColorPickerComponent],
  template: `
    <div class="color-picker-view">
      <!-- Title -->
      <div class="color-picker-view__title">{{ colorType === 'text' ? 'Text Color' : 'Background Color' }}noôi</div>

      <!-- Color Picker Component -->
      <document-engine-color-picker
        [colorPalette]="colorPalette"
        [activeColor]="activeColor"
        [usedColors]="usedColors"
        (colorSelected)="applyColor($event)"
        (colorRemoved)="removeColor()"
      />

      <!-- Actions -->
      <div class="color-picker-view__actions">
        <button type="button" documentEngineButton variant="destructive" (click)="removeColor()">Remove Color</button>
        <button type="button" documentEngineButton variant="secondary" (click)="close?.()">Close</button>
      </div>
    </div>
  `,
  styleUrls: ['./color-picker-view.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorPickerViewComponent implements BubbleMenuViewContent<Record<string, unknown>> {
  editor?: Editor;
  colorType: 'text' | 'fill' = 'text';
  usedColors: Color[] = [];
  activeColor: Color | null = null;

  close?: () => void;
  goBack?: (viewId?: string) => void;
  navigateTo?: (viewId: string) => void;

  // Basic color palette
  colorPalette = COLORS;

  onActivate(attrs: Record<string, unknown>): void {
    this.colorType = (attrs['type'] as 'text' | 'fill') || 'text';
    this.usedColors = this.collectUsedColors(this.colorType);
    this.activeColor = this.getActiveColor(this.colorType);
  }

  applyColor(color: Color | null): void {
    if (!this.editor || !color) return;

    if (this.colorType === 'text') {
      // Use the TextStyle extension methods
      (this.editor.chain().focus() as any).setColor(color.value).run();
    } else {
      // Use the TextStyle extension methods
      (this.editor.chain().focus() as any).setBackgroundColor(color.value).run();
    }

    this.close?.();
  }

  removeColor(): void {
    if (!this.editor) return;

    if (this.colorType === 'text') {
      // Use the TextStyle extension methods
      (this.editor.chain().focus() as any).unsetColor().run();
    } else {
      // Use the TextStyle extension methods
      (this.editor.chain().focus() as any).unsetBackgroundColor().run();
    }

    this.close?.();
  }

  private getActiveColor(type: 'text' | 'fill'): Color | null {
    const attr = type === 'text' ? 'color' : 'backgroundColor';
    const attrs = this.editor?.getAttributes('textStyle');
    const color = (attrs?.[attr] as string | undefined) || null;
    if (!color) return null;
    const normalized = normalizeColor(color);
    return normalized ? Color.from(normalized) : null;
  }

  private collectUsedColors(type: 'text' | 'fill'): Color[] {
    try {
      const json = this.editor?.getJSON();
      const colors = new Set<string>();
      const attr = type === 'text' ? 'color' : 'backgroundColor';

      type ProseMirrorNode = {
        marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
        content?: ProseMirrorNode[];
      };

      const walk = (node: ProseMirrorNode | undefined): void => {
        if (!node) return;
        if (node.marks) {
          for (const m of node.marks) {
            const attrs = m.attrs as Record<string, unknown> | undefined;
            if (m.type === 'textStyle' && attrs && typeof attrs[attr] === 'string') {
              colors.add(attrs[attr] as string);
            }
          }
        }
        if (node.content) {
          for (const child of node.content) walk(child);
        }
      };

      walk(json as unknown as ProseMirrorNode);

      const arr = Array.from(colors)
        .map((c) => normalizeColor(c))
        .filter((c): c is string => !!c)
        .filter((c) => c.toLowerCase() !== '#000000' && c.toLowerCase() !== '#ffffff')
        .map((c) => Color.from(c));

      return Array.from(new Map(arr.map((c) => [c.value, c])).values());
    } catch {
      return [];
    }
  }
}
