import { inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as IconConstants from './icon.constant';

/**
 * Icon registry service for managing SVG icons
 * Similar to Angular Material's MatIconRegistry
 */
@Injectable({
  providedIn: 'root',
})
export class IconRegistryService {
  private sanitizer = inject(DomSanitizer);
  private icons: Map<string, string> = new Map();

  constructor() {
    this.registerDefaultIcons();
  }

  /**
   * Register a new icon with its SVG content
   */
  registerIcon(name: string, svgContent: string): void {
    if (this.icons.has(name)) {
      throw new Error(`Icon ${name} already registered`);
    }

    this.icons.set(name, svgContent);
  }

  /**
   * Get icon SVG content by name
   * Returns SafeHtml for use in templates with [innerHTML]
   */
  getIcon(name: string): SafeHtml {
    const icon = this.icons.get(name);

    if (!icon) {
      console.warn(`Icon ${name} not registered`);
      return this.sanitizer.bypassSecurityTrustHtml(IconConstants.DEFAULT);
    }

    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }

  /**
   * Get raw icon SVG string by name
   * Returns string for direct DOM manipulation
   */
  getIconString(name: string): string {
    const icon = this.icons.get(name);

    if (!icon) {
      console.warn(`Icon ${name} not registered`);
      return IconConstants.DEFAULT;
    }

    return icon;
  }

  /**
   * Register default icons used in the application
   */
  private registerDefaultIcons(): void {
    // Basic icons
    this.registerIcon('check', IconConstants.CHECK);
    this.registerIcon('undo', IconConstants.UNDO);
    this.registerIcon('redo', IconConstants.REDO);

    // Formatting icons
    this.registerIcon('format_size', IconConstants.FORMAT_SIZE);
    this.registerIcon('arrow_drop_down', IconConstants.ARROW_DROP_DOWN);
    this.registerIcon('format_line_spacing', IconConstants.FORMAT_LINE_SPACING);
    this.registerIcon('match_case', IconConstants.MATCH_CASE);
    this.registerIcon('format_clear', IconConstants.FORMAT_CLEAR);
    this.registerIcon('format_color_text', IconConstants.FORMAT_COLOR_TEXT);
    this.registerIcon('format_color_fill', IconConstants.FORMAT_COLOR_FILL);
    this.registerIcon('format_bold', IconConstants.FORMAT_BOLD);
    this.registerIcon('format_italic', IconConstants.FORMAT_ITALIC);
    this.registerIcon('format_underline', IconConstants.FORMAT_UNDERLINE);
    this.registerIcon('format_strikethrough', IconConstants.FORMAT_STRIKETHROUGH);
    this.registerIcon('subscript', IconConstants.SUBSCRIPT);
    this.registerIcon('superscript', IconConstants.SUPERSCRIPT);
    this.registerIcon('code', IconConstants.CODE);

    // Alignment icons
    this.registerIcon('format_align_left', IconConstants.FORMAT_ALIGN_LEFT);
    this.registerIcon('format_align_center', IconConstants.FORMAT_ALIGN_CENTER);
    this.registerIcon('format_align_right', IconConstants.FORMAT_ALIGN_RIGHT);
    this.registerIcon('format_align_justify', IconConstants.FORMAT_ALIGN_JUSTIFY);
    this.registerIcon('format_indent_decrease', IconConstants.FORMAT_INDENT_DECREASE);
    this.registerIcon('format_indent_increase', IconConstants.FORMAT_INDENT_INCREASE);

    // List icons
    this.registerIcon('format_list_bulleted', IconConstants.FORMAT_LIST_BULLETED);
    this.registerIcon('format_list_numbered', IconConstants.FORMAT_LIST_NUMBERED);
    this.registerIcon('format_quote', IconConstants.FORMAT_QUOTE);

    // Table icons
    this.registerIcon('table_rows', IconConstants.TABLE_ROWS);
    this.registerIcon('table_cell_property', IconConstants.TABLE_CELL_PROPERTY);
    this.registerIcon('table_column', IconConstants.TABLE_COLUMN);
    this.registerIcon('table_merge_cell', IconConstants.TABLE_MERGE_CELL);
    this.registerIcon('table_property', IconConstants.TABLE_PROPERTY);
    this.registerIcon('table_row', IconConstants.TABLE_ROW);

    // Other icons
    this.registerIcon('link', IconConstants.LINK);
    this.registerIcon('link_off', IconConstants.LINK_OFF);
    this.registerIcon('special_character', IconConstants.SPECIAL_CHARACTER);
    this.registerIcon('clear_all', IconConstants.CLEAR_ALL);
    this.registerIcon('insert_page_break', IconConstants.INSERT_PAGE_BREAK);
    this.registerIcon('markdown', IconConstants.MARKDOWN);
    this.registerIcon('dynamic_form', IconConstants.DYNAMIC_FORM);
    this.registerIcon('photo', IconConstants.PHOTO);
    this.registerIcon('print', IconConstants.PRINT);
    this.registerIcon('archive', IconConstants.ARCHIVE);
    this.registerIcon('restrict_edit', IconConstants.RESTRICT_EDIT);

    this.registerIcon('edit', IconConstants.EDIT);
    this.registerIcon('settings', IconConstants.SETTINGS);
    this.registerIcon('search', IconConstants.SEARCH);
    this.registerIcon('search_off', IconConstants.SEARCH_OFF);
    this.registerIcon('description', IconConstants.DESCRIPTION);
    this.registerIcon('close', IconConstants.CLOSE);
    this.registerIcon('vertical_align_top', IconConstants.VERTICAL_ALIGN_TOP);
    this.registerIcon('vertical_align_center', IconConstants.VERTICAL_ALIGN_CENTER);
    this.registerIcon('vertical_align_bottom', IconConstants.VERTICAL_ALIGN_BOTTOM);
  }
}
