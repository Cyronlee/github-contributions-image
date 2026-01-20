export interface Contribution {
  date: string;
  count: number;
  level: number;
}

export interface ContributionsData {
  total: number;
  range: {
    start: string;
    end: string;
  };
  contributions: Contribution[];
}

export interface Theme {
  background: string;
  text: string;
  meta: string;
  grade0: string;
  grade1: string;
  grade2: string;
  grade3: string;
  grade4: string;
}

export type ThemeName = 'light' | 'dark';
