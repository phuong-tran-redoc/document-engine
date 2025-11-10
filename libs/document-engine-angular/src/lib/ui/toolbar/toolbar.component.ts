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
import { DocumentEngineConfig, ListStyleType, TextCaseOptions } from '@phuong-tran-redoc/document-engine-core';
import { Editor } from '@tiptap/core';
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
import { EditorBubbleMenuConfig, ToolbarBubbleMenuConfig } from '../../core';
import { HeadingLevel } from '../../types';
import { ButtonDirective } from '../button';
import { IconComponent } from '../icon';
import { SelectLabelDirective } from '../select/select-label.directive';
import { SelectOptionDirective } from '../select/select-option.directive';
import { SelectComponent } from '../select/select.component';
import { EditorBubbleMenuComponent, ToolbarBubbleMenuComponent } from '../../views/wrapper';

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
  @Input() config?: Partial<DocumentEngineConfig>;
  @Input() editable = true;

  activeFontSize: string | null = null;
  activeLineHeight: string | null = null;
  activeHeading: number | null = null;
  activeTextAlign: string | null = null;
  activeTextAlignIcon = 'format_align_left';

  readonly fontSizeOptions = [
    { value: '12px', label: '12px' },
    { value: '14px', label: '14px' },
    { value: '16px', label: '16px' },
    { value: '18px', label: '18px' },
    { value: '20px', label: '20px' },
  ];

  readonly lineHeightOptions = [
    { value: null, label: 'Default' },
    { value: '1', label: '1' },
    { value: '1.5', label: '1.5' },
    { value: '2', label: '2' },
    { value: '2.5', label: '2.5' },
    { value: '3', label: '3' },
  ];

  readonly textCaseOptions: { value: TextCaseOptions['type']; label: string }[] = [
    { value: 'uppercase', label: 'UPPERCASE' },
    { value: 'lowercase', label: 'lowercase' },
    { value: 'capitalize', label: 'Capitalize' },
  ];

  readonly headingOptions = [
    { value: null, label: 'Normal text', class: '' },
    { value: 1, label: 'Heading 1', class: 'h1' },
    { value: 2, label: 'Heading 2', class: 'h2' },
    { value: 3, label: 'Heading 3', class: 'h3' },
  ];

  readonly textAlignOptions = [
    { value: 'left', label: 'Align Left', icon: 'format_align_left' },
    { value: 'center', label: 'Align Center', icon: 'format_align_center' },
    { value: 'right', label: 'Align Right', icon: 'format_align_right' },
    { value: 'justify', label: 'Align Justify', icon: 'format_align_justify' },
  ];

  readonly listStyleOptions = [
    { value: 'decimal' as ListStyleType, label: 'Decimal', example: '1.' },
    { value: 'lower-alpha-dot' as ListStyleType, label: 'Lower Alpha', example: 'a.' },
    { value: 'lower-alpha-parens' as ListStyleType, label: 'Lower Alpha (Parentheses)', example: '(a)' },
    { value: 'lower-roman-parens' as ListStyleType, label: 'Lower Roman', example: '(i)' },
  ];

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

  private updateToolbarState = (): void => {
    if (!this.editor) {
      return;
    }

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
    if (!this.editor) {
      return;
    }

    // Subscribe to selectionUpdate to keep toolbar state in sync when cursor/selection changes
    this.editor.on('update', this.updateToolbarState);
    this.editor.on('transaction', this.updateToolbarState);

    // Initialize toolbar state once
    this.updateToolbarState();
  }

  ngOnDestroy(): void {
    this.editor.off('update', this.updateToolbarState);
    this.editor.off('transaction', this.updateToolbarState);
    this.editor.destroy();
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

  printValue(): void {
    console.log('html', this.editor.getHTML());
    console.log('json', this.editor.getJSON());
    console.log('State', this.editor.state);
  }

  // Toolbar configuration helpers
  hasHistory(): boolean {
    const config = this.config ?? {};
    return config.starterKit !== false;
  }

  hasFormatting(): boolean {
    const config = this.config ?? {};
    return config.starterKit !== false;
  }

  hasColors(): boolean {
    const config = this.config ?? {};
    return config.textStyleKit !== false;
  }

  hasAdvanced(): boolean {
    // Check if any advanced features are enabled
    return (
      this.hasTextCase() ||
      this.hasLists() ||
      this.hasLinks() ||
      this.hasImages() ||
      this.hasDynamicFields() ||
      this.hasSpecialChars() ||
      this.hasTemplates()
    );
  }

  hasTextCase(): boolean {
    const config = this.config ?? {};
    return config.textCase !== false;
  }

  hasHeading(): boolean {
    const config = this.config ?? {};
    return config.heading !== false;
  }

  hasIndent(): boolean {
    const config = this.config ?? {};
    return config.indent !== false;
  }

  hasLists(): boolean {
    const config = this.config ?? {};
    // Check orderedList first (custom extension)
    if (config.orderedList !== false) {
      return true;
    }

    // Then check starterKit for bulletList
    if (config.starterKit === false) {
      return false;
    }

    if (config.starterKit && typeof config.starterKit === 'object') {
      const starterKit = config.starterKit;
      return starterKit.bulletList !== false;
    }
    return true; // Default includes lists
  }

  hasLinks(): boolean {
    const config = this.config ?? {};
    if (config.starterKit === false) {
      return false;
    }
    if (config.starterKit && typeof config.starterKit === 'object') {
      return config.starterKit.link !== false;
    }
    return true; // Default includes links
  }

  hasImages(): boolean {
    const config = this.config ?? {};
    return config.image !== false;
  }

  hasDynamicFields(): boolean {
    const config = this.config ?? {};
    return config.dynamicField !== false;
  }

  hasSpecialChars(): boolean {
    // Special characters are typically always available if editor is editable
    return this.editable;
  }

  hasTemplates(): boolean {
    const config = this.config ?? {};
    return config.templates !== undefined && config.templates !== null && config.templates.length > 0;
  }

  hasTable(): boolean {
    const config = this.config ?? {};
    return config.tables !== false;
  }

  hasEditableRegion(): boolean {
    const config = this.config ?? {};
    return config.restrictedEditing !== false;
  }

  hasPageBreak(): boolean {
    const config = this.config ?? {};
    return config.pageBreak !== false;
  }

  hasClearContent(): boolean {
    const config = this.config ?? {};
    return config.clearContent !== false;
  }

  hasMarkdown(): boolean {
    const config = this.config ?? {};
    return config.markdown !== false;
  }
}
