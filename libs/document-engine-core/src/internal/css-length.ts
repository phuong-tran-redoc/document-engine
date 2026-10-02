/** Pixels per unit for the absolute CSS length units (CSS Values 4: 1in = 96px). */
const PX_PER_UNIT: Record<string, number> = {
  px: 1,
  pt: 96 / 72,
  pc: 16,
  in: 96,
  cm: 96 / 2.54,
  mm: 96 / 25.4,
  q: 96 / 101.6,
};

/**
 * Convert a single absolute CSS length (`36pt`, `1cm`, `40px`) to pixels.
 * Returns `null` for anything else: relative units (`em`, `%`), keywords, or several values.
 */
export function absoluteLengthToPx(value: string | null | undefined): number | null {
  const match = /^(-?\d*\.?\d+)([a-z]*)$/i.exec((value ?? '').trim());
  if (!match) return null;
  const unit = match[2].toLowerCase();
  const factor = unit === '' ? (Number(match[1]) === 0 ? 1 : undefined) : PX_PER_UNIT[unit];
  return factor === undefined ? null : Number(match[1]) * factor;
}
