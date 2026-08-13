/**
 * Normalize what a user typed into the border-width field into a valid CSS length.
 *
 * The field is a free-text input, and `border-width: 3` is not a valid declaration —
 * the browser drops it silently, so typing a bare number used to do nothing at all
 * with no feedback. A bare number is the single most likely thing to type, and in a
 * length context it conventionally means pixels, so it is completed to `px`.
 *
 * Anything already carrying a unit is left alone (only the unit is lower-cased).
 *
 * The two failure modes are deliberately NOT the same value, because the command this
 * feeds reads `null` as "clear this field" and `undefined` as "leave it alone":
 *
 * - an **empty** field is a real instruction to clear the width, so it returns `null`;
 * - **unusable** input (`abc`, `-2px`, `50%`) returns `undefined`, so a typo leaves the
 *   width the cell already had instead of wiping it. Collapsing the two would mean a
 *   user with a working `1px` border who mistypes `3 pixels` loses it on Save with no
 *   message — the field is free text, so mistyping it is the expected case, not a rare one.
 *
 * @returns a valid CSS border-width; `null` to clear it; `undefined` to leave it alone.
 */
export function normalizeBorderWidth(input: string | null | undefined): string | null | undefined {
  const value = (input ?? '').trim();
  if (!value) return null;

  // `thin | medium | thick` are valid border-width keywords in their own right.
  if (/^(thin|medium|thick)$/i.test(value)) return value.toLowerCase();

  // A bare number — the case this helper exists for. Border widths cannot be
  // negative, so a signed value is rejected rather than quietly clamped.
  if (/^\d+(\.\d+)?$/.test(value)) return `${parseFloat(value)}px`;

  // Already a length. Units per CSS Values 4; `%` is not valid for border-width.
  const withUnit = /^(\d+(?:\.\d+)?)\s*(px|em|rem|pt|pc|in|cm|mm|q|ch|ex|vh|vw|vmin|vmax)$/i.exec(value);
  if (withUnit) return `${parseFloat(withUnit[1])}${withUnit[2].toLowerCase()}`;

  // Not a border-width at all — leave whatever the cell already has untouched.
  return undefined;
}
