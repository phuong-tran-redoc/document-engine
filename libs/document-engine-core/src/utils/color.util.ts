/**
 * Normalizes a color value to lowercase hex format
 * Supports hex (#RGB, #RRGGBB) and rgb(r, g, b) formats
 *
 * @param color - Color value to normalize
 * @returns Normalized hex color or null if invalid
 *
 * @example
 * normalizeColor('#FF0000') // '#ff0000'
 * normalizeColor('rgb(255, 0, 0)') // '#ff0000'
 * normalizeColor('#F00') // '#f00'
 * normalizeColor('invalid') // null
 */
export function normalizeColor(color: string): string | null {
  if (!color) return null;

  const trimmed = color.trim().toLowerCase();

  if (trimmed === 'transparent') return trimmed;

  // Check if it's a valid hex color
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) {
    return trimmed;
  }

  // Try to parse RGB
  const rgbMatch = trimmed.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (rgbMatch) {
    const r = Math.max(0, Math.min(255, parseInt(rgbMatch[1], 10)));
    const g = Math.max(0, Math.min(255, parseInt(rgbMatch[2], 10)));
    const b = Math.max(0, Math.min(255, parseInt(rgbMatch[3], 10)));
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  return null;
}
