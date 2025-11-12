import { DocumentEngineConfig, RestrictedEditingOptions } from '@phuong-tran-redoc/document-engine-core';
import { Editor } from '@tiptap/core';

export interface ToolbarState {
  isReadOnly: boolean;

  // History
  canUndo: boolean;
  canRedo: boolean;

  // Format Utilities
  canResetFormat: boolean;

  // Text Styles - Basic Inline
  canToggleBold: boolean;
  canToggleItalic: boolean;
  canToggleUnderline: boolean;
  canToggleStrike: boolean;

  // Text Styles - Advanced Inline
  canToggleSubscript: boolean;
  canToggleSuperscript: boolean;
  canToggleCode: boolean;
  canToggleLink: boolean;

  // Alignment & Layout
  canDecreaseIndent: boolean;
  canIncreaseIndent: boolean;
  canToggleBulletList: boolean;

  // Block Types
  canToggleBlockquote: boolean;

  // Insert Object
  canInsertPageBreak: boolean;

  // Business Features
  canToggleEditableRegion: boolean;

  // Actions
  canClearContent: boolean;
}

export const DEFAULT_TOOLBAR_STATE: ToolbarState = {
  isReadOnly: true,
  canUndo: false,
  canRedo: false,
  canResetFormat: false,
  canToggleBold: false,
  canToggleItalic: false,
  canToggleUnderline: false,
  canToggleStrike: false,
  canToggleSubscript: false,
  canToggleSuperscript: false,
  canToggleCode: false,
  canToggleLink: false,
  canDecreaseIndent: false,
  canIncreaseIndent: false,
  canToggleBulletList: false,
  canToggleBlockquote: false,
  canInsertPageBreak: false,
  canToggleEditableRegion: false,
  canClearContent: false,
};

function safeCanCheck(editor: Editor, commandFn: () => boolean): boolean {
  try {
    return commandFn();
  } catch {
    return false;
  }
}

export function buildToolbarState(editor: Editor, config?: Partial<DocumentEngineConfig>): ToolbarState {
  return {
    isReadOnly:
      !config?.editable ||
      (!!config.restrictedEditing &&
        (config?.restrictedEditing as RestrictedEditingOptions).initialMode === 'restricted'),

    // History
    canUndo: safeCanCheck(editor, () => editor.can().chain().focus().undo().run()),
    canRedo: safeCanCheck(editor, () => editor.can().chain().focus().redo().run()),

    // Format Utilities
    canResetFormat: safeCanCheck(editor, () => editor.can().chain().focus().resetFormat().run()),

    // Text Styles - Basic Inline
    canToggleBold: safeCanCheck(editor, () => editor.can().chain().focus().toggleBold().run()),
    canToggleItalic: safeCanCheck(editor, () => editor.can().chain().focus().toggleItalic().run()),
    canToggleUnderline: safeCanCheck(editor, () => editor.can().chain().focus().toggleUnderline().run()),
    canToggleStrike: safeCanCheck(editor, () => editor.can().chain().focus().toggleStrike().run()),

    // Text Styles - Advanced Inline
    canToggleSubscript: safeCanCheck(editor, () => editor.can().chain().focus().toggleSubscript().run()),
    canToggleSuperscript: safeCanCheck(editor, () => editor.can().chain().focus().toggleSuperscript().run()),
    canToggleCode: safeCanCheck(editor, () => editor.can().chain().focus().toggleCode().run()),
    canToggleLink: safeCanCheck(editor, () => editor.can().chain().focus().toggleLink().run()),

    // Alignment & Layout
    canDecreaseIndent: safeCanCheck(editor, () => editor.can().chain().focus().decreaseIndent().run()),
    canIncreaseIndent: safeCanCheck(editor, () => editor.can().chain().focus().increaseIndent().run()),
    canToggleBulletList: safeCanCheck(editor, () => editor.can().chain().focus().toggleBulletList().run()),

    // Block Types
    canToggleBlockquote: safeCanCheck(editor, () => editor.can().chain().focus().toggleBlockquote().run()),

    // Insert Object
    canInsertPageBreak: safeCanCheck(editor, () => editor.can().chain().focus().insertPageBreak().run()),

    // Business Features
    canToggleEditableRegion: safeCanCheck(editor, () => editor.can().chain().focus().toggleEditableRegion().run()),

    // Actions
    canClearContent: safeCanCheck(editor, () => editor.can().chain().focus().clear().run()),
  };
}
