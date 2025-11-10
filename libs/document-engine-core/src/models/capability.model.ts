import { DocumentEngineConfig } from '../core';

/**
 * EditorCapabilities class
 * Pre-calculates all capability checks from DocumentEngineConfig
 * to avoid repeated function calls in UI components
 */
export class EditorCapabilities {
  // History & Formatting
  readonly hasHistory: boolean;
  readonly hasFormatting: boolean;

  // Colors & Styles
  readonly hasColors: boolean;
  readonly hasBold: boolean;
  readonly hasItalic: boolean;
  readonly hasUnderline: boolean;
  readonly hasStrike: boolean;

  // Text Formatting
  readonly hasFontSize: boolean;
  readonly hasLineHeight: boolean;
  readonly hasTextCase: boolean;
  readonly hasHeading: boolean;
  readonly hasResetFormat: boolean;

  // Alignment & Layout
  readonly hasTextAlign: boolean;
  readonly hasIndent: boolean;

  // Lists
  readonly hasLists: boolean;

  // Advanced Features
  readonly hasLinks: boolean;
  readonly hasImages: boolean;
  readonly hasTable: boolean;
  readonly hasDynamicFields: boolean;
  readonly hasTemplates: boolean;
  readonly hasSpecialChars: boolean;

  // Utilities
  readonly hasEditableRegion: boolean;
  readonly hasPageBreak: boolean;
  readonly hasClearContent: boolean;
  readonly hasMarkdown: boolean;

  // UI Components
  readonly hasFooter: boolean;

  // Computed
  readonly hasAdvanced: boolean;

  constructor(config: Partial<DocumentEngineConfig>, editable = true) {
    console.log('Calculate config', config);

    // History & Formatting
    this.hasHistory = config.starterKit !== false;
    this.hasFormatting = config.starterKit !== false;

    // Colors & Styles
    this.hasColors = config.textStyleKit !== false;
    this.hasBold = this.checkStarterKitFeature(config, 'bold');
    this.hasItalic = this.checkStarterKitFeature(config, 'italic');
    this.hasUnderline = this.checkStarterKitFeature(config, 'underline');
    this.hasStrike = this.checkStarterKitFeature(config, 'strike');

    // Text Formatting
    this.hasFontSize = config.fontSize !== false;
    this.hasLineHeight = config.lineHeight !== false;
    this.hasTextCase = config.textCase !== false;
    this.hasHeading = config.heading !== false;
    this.hasResetFormat = config.resetFormat !== false;

    // Alignment & Layout
    this.hasTextAlign = config.textAlign !== false;
    this.hasIndent = config.indent !== false;

    // Lists - check both custom orderedList and starterKit bulletList
    this.hasLists = this.checkListsCapability(config);

    // Advanced Features
    this.hasLinks = this.checkStarterKitFeature(config, 'link');
    this.hasImages = config.image !== false;
    this.hasTable = config.tables !== false;
    this.hasDynamicFields = config.dynamicField !== false;
    this.hasTemplates = !!(config.templates && config.templates.length > 0);
    this.hasSpecialChars = editable;

    // Utilities
    this.hasEditableRegion = config.restrictedEditing !== false;
    this.hasPageBreak = config.pageBreak !== false;
    this.hasClearContent = config.clearContent !== false;
    this.hasMarkdown = config.markdown !== false;

    // UI Components
    this.hasFooter = config.showFooter !== false;

    // Computed - check if any advanced features are enabled
    this.hasAdvanced =
      this.hasTextCase ||
      this.hasLists ||
      this.hasLinks ||
      this.hasImages ||
      this.hasDynamicFields ||
      this.hasSpecialChars ||
      this.hasTemplates;
  }

  /**
   * Check if a specific feature is enabled in StarterKit
   */
  private checkStarterKitFeature(
    config: Partial<DocumentEngineConfig>,
    feature: 'bold' | 'italic' | 'underline' | 'strike' | 'link'
  ): boolean {
    if (config.starterKit === false) {
      return false;
    }
    if (config.starterKit && typeof config.starterKit === 'object') {
      return (config.starterKit as any)[feature] !== false;
    }
    return true; // Default includes all features
  }

  /**
   * Check if lists capability is enabled
   * Checks both custom orderedList and starterKit bulletList
   */
  private checkListsCapability(config: Partial<DocumentEngineConfig>): boolean {
    // Check orderedList first (custom extension)
    if (config.orderedList !== false) {
      return true;
    }

    // Then check starterKit for bulletList
    if (config.starterKit === false) {
      return false;
    }

    if (config.starterKit && typeof config.starterKit === 'object') {
      return (config.starterKit as any).bulletList !== false;
    }
    return true; // Default includes lists
  }
}
