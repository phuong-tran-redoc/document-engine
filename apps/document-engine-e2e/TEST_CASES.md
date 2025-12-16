# E2E Test Cases

**Total Tests:** 30
**Priority:** @critical

| Layer                | Component/Feature            | Test Case                                                        | Priority    | File Location                                   |
| :------------------- | :--------------------------- | :--------------------------------------------------------------- | :---------- | :---------------------------------------------- |
| **Layer 1: Core**    | **Table NodeView**           | should show hover icons when mouse enters table                  | 🔴 Critical | `core/nodeviews/table-nodeview.spec.ts`         |
| **Layer 1: Core**    | **Table NodeView**           | should add row before when clicking add row before button        | 🔴 Critical | `core/nodeviews/table-nodeview.spec.ts`         |
| **Layer 1: Core**    | **Table NodeView**           | should add row after when clicking add row after button          | 🔴 Critical | `core/nodeviews/table-nodeview.spec.ts`         |
| **Layer 1: Core**    | **Table NodeView**           | should delete row when clicking delete row button                | 🔴 Critical | `core/nodeviews/table-nodeview.spec.ts`         |
| **Layer 1: Core**    | **Table NodeView**           | should add column before when clicking add column before button  | 🔴 Critical | `core/nodeviews/table-nodeview.spec.ts`         |
| **Layer 1: Core**    | **Table NodeView**           | should add column after when clicking add column after button    | 🔴 Critical | `core/nodeviews/table-nodeview.spec.ts`         |
| **Layer 1: Core**    | **Table NodeView**           | should delete column when clicking delete column button          | 🔴 Critical | `core/nodeviews/table-nodeview.spec.ts`         |
| **Layer 1: Core**    | **Table NodeView**           | should not show hover icons on nested table when hovering parent | 🔴 Critical | `core/nodeviews/table-nodeview.spec.ts`         |
| **Layer 1: Core**    | **Table NodeView**           | should hide icons when mouse leaves table                        | 🔴 Critical | `core/nodeviews/table-nodeview.spec.ts`         |
| **Layer 1: Core**    | **Table NodeView**           | should position icons correctly relative to table                | 🔴 Critical | `core/nodeviews/table-nodeview.spec.ts`         |
| **Layer 1: Core**    | **PageBreak NodeView**       | should render with correct attributes                            | 🔴 Critical | `core/nodeviews/page-break-nodeview.spec.ts`    |
| **Layer 1: Core**    | **PageBreak NodeView**       | should be selectable                                             | 🔴 Critical | `core/nodeviews/page-break-nodeview.spec.ts`    |
| **Layer 1: Core**    | **PageBreak NodeView**       | should delete on backspace                                       | 🔴 Critical | `core/nodeviews/page-break-nodeview.spec.ts`    |
| **Layer 1: Core**    | **DynamicField NodeView**    | should insert and display correctly                              | 🔴 Critical | `core/nodeviews/dynamic-field-nodeview.spec.ts` |
| **Layer 1: Core**    | **DynamicField NodeView**    | should validate field name                                       | 🔴 Critical | `core/nodeviews/dynamic-field-nodeview.spec.ts` |
| **Layer 2: Angular** | **Toolbar Component**        | should toggle bold when clicking bold button                     | 🔴 Critical | `angular/components/toolbar.spec.ts`            |
| **Layer 2: Angular** | **Toolbar Component**        | should show active state when cursor is in bold text             | 🔴 Critical | `angular/components/toolbar.spec.ts`            |
| **Layer 2: Angular** | **Toolbar Component**        | should apply heading when selecting from dropdown                | 🔴 Critical | `angular/components/toolbar.spec.ts`            |
| **Layer 2: Angular** | **Toolbar Component**        | should disable buttons when editor is not editable               | 🔴 Critical | `angular/components/toolbar.spec.ts`            |
| **Layer 2: Angular** | **Toolbar Component**        | should insert table when clicking insert table button            | 🔴 Critical | `angular/components/toolbar.spec.ts`            |
| **Layer 2: Angular** | **Toolbar Component**        | should apply text alignment when clicking align buttons          | 🔴 Critical | `angular/components/toolbar.spec.ts`            |
| **Layer 2: Angular** | **Toolbar Component**        | should undo when clicking undo button                            | 🔴 Critical | `angular/components/toolbar.spec.ts`            |
| **Layer 2: Angular** | **Toolbar Component**        | should redo when clicking redo button                            | 🔴 Critical | `angular/components/toolbar.spec.ts`            |
| **Layer 2: Angular** | **DocumentEditor Component** | should emit editorReady event with editor instance               | 🔴 Critical | `angular/components/document-editor.spec.ts`    |
| **Layer 2: Angular** | **DocumentEditor Component** | should apply config binding                                      | 🔴 Critical | `angular/components/document-editor.spec.ts`    |
| **Layer 2: Angular** | **DocumentEditor Component** | should handle lifecycle correctly                                | 🔴 Critical | `angular/components/document-editor.spec.ts`    |
| **Layer 2: Angular** | **DocumentEditor Component** | should expose editor instance to window                          | 🔴 Critical | `angular/components/document-editor.spec.ts`    |
| **Layer 2: Angular** | **TiptapEditor Directive**   | should bind ngModel correctly                                    | 🔴 Critical | `angular/directives/tiptap-editor.spec.ts`      |
| **Layer 2: Angular** | **TiptapEditor Directive**   | should update on value change                                    | 🔴 Critical | `angular/directives/tiptap-editor.spec.ts`      |
| **Layer 2: Angular** | **TiptapEditor Directive**   | should emit events on content change                             | 🔴 Critical | `angular/directives/tiptap-editor.spec.ts`      |
