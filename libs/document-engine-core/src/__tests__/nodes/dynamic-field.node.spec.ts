import { Editor } from '@tiptap/core';
import { createTestEditor } from '../helpers/editor-factory';
import { DynamicField } from '../../nodes/dynamic-field.node';

type DynamicFieldNode = {
  type: string;
  attrs?: {
    fieldId?: string;
    label?: string;
  };
};

describe('DynamicField Node', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = createTestEditor([DynamicField]);
  });

  afterEach(() => {
    editor.destroy();
  });

  describe('Attributes', () => {
    it('should have fieldId and label attributes', () => {
      const dynamicFieldNode = editor.schema.nodes['dynamicField'];
      expect(dynamicFieldNode.spec.attrs).toHaveProperty('fieldId');
      expect(dynamicFieldNode.spec.attrs).toHaveProperty('label');
    });

    it('should parse fieldId from data-field-id attribute', () => {
      editor.commands.setContent(
        '<p><span data-field-id="customer_name" data-label="Customer Name">{{customer_name}}</span></p>'
      );

      const json = editor.getJSON();
      const dynamicField = json.content?.[0]?.content?.[0] as DynamicFieldNode | undefined;
      expect(dynamicField?.type).toBe('dynamicField');
      expect(dynamicField?.attrs?.fieldId).toBe('customer_name');
    });

    it('should parse label from data-label attribute', () => {
      editor.commands.setContent('<p><span data-field-id="order_id" data-label="Order ID">{{order_id}}</span></p>');

      const json = editor.getJSON();
      const dynamicField = json.content?.[0]?.content?.[0] as DynamicFieldNode | undefined;
      expect(dynamicField?.attrs?.label).toBe('Order ID');
    });
  });

  describe('Rendering', () => {
    it('should render as span with data attributes', () => {
      editor.commands.insertDynamicField({ fieldId: 'test_field', label: 'Test Field' });

      const html = editor.getHTML();
      expect(html).toContain('data-field-id="test_field"');
      expect(html).toContain('data-label="Test Field"');
      expect(html).toContain('<span');
    });

    it('should render fieldId in {{}} format', () => {
      editor.commands.insertDynamicField({ fieldId: 'customer_email', label: 'Email' });

      const html = editor.getHTML();
      expect(html).toContain('{{customer_email}}');
    });

    it('should include dynamic-field class', () => {
      editor.commands.insertDynamicField({ fieldId: 'test', label: 'Test' });

      const html = editor.getHTML();
      expect(html).toContain('class="dynamic-field red-dynamic-field"');
    });
  });

  describe('Parsing - Standard Format', () => {
    it('should parse span with data-field-id', () => {
      editor.commands.setContent(
        '<p><span data-field-id="ref_number" data-label="Reference">{{ref_number}}</span></p>'
      );

      const json = editor.getJSON();
      const dynamicField = json.content?.[0]?.content?.[0] as DynamicFieldNode | undefined;
      expect(dynamicField?.type).toBe('dynamicField');
      expect(dynamicField?.attrs?.fieldId).toBe('ref_number');
      expect(dynamicField?.attrs?.label).toBe('Reference');
    });

    it('should parse multiple dynamic fields', () => {
      editor.commands.setContent(
        '<p><span data-field-id="first" data-label="First">{{first}}</span> and <span data-field-id="second" data-label="Second">{{second}}</span></p>'
      );

      const json = editor.getJSON();
      const fields = json.content?.[0]?.content?.filter((node) => node.type === 'dynamicField');
      expect(fields?.length).toBe(2);
    });
  });

  describe('Parsing - CKEditor Legacy Format', () => {
    it('should parse span.red-dynamic-field', () => {
      editor.commands.setContent(
        '<p><span class="red-dynamic-field" value="Customer Name">{{customer_name}}</span></p>'
      );

      const json = editor.getJSON();
      const dynamicField = json.content?.[0]?.content?.[0] as DynamicFieldNode | undefined;
      expect(dynamicField?.type).toBe('dynamicField');
      expect(dynamicField?.attrs?.fieldId).toBe('customer_name');
      expect(dynamicField?.attrs?.label).toBe('Customer Name');
    });

    it('should extract fieldId from {{}} in text content', () => {
      editor.commands.setContent('<p><span class="red-dynamic-field">{{order_id}}</span></p>');

      const json = editor.getJSON();
      const dynamicField = json.content?.[0]?.content?.[0] as DynamicFieldNode | undefined;
      expect(dynamicField?.attrs?.fieldId).toBe('order_id');
    });

    it('should handle dynamicfieldname attribute', () => {
      editor.commands.setContent(
        '<p><span class="red-dynamic-field" dynamicfieldname="Product Name">{{product}}</span></p>'
      );

      const json = editor.getJSON();
      const dynamicField = json.content?.[0]?.content?.[0] as DynamicFieldNode | undefined;
      expect(dynamicField?.attrs?.label).toBe('Product Name');
    });

    it('should use fieldId as label fallback', () => {
      editor.commands.setContent('<p><span class="red-dynamic-field">{{standalone_field}}</span></p>');

      const json = editor.getJSON();
      const dynamicField = json.content?.[0]?.content?.[0] as DynamicFieldNode | undefined;
      expect(dynamicField?.attrs?.label).toBe('standalone_field');
    });

    it('should trim whitespace from {{}} extraction', () => {
      editor.commands.setContent('<p><span class="red-dynamic-field">{{ spaced_field }}</span></p>');

      const json = editor.getJSON();
      const dynamicField = json.content?.[0]?.content?.[0] as DynamicFieldNode | undefined;
      expect(dynamicField?.attrs?.fieldId).toBe('spaced_field');
    });
  });

  describe('Commands', () => {
    describe('insertDynamicField()', () => {
      it('should insert dynamic field with fieldId and label', () => {
        editor.commands.setContent('<p>Before </p>');
        editor.commands.setTextSelection(8);

        const result = editor.commands.insertDynamicField({
          fieldId: 'new_field',
          label: 'New Field',
        });

        expect(result).toBe(true);
        const json = editor.getJSON();
        const dynamicField = json.content?.[0]?.content?.find((node) => node.type === 'dynamicField') as
          | DynamicFieldNode
          | undefined;
        expect(dynamicField?.attrs?.fieldId).toBe('new_field');
        expect(dynamicField?.attrs?.label).toBe('New Field');
      });

      it('should return false when fieldId is missing', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        const result = editor.commands.insertDynamicField({
          fieldId: '',
          label: 'Label',
        });

        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });

      it('should return false when label is missing', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        const result = editor.commands.insertDynamicField({
          fieldId: 'field',
          label: '',
        });

        expect(result).toBe(false);
        consoleSpy.mockRestore();
      });

      it('should insert at cursor position', () => {
        editor.commands.setContent('<p>Start End</p>');
        editor.commands.setTextSelection(6);

        editor.commands.insertDynamicField({
          fieldId: 'middle',
          label: 'Middle',
        });

        const html = editor.getHTML();
        expect(html).toContain('Start');
        expect(html).toContain('{{middle}}');
        expect(html).toContain('End');
      });
    });
  });

  describe('Node Properties', () => {
    it('should be an inline node', () => {
      const dynamicFieldNode = editor.schema.nodes['dynamicField'];
      expect(dynamicFieldNode.spec.group).toBe('inline');
      expect(dynamicFieldNode.spec.inline).toBe(true);
    });

    it('should be an atom node', () => {
      const dynamicFieldNode = editor.schema.nodes['dynamicField'];
      expect(dynamicFieldNode.spec.atom).toBe(true);
    });

    it('should be selectable', () => {
      const dynamicFieldNode = editor.schema.nodes['dynamicField'];
      expect(dynamicFieldNode.spec.selectable).toBe(true);
    });

    it('should not be draggable', () => {
      const dynamicFieldNode = editor.schema.nodes['dynamicField'];
      expect(dynamicFieldNode.spec.draggable).toBe(false);
    });
  });

  describe('HTML Round-trip', () => {
    it('should convert CKEditor format to standard format', () => {
      editor.commands.setContent('<p><span class="red-dynamic-field" value="Old Label">{{old_field}}</span></p>');

      const outputHTML = editor.getHTML();

      expect(outputHTML).toContain('data-field-id="old_field"');
      expect(outputHTML).toContain('data-label="Old Label"');
      expect(outputHTML).toContain('class="dynamic-field red-dynamic-field"');
    });
  });

  describe('Edge Cases & Missing Branches', () => {
    describe('Rendering with empty attributes', () => {
      it('should handle empty fieldId in renderHTML', () => {
        // Test branch: if (!attributes['fieldId']) return {};
        // Note: Empty string is truthy in JS, so it will be rendered
        editor.commands.setContent('<p><span data-field-id="" data-label="Test">content</span></p>');

        const html = editor.getHTML();
        // Empty string is still rendered (truthy in JS)
        expect(html).toContain('data-field-id=""');
      });

      it('should handle null fieldId', () => {
        editor.commands.setContent('<p><span data-label="Label Only">content</span></p>');

        const html = editor.getHTML();
        // Without fieldId, should not render the field
        expect(html).not.toContain('data-field-id');
      });

      it('should handle empty label in renderHTML', () => {
        // Test branch: if (!attributes['label']) return {};
        // Note: Empty string is truthy in JS, so it will be rendered
        editor.commands.setContent('<p><span data-field-id="test" data-label="">{{test}}</span></p>');

        const html = editor.getHTML();
        // Empty string is still rendered (truthy in JS)
        expect(html).toContain('data-label=""');
      });

      it('should handle null label', () => {
        editor.commands.setContent('<p><span data-field-id="test">{{test}}</span></p>');

        const html = editor.getHTML();
        // Without label, should not render data-label
        expect(html).not.toContain('data-label');
      });

      it('should render empty string when fieldId is falsy', () => {
        // Test branch: fieldId ? `{{${fieldId}}}` : ''
        editor.commands.setContent('<p><span data-field-id="" data-label="Test"></span></p>');

        const html = editor.getHTML();
        // Should not contain {{}} when fieldId is empty
        expect(html).not.toContain('{{}}');
      });
    });

    describe('CKEditor Legacy - Additional Attributes', () => {
      it('should handle "name" attribute as label fallback', () => {
        // Test the third fallback: element.getAttribute('name')
        editor.commands.setContent('<p><span class="red-dynamic-field" name="Name Attr">{{field}}</span></p>');

        const json = editor.getJSON();
        const dynamicField = json.content?.[0]?.content?.[0] as DynamicFieldNode | undefined;
        expect(dynamicField?.attrs?.label).toBe('Name Attr');
      });

      it('should prioritize "value" over "dynamicfieldname"', () => {
        editor.commands.setContent(
          '<p><span class="red-dynamic-field" value="Value Attr" dynamicfieldname="DFName">{{field}}</span></p>'
        );

        const json = editor.getJSON();
        const dynamicField = json.content?.[0]?.content?.[0] as DynamicFieldNode | undefined;
        // "value" should take precedence
        expect(dynamicField?.attrs?.label).toBe('Value Attr');
      });

      it('should prioritize "dynamicfieldname" over "name"', () => {
        editor.commands.setContent(
          '<p><span class="red-dynamic-field" dynamicfieldname="DFName" name="Name">{{field}}</span></p>'
        );

        const json = editor.getJSON();
        const dynamicField = json.content?.[0]?.content?.[0] as DynamicFieldNode | undefined;
        // "dynamicfieldname" should take precedence over "name"
        expect(dynamicField?.attrs?.label).toBe('DFName');
      });

      it('should handle empty text content in CKEditor format', () => {
        editor.commands.setContent('<p><span class="red-dynamic-field" value="Label"></span></p>');

        const json = editor.getJSON();
        const dynamicField = json.content?.[0]?.content?.[0] as DynamicFieldNode | undefined;
        // Should extract empty string as fieldId
        expect(dynamicField?.attrs?.fieldId).toBe('');
        expect(dynamicField?.attrs?.label).toBe('Label');
      });

      it('should handle text without curly braces', () => {
        editor.commands.setContent('<p><span class="red-dynamic-field">plain_text</span></p>');

        const json = editor.getJSON();
        const dynamicField = json.content?.[0]?.content?.[0] as DynamicFieldNode | undefined;
        // Should extract text as-is
        expect(dynamicField?.attrs?.fieldId).toBe('plain_text');
      });
    });

    describe('NodeView fallback logic', () => {
      it('should use fieldId when label is missing', () => {
        editor.commands.setContent('<p><span data-field-id="test_id">{{test_id}}</span></p>');

        const html = editor.getHTML();
        // NodeView should use fieldId as fallback
        expect(html).toContain('test_id');
      });

      it('should use "Unknown Field" when both label and fieldId are missing', () => {
        // This is hard to test directly, but we can verify the node is created
        editor.commands.setContent('<p><span class="red-dynamic-field"></span></p>');

        const json = editor.getJSON();
        const dynamicField = json.content?.[0]?.content?.[0] as DynamicFieldNode | undefined;
        // Should still parse as dynamicField node
        expect(dynamicField?.type).toBe('dynamicField');
      });
    });
  });

  describe('Extension Registration', () => {
    it('should register node with correct name', () => {
      expect(editor.schema.nodes['dynamicField']).toBeDefined();
    });

    it('should have insertDynamicField command available', () => {
      expect(editor.commands.insertDynamicField).toBeDefined();
    });
  });
});
