import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import {
  DocumentEngineConfig,
  EditorCapabilities,
  ListStyleType,
  TextCaseType,
} from '@phuong-tran-redoc/document-engine-core';
import { Editor } from '@tiptap/core';
import { throttle } from 'lodash-es';
import {
  ColorBubbleConfig,
  DynamicFieldsBubbleConfig,
  ImageBubbleConfig,
  LinkBubbleConfig,
  SpecialCharactersBubbleConfig,
  TableBubbleConfig,
  TableCreateBubbleConfig,
  TemplateBubbleConfig,
} from '../../configs';
import {
  FONT_SIZE_OPTIONS,
  HEADING_OPTIONS,
  LINE_HEIGHT_OPTIONS,
  TEXT_ALIGN_OPTIONS,
  TEXT_CASE_OPTIONS,
} from '../../constants';
import { LIST_STYLE_OPTIONS } from '../../constants/list.constant';
import { EditorBubbleMenuConfig, ToolbarBubbleMenuConfig } from '../../core';
import { HeadingLevel } from '../../types';
import { EditorBubbleMenuComponent, ToolbarBubbleMenuComponent } from '../../views/wrapper';
import { ButtonDirective } from '../button';
import { IconComponent } from '../icon';
import { SelectLabelDirective } from '../select/select-label.directive';
import { SelectOptionDirective } from '../select/select-option.directive';
import { SelectComponent } from '../select/select.component';
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
})
export class ToolbarComponent implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() editor!: Editor;
  @Input() capabilities!: EditorCapabilities;
  @Input() config?: Partial<DocumentEngineConfig>; // Only for dynamicFieldsCategories and templates

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
  @ViewChild('tableBubbleWrapper') private tableBubbleWrapper!: EditorBubbleMenuComponent;
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

    this.editor.destroy();
  }

  testDisable() {
    console.log('fn testDisable called');
    return true;
  }

  setFontSize(size: string | null): void {
    if (size) {
      this.editor.chain().focus().setFontSize(size).run();
      return;
    }

    this.editor.chain().focus().unsetFontSize().run();
  }

  setLineHeight(lineHeight: string | null): void {
    if (lineHeight) {
      this.editor.chain().focus().setLineHeight(lineHeight).run();
      return;
    }

    this.editor.chain().focus().unsetLineHeight().run();
  }

  setHeading(level: string | null): void {
    if (!level) {
      this.editor.chain().focus().removeHeading().run();
      return;
    }

    const levelNumber = parseInt(level, 10) as HeadingLevel;
    this.editor.chain().focus().toggleHeading({ level: levelNumber }).run();
  }

  setTextAlign(align: string | null): void {
    if (align) {
      this.editor
        .chain()
        .focus()
        .setTextAlign(align as 'left' | 'center' | 'right' | 'justify')
        .run();
      return;
    }

    // Reset to default (left)
    this.editor.chain().focus().setTextAlign('left').run();
  }

  setListStyle(listStyleType: ListStyleType): void {
    if (this.editor.isActive('customOrderedList')) {
      // If there's an active ordered list, update its style
      this.editor.chain().focus().setListStyle(listStyleType).run();
      return;
    }

    // If no active list, create a new one with the selected style
    this.editor.chain().focus().toggleOrderedList().run();
    this.editor.chain().focus().setListStyle(listStyleType).run();
  }

  openColorBubble(event: MouseEvent, type: 'text' | 'fill'): void {
    const targetElement = (event.currentTarget || event.target) as HTMLElement;
    this.colorBubbleMenu?.toggleBubble(targetElement, { type });
  }

  toggleLink(): void {
    if (this.editor.isActive('link')) {
      // If link is active, remove it
      this.editor.chain().focus().unsetLink().run();
    } else {
      // If no link, open the bubble menu
      this.linkBubbleWrapper?.showBubble();
    }
  }

  insertImage(event: MouseEvent): void {
    const targetElement = (event.currentTarget || event.target) as HTMLElement;
    this.imageBubbleMenu?.toggleBubble(targetElement);
  }

  openSpecialCharsBubble(event: MouseEvent): void {
    const targetElement = (event.currentTarget || event.target) as HTMLElement;
    this.specialCharsBubbleMenu?.toggleBubble(targetElement);
  }

  openDynamicFieldsBubble(event: MouseEvent): void {
    const targetElement = (event.currentTarget || event.target) as HTMLElement;
    this.dynamicFieldsBubbleMenu?.toggleBubble(targetElement, {
      categories: this.config?.dynamicFieldsCategories || [],
    });
  }

  openTemplateBubble(event: MouseEvent): void {
    const targetElement = (event.currentTarget || event.target) as HTMLElement;
    this.templateBubbleMenu?.toggleBubble(targetElement, {
      templates: this.config?.templates || [],
    });
  }

  openCreateTableBubble(event: MouseEvent): void {
    const targetElement = (event.currentTarget || event.target) as HTMLElement;
    this.tableCreateBubbleMenu?.toggleBubble(targetElement);
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

  printValue(): void {
    console.log('html', this.editor.getHTML());
    console.log('json', this.editor.getJSON());
    console.log('State', this.editor.state);
  }
}
