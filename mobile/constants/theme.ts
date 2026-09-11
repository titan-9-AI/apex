================================================================
export const palette = {
  purple: '#7c3aed',
  purpleSoft: '#ede9fe',
  purpleDeep: '#4c1d95',
  bgDark: '#15082b',
  bgDarkAlt: '#1e0f3d',
  surfaceDark: '#2a1654',
  pink: '#ec4899',
};

export type Theme = {
  colors: {
    background: string; surface: string; surfaceAlt: string;
    text: string; textSecondary: string; textMuted: string;
    border: string; accent: string; accentSoft: string; onAccent: string;
  };
  spacing: Record<'xs'|'sm'|'md'|'lg'|'xl'|'2xl'|'3xl', number>;
  radius: Record<'sm'|'md'|'lg'|'xl'|'full', number>;
  type: { title: number; heading: number; body: number; caption: number; footnote: number };
};

export const darkTheme: Theme = {
  colors: {
    background: palette.bgDark,
    surface: palette.surfaceDark,
    surfaceAlt: palette.bgDarkAlt,
    text: '#f5f3ff',
    textSecondary: '#d8ccf5',
    textMuted: '#a78bfa',
    border: '#3b2a66',
    accent: palette.purple,
    accentSoft: palette.purpleSoft,
    onAccent: '#ffffff',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32, '3xl': 48 },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, full: 999 },
  type: { title: 32, heading: 22, body: 16, caption: 13, footnote: 11 },
};

export const lightTheme: Theme = {
  colors: {
    background: '#f7f5ff',
    surface: '#ffffff',
    surfaceAlt: '#f1ebff',
    text: '#1e1b2e',
    textSecondary: '#4c3f73',
    textMuted: '#7c6ba8',
    border: '#e2d9f5',
    accent: palette.purple,
    accentSoft: '#ede9fe',
    onAccent: '#ffffff',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32, '3xl': 48 },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, full: 999 },
  type: { title: 32, heading: 22, body: 16, caption: 13, footnote: 11 },
};


================================================================
