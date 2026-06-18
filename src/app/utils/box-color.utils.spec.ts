import { brighten, generateBoxColor, parseHsl } from './box-color.utils';

describe('box-color utils', () => {
  describe('parseHsl', () => {
    it('parses the space-separated hsl string from generateBoxColor', () => {
      expect(parseHsl('hsl(120deg 50% 45%)')).toEqual({ h: 120, s: 50, l: 45 });
    });

    it('round-trips a freshly generated colour', () => {
      const { h, s, l } = parseHsl(generateBoxColor());
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(354);
      expect(s).toBeGreaterThanOrEqual(40);
      expect(l).toBeGreaterThanOrEqual(40);
      expect(l).toBeLessThan(60);
    });
  });

  describe('brighten', () => {
    it('adds the delta to the lightness channel only', () => {
      expect(brighten('hsl(200deg 50% 50%)', 30)).toBe('hsl(200deg 50% 80%)');
    });

    it('clamps lightness at 100', () => {
      expect(brighten('hsl(0deg 50% 90%)', 30)).toBe('hsl(0deg 50% 100%)');
    });

    it('leaves hue and saturation untouched', () => {
      const { h, s } = parseHsl(brighten('hsl(123deg 47% 41%)', 10));
      expect(h).toBe(123);
      expect(s).toBe(47);
    });
  });
});
