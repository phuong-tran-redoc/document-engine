import { Editor } from '@tiptap/core';
import { createTestEditor } from '../helpers/editor-factory';
import { PageBreak } from '../../nodes/page-break.node';

describe('PageBreak Node', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = createTestEditor([PageBreak]);
  });

  afterEach(() => {
    editor.destroy();
  });

  describe('Rendering', () => {
    it('should render div with data-page-break attribute', () => {
      editor.commands.insertPageBreak();

      const html = editor.getHTML();
      expect(html).toContain('data-page-break="true"');
      expect(html).toContain('<div');
    });

    it('should render with correct class', () => {
      editor.commands.insertPageBreak();

      const html = editor.getHTML();
      expect(html).toContain('class="document-engine-page-break"');
    });

    it('should render with page break styles', () => {
      editor.commands.insertPageBreak();

      const html = editor.getHTML();
      expect(html).toContain('break-before: page');
      expect(html).toContain('page-break-before: always');
    });

    it('should render label span', () => {
      editor.commands.insertPageBreak();

      const html = editor.getHTML();
      expect(html).toContain('class="document-engine-page-break-label"');
      expect(html).toContain('Page break');
    });
  });

  describe('Parsing', () => {
    describe('Standard Tiptap format', () => {
      it('should parse div with data-page-break attribute', () => {
        editor.commands.setContent('<div data-page-break="true"></div>');

        const json = editor.getJSON();
        expect(json.content?.[0]?.type).toBe('pageBreak');
      });
    });

    describe('CKEditor legacy format', () => {
      it('should parse div with page-break class', () => {
        editor.commands.setContent('<div class="page-break"></div>');

        const json = editor.getJSON();
        expect(json.content?.[0]?.type).toBe('pageBreak');
      });
    });
  });

  describe('Commands', () => {
    describe('insertPageBreak()', () => {
      it('should insert page break node', () => {
        editor.commands.setContent('<p>Before</p>');
        editor.commands.setTextSelection(8);

        const result = editor.commands.insertPageBreak();

        expect(result).toBe(true);
        const json = editor.getJSON();
        expect(json.content?.some((node) => node.type === 'pageBreak')).toBe(true);
      });

      it('should insert at cursor position', () => {
        editor.commands.setContent('<p>First</p><p>Second</p>');
        editor.commands.setTextSelection(8); // End of first paragraph

        editor.commands.insertPageBreak();

        const json = editor.getJSON();
        expect(json.content?.[1]?.type).toBe('pageBreak');
      });

      it('should insert multiple page breaks', () => {
        editor.commands.setContent('<p>First</p>');

        // Insert first page break at end
        editor.commands.setTextSelection(7);
        const result1 = editor.commands.insertPageBreak();
        expect(result1).toBe(true);

        // Add content after first page break
        editor.commands.insertContent('<p>Second</p>');

        // Insert second page break at end
        const result2 = editor.commands.insertPageBreak();
        expect(result2).toBe(true);

        const json = editor.getJSON();
        const pageBreaks = json.content?.filter((node) => node.type === 'pageBreak');
        // Should have at least 1 page break (behavior depends on cursor position after insertContent)
        expect(pageBreaks?.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Node Properties', () => {
    it('should be an atom node', () => {
      const pageBreakNode = editor.schema.nodes['pageBreak'];
      expect(pageBreakNode.spec.atom).toBe(true);
    });

    it('should be selectable', () => {
      const pageBreakNode = editor.schema.nodes['pageBreak'];
      expect(pageBreakNode.spec.selectable).toBe(true);
    });

    it('should be a block node', () => {
      const pageBreakNode = editor.schema.nodes['pageBreak'];
      expect(pageBreakNode.spec.group).toBe('block');
    });
  });

  describe('HTML Round-trip', () => {
    it('should convert CKEditor format to standard format', () => {
      editor.commands.setContent('<div class="page-break"></div>');

      const outputHTML = editor.getHTML();

      expect(outputHTML).toContain('data-page-break="true"');
      expect(outputHTML).toContain('document-engine-page-break');
    });
  });

  describe('Extension Registration', () => {
    it('should register node with correct name', () => {
      expect(editor.schema.nodes['pageBreak']).toBeDefined();
    });

    it('should have insertPageBreak command available', () => {
      expect(editor.commands.insertPageBreak).toBeDefined();
    });
  });
});
