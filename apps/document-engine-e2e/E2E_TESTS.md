# E2E Test Documentation

**Last Updated:** 2025-12-17  
**Total Test Files:** 21  
**Total Tests:** ~177 (32 implemented, 145 planned)

---

## 📊 Quick Stats

| Priority      | Files  | Tests   | Implemented | Planned |
| ------------- | ------ | ------- | ----------- | ------- |
| **@critical** | 6      | 58      | 32          | 26      |
| **@high**     | 7      | 77      | 0           | 77      |
| **@medium**   | 8      | 42      | 0           | 42      |
| **TOTAL**     | **21** | **177** | **32**      | **145** |

---

## 🎯 Test Organization by Priority

### 🔴 @critical - Core Functionality (6 files, 58 tests)

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

#### 5. Table Main View (18 tests) 🟡 PLACEHOLDER

**File:** `angular/views/table-main-view.spec.ts`  
**Source:** `libs/document-engine-angular/src/lib/views/table-views/table-main-view.ts`

**Column Actions (4 tests):**

1. should insert column left when selecting add-before option
2. should insert column right when selecting add-after option
3. should delete column when selecting delete option
4. should select entire column when selecting select option

**Row Actions (4 tests):** 5. should insert row above when selecting add-before option 6. should insert row below when selecting add-after option 7. should delete row when selecting delete option 8. should select entire row when selecting select option

**Cell Actions (4 tests):** 9. should merge cells when multiple cells are selected 10. should split cell when merged cell is selected 11. should disable merge button when single cell is selected 12. should disable split button when non-merged cell is selected

**Navigation (2 tests):** 13. should navigate to Table Properties view when clicking table properties button 14. should navigate to Cell Properties view when clicking cell properties button

**Remaining (4 tests):**
15-18. Additional table manipulation tests

---

#### 6. Restricted Editing Extension (8 tests) 🟡 PLACEHOLDER

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

### 🟠 @high - Important Features (7 files, 77 tests)

#### 7. Table Cell Style View (20 tests) 🟡 PLACEHOLDER

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

**Background Styling (2 tests):** 8. should set background color using color picker 9. should clear background color

**Text Alignment (4 tests):** 10. should set text alignment to left 11. should set text alignment to center 12. should set text alignment to right 13. should set text alignment to justify

**Vertical Alignment (3 tests):** 14. should set vertical alignment to top 15. should set vertical alignment to middle 16. should set vertical alignment to bottom

**Actions (4 tests):** 17. should save cell styles when clicking Save button 18. should cancel and return to main view when clicking Cancel button 19. should apply multiple style changes together 20. Additional cell styling test

---

#### 8. Table Style View (13 tests) 🟡 PLACEHOLDER

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

**Background Styling (2 tests):** 9. should set table background color using color picker 10. should clear table background color

**Actions (3 tests):** 11. should save table styles when clicking Save button 12. should cancel and return to main view when clicking Cancel button 13. should apply multiple style changes together

---

#### 9. Table Resizing Extension (6 tests) 🟡 PLACEHOLDER

**File:** `core/extensions/table-resizing.spec.ts`  
**Source:** `libs/document-engine-core/src/extensions/table-resizing.extension.ts`

1. should show resize handle on column border hover
2. should resize column by dragging handle
3. should update colwidths attribute after resize
4. should maintain total table width during resize
5. should respect minimum column width
6. should show cursor change during resize

---

#### 10-13. Additional @high Files (38 tests) 🔴 TODO

- **link-main-view.spec.ts** (~10 tests)
- **link-edit-view.spec.ts** (~8 tests)
- **image-insert-view.spec.ts** (~12 tests)
- **table-create-view.spec.ts** (~8 tests)

---

### 🟡 @medium - Nice-to-Have (8 files, 42 tests)

#### 14. Reset on Enter Extension (4 tests) 🟡 PLACEHOLDER

**File:** `core/extensions/reset-on-enter.spec.ts`  
**Source:** `libs/document-engine-core/src/extensions/reset-on-enter.extension.ts`

1. should reset formatting when pressing Enter in heading
2. should reset formatting when pressing Enter in list
3. should maintain formatting with Shift+Enter
4. should reset custom styles on Enter

---

#### 15-21. Additional @medium Files (38 tests) 🔴 TODO

- **dynamic-fields-view.spec.ts** (~6 tests)
- **special-characters-view.spec.ts** (~5 tests)
- **template-view.spec.ts** (~6 tests)
- **color-picker-view.spec.ts** (~8 tests)
- **link-properties-view.spec.ts** (~6 tests)
- **clear-content.spec.ts** (~3 tests)
- **text-case.spec.ts** (~4 tests)

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
│       ├── table-resizing.spec.ts (@high) 🟡 6 tests
│       ├── reset-on-enter.spec.ts (@medium) 🟡 4 tests
│       ├── clear-content.spec.ts (@medium) 🔴 TODO
│       └── text-case.spec.ts (@medium) 🔴 TODO
└── angular/
    ├── components/
    │   ├── toolbar.spec.ts (@critical) ✅ 8 tests (planned)
    │   ├── document-editor.spec.ts (@critical) ✅ 4 tests (planned)
    │   └── tiptap-editor.spec.ts (@critical) ✅ 3 tests (planned)
    └── views/
        ├── table-main-view.spec.ts (@critical) 🟡 18 tests
        ├── table-cell-style-view.spec.ts (@high) 🟡 20 tests
        ├── table-style-view.spec.ts (@high) 🟡 13 tests
        ├── table-create-view.spec.ts (@high) 🔴 TODO
        ├── link-main-view.spec.ts (@high) 🔴 TODO
        ├── link-edit-view.spec.ts (@high) 🔴 TODO
        ├── link-properties-view.spec.ts (@medium) 🔴 TODO
        ├── image-insert-view.spec.ts (@high) 🔴 TODO
        ├── dynamic-fields-view.spec.ts (@medium) 🔴 TODO
        ├── special-characters-view.spec.ts (@medium) 🔴 TODO
        ├── template-view.spec.ts (@medium) 🔴 TODO
        └── color-picker-view.spec.ts (@medium) 🔴 TODO
```

---

## 🔑 Legend

- ✅ **IMPLEMENTED** - Tests written and working
- 🟡 **PLACEHOLDER** - File created with TODO placeholders
- 🔴 **TODO** - File needs to be created

---

## 📈 Implementation Roadmap

### Phase 1: @critical (Priority 1)

1. ✅ Core NodeViews (table, page-break, dynamic-field)
2. ✅ Table Bubble Menu Extension
3. 🟡 Table Main View (implement tests)
4. 🟡 Restricted Editing Extension (implement tests)

### Phase 2: @high (Priority 2)

5. 🟡 Table Cell Style View (implement tests)
6. 🟡 Table Style View (implement tests)
7. 🟡 Table Resizing Extension (implement tests)
8. 🔴 Link Views (create & implement)
9. 🔴 Image Insert View (create & implement)
10. 🔴 Table Create View (create & implement)

### Phase 3: @medium (Priority 3)

11. 🟡 Reset on Enter Extension (implement tests)
12. 🔴 Remaining utility views (create & implement)

---

## 📝 Notes

- All placeholder tests use `// TODO: Implement` comments
- Test files follow naming convention: `{feature-name}.spec.ts`
- Priority tags (@critical, @high, @medium) indicate implementation order
- Focus on UI interaction testing, not command execution
- Verify visual changes in DOM/styles
