export const colors = {
  green: '#6FAE2E',
  greenLight: '#9BD253',
  orange: '#F0961B',
  orangeLight: '#FFC24D',
  blue: '#1FA6D6',
  blueLight: '#5FD3EF',
  rust: '#E85526',
  rustLight: '#F97A45',
  pink: '#D42561',
  pinkLight: '#F14A83',

  navy: '#1B2A41',
  navySoft: '#2C3E5A',
  cream: '#FBF3DD',
  creamDeep: '#F4EFCF',
  background: '#FFFCF3',
  surface: '#FFFFFF',
  border: '#EDE6CC',

  text: '#1B2A41',
  textMuted: '#6B7688',
  textFaint: '#9AA3B2',

  success: '#6FAE2E',
  danger: '#D64545',
  warning: '#F0961B',
  info: '#1FA6D6',
} as const;

export const gradients = {
  hero: [colors.greenLight, colors.blueLight] as const,
  warm: [colors.orangeLight, colors.rust] as const,
  care: [colors.blueLight, colors.blue] as const,
  companion: [colors.pinkLight, colors.pink] as const,
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const typography = {
  display: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
  h1: { fontSize: 26, fontWeight: '800' as const, letterSpacing: -0.3 },
  h2: { fontSize: 21, fontWeight: '700' as const },
  h3: { fontSize: 17, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '500' as const },
  bodyLarge: { fontSize: 18, fontWeight: '500' as const },
  caption: { fontSize: 13, fontWeight: '600' as const },
  tiny: { fontSize: 11, fontWeight: '700' as const },
};

export const shadow = {
  card: {
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  soft: {
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
};

export type PersonColorKey = 'green' | 'orange' | 'blue' | 'pink' | 'rust';

export const personPalette: Record<PersonColorKey, { main: string; light: string }> = {
  green: { main: colors.green, light: colors.greenLight },
  orange: { main: colors.orange, light: colors.orangeLight },
  blue: { main: colors.blue, light: colors.blueLight },
  pink: { main: colors.pink, light: colors.pinkLight },
  rust: { main: colors.rust, light: colors.rustLight },
};

export const personColorOrder: PersonColorKey[] = ['blue', 'green', 'orange', 'pink', 'rust'];
