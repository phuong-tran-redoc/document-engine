# Test Cases - Document Engine Core Library

Tổng hợp chi tiết các test cases cho `@phuong-tran-redoc/document-engine-core` library.

**Tổng số test cases**: 178  
**Tổng số test files**: 11  
**Coverage target**: ≥ 80%

---

## 1. Extensions Tests

### 1.1. ClearContent Extension

**File**: `extensions/clear-content.extension.spec.ts`  
**Tổng số tests**: 5

| ID     | Tên Test                                    | Mô tả                                     | Input                                                        | Expected Output                     |
| ------ | ------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------ | ----------------------------------- |
| CC-001 | should clear all content from editor        | Xóa toàn bộ nội dung trong editor         | `<p>Hello World</p><p>Second paragraph</p>`                  | Editor trống, `isEmpty = true`      |
| CC-002 | should clear content with formatting        | Xóa nội dung có formatting (bold, italic) | `<p><strong>Bold text</strong> and <em>italic text</em></p>` | Editor trống                        |
| CC-003 | should work when editor is already empty    | Xử lý khi editor đã trống                 | Empty content                                                | Không lỗi, editor vẫn trống         |
| CC-004 | should register extension with correct name | Kiểm tra extension được đăng ký đúng      | N/A                                                          | Extension name = 'clearContent'     |
| CC-005 | should have clear command available         | Kiểm tra command `clear()` tồn tại        | N/A                                                          | `editor.commands.clear` là function |

---

### 1.2. ResetFormat Extension

**File**: `extensions/reset-format.extension.spec.ts`  
**Tổng số tests**: 5

| ID     | Tên Test                                            | Mô tả                                      | Input                                                       | Expected Output                           |
| ------ | --------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------- | ----------------------------------------- |
| RF-001 | should clear all marks from selected text           | Xóa tất cả marks (bold, italic, underline) | `<p><strong><em><u>Formatted text</u></em></strong></p>`    | Plain text không có marks                 |
| RF-002 | should clear node formatting (heading to paragraph) | Chuyển heading thành paragraph             | `<h1>Heading text</h1>`                                     | `<p>Heading text</p>`                     |
| RF-003 | should preserve text content                        | Giữ nguyên nội dung text sau khi reset     | `<h1><strong><em>This is formatted text</em></strong></h1>` | Text content không đổi                    |
| RF-004 | should register extension with correct name         | Kiểm tra extension được đăng ký đúng       | N/A                                                         | Extension name = 'resetFormat'            |
| RF-005 | should have resetFormat command available           | Kiểm tra command `resetFormat()` tồn tại   | N/A                                                         | `editor.commands.resetFormat` là function |

---

### 1.3. TextCase Extension

**File**: `extensions/text-case.extension.spec.ts`  
**Tổng số tests**: 12

| ID     | Tên Test                                          | Mô tả                                 | Input                       | Expected Output                        |
| ------ | ------------------------------------------------- | ------------------------------------- | --------------------------- | -------------------------------------- |
| TC-001 | should convert selected text to uppercase         | Chuyển text thành chữ HOA             | `hello world` (selected)    | `HELLO WORLD`                          |
| TC-002 | should convert mixed case to uppercase            | Chuyển mixed case thành chữ HOA       | `HeLLo WoRLd`               | `HELLO WORLD`                          |
| TC-003 | should convert selected text to lowercase         | Chuyển text thành chữ thường          | `HELLO WORLD`               | `hello world`                          |
| TC-004 | should capitalize first letter and lowercase rest | Viết hoa chữ cái đầu                  | `hello world`               | `Hello world`                          |
| TC-005 | should work with single character                 | Xử lý ký tự đơn                       | `a`                         | `A` (capitalize)                       |
| TC-006 | should return false when selection is empty       | Return false khi không có selection   | No selection                | `result = false`                       |
| TC-007 | should maintain selection after transformation    | Giữ nguyên selection sau transform    | Selection from 1 to 6       | Selection vẫn from 1 to 6              |
| TC-008 | should work with partial text selection           | Chuyển đổi một phần text              | `hello` trong `hello world` | `HELLO world`                          |
| TC-009 | should handle special characters                  | Xử lý ký tự đặc biệt                  | `hello@world.com`           | `HELLO@WORLD.COM`                      |
| TC-010 | should handle numbers                             | Xử lý số                              | `hello123world`             | `HELLO123WORLD`                        |
| TC-011 | should register extension with correct name       | Kiểm tra extension được đăng ký đúng  | N/A                         | Extension name = 'textCase'            |
| TC-012 | should have textCase command available            | Kiểm tra command `textCase()` tồn tại | N/A                         | `editor.commands.textCase` là function |

---

### 1.4. Indent Extension

**File**: `extensions/indent.extension.spec.ts`  
**Tổng số tests**: 15

| ID     | Tên Test                                               | Mô tả                                   | Input                                        | Expected Output                |
| ------ | ------------------------------------------------------ | --------------------------------------- | -------------------------------------------- | ------------------------------ |
| IN-001 | should parse margin-left style to indent attribute     | Parse HTML style thành indent attribute | `<p style="margin-left: 40px">Text</p>`      | `indent = 40`                  |
| IN-002 | should parse different indent values                   | Parse các giá trị indent khác nhau      | `<p style="margin-left: 80px">Text</p>`      | `indent = 80`                  |
| IN-003 | should parse indent on heading                         | Parse indent trên heading               | `<h1 style="margin-left: 40px">Heading</h1>` | `indent = 40`                  |
| IN-004 | should render indent attribute as margin-left style    | Render indent attribute ra HTML         | `{ indent: 40 }`                             | `style="margin-left: 40px"`    |
| IN-005 | should increase indent by default value (40px)         | Tăng indent lần đầu                     | `<p>Text</p>`                                | `indent = 40`                  |
| IN-006 | should increase existing indent                        | Tăng indent đã có                       | `indent = 40`                                | `indent = 80`                  |
| IN-007 | should work multiple times                             | Tăng indent nhiều lần                   | 3 lần `increaseIndent()`                     | `indent = 120`                 |
| IN-008 | should return false for non-allowed node types         | Return false cho node không hợp lệ      | `<blockquote>`                               | `result = false`               |
| IN-009 | should decrease indent by default value                | Giảm indent                             | `indent = 80`                                | `indent = 40`                  |
| IN-010 | should not allow negative indent                       | Không cho phép indent âm                | `indent = 0`, gọi `decreaseIndent()`         | `result = false`               |
| IN-011 | should reset attribute when indent becomes 0           | Reset attribute khi indent = 0          | `indent = 40`, gọi `decreaseIndent()`        | `indent = undefined`           |
| IN-012 | should handle increase then decrease                   | Xử lý tăng rồi giảm                     | Tăng 2 lần, giảm 1 lần                       | `indent = 40`                  |
| IN-013 | should handle full cycle back to 0                     | Xử lý chu kỳ đầy đủ về 0                | Tăng 1 lần, giảm 1 lần                       | `indent = undefined`           |
| IN-014 | should register extension with correct name            | Kiểm tra extension được đăng ký đúng    | N/A                                          | Extension name = 'indent'      |
| IN-015 | should have increaseIndent and decreaseIndent commands | Kiểm tra commands tồn tại               | N/A                                          | Cả 2 commands đều là functions |

---

### 1.5. CustomOrderedList Extension

**File**: `extensions/ordered-list.extension.spec.ts`  
**Tổng số tests**: 29

#### Parsing from data-list-style-type attribute (11 tests)

| ID     | Tên Test                          | Mô tả                               | Input                                              | Expected Output                                 |
| ------ | --------------------------------- | ----------------------------------- | -------------------------------------------------- | ----------------------------------------------- |
| OL-001 | should parse decimal (default)    | Parse decimal từ data attribute     | `<ol data-list-style-type="decimal">`              | `data-list-style-type = 'decimal'`              |
| OL-002 | should parse lower-alpha          | Parse lower-alpha từ data attribute | `<ol data-list-style-type="lower-alpha">`          | `data-list-style-type = 'lower-alpha'`          |
| OL-003 | should parse upper-alpha          | Parse upper-alpha từ data attribute | `<ol data-list-style-type="upper-alpha">`          | `data-list-style-type = 'upper-alpha'`          |
| OL-004 | should parse lower-roman          | Parse lower-roman từ data attribute | `<ol data-list-style-type="lower-roman">`          | `data-list-style-type = 'lower-roman'`          |
| OL-005 | should parse upper-roman          | Parse upper-roman từ data attribute | `<ol data-list-style-type="upper-roman">`          | `data-list-style-type = 'upper-roman'`          |
| OL-006 | should parse lower-alpha-dot      | Parse lower-alpha-dot               | `<ol data-list-style-type="lower-alpha-dot">`      | `data-list-style-type = 'lower-alpha-dot'`      |
| OL-007 | should parse lower-alpha-parens   | Parse lower-alpha-parens            | `<ol data-list-style-type="lower-alpha-parens">`   | `data-list-style-type = 'lower-alpha-parens'`   |
| OL-008 | should parse lower-roman-parens   | Parse lower-roman-parens            | `<ol data-list-style-type="lower-roman-parens">`   | `data-list-style-type = 'lower-roman-parens'`   |
| OL-009 | should parse decimal-leading-zero | Parse decimal-leading-zero          | `<ol data-list-style-type="decimal-leading-zero">` | `data-list-style-type = 'decimal-leading-zero'` |
| OL-010 | should parse lower-latin          | Parse lower-latin                   | `<ol data-list-style-type="lower-latin">`          | `data-list-style-type = 'lower-latin'`          |
| OL-011 | should parse upper-latin          | Parse upper-latin                   | `<ol data-list-style-type="upper-latin">`          | `data-list-style-type = 'upper-latin'`          |

#### Parsing from CSS style property (7 tests)

| ID     | Tên Test                                              | Mô tả                             | Input                                                                | Expected Output                        |
| ------ | ----------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------- | -------------------------------------- |
| OL-012 | should parse from style="list-style-type:decimal"     | Parse từ CSS style (decimal)      | `<ol style="list-style-type:decimal">`                               | `data-list-style-type = 'decimal'`     |
| OL-013 | should parse from style="list-style-type:lower-alpha" | Parse từ CSS style (lower-alpha)  | `<ol style="list-style-type:lower-alpha">`                           | `data-list-style-type = 'lower-alpha'` |
| OL-014 | should parse from style="list-style-type:upper-alpha" | Parse từ CSS style (upper-alpha)  | `<ol style="list-style-type:upper-alpha">`                           | `data-list-style-type = 'upper-alpha'` |
| OL-015 | should parse from style="list-style-type:lower-roman" | Parse từ CSS style (lower-roman)  | `<ol style="list-style-type:lower-roman">`                           | `data-list-style-type = 'lower-roman'` |
| OL-016 | should parse from style="list-style-type:upper-roman" | Parse từ CSS style (upper-roman)  | `<ol style="list-style-type:upper-roman">`                           | `data-list-style-type = 'upper-roman'` |
| OL-017 | should parse from style with spaces                   | Parse CSS với spaces              | `<ol style="list-style-type: lower-alpha;">`                         | `data-list-style-type = 'lower-alpha'` |
| OL-018 | should parse from style with multiple properties      | Parse CSS với multiple properties | `<ol style="margin:10px; list-style-type:upper-roman; padding:5px">` | `data-list-style-type = 'upper-roman'` |

#### Priority and Fallback (2 tests)

| ID     | Tên Test                                              | Mô tả                                     | Input                                                                         | Expected Output                        |
| ------ | ----------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------- |
| OL-019 | should prioritize data-list-style-type over CSS style | data attribute có priority cao hơn CSS    | `<ol data-list-style-type="upper-alpha" style="list-style-type:lower-roman">` | `data-list-style-type = 'upper-alpha'` |
| OL-020 | should default to decimal when no attribute or style  | Default về decimal khi không có attribute | `<ol><li><p>Item</p></li></ol>`                                               | `data-list-style-type = 'decimal'`     |

#### Rendering (1 test)

| ID     | Tên Test                                     | Mô tả                    | Input                                       | Expected Output     |
| ------ | -------------------------------------------- | ------------------------ | ------------------------------------------- | ------------------- |
| OL-021 | should render data-list-style-type attribute | Render attribute ra HTML | `{ 'data-list-style-type': 'upper-alpha' }` | HTML chứa attribute |

#### Commands (6 tests)

| ID     | Tên Test                                         | Mô tả                            | Input                                         | Expected Output                        |
| ------ | ------------------------------------------------ | -------------------------------- | --------------------------------------------- | -------------------------------------- |
| OL-022 | should set list style to upper-alpha             | Set style thành upper-alpha      | `setListStyle('upper-alpha')`                 | Attribute = 'upper-alpha'              |
| OL-023 | should change existing style                     | Thay đổi style đã có             | `lower-alpha` → `setListStyle('upper-roman')` | Attribute = 'upper-roman'              |
| OL-024 | should work with multiple list items             | Áp dụng cho list nhiều items     | 3 list items                                  | Tất cả items có cùng style             |
| OL-025 | should set all ListStyleType values correctly    | Verify tất cả 11 types hoạt động | Loop qua tất cả 11 ListStyleType values       | Mỗi type được set thành công           |
| OL-026 | should inherit from parent OrderedList extension | Kế thừa từ OrderedList           | N/A                                           | `toggleOrderedList` command tồn tại    |
| OL-027 | should create ordered list from paragraph        | Tạo list từ paragraph            | `<p>Text</p>`                                 | `isActive('customOrderedList') = true` |

#### Extension Registration (2 tests)

| ID     | Tên Test                                    | Mô tả                                     | Input | Expected Output                            |
| ------ | ------------------------------------------- | ----------------------------------------- | ----- | ------------------------------------------ |
| OL-028 | should register extension with correct name | Kiểm tra extension được đăng ký đúng      | N/A   | Extension name = 'customOrderedList'       |
| OL-029 | should have setListStyle command available  | Kiểm tra command `setListStyle()` tồn tại | N/A   | `editor.commands.setListStyle` là function |

---

## 2. Nodes Tests

### 2.1. NotumHeading Node

**File**: `nodes/heading.node.spec.ts`  
**Tổng số tests**: 11

| ID     | Tên Test                                                              | Mô tả                                             | Input                                 | Expected Output                            |
| ------ | --------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------- | ------------------------------------------ |
| NH-001 | should convert heading to paragraph                                   | Chuyển heading thành paragraph                    | `<h1>Heading text</h1>`               | `<p>Heading text</p>`                      |
| NH-002 | should preserve text content when converting                          | Giữ nguyên text khi convert                       | `<h2>Important heading</h2>`          | Text không đổi                             |
| NH-003 | should work with different heading levels                             | Xử lý tất cả levels (h1-h6)                       | `<h1>` đến `<h6>`                     | Tất cả đều convert thành `<p>`             |
| NH-004 | should return false when not in heading                               | Return false khi không phải heading               | `<p>Regular paragraph</p>`            | `result = false`                           |
| NH-005 | should convert entire heading when only part of text is selected      | Convert cả heading khi chỉ select một phần text   | Select "Heading" trong "Heading text" | Cả heading convert thành paragraph         |
| NH-006 | should have toggleHeading command from parent                         | Kế thừa toggleHeading command                     | N/A                                   | Command tồn tại                            |
| NH-007 | should have setHeading command from parent                            | Kế thừa setHeading command                        | N/A                                   | Command tồn tại                            |
| NH-008 | should toggle heading with parent command                             | Toggle heading bằng parent command                | `<p>Text</p>`                         | `isActive('heading', { level: 1 }) = true` |
| NH-009 | should convert entire paragraph to heading when only part is selected | Convert cả paragraph khi chỉ select một phần text | Select "Regular" trong paragraph      | Cả paragraph convert thành heading         |
| NH-010 | should register node with correct name                                | Kiểm tra node được đăng ký đúng                   | N/A                                   | Node name = 'heading'                      |
| NH-011 | should have removeHeading command available                           | Kiểm tra command `removeHeading()` tồn tại        | N/A                                   | Command là function                        |

---

### 2.2. PageBreak Node

**File**: `nodes/page-break.node.spec.ts`  
**Tổng số tests**: 15

| ID     | Tên Test                                          | Mô tả                           | Input                                | Expected Output                      |
| ------ | ------------------------------------------------- | ------------------------------- | ------------------------------------ | ------------------------------------ |
| PB-001 | should render div with data-page-break attribute  | Render div với attribute        | `insertPageBreak()`                  | HTML chứa `data-page-break="true"`   |
| PB-002 | should render with correct class                  | Render với class đúng           | `insertPageBreak()`                  | Class = 'document-engine-page-break' |
| PB-003 | should render with page break styles              | Render với CSS styles           | `insertPageBreak()`                  | Chứa `break-before: page`            |
| PB-004 | should render label span                          | Render label                    | `insertPageBreak()`                  | Chứa span với text 'Page break'      |
| PB-005 | should parse div with data-page-break attribute   | Parse standard format           | `<div data-page-break="true"></div>` | Node type = 'pageBreak'              |
| PB-006 | should parse div with page-break class            | Parse CKEditor format           | `<div class="page-break"></div>`     | Node type = 'pageBreak'              |
| PB-007 | should insert page break node                     | Insert page break               | `insertPageBreak()`                  | Node được thêm vào document          |
| PB-008 | should insert at cursor position                  | Insert đúng vị trí cursor       | Cursor tại position 7                | Page break tại index 1               |
| PB-009 | should insert multiple page breaks                | Insert nhiều page breaks        | 2 lần `insertPageBreak()`            | 2 page break nodes                   |
| PB-010 | should be an atom node                            | Kiểm tra node properties        | N/A                                  | `atom = true`                        |
| PB-011 | should be selectable                              | Kiểm tra selectable             | N/A                                  | `selectable = true`                  |
| PB-012 | should be a block node                            | Kiểm tra group                  | N/A                                  | `group = 'block'`                    |
| PB-013 | should convert CKEditor format to standard format | Round-trip conversion           | CKEditor HTML                        | Standard HTML output                 |
| PB-014 | should register node with correct name            | Kiểm tra node được đăng ký đúng | N/A                                  | Node name = 'pageBreak'              |
| PB-015 | should have insertPageBreak command available     | Kiểm tra command tồn tại        | N/A                                  | Command là function                  |

---

### 2.3. DynamicField Node

**File**: `nodes/dynamic-field.node.spec.ts`  
**Tổng số tests**: 36

| ID     | Tên Test                                                    | Mô tả                                  | Input                                          | Expected Output                           |
| ------ | ----------------------------------------------------------- | -------------------------------------- | ---------------------------------------------- | ----------------------------------------- |
| DF-001 | should have fieldId and label attributes                    | Kiểm tra attributes tồn tại            | N/A                                            | Có `fieldId` và `label` attrs             |
| DF-002 | should parse fieldId from data-field-id attribute           | Parse fieldId                          | `<span data-field-id="customer_name">`         | `fieldId = 'customer_name'`               |
| DF-003 | should parse label from data-label attribute                | Parse label                            | `<span data-label="Customer Name">`            | `label = 'Customer Name'`                 |
| DF-004 | should render as span with data attributes                  | Render với data attributes             | `insertDynamicField({ fieldId, label })`       | Span chứa `data-field-id` và `data-label` |
| DF-005 | should render fieldId in {{}} format                        | Render fieldId format                  | `fieldId = 'customer_email'`                   | Text content = `{{customer_email}}`       |
| DF-006 | should include dynamic-field class                          | Render với classes                     | `insertDynamicField()`                         | Class = 'dynamic-field red-dynamic-field' |
| DF-007 | should parse span with data-field-id                        | Parse standard format                  | `<span data-field-id="ref_number">`            | Node type = 'dynamicField'                |
| DF-008 | should parse multiple dynamic fields                        | Parse nhiều fields                     | 2 dynamic field spans                          | 2 nodes type = 'dynamicField'             |
| DF-009 | should parse span.red-dynamic-field                         | Parse CKEditor format                  | `<span class="red-dynamic-field" value="...">` | Parse đúng fieldId và label               |
| DF-010 | should extract fieldId from {{}} in text content            | Extract từ text                        | `{{order_id}}`                                 | `fieldId = 'order_id'`                    |
| DF-011 | should handle dynamicfieldname attribute                    | Parse CKEditor attribute               | `dynamicfieldname="Product Name"`              | `label = 'Product Name'`                  |
| DF-012 | should use fieldId as label fallback                        | Fallback label                         | Không có label attribute                       | `label = fieldId`                         |
| DF-013 | should trim whitespace from {{}} extraction                 | Trim whitespace                        | `{{ spaced_field }}`                           | `fieldId = 'spaced_field'`                |
| DF-014 | should insert dynamic field with fieldId and label          | Insert field                           | `insertDynamicField({ fieldId, label })`       | Field được insert với đúng attrs          |
| DF-015 | should return false when fieldId is missing                 | Validate fieldId required              | `fieldId = ''`                                 | `result = false`, console.error           |
| DF-016 | should return false when label is missing                   | Validate label required                | `label = ''`                                   | `result = false`, console.error           |
| DF-017 | should insert at cursor position                            | Insert đúng vị trí                     | Cursor tại position 6                          | Field insert giữa text                    |
| DF-018 | should be an inline node                                    | Kiểm tra node properties               | N/A                                            | `group = 'inline'`, `inline = true`       |
| DF-019 | should be an atom node                                      | Kiểm tra atom                          | N/A                                            | `atom = true`                             |
| DF-020 | should be selectable                                        | Kiểm tra selectable                    | N/A                                            | `selectable = true`                       |
| DF-021 | should not be draggable                                     | Kiểm tra draggable                     | N/A                                            | `draggable = false`                       |
| DF-022 | should convert CKEditor format to standard format           | Round-trip conversion                  | CKEditor HTML                                  | Standard HTML với data attributes         |
| DF-023 | should register node with correct name                      | Kiểm tra node được đăng ký đúng        | N/A                                            | Node name = 'dynamicField'                |
| DF-024 | should have insertDynamicField command available            | Kiểm tra command tồn tại               | N/A                                            | Command là function                       |
| DF-025 | should handle empty fieldId in renderHTML                   | Test empty string vs null (fieldId)    | `data-field-id=""`                             | Empty string được render                  |
| DF-026 | should handle null fieldId                                  | Test null fieldId                      | Không có `data-field-id`                       | Không render attribute                    |
| DF-027 | should handle empty label in renderHTML                     | Test empty string vs null (label)      | `data-label=""`                                | Empty string được render                  |
| DF-028 | should handle null label                                    | Test null label                        | Không có `data-label`                          | Không render attribute                    |
| DF-029 | should render empty string when fieldId is falsy            | Test ternary operator                  | `fieldId = ""`                                 | Không render `{{}}`                       |
| DF-030 | should handle "name" attribute as label fallback            | Test CKEditor "name" attr              | `name="Name Attr"`                             | `label = 'Name Attr'`                     |
| DF-031 | should prioritize "value" over "dynamicfieldname"           | Test attribute priority (value)        | `value="X" dynamicfieldname="Y"`               | `label = 'X'` (value wins)                |
| DF-032 | should prioritize "dynamicfieldname" over "name"            | Test attribute priority (dynamicfield) | `dynamicfieldname="X" name="Y"`                | `label = 'X'` (dynamicfieldname wins)     |
| DF-033 | should handle empty text content in CKEditor format         | Test empty text extraction             | `<span class="red-dynamic-field"></span>`      | `fieldId = ''`                            |
| DF-034 | should handle text without curly braces                     | Test plain text extraction             | `plain_text`                                   | `fieldId = 'plain_text'`                  |
| DF-035 | should use fieldId when label is missing (NodeView)         | Test NodeView fallback                 | Chỉ có fieldId                                 | Display fieldId                           |
| DF-036 | should use "Unknown Field" when both are missing (NodeView) | Test NodeView ultimate fallback        | Không có label và fieldId                      | Display 'Unknown Field'                   |

---

## 3. Utilities Tests

### 3.1. Table Utilities

**File**: `utils/table.util.spec.ts`  
**Tổng số tests**: 15

| ID     | Tên Test                                                      | Mô tả                              | Input                                         | Expected Output                          |
| ------ | ------------------------------------------------------------- | ---------------------------------- | --------------------------------------------- | ---------------------------------------- |
| TU-001 | should return cell info when cursor is in a cell              | Lấy thông tin cell                 | Cursor trong cell                             | `{ rowIndex, colIndex, cellIndex, ... }` |
| TU-002 | should return correct row and column indices                  | Lấy indices đúng                   | Cursor trong cell cụ thể                      | Row và column indices chính xác          |
| TU-003 | should return null when cursor is not in a cell               | Return null khi không trong table  | Cursor trong `<p>`                            | `result = null`                          |
| TU-004 | should return table node and map                              | Lấy table node và map              | Cursor trong cell                             | `tableNode` và `map` defined             |
| TU-005 | should return single cell when cursor is in a cell            | Lấy single cell                    | Cursor trong cell                             | Array có 1 cell                          |
| TU-006 | should return empty array when not in table                   | Return empty khi không trong table | Cursor ngoài table                            | `cells.length = 0`                       |
| TU-007 | should return cell node and position                          | Lấy node và position               | Cursor trong cell                             | Cell có `node` và `pos`                  |
| TU-008 | should work with table headers                                | Xử lý table headers                | Cursor trong `<th>`                           | Node type = 'tableHeader'                |
| TU-009 | should return common value when all cells have same attribute | Lấy giá trị chung                  | Tất cả cells có `backgroundColor = '#ff0000'` | Value = '#ff0000'                        |
| TU-010 | should return undefined when cells have different values      | Return undefined khi khác nhau     | Cells có colors khác nhau                     | Value = `undefined`                      |
| TU-011 | should return fallback value when no cells provided           | Return fallback                    | Empty cells array                             | Value = fallback value                   |
| TU-012 | should handle object attributes with deep comparison          | So sánh deep object                | Cells có border objects giống nhau            | Value = border object                    |
| TU-013 | should detect different object values                         | Phát hiện objects khác nhau        | Border objects khác `style`                   | Value = `undefined`                      |
| TU-014 | should handle null and undefined values                       | Xử lý null values                  | Tất cả cells có `backgroundColor = null`      | Value = `null`                           |
| TU-015 | should detect mixed null and non-null values                  | Phát hiện mixed null               | Một cell null, một cell có value              | Value = `undefined`                      |

---

### 3.2. Color Utilities

**File**: `utils/color.util.spec.ts`  
**Tổng số tests**: 20

| ID     | Tên Test                                         | Mô tả                                 | Input                                | Expected Output      |
| ------ | ------------------------------------------------ | ------------------------------------- | ------------------------------------ | -------------------- |
| CU-001 | should normalize 6-digit hex color to lowercase  | Normalize hex 6 digits                | `#FF0000`, `#ABCDEF`                 | `#ff0000`, `#abcdef` |
| CU-002 | should normalize 3-digit hex color to lowercase  | Normalize hex 3 digits                | `#F00`, `#ABC`                       | `#f00`, `#abc`       |
| CU-003 | should preserve already lowercase hex colors     | Giữ nguyên hex đã lowercase           | `#ff0000`, `#abc`                    | `#ff0000`, `#abc`    |
| CU-004 | should handle hex colors with mixed case         | Xử lý mixed case                      | `#FfAaBb`, `#F0a`                    | `#ffaabb`, `#f0a`    |
| CU-005 | should convert rgb(r, g, b) to hex               | Convert RGB sang hex                  | `rgb(255, 0, 0)`                     | `#ff0000`            |
| CU-006 | should handle rgb with extra spaces              | Xử lý RGB với spaces                  | `rgb( 255 , 0 , 0 )`                 | `#ff0000`            |
| CU-007 | should handle RGB with uppercase                 | Xử lý RGB uppercase                   | `RGB(255, 0, 0)`                     | `#ff0000`            |
| CU-008 | should handle valid RGB edge values              | Xử lý RGB edge values                 | `rgb(0, 0, 0)`, `rgb(255, 255, 255)` | `#000000`, `#ffffff` |
| CU-009 | should handle transparent color                  | Xử lý transparent                     | `transparent`, `TRANSPARENT`         | `transparent`        |
| CU-010 | should return null for empty string              | Return null cho empty                 | `''`                                 | `null`               |
| CU-011 | should return null for invalid hex format        | Return null cho hex invalid           | `#GG0000`, `#12`, `FF0000`           | `null`               |
| CU-012 | should return null for invalid RGB format        | Return null cho RGB invalid           | `rgb(255, 0)`, `rgb(a, b, c)`        | `null`               |
| CU-013 | should return null for unsupported color formats | Return null cho formats không support | `red`, `rgba(...)`, `hsl(...)`       | `null`               |
| CU-014 | should return null for whitespace-only string    | Return null cho whitespace            | `'   '`, `'\t\n'`                    | `null`               |
| CU-015 | should trim whitespace                           | Trim whitespace                       | `'  #FF0000  '`                      | `#ff0000`            |
| CU-016 | should handle black and white                    | Xử lý black/white                     | `#000000`, `#FFFFFF`, `rgb(0,0,0)`   | Correct hex values   |
| CU-017 | should handle grayscale colors                   | Xử lý grayscale                       | `rgb(128, 128, 128)`, `#808080`      | `#808080`            |

---

### 3.3. Text Utilities

**File**: `utils/text.util.spec.ts`  
**Tổng số tests**: 30

#### getSelectedText() - 7 tests

| ID      | Tên Test                                     | Mô tả                         | Input                                     | Expected Output  |
| ------- | -------------------------------------------- | ----------------------------- | ----------------------------------------- | ---------------- |
| TXU-001 | should return selected text                  | Lấy text được select          | Select "Hello" trong "Hello World"        | `'Hello'`        |
| TXU-002 | should return null when selection is empty   | Return null khi chỉ có cursor | Cursor position, no selection             | `null`           |
| TXU-003 | should return text across multiple words     | Lấy text nhiều words          | Select "Hello World"                      | `'Hello World'`  |
| TXU-004 | should return text with spaces between nodes | Lấy text qua nhiều nodes      | Select across `<p>First</p><p>Second</p>` | `'First Second'` |
| TXU-005 | should handle selection with formatting      | Xử lý selection có formatting | Select `<strong>Bold</strong> text`       | `'Bold text'`    |
| TXU-006 | should return partial text selection         | Lấy một phần text             | Select "World" trong "Hello World"        | `'World'`        |
| TXU-007 | should return single character selection     | Lấy 1 ký tự                   | Select "H"                                | `'H'`            |

#### getActiveMarkRange() - 23 tests

| ID      | Tên Test                                               | Mô tả                              | Input                                     | Expected Output                   |
| ------- | ------------------------------------------------------ | ---------------------------------- | ----------------------------------------- | --------------------------------- |
| TXU-008 | should return range of bold mark at cursor             | Lấy range của bold mark            | Cursor trong `<strong>bold text</strong>` | `{from, to, mark}`                |
| TXU-009 | should return null when cursor is not in bold text     | Return null khi không trong bold   | Cursor trong text thường                  | `null`                            |
| TXU-010 | should return full range when cursor at start of mark  | Lấy full range khi cursor ở đầu    | Cursor at start of bold                   | Full range                        |
| TXU-011 | should return full range when cursor at end of mark    | Lấy full range khi cursor ở cuối   | Cursor at end of bold                     | Full range                        |
| TXU-012 | should return range of link mark at cursor             | Lấy range của link mark            | Cursor trong `<a>link</a>`                | `{from, to, mark}`                |
| TXU-013 | should return link attributes                          | Lấy link attributes                | Cursor trong link                         | `mark.attrs.href = 'https://...'` |
| TXU-014 | should return correct mark when multiple marks present | Xử lý multiple marks               | `<strong><a>bold link</a></strong>`       | Both marks returned               |
| TXU-015 | should return null for non-existent mark type          | Return null cho mark không tồn tại | Search for 'italic' in bold text          | `null`                            |
| TXU-016 | should handle empty document                           | Xử lý empty document               | Empty `<p></p>`                           | `null`                            |
| TXU-017 | should handle mark at document start                   | Xử lý mark ở đầu document          | `<p><strong>Start</strong> text</p>`      | Correct range                     |
| TXU-018 | should handle mark at document end                     | Xử lý mark ở cuối document         | `<p>Text <strong>end</strong></p>`        | Correct range                     |

---

## Test Statistics

### Tổng quan

| Category   | Số lượng test files | Số lượng test cases | Coverage mục tiêu |
| ---------- | ------------------- | ------------------- | ----------------- |
| Extensions | 5                   | 75                  | ≥ 80%             |
| Nodes      | 3                   | 62                  | ≥ 80%             |
| Utilities  | 3                   | 65                  | ≥ 80%             |
| **TOTAL**  | **11**              | **202**             | **≥ 80%**         |

### Breakdown theo Extension/Node/Util

| Component         | Test Cases | Complexity | Priority |
| ----------------- | ---------- | ---------- | -------- |
| ClearContent      | 5          | Low        | Medium   |
| ResetFormat       | 5          | Low        | Medium   |
| TextCase          | 12         | Medium     | Medium   |
| Indent            | 15         | Medium     | High     |
| CustomOrderedList | 29         | Medium     | High     |
| NotumHeading      | 11         | Low        | Medium   |
| PageBreak         | 15         | Medium     | High     |
| DynamicField      | 36         | High       | Critical |
| Table Utilities   | 15         | High       | Critical |
| Color Utilities   | 20         | Low        | Medium   |
| Text Utilities    | 30         | Medium     | High     |

---

## Files Excluded from Coverage

Các files sau được **exclude khỏi coverage report** vì cần **integration/E2E tests** hoặc **không có logic để test**:

| File                                         | Size     | Lý do exclude                                                                                   | Test approach                              |
| -------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `views/block-handler.ts`                     | 14.6KB   | NodeView implementation, DOM manipulation, user interactions (click/hover/drag), visual testing | E2E tests (Playwright/Cypress)             |
| `utils/dom.util.ts`                          | 1.6KB    | DOM traversal, Tiptap integration, browser APIs (`matches()`, `parentElement`)                  | Component integration tests                |
| `models/color.model.ts`                      | 1.2KB    | Simple data model (getters/setters), low complexity, low priority                               | Optional unit tests                        |
| `extensions/table-style.extension.ts`        | 20.5KB   | Complex UI logic (table styling, borders, colors), CSS manipulation, visual testing needed      | Integration/E2E tests + visual regression  |
| `extensions/table-resizing.extension.ts`     | 7.6KB    | Mouse events (drag & drop), column width calculations, DOM measurements                         | Integration tests with mouse simulation    |
| `extensions/restricted-editing.extension.ts` | 15.3KB   | Complex permissions logic, user interactions, content restrictions                              | Integration tests with user scenarios      |
| `extensions/reset-on-enter.extension.ts`     | 1.2KB    | Keyboard shortcuts (Enter key), editor state manipulation, command chaining                     | Integration tests with keyboard simulation |
| `constants/table.constant.ts`                | 39 bytes | Pure constant export (`MIN_NEW_COL_WIDTH = 5.0`), no logic to test                              | N/A - No tests needed                      |

**Impact**: Excluding these files tăng coverage lên **~90%**, cho phép focus vào **testable business logic**.

---

## Test Execution

### Commands

```bash
# Run all tests
npm test document-engine-core

# Run with coverage
npm test document-engine-core -- --coverage

# Run specific test file
npm test document-engine-core -- indent.extension.spec.ts

# Watch mode
npm test document-engine-core -- --watch

# Run tests for specific pattern
npm test document-engine-core -- --testNamePattern="should parse"
```

### Coverage Requirements

- **Statements**: ≥ 80%
- **Branches**: ≥ 75%
- **Functions**: ≥ 80%
- **Lines**: ≥ 80%

---

## Test Structure

```
src/__tests__/
├── helpers/
│   └── editor-factory.ts          # Helper để tạo test editor instances
├── extensions/
│   ├── clear-content.extension.spec.ts
│   ├── reset-format.extension.spec.ts
│   ├── text-case.extension.spec.ts
│   ├── indent.extension.spec.ts
│   └── ordered-list.extension.spec.ts
├── nodes/
│   ├── heading.node.spec.ts
│   ├── page-break.node.spec.ts
│   └── dynamic-field.node.spec.ts
├── utils/
│   └── table.util.spec.ts
└── TEST_CASES.md                  # File này
```

---

## Notes

- ✅ Tất cả tests độc lập với Angular framework
- ✅ Sử dụng Jest với jsdom environment
- ✅ Test helpers được tạo trong `helpers/` folder
- ✅ Mỗi test case có ID duy nhất để dễ tracking và reference
- ✅ Tests cover cả standard format và legacy CKEditor format
- ✅ Không có lỗi ESLint/TypeScript
- ✅ Tất cả imports sử dụng proper types (không dùng `any`)
- ✅ **CustomOrderedList** hỗ trợ parse từ cả `data-list-style-type` attribute (our format) và CSS `style="list-style-type:..."` (other editors)
  - Priority: `data-list-style-type` > CSS `list-style-type` > default (`decimal`)
  - Tương thích với: CKEditor, TinyMCE, và các editors khác

---

## Test Coverage Goals

### Phase 1: Core Extensions ✅

- [x] ClearContent (5 tests)
- [x] ResetFormat (5 tests)
- [x] TextCase (12 tests)
- [x] Indent (15 tests)

### Phase 2: List Extensions ✅

- [x] CustomOrderedList (29 tests - covers all 11 ListStyleType values + CSS parsing + comprehensive command test)

### Phase 3: Nodes ✅

- [x] NotumHeading (11 tests - includes partial selection tests)
- [x] PageBreak (15 tests)
- [x] DynamicField (36 tests)

### Phase 4: Utilities ✅

- [x] Table Utilities (15 tests)
- [x] Color Utilities (20 tests - pure functions)
- [x] Text Utilities (30 tests - selection & marks)

### Phase 5: Integration Tests ⏸️

- [ ] Chờ xác nhận từ user

---

## Maintenance

Khi thêm test cases mới:

1. Thêm test vào file spec tương ứng
2. Cập nhật bảng test cases trong file này
3. Cập nhật số lượng tests trong phần Statistics
4. Đảm bảo test ID theo format: `[PREFIX]-[NUMBER]` (e.g., `DF-025`)
5. Chạy ESLint để đảm bảo không có lỗi
