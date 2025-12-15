import { Editor } from '@tiptap/core';
import { BulletList, ListItem } from '@tiptap/extension-list';
import { CustomOrderedList } from '../../extensions/ordered-list.extension';
import { ListStyleType } from '../../types';
import { createTestEditor } from '../helpers/editor-factory';

describe('CustomOrderedList Extension', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = createTestEditor([CustomOrderedList, BulletList, ListItem]);
  });

  afterEach(() => {
    editor.destroy();
  });

  describe('Attributes', () => {
    describe('Parsing', () => {
      describe('From data-list-style-type attribute (our format)', () => {
        it('should parse decimal (default)', () => {
          editor.commands.setContent('<ol data-list-style-type="decimal"><li><p>Item</p></li></ol>');
          expect(editor.getJSON().content?.[0]?.attrs?.['data-list-style-type']).toBe('decimal');
        });

        it('should parse lower-alpha', () => {
          editor.commands.setContent('<ol data-list-style-type="lower-alpha"><li><p>Item</p></li></ol>');
          expect(editor.getJSON().content?.[0]?.attrs?.['data-list-style-type']).toBe('lower-alpha');
        });

        it('should parse upper-alpha', () => {
          editor.commands.setContent('<ol data-list-style-type="upper-alpha"><li><p>Item</p></li></ol>');
          expect(editor.getJSON().content?.[0]?.attrs?.['data-list-style-type']).toBe('upper-alpha');
        });

        it('should parse lower-roman', () => {
          editor.commands.setContent('<ol data-list-style-type="lower-roman"><li><p>Item</p></li></ol>');
          expect(editor.getJSON().content?.[0]?.attrs?.['data-list-style-type']).toBe('lower-roman');
        });

        it('should parse upper-roman', () => {
          editor.commands.setContent('<ol data-list-style-type="upper-roman"><li><p>Item</p></li></ol>');
          expect(editor.getJSON().content?.[0]?.attrs?.['data-list-style-type']).toBe('upper-roman');
        });

        it('should parse lower-alpha-dot', () => {
          editor.commands.setContent('<ol data-list-style-type="lower-alpha-dot"><li><p>Item</p></li></ol>');
          expect(editor.getJSON().content?.[0]?.attrs?.['data-list-style-type']).toBe('lower-alpha-dot');
        });

        it('should parse lower-alpha-parens', () => {
          editor.commands.setContent('<ol data-list-style-type="lower-alpha-parens"><li><p>Item</p></li></ol>');
          expect(editor.getJSON().content?.[0]?.attrs?.['data-list-style-type']).toBe('lower-alpha-parens');
        });

        it('should parse lower-roman-parens', () => {
          editor.commands.setContent('<ol data-list-style-type="lower-roman-parens"><li><p>Item</p></li></ol>');
          expect(editor.getJSON().content?.[0]?.attrs?.['data-list-style-type']).toBe('lower-roman-parens');
        });

        it('should parse decimal-leading-zero', () => {
          editor.commands.setContent('<ol data-list-style-type="decimal-leading-zero"><li><p>Item</p></li></ol>');
          expect(editor.getJSON().content?.[0]?.attrs?.['data-list-style-type']).toBe('decimal-leading-zero');
        });

        it('should parse lower-latin', () => {
          editor.commands.setContent('<ol data-list-style-type="lower-latin"><li><p>Item</p></li></ol>');
          expect(editor.getJSON().content?.[0]?.attrs?.['data-list-style-type']).toBe('lower-latin');
        });

        it('should parse upper-latin', () => {
          editor.commands.setContent('<ol data-list-style-type="upper-latin"><li><p>Item</p></li></ol>');
          expect(editor.getJSON().content?.[0]?.attrs?.['data-list-style-type']).toBe('upper-latin');
        });
      });

      describe('From CSS style property (other editors format)', () => {
        it('should parse from style="list-style-type:decimal"', () => {
          editor.commands.setContent('<ol style="list-style-type:decimal"><li><p>Item</p></li></ol>');
          expect(editor.getJSON().content?.[0]?.attrs?.['data-list-style-type']).toBe('decimal');
        });

        it('should parse from style="list-style-type:lower-alpha"', () => {
          editor.commands.setContent('<ol style="list-style-type:lower-alpha"><li><p>Item</p></li></ol>');
          expect(editor.getJSON().content?.[0]?.attrs?.['data-list-style-type']).toBe('lower-alpha');
        });

        it('should parse from style="list-style-type:upper-alpha"', () => {
          editor.commands.setContent('<ol style="list-style-type:upper-alpha"><li><p>Item</p></li></ol>');
          expect(editor.getJSON().content?.[0]?.attrs?.['data-list-style-type']).toBe('upper-alpha');
        });

        it('should parse from style="list-style-type:lower-roman"', () => {
          editor.commands.setContent('<ol style="list-style-type:lower-roman"><li><p>Item</p></li></ol>');
          expect(editor.getJSON().content?.[0]?.attrs?.['data-list-style-type']).toBe('lower-roman');
        });

        it('should parse from style="list-style-type:upper-roman"', () => {
          editor.commands.setContent('<ol style="list-style-type:upper-roman"><li><p>Item</p></li></ol>');
          expect(editor.getJSON().content?.[0]?.attrs?.['data-list-style-type']).toBe('upper-roman');
        });

        it('should parse from style with spaces', () => {
          editor.commands.setContent('<ol style="list-style-type: lower-alpha;"><li><p>Item</p></li></ol>');
          expect(editor.getJSON().content?.[0]?.attrs?.['data-list-style-type']).toBe('lower-alpha');
        });

        it('should parse from style with multiple properties', () => {
          editor.commands.setContent(
            '<ol style="margin:10px; list-style-type:upper-roman; padding:5px"><li><p>Item</p></li></ol>'
          );
          expect(editor.getJSON().content?.[0]?.attrs?.['data-list-style-type']).toBe('upper-roman');
        });
      });

      describe('Priority and fallback', () => {
        it('should prioritize data-list-style-type over CSS style', () => {
          editor.commands.setContent(
            '<ol data-list-style-type="upper-alpha" style="list-style-type:lower-roman"><li><p>Item</p></li></ol>'
          );
          expect(editor.getJSON().content?.[0]?.attrs?.['data-list-style-type']).toBe('upper-alpha');
        });

        it('should default to decimal when no attribute or style is present', () => {
          editor.commands.setContent('<ol><li><p>Item</p></li></ol>');
          expect(editor.getJSON().content?.[0]?.attrs?.['data-list-style-type']).toBe('decimal');
        });
      });
    });

    describe('Rendering', () => {
      it('should render data-list-style-type attribute', () => {
        editor.commands.setContent({
          type: 'doc',
          content: [
            {
              type: 'customOrderedList',
              attrs: { 'data-list-style-type': 'upper-alpha' },
              content: [
                {
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item' }] }],
                },
              ],
            },
          ],
        });

        const html = editor.getHTML();
        expect(html).toContain('data-list-style-type="upper-alpha"');
      });
    });
  });

  describe('Commands', () => {
    describe('setListStyle()', () => {
      it('should set list style to upper-alpha', () => {
        editor.commands.setContent('<ol><li><p>Item</p></li></ol>');
        editor.commands.setTextSelection(3);

        const result = editor.commands.setListStyle('upper-alpha');

        expect(result).toBe(true);
        const json = editor.getJSON();
        expect(json.content?.[0]?.attrs?.['data-list-style-type']).toBe('upper-alpha');
      });

      it('should change existing style', () => {
        editor.commands.setContent('<ol data-list-style-type="lower-alpha"><li><p>Item</p></li></ol>');
        editor.commands.setTextSelection(3);

        editor.commands.setListStyle('upper-roman');

        const json = editor.getJSON();
        expect(json.content?.[0]?.attrs?.['data-list-style-type']).toBe('upper-roman');
      });

      it('should work with multiple list items', () => {
        editor.commands.setContent(`
          <ol>
            <li><p>Item 1</p></li>
            <li><p>Item 2</p></li>
            <li><p>Item 3</p></li>
          </ol>
        `);
        editor.commands.setTextSelection(3);

        editor.commands.setListStyle('upper-alpha');

        const json = editor.getJSON();
        expect(json.content?.[0]?.attrs?.['data-list-style-type']).toBe('upper-alpha');
      });

      it('should set all ListStyleType values correctly', () => {
        const allTypes: ListStyleType[] = [
          'decimal',
          'lower-alpha',
          'upper-alpha',
          'lower-roman',
          'upper-roman',
          'lower-alpha-dot',
          'lower-alpha-parens',
          'lower-roman-parens',
          'decimal-leading-zero',
          'lower-latin',
          'upper-latin',
        ];

        editor.commands.setContent('<ol><li><p>Item</p></li></ol>');
        editor.commands.setTextSelection(3);

        allTypes.forEach((type) => {
          const result = editor.commands.setListStyle(type);
          expect(result).toBe(true);

          const json = editor.getJSON();
          expect(json.content?.[0]?.attrs?.['data-list-style-type']).toBe(type);
        });
      });
    });

    describe('toggleOrderedList()', () => {
      it('should inherit from parent OrderedList extension', () => {
        expect(editor.commands.toggleOrderedList).toBeDefined();
      });

      it('should create ordered list from paragraph', () => {
        editor.commands.setContent('<p>Text</p>');
        editor.commands.setTextSelection(1);

        const result = editor.commands.toggleOrderedList();

        expect(result).toBe(true);
        expect(editor.isActive('customOrderedList')).toBe(true);
      });
    });
  });

  describe('Extension Registration', () => {
    it('should register extension with correct name', () => {
      expect(editor.extensionManager.extensions.find((ext) => ext.name === 'customOrderedList')).toBeDefined();
    });

    it('should have setListStyle command available', () => {
      expect(editor.commands.setListStyle).toBeDefined();
    });
  });
});
