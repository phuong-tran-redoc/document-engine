# E2E Test Documentation

**Last Updated:** 2025-12-18  
**Total Test Files:** 28  
**Total Tests:** ~235 (71 implemented, 164 planned)

---

## 📊 Quick Stats

| Priority      | Files  | Tests   | Implemented | Planned |
| ------------- | ------ | ------- | ----------- | ------- |
| **@critical** | 7      | 64      | 52          | 12      |
| **@high**     | 11     | 115     | 46          | 69      |
| **@medium**   | 10     | 56      | 11          | 45      |
| **TOTAL**     | **28** | **235** | **109**     | **126** |

---

## 📁 Directory Structure

```
apps/document-engine-e2e/src/
├── core/
│   ├── nodeviews/
│   │   ├── table-nodeview.spec.ts (@critical) ✅ 12 tests
│   │   ├── page-break-nodeview.spec.ts (@critical) ✅ 3 tests
│   │   └── dynamic-field-nodeview.spec.ts (@critical) ✅ 11 tests
│   └── extensions/
│       ├── table-bubble-menu.spec.ts (@critical) ✅ 6 tests
│       ├── restricted-editing.spec.ts (@critical) 🟡 8 tests
│       ├── table-resizing.spec.ts (@high) ✅ 6 tests
│       ├── reset-on-enter.spec.ts (@medium) ✅ 4 tests
│       ├── clear-content.spec.ts (@medium) ✅ 3 tests
│       └── text-case.spec.ts (@medium) ✅ 4 tests
└── angular/
    ├── directives/
    │   └── tiptap-editor.spec.ts (@critical) ✅ 6 tests
    ├── components/
    │   ├── toolbar.spec.ts (@critical) ✅ 8 tests (planned)
    │   └── document-editor.spec.ts (@critical) ✅ 4 tests (planned)
    └── views/
        ├── table-main-view.spec.ts (@critical) ✅ 14 tests
        ├── table-cell-style-view.spec.ts (@high) ✅ 19 tests
        ├── table-style-view.spec.ts (@high) ✅ 13 tests
        ├── table-create-view.spec.ts (@high) ✅ 8 tests
        ├── link-main-view.spec.ts (@high) 🟡 10 tests
        ├── link-edit-view.spec.ts (@high) 🟡 8 tests
        ├── link-properties-view.spec.ts (@medium) 🟡 6 tests
        ├── image-insert-view.spec.ts (@high) 🟡 12 tests
        ├── dynamic-fields-view.spec.ts (@medium) 🟡 6 tests
        ├── special-characters-view.spec.ts (@medium) 🟡 5 tests
        ├── template-view.spec.ts (@medium) 🟡 6 tests
        └── color-picker-view.spec.ts (@medium) 🟡 8 tests
```

**Legend:**

- ✅ **IMPLEMENTED** - Tests written and working
- 🟡 **PLACEHOLDER** - File created with TODO placeholders
- 🔴 **TODO** - File needs to be created

---

## 🎯 Test Organization by Priority

### 🔴 @critical - Core Functionality (7 files, 64 tests)

#### 1. Table NodeView (12 tests) ✅ IMPLEMENTED

**File:** `core/nodeviews/table-nodeview.spec.ts`  
**Source:** `libs/document-engine-core/src/views/block-handler.ts`

**Handle & TypeAround (2 tests):**

1. should render table with handle wrapper
2. should show typearound buttons on hover

**Colgroup Rendering (3 tests):** 3. should render table with colgroup 4. should render col elements with width styles 5. should update colgroup when table structure changes

**Table Structure (3 tests):** 6. should render table with tbody as contentDOM 7. should render cells as editable 8. should maintain table structure after content changes

**Table Styles (2 tests):** 9. should apply table border styles from attributes 10. should apply table background color from attributes

**Nested Tables & Positioning (2 tests):** 11. should not show hover icons on nested table when hovering parent 12. should position icons correctly relative to table

---

#### 2. PageBreak NodeView (3 tests) ✅ IMPLEMENTED

**File:** `core/nodeviews/page-break-nodeview.spec.ts`

1. should render with correct attributes
2. should be selectable
3. should delete on backspace

---

#### 3. DynamicField NodeView (11 tests) ✅ IMPLEMENTED

**File:** `core/nodeviews/dynamic-field-nodeview.spec.ts`

**Display & Styling (4 tests):**

1. should insert and display correctly
2. should have correct CSS classes
3. should display label text in NodeView
4. should have red-dynamic-field styling applied

**Interaction (3 tests):** 5. should be selectable by clicking 6. should delete on backspace when selected 7. should delete on delete key when selected

**Commands (3 tests):** 8. should insert via insertDynamicField command 9. should insert at cursor position 10. should not insert without required attributes

---

#### 4. Table Bubble Menu Extension (6 tests) ✅ IMPLEMENTED

**File:** `core/extensions/table-bubble-menu.spec.ts`  
**Source:** `libs/document-engine-core/src/extensions/table-style.extension.ts`

**Bubble Menu Rendering (3 tests):**

1. should render table bubble menu when clicking on table cell
2. should show row dropdown options when clicking row control
3. should show column dropdown options when clicking column control

**Bubble Menu Visibility (3 tests):** 4. should hide bubble menu when clicking outside table to paragraph 5. should show bubble menu again when returning to table after clicking paragraph 6. should maintain bubble menu when clicking between cells

---

#### 5. TiptapEditor Directive (6 tests) ✅ IMPLEMENTED

**File:** `angular/directives/tiptap-editor.spec.ts`  
**Source:** `libs/document-engine-angular/src/lib/core/editor.directive.ts`

**ngModel Binding (3 tests):**

1. should bind initial value from ngModel
2. should update model when editor content changes
3. should update editor when model changes externally

**Disabled State (2 tests):**

4. should disable editor when disabled is true
5. should re-enable editor when disabled is toggled back

**Value Synchronization (1 test):**

6. should maintain sync between editor and model

---

#### 6. Table Main View (14 tests) ✅ IMPLEMENTED

**File:** `angular/views/table-main-view.spec.ts`  
**Source:** `libs/document-engine-angular/src/lib/views/table-views/table-main-view.ts`

**Column Actions (4 tests):**

1. should insert column left when clicking insert left button
2. should insert column right when clicking insert right button
3. should delete column when clicking delete button
4. should select entire column when clicking select button

**Row Actions (4 tests):**

5. should insert row above when clicking insert above button
6. should insert row below when clicking insert below button
7. should delete row when clicking delete button
8. should select entire row when clicking select button

**Cell Actions (4 tests):**

9. should merge cells when multiple cells are selected
10. should split cell when merged cell is selected
11. should disable merge button when single cell is selected
12. should disable split button when non-merged cell is selected

**Navigation (2 tests):**

13. should navigate to Table Properties view when clicking table properties button
14. should navigate to Cell Properties view when clicking cell properties button

---

#### 7. Restricted Editing Extension (8 tests) 🟡 PLACEHOLDER

**File:** `core/extensions/restricted-editing.spec.ts`  
**Source:** `libs/document-engine-core/src/extensions/restricted-editing.extension.ts`

**Read-only Regions (4 tests):**

1. should prevent editing in read-only regions
2. should allow editing in editable regions
3. should prevent deletion of read-only content
4. should prevent pasting into read-only regions

**Visual Indicators (2 tests):** 5. should show visual indicator for read-only regions 6. should show cursor changes in read-only regions

**Permissions (2 tests):** 7. should respect permission levels 8. should allow toggling edit mode

---

### 🟠 @high - Important Features (11 files, 115 tests)

#### 8. Table Cell Style View (19 tests) ✅ IMPLEMENTED

**File:** `angular/views/table-cell-style-view.spec.ts`  
**Source:** `libs/document-engine-angular/src/lib/views/table-views/table-cell-style-view.ts`

**Border Styling (7 tests):**

1. should set border width
2. should set border style to solid
3. should set border style to dashed
4. should set border style to dotted
5. should set border style to none
6. should set border color using color picker
7. should clear border color

**Background Styling (2 tests):**

8. should set background color using color picker
9. should clear background color

**Text Alignment (4 tests):**

10. should set text alignment to left
11. should set text alignment to center
12. should set text alignment to right
13. should set text alignment to justify

**Vertical Alignment (3 tests):**

14. should set vertical alignment to top
15. should set vertical alignment to middle
16. should set vertical alignment to bottom

**Actions (3 tests):**

17. should save cell styles when clicking Save button
18. should cancel and return to main view when clicking Cancel button
19. should apply multiple style changes together

---

#### 9. Table Style View (13 tests) ✅ IMPLEMENTED

**File:** `angular/views/table-style-view.spec.ts`  
**Source:** `libs/document-engine-angular/src/lib/views/table-views/table-style-view.ts`

**Border Styling (8 tests):**

1. should set table border width
2. should set table border style to solid
3. should set table border style to double
4. should set table border style to dashed
5. should set table border style to dotted
6. should set table border style to none
7. should set table border color using color picker
8. should clear table border color

**Background Styling (2 tests):**

9. should set table background color using color picker
10. should clear table background color

**Actions (3 tests):**

11. should save table styles when clicking Save button
12. should cancel and return to main view when clicking Cancel button
13. should apply multiple style changes together

---

#### 10. Table Resizing Extension (6 tests) ✅ IMPLEMENTED

**File:** `core/extensions/table-resizing.spec.ts`  
**Source:** `libs/document-engine-core/src/extensions/table-resizing.extension.ts`

1. should show resize handle on column border hover
2. should resize column by dragging handle
3. should update colwidths attribute after resize
4. should maintain total table width during resize
5. should respect minimum column width
6. should show cursor change during resize

---

#### 11. Link Main View (10 tests) 🟡 PLACEHOLDER

**File:** `angular/views/link-main-view.spec.ts`  
**Source:** `libs/document-engine-angular/src/lib/views/link-views/link-main-view.ts`

**Link Creation (4 tests):**

1. should show link input field
2. should create link with URL
3. should create link with text
4. should validate URL format

**Link Editing (3 tests):** 5. should show edit options for existing link 6. should update link URL 7. should remove link

**Navigation (3 tests):** 8. should navigate to link properties view 9. should open link in new tab 10. Additional link test

---

#### 12. Link Edit View (8 tests) � PLACEHOLDER

**File:** `angular/views/link-edit-view.spec.ts`  
**Source:** `libs/document-engine-angular/src/lib/views/link-views/link-edit-view.ts`

**URL Editing (3 tests):**

1. should edit link URL
2. should edit link text
3. should validate URL on edit

**Link Attributes (2 tests):** 4. should set link to open in new tab 5. should set link title attribute

**Actions (3 tests):** 6. should save link changes 7. should cancel link editing 8. should delete link

---

#### 13. Image Insert View (12 tests) 🟡 PLACEHOLDER

**File:** `angular/views/image-insert-view.spec.ts`  
**Source:** `libs/document-engine-angular/src/lib/views/image-insert-view/image-insert-view.ts`

**Image Upload (4 tests):**

1. should show file upload button
2. should upload image file
3. should validate file type
4. should validate file size

**Image URL (3 tests):** 5. should insert image from URL 6. should validate image URL 7. should show preview of URL image

**Image Properties (3 tests):** 8. should set image alt text 9. should set image dimensions 10. should set image alignment

**Actions (2 tests):** 11. should insert image with properties 12. should cancel image insertion

---

#### 14. Table Create View (8 tests) ✅ IMPLEMENTED

**File:** `angular/views/table-create-view.spec.ts`  
**Source:** Uses `insertTable` command via `/test-bench/table`

**Table Dimensions (4 tests):**

1. should show row and column inputs
2. should create table with specified dimensions
3. should validate minimum dimensions
4. should validate maximum dimensions

**Table Options (2 tests):**

5. should toggle header row option
6. should set initial table width

**Actions (2 tests):**

7. should create table on confirm
8. should cancel table creation

---

### 🟡 @medium - Nice-to-Have (10 files, 56 tests)

#### 15. Reset on Enter Extension (4 tests) ✅ IMPLEMENTED

**File:** `core/extensions/reset-on-enter.spec.ts`  
**Source:** `libs/document-engine-core/src/extensions/reset-on-enter.extension.ts`

1. should reset formatting when pressing Enter in heading
2. should reset formatting when pressing Enter in list
3. should maintain formatting with Shift+Enter
4. should reset custom styles on Enter

---

#### 16. Link Properties View (6 tests) 🟡 PLACEHOLDER

**File:** `angular/views/link-properties-view.spec.ts`  
**Source:** `libs/document-engine-angular/src/lib/views/link-views/link-properties-view.ts`

**Advanced Options (3 tests):**

1. should set link rel attribute
2. should set link class
3. should set link ID

**Actions (3 tests):** 4. should save advanced properties 5. should cancel property changes 6. should navigate back to main view

---

#### 17. Dynamic Fields View (6 tests) � PLACEHOLDER

**File:** `angular/views/dynamic-fields-view.spec.ts`  
**Source:** `libs/document-engine-angular/src/lib/views/dynamic-fields-view/dynamic-fields-view.ts`

**Field Selection (3 tests):**

1. should show available field types
2. should filter fields by search
3. should show field preview

**Field Insertion (3 tests):** 4. should insert selected field 5. should configure field properties 6. should cancel field insertion

---

#### 18. Special Characters View (5 tests) 🟡 PLACEHOLDER

**File:** `angular/views/special-characters-view.spec.ts`  
**Source:** `libs/document-engine-angular/src/lib/views/special-characters-view/special-characters-view.ts`

**Character Grid (3 tests):**

1. should show character grid
2. should filter characters by category
3. should search for characters

**Character Insertion (2 tests):** 4. should insert character on click 5. should show character preview

---

#### 19. Template View (6 tests) 🟡 PLACEHOLDER

**File:** `angular/views/template-view.spec.ts`  
**Source:** `libs/document-engine-angular/src/lib/views/template-view/template-view.ts`

**Template Selection (3 tests):**

1. should show available templates
2. should filter templates by category
3. should show template preview

**Template Insertion (3 tests):** 4. should insert template content 5. should replace existing content with template 6. should cancel template insertion

---

#### 20. Color Picker View (8 tests) 🟡 PLACEHOLDER

**File:** `angular/views/color-picker-view.spec.ts`  
**Source:** `libs/document-engine-angular/src/lib/views/color-picker-view/color-picker-view.ts`

**Color Palette (3 tests):**

1. should show color palette
2. should select color from palette
3. should show selected color preview

**Custom Color (3 tests):** 4. should allow custom color input 5. should validate color format 6. should show color picker dialog

**Actions (2 tests):** 7. should apply selected color 8. should clear color selection

---

#### 21. Clear Content Extension (3 tests) ✅ IMPLEMENTED

**File:** `core/extensions/clear-content.spec.ts`  
**Source:** `libs/document-engine-core/src/extensions/clear-content.extension.ts`

1. should clear all editor content
2. should show confirmation dialog
3. should cancel clear operation

---

#### 22. Text Case Extension (4 tests) ✅ IMPLEMENTED

**File:** `core/extensions/text-case.spec.ts`  
**Source:** `libs/document-engine-core/src/extensions/text-case.extension.ts`

1. should convert text to uppercase
2. should convert text to lowercase
3. should convert text to title case
4. should toggle case

---

## Implementation Roadmap

### Phase 1: @critical (Priority 1)

1. ✅ Core NodeViews (table, page-break, dynamic-field)
2. ✅ Table Bubble Menu Extension
3. ✅ Table Main View
4. 🟡 Restricted Editing Extension (needs test bench)

### Phase 2: @high (Priority 2)

5. ✅ Table Cell Style View
6. ✅ Table Style View
7. ✅ Table Resizing Extension
8. ✅ Table Create View
9. 🔴 Link Views (needs test bench)
10. 🔴 Image Insert View (needs test bench)

### Phase 3: @medium (Priority 3)

11. ✅ Reset on Enter Extension
12. ✅ Clear Content Extension
13. ✅ Text Case Extension
14. 🔴 Remaining utility views (needs test benches)

---

## 📝 Notes

- All placeholder tests use `// TODO: Implement` comments
- Test files follow naming convention: `{feature-name}.spec.ts`
- Priority tags (@critical, @high, @medium) indicate implementation order
- Focus on UI interaction testing, not command execution
- Verify visual changes in DOM/styles
