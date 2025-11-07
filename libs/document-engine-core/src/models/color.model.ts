import { normalizeColor } from '../utils';

export class Color {
  public readonly value: string;
  public readonly name: string;
  public readonly type?: 'rgb' | 'hex';

  private constructor(value: string, name?: string, type?: 'rgb' | 'hex') {
    const normalizedColor = normalizeColor(value);

    if (!normalizedColor) {
      throw new Error('Invalid or unsupported color');
    }

    this.value = normalizedColor;
    this.name = name ?? normalizedColor;
    this.type = type;

    Object.freeze(this);
  }

  public static from(value: string, name?: string, type?: 'rgb' | 'hex'): Color {
    return new Color(value, name, type);
  }

  public static fromArray(colors: (string | { value: string; name?: string; type?: 'rgb' | 'hex' })[]): Color[] {
    return colors.map((color) => {
      if (typeof color === 'string') {
        return new Color(color);
      }

      return new Color(color.value, color.name, color.type);
    });
  }

  public equals(color: Color): boolean {
    return this.value === color.value;
  }

  public is(color: string) {
    return this.value === normalizeColor(color);
  }
}
