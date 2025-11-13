import { DocumentEngineConfig } from './kit/kit.type';

/**
 * EditorCapabilities class
 * Pre-calculates all capability checks from DocumentEngineConfig
 * to avoid repeated function calls in UI components
 */
export class EditorCapabilities {
  // History (undo/redo)
  readonly hasHistory: boolean;

  // Basic inline
  readonly hasBold: boolean;
  readonly hasItalic: boolean;
  readonly hasUnderline: boolean;
  readonly hasStrike: boolean;
  readonly basicInline: boolean;

  // Advanced Inine
  readonly hasSubscript: boolean;
  readonly hasSuperscript: boolean;
  readonly hasCode: boolean;
  readonly hasLink: boolean;
  readonly advancedInline: boolean;

  // Text property
  readonly hasHeading: boolean;
  readonly hasFontSize: boolean;
  readonly hasLineHeight: boolean;
  readonly hasTextCase: boolean;
  readonly hasTextProperty: boolean;

  // Alignment & Layout
  readonly hasTextAlign: boolean;
  readonly hasIndent: boolean;
  readonly hasLists: boolean;
  readonly hasAlignmentLayout: boolean;

  // Format Utilities
  readonly hasColors: boolean;
  readonly hasResetFormat: boolean;
  readonly hasFormatUtilities: boolean;

  // Block Types
  readonly hasCodeBlock: boolean;
  readonly hasBlockquote: boolean;
  readonly hasBlockTypes: boolean;

  // Insert Object
  readonly hasImages: boolean;
  readonly hasTable: boolean;
  readonly hasSpecialChars: boolean;
  readonly hasPageBreak: boolean;
  readonly hasInsertObject: boolean;

  // Business Features
  readonly hasTemplates: boolean;
  readonly hasDynamicFields: boolean;
  readonly hasEditableRegion: boolean;
  readonly hasBusinessFeatures: boolean;

  // Actions
  readonly hasClearContent: boolean;
  readonly hasMarkdown: boolean;
  readonly hasActions: boolean;

  // UI Components
  readonly hasFooter: boolean;
  readonly hasPrintButton: boolean;

  constructor(config: Partial<DocumentEngineConfig>) {
    // History
    this.hasHistory = config.undoRedo !== false;

    // Basic inline
    this.hasBold = config.bold !== false;
    this.hasItalic = config.italic !== false;
    this.hasUnderline = config.underline !== false;
    this.hasStrike = config.strike !== false;
    this.basicInline = this.hasBold || this.hasItalic || this.hasUnderline || this.hasStrike;

    // Advanced Inline
    this.hasSubscript = config.subscript !== false;
    this.hasSuperscript = config.superscript !== false;
    this.hasCode = config.code !== false;
    this.hasLink = config.link !== false;
    this.advancedInline = this.hasSubscript || this.hasSuperscript || this.hasCode || this.hasLink;

    // Text property
    this.hasHeading = config.heading !== false;
    this.hasFontSize = config.fontSize !== false;
    this.hasLineHeight = config.lineHeight !== false;
    this.hasTextCase = config.textCase !== false;
    this.hasTextProperty = this.hasHeading || this.hasFontSize || this.hasLineHeight || this.hasTextCase;

    // Alignment & Layout
    this.hasTextAlign = config.textAlign !== false;
    this.hasIndent = config.indent !== false;
    this.hasLists = config.list !== false;
    this.hasAlignmentLayout = this.hasTextAlign || this.hasIndent || this.hasLists;

    // Format Utilities
    this.hasColors = config.textStyleKit !== false;
    this.hasResetFormat = config.resetFormat !== false;
    this.hasFormatUtilities = this.hasColors || this.hasResetFormat;

    // Block Types
    this.hasCodeBlock = false;
    this.hasBlockquote = config.blockquote !== false;
    this.hasBlockTypes = this.hasCodeBlock || this.hasBlockquote;

    // Insert Object
    this.hasImages = config.image !== false;
    this.hasTable = config.tables !== false;
    this.hasSpecialChars = config.specialCharacters !== false;
    this.hasPageBreak = config.pageBreak !== false;
    this.hasInsertObject = this.hasImages || this.hasTable || this.hasSpecialChars || this.hasPageBreak;

    // Business Features
    this.hasTemplates = !!(config.templates && config.templates.length > 0);
    this.hasDynamicFields = config.dynamicField !== false;
    this.hasEditableRegion = config.restrictedEditing !== false;
    this.hasBusinessFeatures = this.hasTemplates || this.hasDynamicFields || this.hasEditableRegion;

    // Actions
    this.hasClearContent = config.clearContent !== false;
    this.hasMarkdown = false;
    this.hasActions = this.hasClearContent || this.hasMarkdown;

    // UI Components
    this.hasFooter = config.showFooter !== false;
    this.hasPrintButton = config.showPrintButton !== false;
  }
}
