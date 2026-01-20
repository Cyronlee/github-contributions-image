import type { Theme, ThemeName } from './types';

export const themes: Record<ThemeName, Theme> = {
  light: {
    background: '#ffffff',
    text: '#1f2328',
    meta: '#1f2328',
    grade0: '#ebedf0',
    grade1: '#9be9a8',
    grade2: '#40c463',
    grade3: '#30a14e',
    grade4: '#216e39',
  },
  dark: {
    background: '#0d1117',
    text: '#e6edf3',
    meta: '#e6edf3',
    grade0: '#161b22',
    grade1: '#0e4429',
    grade2: '#006d32',
    grade3: '#26a641',
    grade4: '#39d353',
  },
};

export function getTheme(themeName: ThemeName = 'light'): Theme {
  return themes[themeName] ?? themes.light;
}
