import { describe, it, expect } from 'vitest';
import { themes, getTheme } from '@/lib/themes';

describe('themes', () => {
  it('should have light and dark themes defined', () => {
    expect(themes).toHaveProperty('light');
    expect(themes).toHaveProperty('dark');
  });

  it('should have all required properties in light theme', () => {
    const lightTheme = themes.light;

    expect(lightTheme).toHaveProperty('background');
    expect(lightTheme).toHaveProperty('text');
    expect(lightTheme).toHaveProperty('meta');
    expect(lightTheme).toHaveProperty('grade0');
    expect(lightTheme).toHaveProperty('grade1');
    expect(lightTheme).toHaveProperty('grade2');
    expect(lightTheme).toHaveProperty('grade3');
    expect(lightTheme).toHaveProperty('grade4');
  });

  it('should have all required properties in dark theme', () => {
    const darkTheme = themes.dark;

    expect(darkTheme).toHaveProperty('background');
    expect(darkTheme).toHaveProperty('text');
    expect(darkTheme).toHaveProperty('meta');
    expect(darkTheme).toHaveProperty('grade0');
    expect(darkTheme).toHaveProperty('grade1');
    expect(darkTheme).toHaveProperty('grade2');
    expect(darkTheme).toHaveProperty('grade3');
    expect(darkTheme).toHaveProperty('grade4');
  });

  it('should have valid color values', () => {
    const hexColorRegex = /^#[0-9a-fA-F]{6}$/;

    for (const [themeName, theme] of Object.entries(themes)) {
      for (const [key, value] of Object.entries(theme)) {
        expect(
          hexColorRegex.test(value),
          `${themeName}.${key} should be a valid hex color`
        ).toBe(true);
      }
    }
  });
});

describe('getTheme', () => {
  it('should return light theme by default', () => {
    const theme = getTheme();
    expect(theme).toEqual(themes.light);
  });

  it('should return light theme for "light"', () => {
    const theme = getTheme('light');
    expect(theme).toEqual(themes.light);
  });

  it('should return dark theme for "dark"', () => {
    const theme = getTheme('dark');
    expect(theme).toEqual(themes.dark);
  });

  it('should fallback to light theme for invalid theme name', () => {
    // @ts-expect-error Testing invalid input
    const theme = getTheme('invalid');
    expect(theme).toEqual(themes.light);
  });
});
