import { normalizeBorderWidth } from './border-width.util';

describe('normalizeBorderWidth', () => {
  it('completes a bare number to px — the case this exists for', () => {
    // `border-width: 3` is invalid CSS and is dropped by the browser, so typing a
    // bare number used to apply nothing at all with no feedback.
    expect(normalizeBorderWidth('3')).toBe('3px');
    expect(normalizeBorderWidth('0')).toBe('0px');
    expect(normalizeBorderWidth('1.5')).toBe('1.5px');
  });

  it('leaves a value that already carries a unit alone', () => {
    expect(normalizeBorderWidth('2px')).toBe('2px');
    expect(normalizeBorderWidth('0.25rem')).toBe('0.25rem');
    expect(normalizeBorderWidth('1em')).toBe('1em');
  });

  it('normalizes casing and stray whitespace', () => {
    expect(normalizeBorderWidth('  4PX ')).toBe('4px');
    expect(normalizeBorderWidth('2 px')).toBe('2px');
    expect(normalizeBorderWidth('01px')).toBe('1px');
  });

  it('keeps the CSS border-width keywords', () => {
    expect(normalizeBorderWidth('thin')).toBe('thin');
    expect(normalizeBorderWidth('MEDIUM')).toBe('medium');
    expect(normalizeBorderWidth('thick')).toBe('thick');
  });

  it('returns null for an empty field — that is a real instruction to clear the width', () => {
    expect(normalizeBorderWidth('')).toBeNull();
    expect(normalizeBorderWidth('   ')).toBeNull();
    expect(normalizeBorderWidth(null)).toBeNull();
    expect(normalizeBorderWidth(undefined)).toBeNull();
  });

  it('returns undefined for unusable input so a typo does not wipe the current width', () => {
    // `undefined` reaches the command as "leave this field alone". Returning `null` here
    // would clear a working border because the user mistyped into a free-text field.
    expect(normalizeBorderWidth('abc')).toBeUndefined();
    expect(normalizeBorderWidth('-2px')).toBeUndefined(); // widths cannot be negative
    expect(normalizeBorderWidth('50%')).toBeUndefined(); // % is not valid for border-width
    expect(normalizeBorderWidth('3px solid')).toBeUndefined();
  });

  it('separates "clear it" from "leave it alone" — the distinction the command relies on', () => {
    expect(normalizeBorderWidth('')).toBeNull();
    expect(normalizeBorderWidth('nonsense')).toBeUndefined();
    expect(normalizeBorderWidth('')).not.toBe(normalizeBorderWidth('nonsense'));
  });
});
