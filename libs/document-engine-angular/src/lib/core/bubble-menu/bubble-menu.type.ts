import { Type } from '@angular/core';
import { Editor } from '@tiptap/core';
import { BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu';

export type BubbleTarget =
  | {
      kind: 'mark';
      name: string | string[];
      allowEmptySelection?: boolean;
      requireFocus?: boolean;
      extraPredicate?: (editor: Editor) => boolean;
    }
  | {
      kind: 'node';
      name: string | string[];
      allowEmptySelection?: boolean;
      requireFocus?: boolean;
      extraPredicate?: (editor: Editor) => boolean;
    };

export type BubbleMenuProps = Omit<
  BubbleMenuPluginProps,
  'editor' | 'element' | 'pluginKey' | 'shouldShow' | 'getReferencedVirtualElement'
> & {
  pluginKey: string;
  mountTo?: string | null;
};

/**
 * Interface that bubble view components must implement
 */
export interface BubbleMenuViewContent<TAttrs = Record<string, unknown>> {
  /**
   * Called when view becomes active
   *
   * @param attrs - Attributes from the active mark/node
   *
   * Use this to:
   * - Initialize form controls with attribute values
   * - Set up initial state
   */
  onActivate?(attrs: TAttrs): void;

  /**
   * Called when view becomes inactive (before navigation away or close)
   *
   * Use this to:
   * - Clean up subscriptions
   * - Cancel pending operations
   */
  onDeactivate?(): void;

  /**
   * Navigate to another view by ID
   * Views decide their own navigation logic
   *
   * @param viewId - The ID of the view to navigate to
   *
   * @example
   * // In main view: navigate to edit
   * this.navigateTo?.('edit');
   */
  navigateTo?(viewId: string): void;

  /**
   * Navigate back to previous view
   * Each view decides where "back" goes
   *
   * @param viewId - Optional view ID to go back to. If not provided, closes the bubble
   *
   * @example
   * // In edit view: go back to main
   * this.goBack?.('main');
   *
   * // Or close if no previous view
   * this.close?.();
   */
  goBack?(viewId?: string): void;

  /**
   * Close the entire bubble menu
   *
   * @example
   * this.close?.();
   */
  close?(): void;

  /**
   * Editor instance (injected by wrapper)
   */
  editor?: Editor;

  /**
   * Current view ID (injected by wrapper)
   */
  viewId?: string;
}

/**
 * Configuration for a single view within the bubble menu
 */
export interface BubbleMenuViewConfig<TAttrs = Record<string, unknown>> {
  /**
   * Unique identifier for this view
   * Used for navigation: navigateTo('viewId')
   */
  id: string;

  /**
   * The Angular component to render for this view
   */
  component: Type<BubbleMenuViewContent<TAttrs>>;

  /**
   * Condition to determine if this view should be shown when bubble activates
   *
   * @param attrs - The attributes from the active mark/node
   * @returns true if this view should be shown
   *
   * @example
   * showWhen: (attrs) => !!attrs.href  // Show if link exists
   * showWhen: (attrs) => attrs.colspan > 1  // Show if cell spans multiple columns
   */
  showWhen?: (attrs: TAttrs) => boolean;

  /**
   * Should this view be shown when bubble is force-opened?
   * (e.g., via toolbar button when no selection exists)
   *
   * @default false
   */
  showOnForceOpen?: boolean;

  /**
   * Is this the default/fallback view?
   * Shown when no other view's showWhen condition matches
   *
   * @default false
   */
  isDefault?: boolean;

  /**
   * Optional label for debugging/logging
   */
  label?: string;
}

/**
 * Configuration for the multi-view bubble menu wrapper
 */
export interface EditorBubbleMenuConfig {
  /**
   * The target mark or node to track
   */
  target: BubbleTarget;

  /**
   * Array of view configurations
   * Order matters: first matching view is selected
   */
  views: BubbleMenuViewConfig[];

  /**
   * Optional Floating UI options for positioning and behavior
   */
  props?: BubbleMenuProps;
}

export interface ToolbarBubbleMenuConfig {
  /**
   * Unique plugin key for this bubble menu instance
   */
  pluginKey: string;

  /**
   * Array of view configurations
   * Order matters: first matching view is selected
   */
  views: BubbleMenuViewConfig[];

  /**
   * Optional width for the bubble menu
   */
  width?: string;

  /**
   * Optional max width for the bubble menu
   */
  maxWidth?: string;
}
