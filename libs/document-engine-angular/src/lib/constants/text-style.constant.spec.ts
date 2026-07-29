import { DEFAULT_HEADING_LEVELS, buildHeadingOptions } from './text-style.constant';

/**
 * The toolbar's block-type dropdown must mirror the editor's configured heading
 * levels: no dead entry for a level the config omits, and no configured level
 * left unreachable. A plain-function unit test — no Angular TestBed needed.
 */
describe('buildHeadingOptions', () => {
  it('always leads with the "Normal text" (paragraph) entry', () => {
    const [first] = buildHeadingOptions([2, 3, 4]);
    expect(first).toEqual({ value: null, label: 'Normal text', class: '' });
  });

  it('offers exactly the configured levels (semantic mode = 2/3/4)', () => {
    const options = buildHeadingOptions([2, 3, 4]);
    expect(options).toEqual([
      { value: null, label: 'Normal text', class: '' },
      { value: 2, label: 'Heading 2', class: 'h2' },
      { value: 3, label: 'Heading 3', class: 'h3' },
      { value: 4, label: 'Heading 4', class: 'h4' },
    ]);
  });

  it('drops the level-1 entry when it is not configured', () => {
    const values = buildHeadingOptions([2, 3, 4]).map((o) => o.value);
    expect(values).not.toContain(1);
  });

  it('makes an otherwise-unreachable level (H4) selectable', () => {
    const values = buildHeadingOptions([2, 3, 4]).map((o) => o.value);
    expect(values).toContain(4);
  });

  it('de-duplicates and sorts levels ascending', () => {
    const values = buildHeadingOptions([4, 2, 2, 3]).map((o) => o.value);
    expect(values).toEqual([null, 2, 3, 4]);
  });

  it('falls back to the default 1–6 set when levels are omitted', () => {
    const values = buildHeadingOptions().map((o) => o.value);
    expect(values).toEqual([null, ...DEFAULT_HEADING_LEVELS]);
  });

  it('falls back to the default set for an empty levels array', () => {
    const values = buildHeadingOptions([]).map((o) => o.value);
    expect(values).toEqual([null, ...DEFAULT_HEADING_LEVELS]);
  });
});
