/**
 * Centralized selectors for E2E tests
 * Using data-testid attributes for stable, maintenance-friendly selectors
 */

export const SELECTORS = {
  // NodeViews
  table: {
    container: '[data-testid="table-nodeview-container"]',
    addRowBefore: '[data-testid="table-add-row-before"]',
    addRowAfter: '[data-testid="table-add-row-after"]',
    deleteRow: '[data-testid="table-delete-row"]',
    addColumnBefore: '[data-testid="table-add-column-before"]',
    addColumnAfter: '[data-testid="table-add-column-after"]',
    deleteColumn: '[data-testid="table-delete-column"]',
  },

  pageBreak: {
    nodeview: '[data-testid="page-break-nodeview"]',
  },

  dynamicField: {
    wrapper: '[data-testid="dynamic-field-wrapper"]',
    label: '[data-testid="dynamic-field-label"]',
    input: '[data-testid="dynamic-field-input"]',
  },

  // Toolbar
  toolbar: {
    container: '[data-testid="toolbar-container"]',
    bold: '[data-testid="toolbar-bold-btn"]',
    italic: '[data-testid="toolbar-italic-btn"]',
    underline: '[data-testid="toolbar-underline-btn"]',
    strike: '[data-testid="toolbar-strike-btn"]',
    headingSelect: '[data-testid="toolbar-heading-select"]',
    textColor: '[data-testid="toolbar-text-color"]',
    bgColor: '[data-testid="toolbar-bg-color"]',
    alignLeft: '[data-testid="toolbar-align-left"]',
    alignCenter: '[data-testid="toolbar-align-center"]',
    alignRight: '[data-testid="toolbar-align-right"]',
    alignJustify: '[data-testid="toolbar-align-justify"]',
    insertTable: '[data-testid="toolbar-insert-table"]',
    insertLink: '[data-testid="toolbar-insert-link"]',
    insertImage: '[data-testid="toolbar-insert-image"]',
    undo: '[data-testid="toolbar-undo"]',
    redo: '[data-testid="toolbar-redo"]',
  },

  // BubbleMenu
  bubbleMenu: {
    container: '[data-testid="bubble-menu-container"]',
    bold: '[data-testid="bubble-menu-bold"]',
    italic: '[data-testid="bubble-menu-italic"]',
    underline: '[data-testid="bubble-menu-underline"]',
    link: '[data-testid="bubble-menu-link"]',
    textColor: '[data-testid="bubble-menu-text-color"]',
  },

  // Footer
  footer: {
    container: '[data-testid="footer-container"]',
    charCount: '[data-testid="footer-char-count"]',
    wordCount: '[data-testid="footer-word-count"]',
    editableToggle: '[data-testid="footer-editable-toggle"]',
  },

  // Editor
  editor: {
    content: '[data-testid="editor-content"]',
    toolbar: '[data-testid="editor-toolbar"]',
    footer: '[data-testid="editor-footer"]',
  },
} as const;

/**
 * CSS selectors for DOM elements (when data-testid not available)
 */
export const CSS_SELECTORS = {
  table: 'table',
  tableCell: 'td, th',
  tableRow: 'tr',
  paragraph: 'p',
  heading: 'h1, h2, h3, h4, h5, h6',
  bold: 'strong, b',
  italic: 'em, i',
  underline: 'u',
} as const;
