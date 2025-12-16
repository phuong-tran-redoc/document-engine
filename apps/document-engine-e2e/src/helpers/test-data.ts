/**
 * Centralized test data fixtures for E2E tests
 * Provides reusable HTML content for various test scenarios
 */

export const TEST_DATA = {
  // Table fixtures
  tables: {
    simple2x2: `
      <table>
        <tr><td>Cell 1-1</td><td>Cell 1-2</td></tr>
        <tr><td>Cell 2-1</td><td>Cell 2-2</td></tr>
      </table>
    `,

    simple3x3: `
      <table>
        <tr><td>A1</td><td>B1</td><td>C1</td></tr>
        <tr><td>A2</td><td>B2</td><td>C2</td></tr>
        <tr><td>A3</td><td>B3</td><td>C3</td></tr>
      </table>
    `,

    withHeader: `
      <table>
        <thead>
          <tr><th>Header 1</th><th>Header 2</th></tr>
        </thead>
        <tbody>
          <tr><td>Data 1-1</td><td>Data 1-2</td></tr>
          <tr><td>Data 2-1</td><td>Data 2-2</td></tr>
        </tbody>
      </table>
    `,

    nested: `
      <table>
        <tr>
          <td>Outer cell</td>
          <td>
            <table>
              <tr><td>Inner cell 1</td></tr>
              <tr><td>Inner cell 2</td></tr>
            </table>
          </td>
        </tr>
      </table>
    `,

    withFormatting: `
      <table>
        <tr>
          <td><strong>Bold cell</strong></td>
          <td><em>Italic cell</em></td>
        </tr>
        <tr>
          <td><u>Underline cell</u></td>
          <td><strong><em>Bold italic</em></strong></td>
        </tr>
      </table>
    `,
  },

  // Dynamic field fixtures
  dynamicFields: {
    simple: '<p><span data-field="customerName" contenteditable="false">Customer Name</span></p>',

    multiple: `
      <p>Dear <span data-field="customerName" contenteditable="false">Customer Name</span>,</p>
      <p>Your account number is <span data-field="accountNumber" contenteditable="false">Account Number</span>.</p>
      <p>Amount: <span data-field="amount" contenteditable="false">Amount</span></p>
    `,

    inTable: `
      <table>
        <tr>
          <td>Customer</td>
          <td><span data-field="customerName" contenteditable="false">Customer Name</span></td>
        </tr>
        <tr>
          <td>Product</td>
          <td><span data-field="productName" contenteditable="false">Product Name</span></td>
        </tr>
      </table>
    `,
  },

  // Text content fixtures
  text: {
    simple: '<p>Hello World</p>',
    multiParagraph: '<p>First paragraph</p><p>Second paragraph</p><p>Third paragraph</p>',

    formatted: '<p><strong>Bold</strong> and <em>italic</em> and <u>underline</u> text</p>',

    complex: `
      <h1>Main Heading</h1>
      <p>This is a <strong>bold</strong> paragraph with <em>italic</em> text.</p>
      <h2>Subheading</h2>
      <p>Another paragraph with <u>underline</u> and <strong><em>bold italic</em></strong>.</p>
    `,

    withList: `
      <p>Introduction text:</p>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>
      <p>Conclusion text.</p>
    `,
  },

  // Heading fixtures
  headings: {
    h1: '<h1>Heading Level 1</h1>',
    h2: '<h2>Heading Level 2</h2>',
    h3: '<h3>Heading Level 3</h3>',
    mixed: `
      <h1>Main Heading</h1>
      <p>Paragraph</p>
      <h2>Subheading</h2>
      <p>More content</p>
      <h3>Sub-subheading</h3>
    `,
  },

  // Template fixtures
  templates: {
    letterTemplate: `
      <h1>Business Letter Template</h1>
      <p>Date: <span data-field="date" contenteditable="false">Date</span></p>
      <p>Dear <span data-field="customerName" contenteditable="false">Customer Name</span>,</p>
      <p>Thank you for your inquiry about <span data-field="product" contenteditable="false">Product</span>.</p>
      <table>
        <tr><td>Product</td><td><span data-field="productName" contenteditable="false">Product Name</span></td></tr>
        <tr><td>Price</td><td><span data-field="price" contenteditable="false">Price</span></td></tr>
      </table>
      <p>Best regards,</p>
      <p><span data-field="senderName" contenteditable="false">Sender Name</span></p>
    `,
  },

  // Page break fixtures
  pageBreak: {
    single: '<p>Content before</p><div data-page-break="true"></div><p>Content after</p>',
    multiple: `
      <p>Page 1 content</p>
      <div data-page-break="true"></div>
      <p>Page 2 content</p>
      <div data-page-break="true"></div>
      <p>Page 3 content</p>
    `,
  },
} as const;

/**
 * Test data values (non-HTML)
 */
export const TEST_VALUES = {
  customerNames: ['John Doe', 'Jane Smith', 'Bob Johnson'],
  accountNumbers: ['ACC-001', 'ACC-002', 'ACC-003'],
  emails: ['test@example.com', 'user@test.com'],
  amounts: ['$1,000.00', '$2,500.50', '$10,000.00'],
} as const;
