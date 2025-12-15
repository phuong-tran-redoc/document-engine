import { normalizeColor } from '../../utils/color.util';

describe('Color Utilities', () => {
  describe('normalizeColor()', () => {
    describe('Hex colors', () => {
      it('should normalize 6-digit hex color to lowercase', () => {
        expect(normalizeColor('#FF0000')).toBe('#ff0000');
        expect(normalizeColor('#ABCDEF')).toBe('#abcdef');
      });

      it('should normalize 3-digit hex color to lowercase', () => {
        expect(normalizeColor('#F00')).toBe('#f00');
        expect(normalizeColor('#ABC')).toBe('#abc');
      });

      it('should preserve already lowercase hex colors', () => {
        expect(normalizeColor('#ff0000')).toBe('#ff0000');
        expect(normalizeColor('#abc')).toBe('#abc');
      });

      it('should handle hex colors with mixed case', () => {
        expect(normalizeColor('#FfAaBb')).toBe('#ffaabb');
        expect(normalizeColor('#F0a')).toBe('#f0a');
      });
    });

    describe('RGB colors', () => {
      it('should convert rgb(r, g, b) to hex', () => {
        expect(normalizeColor('rgb(255, 0, 0)')).toBe('#ff0000');
        expect(normalizeColor('rgb(0, 255, 0)')).toBe('#00ff00');
        expect(normalizeColor('rgb(0, 0, 255)')).toBe('#0000ff');
      });

      it('should handle rgb with extra spaces', () => {
        expect(normalizeColor('rgb( 255 , 0 , 0 )')).toBe('#ff0000');
        expect(normalizeColor('rgb(  255,  0,  0  )')).toBe('#ff0000');
      });

      it('should handle RGB with uppercase', () => {
        expect(normalizeColor('RGB(255, 0, 0)')).toBe('#ff0000');
        expect(normalizeColor('Rgb(128, 128, 128)')).toBe('#808080');
      });

      it('should handle valid RGB edge values', () => {
        expect(normalizeColor('rgb(0, 0, 0)')).toBe('#000000');
        expect(normalizeColor('rgb(255, 255, 255)')).toBe('#ffffff');
        expect(normalizeColor('rgb(128, 128, 128)')).toBe('#808080');
      });
    });

    describe('Special values', () => {
      it('should handle transparent color', () => {
        expect(normalizeColor('transparent')).toBe('transparent');
        expect(normalizeColor('TRANSPARENT')).toBe('transparent');
        expect(normalizeColor('  transparent  ')).toBe('transparent');
      });
    });

    describe('Invalid inputs', () => {
      it('should return null for empty string', () => {
        expect(normalizeColor('')).toBeNull();
      });

      it('should return null for invalid hex format', () => {
        expect(normalizeColor('#GG0000')).toBeNull(); // Invalid hex chars
        expect(normalizeColor('#12')).toBeNull(); // Too short
        expect(normalizeColor('#1234567')).toBeNull(); // Too long
        expect(normalizeColor('FF0000')).toBeNull(); // Missing #
      });

      it('should return null for invalid RGB format', () => {
        expect(normalizeColor('rgb(255, 0)')).toBeNull(); // Missing value
        expect(normalizeColor('rgb(255, 0, 0, 0)')).toBeNull(); // Too many values
        expect(normalizeColor('rgb(a, b, c)')).toBeNull(); // Non-numeric
      });

      it('should return null for unsupported color formats', () => {
        expect(normalizeColor('red')).toBeNull(); // Named color
        expect(normalizeColor('rgba(255, 0, 0, 0.5)')).toBeNull(); // RGBA
        expect(normalizeColor('hsl(0, 100%, 50%)')).toBeNull(); // HSL
      });

      it('should return null for whitespace-only string', () => {
        expect(normalizeColor('   ')).toBeNull();
        expect(normalizeColor('\t\n')).toBeNull();
      });
    });

    describe('Edge cases', () => {
      it('should trim whitespace', () => {
        expect(normalizeColor('  #FF0000  ')).toBe('#ff0000');
        expect(normalizeColor('\t#ABC\n')).toBe('#abc');
      });

      it('should handle black and white', () => {
        expect(normalizeColor('#000000')).toBe('#000000');
        expect(normalizeColor('#FFFFFF')).toBe('#ffffff');
        expect(normalizeColor('#000')).toBe('#000');
        expect(normalizeColor('#FFF')).toBe('#fff');
        expect(normalizeColor('rgb(0, 0, 0)')).toBe('#000000');
        expect(normalizeColor('rgb(255, 255, 255)')).toBe('#ffffff');
      });

      it('should handle grayscale colors', () => {
        expect(normalizeColor('rgb(128, 128, 128)')).toBe('#808080');
        expect(normalizeColor('#808080')).toBe('#808080');
      });
    });
  });
});
