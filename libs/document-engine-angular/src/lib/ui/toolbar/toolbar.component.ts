import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { ListStyleType, TextCaseType } from '@phuong-tran-redoc/document-engine-core';
import { Editor } from '@tiptap/core';
import { throttle } from 'lodash-es';
import { ColorBubbleConfig } from '../../configs/color.config';
import { DynamicFieldsBubbleConfig } from '../../configs/dynamic-fields.config';
import { ImageBubbleConfig } from '../../configs/image.config';
import { LinkBubbleConfig } from '../../configs/link.config';
import { SpecialCharactersBubbleConfig } from '../../configs/special-characters.config';
import { TableBubbleConfig, TableCreateBubbleConfig } from '../../configs/table.config';
import { TemplateBubbleConfig } from '../../configs/template.config';
import {
  FONT_SIZE_OPTIONS,
  HEADING_OPTIONS,
  LINE_HEIGHT_OPTIONS,
  TEXT_ALIGN_OPTIONS,
  TEXT_CASE_OPTIONS,
} from '../../constants/text-style.constant';
import { LIST_STYLE_OPTIONS } from '../../constants/list.constant';
import { DocumentEngineConfig } from '../../core/kit/kit.type';
import { EditorBubbleMenuConfig, ToolbarBubbleMenuConfig } from '../../core/bubble-menu/bubble-menu.type';
import { EditorCapabilities } from '../../core/capability.model';
import { HeadingLevel } from '../../types/heading.type';
import { ToolbarButton } from '../../types/button.type';
import { EditorBubbleMenuComponent } from '../../views/wrapper/editor-bubble-menu.wrapper';
import { ToolbarBubbleMenuComponent } from '../../views/wrapper/toolbar-bubble-menu.wrapper';
import { ButtonDirective } from '../button';
import { IconComponent } from '../icon';
import { SelectLabelDirective } from '../select/select-label.directive';
import { SelectOptionDirective } from '../select/select-option.directive';
import { SelectComponent } from '../select/select.component';
import { ToolbarService } from './toolbar.service';
import { DEFAULT_TOOLBAR_STATE, ToolbarState, buildToolbarState } from './toolbar.state';

/**
 * Toolbar component for document editor
 * Provides toolbar controls for editor actions
 */
@Component({
  selector: 'document-engine-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
    ButtonDirective,
    SelectComponent,
    SelectLabelDirective,
    SelectOptionDirective,
    ToolbarBubbleMenuComponent,
    EditorBubbleMenuComponent,
  ],
  templateUrl: './toolbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        position: sticky;
        top: 0;
        z-index: 20;
      }
    `,
  ],
})
export class ToolbarComponent implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);
  private readonly toolbarService = inject(ToolbarService);

  @Input() editor!: Editor;
  @Input() capabilities!: EditorCapabilities;
  @Input() config?: Partial<DocumentEngineConfig>; // Only for dynamicFieldsCategories and templates

  @Output() readonly action = this.toolbarService.action;

  activeFontSize: string | null = null;
  activeLineHeight: string | null = null;
  activeHeading: number | null = null;
  activeTextAlign: string | null = null;
  activeTextAlignIcon = 'format_align_left';

  toolbarState: ToolbarState = DEFAULT_TOOLBAR_STATE;

  readonly fontSizeOptions = FONT_SIZE_OPTIONS;
  readonly lineHeightOptions = LINE_HEIGHT_OPTIONS;
  readonly textCaseOptions = TEXT_CASE_OPTIONS as { value: TextCaseType; label: string }[];
  readonly headingOptions = HEADING_OPTIONS;
  readonly textAlignOptions = TEXT_ALIGN_OPTIONS;
  readonly listStyleOptions = LIST_STYLE_OPTIONS as { value: ListStyleType; label: string; example: string }[];

  @ViewChild('colorBubbleMenu') private colorBubbleMenu!: ToolbarBubbleMenuComponent;
  @ViewChild('linkBubbleWrapper') private linkBubbleWrapper!: EditorBubbleMenuComponent;
  @ViewChild('imageBubbleMenu') private imageBubbleMenu!: ToolbarBubbleMenuComponent;
  @ViewChild('specialCharsBubbleMenu') private specialCharsBubbleMenu!: ToolbarBubbleMenuComponent;
  @ViewChild('dynamicFieldsBubbleMenu') private dynamicFieldsBubbleMenu!: ToolbarBubbleMenuComponent;
  @ViewChild('templateBubbleMenu') private templateBubbleMenu!: ToolbarBubbleMenuComponent;
  @ViewChild('tableCreateBubbleMenu') private tableCreateBubbleMenu!: ToolbarBubbleMenuComponent;

  readonly colorBubbleConfig: ToolbarBubbleMenuConfig = ColorBubbleConfig;
  readonly linkBubbleConfig: EditorBubbleMenuConfig = LinkBubbleConfig;
  readonly tableBubbleConfig: EditorBubbleMenuConfig = TableBubbleConfig;
  readonly imageBubbleConfig: ToolbarBubbleMenuConfig = ImageBubbleConfig;
  readonly specialCharsBubbleConfig: ToolbarBubbleMenuConfig = SpecialCharactersBubbleConfig;
  readonly dynamicFieldsBubbleConfig: ToolbarBubbleMenuConfig = DynamicFieldsBubbleConfig;
  readonly templateBubbleConfig: ToolbarBubbleMenuConfig = TemplateBubbleConfig;
  readonly tableCreateBubbleConfig: ToolbarBubbleMenuConfig = TableCreateBubbleConfig;

  private throttleUpdateToolbarState = throttle(() => this.updateToolbarState(), 150, {
    leading: true,
    trailing: false,
  });

  private updateToolbarState = (): void => {
    this.ngZone.run(() => {
      if (!this.editor) return;

      // Update toolbar state (can* properties)
      this.toolbarState = buildToolbarState(this.editor, this.config);

      // Update active font size and line height
      const attrs = this.editor.getAttributes('textStyle');
      const size = (attrs?.['fontSize'] as string | undefined) || null;
      this.activeFontSize = size;

      const lineHeight = (attrs?.['lineHeight'] as string | undefined) || null;
      this.activeLineHeight = lineHeight;

      // Update active heading
      let headingLevel: number | null = null;
      for (const option of this.headingOptions) {
        if (this.editor.isActive('heading', { level: option.value })) {
          headingLevel = option.value;
          break;
        }
      }
      this.activeHeading = headingLevel;

      // Update active text align
      const alignOption = this.textAlignOptions.find((option) => this.editor.isActive({ textAlign: option.value }));
      this.activeTextAlign = alignOption?.value || null;
      this.activeTextAlignIcon = alignOption?.icon || 'format_align_left';

      this.cdr.markForCheck();
    });
  };

  ngOnInit(): void {
    // Subscribe to selectionUpdate to keep toolbar state in sync when cursor/selection changes
    this.editor.on('update', this.updateToolbarState);
    this.editor.on('transaction', this.throttleUpdateToolbarState);

    // Initialize toolbar state once
    this.updateToolbarState();
  }

  ngOnDestroy(): void {
    this.editor.off('update', this.updateToolbarState);
    this.editor.off('transaction', this.throttleUpdateToolbarState);

    if (this.throttleUpdateToolbarState) {
      this.throttleUpdateToolbarState.cancel();
    }

    this.toolbarService.ngOnDestroy();
    this.editor.destroy();
  }

  runAndEmit(actionName: string, chain: () => void): void {
    chain();
    this.toolbarService.emit(actionName);
  }

  setFontSize(size: string | null): void {
    if (size) {
      this.editor.chain().focus().setFontSize(size).run();
    } else {
      this.editor.chain().focus().unsetFontSize().run();
    }
    this.toolbarService.emit('setFontSize', size);
  }

  setLineHeight(lineHeight: string | null): void {
    if (lineHeight) {
      this.editor.chain().focus().setLineHeight(lineHeight).run();
    } else {
      this.editor.chain().focus().unsetLineHeight().run();
    }
    this.toolbarService.emit('setLineHeight', lineHeight);
  }

  setHeading(level: string | null): void {
    if (!level) {
      this.editor.chain().focus().removeHeading().run();
    } else {
      const levelNumber = parseInt(level, 10) as HeadingLevel;
      this.editor.chain().focus().toggleHeading({ level: levelNumber }).run();
    }
    this.toolbarService.emit('setHeading', level);
  }

  setTextAlign(align: string | null): void {
    if (align) {
      this.editor
        .chain()
        .focus()
        .setTextAlign(align as 'left' | 'center' | 'right' | 'justify')
        .run();
    } else {
      // Reset to default (left)
      this.editor.chain().focus().setTextAlign('left').run();
    }
    this.toolbarService.emit('setTextAlign', align);
  }

  setListStyle(listStyleType: ListStyleType): void {
    if (this.editor.isActive('customOrderedList')) {
      // If there's an active ordered list, update its style
      this.editor.chain().focus().setListStyle(listStyleType).run();
    } else {
      // If no active list, create a new one with the selected style
      this.editor.chain().focus().toggleOrderedList().run();
      this.editor.chain().focus().setListStyle(listStyleType).run();
    }
    this.toolbarService.emit('setListStyle', listStyleType);
  }

  openColorBubble(event: MouseEvent, type: 'text' | 'fill'): void {
    const targetElement = (event.currentTarget || event.target) as HTMLElement;
    this.colorBubbleMenu?.toggleBubble(targetElement, { type });
    this.toolbarService.emit('openColorBubble', { type });
  }

  toggleLink(): void {
    if (this.editor.isActive('link')) {
      // If link is active, remove it
      this.editor.chain().focus().unsetLink().run();
    } else {
      // If no link, open the bubble menu
      this.linkBubbleWrapper?.showBubble();
    }
    this.toolbarService.emit('toggleLink');
  }

  insertImage(event: MouseEvent): void {
    const targetElement = (event.currentTarget || event.target) as HTMLElement;
    this.imageBubbleMenu?.toggleBubble(targetElement);
    this.toolbarService.emit('insertImage');
  }

  openSpecialCharsBubble(event: MouseEvent): void {
    const targetElement = (event.currentTarget || event.target) as HTMLElement;
    this.specialCharsBubbleMenu?.toggleBubble(targetElement);
    this.toolbarService.emit('openSpecialCharsBubble');
  }

  openDynamicFieldsBubble(event: MouseEvent): void {
    const targetElement = (event.currentTarget || event.target) as HTMLElement;
    this.dynamicFieldsBubbleMenu?.toggleBubble(targetElement, {
      categories: this.config?.dynamicFieldsCategories || [],
    });
    this.toolbarService.emit('openDynamicFieldsBubble');
  }

  openTemplateBubble(event: MouseEvent): void {
    const targetElement = (event.currentTarget || event.target) as HTMLElement;
    this.templateBubbleMenu?.toggleBubble(targetElement, {
      templates: this.config?.templates || [],
    });
    this.toolbarService.emit('openTemplateBubble');
  }

  openCreateTableBubble(event: MouseEvent): void {
    const targetElement = (event.currentTarget || event.target) as HTMLElement;
    this.tableCreateBubbleMenu?.toggleBubble(targetElement);
    this.toolbarService.emit('openCreateTableBubble');
  }

  // downloadAsMarkdown(filename?: string): void {
  //   const fileName = filename ? `${filename}.md` : 'export.md';

  //   const markdown = renderToMarkdown({
  //     content: this.editor.getJSON(),
  //     extensions: this.editor.options.extensions,
  //     options: {
  //       nodeMapping: {
  //         pageBreak: () => 'Page break',
  //       },
  //     },
  //   });

  //   const blob = new Blob([markdown], { type: 'text/markdown' });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = fileName;
  //   a.click();
  //   URL.revokeObjectURL(url);
  // }

  trackByValue(index: number, item: { value: unknown }): unknown {
    return item.value;
  }

  trackByIndex(index: number): number {
    return index;
  }

  get customToolbarButtons(): ToolbarButton[] {
    return this.config?.customToolbarButtons || [];
  }

  handleCustomIconButton(button: ToolbarButton): void {
    if (button.type === 'icon-button') {
      button.callback();
      this.toolbarService.emit('customIconButton', { label: button.label, icon: button.icon });
    }
  }

  handleCustomSelectButton(button: ToolbarButton, value: string): void {
    if (button.type === 'select-button') {
      button.callback();
      this.toolbarService.emit('customSelectButton', { label: button.label, value });
    }
  }

  printValue(): void {
    console.log('html', this.editor.getHTML());
    console.log('json', this.editor.getJSON());
    console.log('State', this.editor.state);
    this.toolbarService.emit('printValue');
  }
}
