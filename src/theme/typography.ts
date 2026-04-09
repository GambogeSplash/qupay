import { TextStyle } from 'react-native';

// Reskinned to match /Users/fubara/qupay tokens — local design tops out at
// Inter_700Bold (no ExtraBold). We keep the `extraBold` key for API compat
// but point it at Inter_700Bold so the whole system dims without per-screen
// edits. Letter-spacing kept slightly tight to preserve display rhythm.
export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_700Bold',
};

type TypographyVariant = TextStyle;

export const typography: Record<string, TypographyVariant> = {
  // Display — big headlines, Syne-style tight letter spacing
  display1: {
    fontFamily: fontFamily.extraBold,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -1.35,
  },
  display2: {
    fontFamily: fontFamily.extraBold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.8,
  },
  // Headings — Syne weight 800 style
  h1: {
    fontFamily: fontFamily.extraBold,
    fontSize: 32,
    lineHeight: 35,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: fontFamily.extraBold,
    fontSize: 26,
    lineHeight: 31,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  h4: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  h5: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  // Body — DM Sans style
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  bodyMedium: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 22,
  },
  bodySm: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  bodySmMedium: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  // Subheaders
  subheader1: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  subheader2: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  // Captions & labels
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  captionMedium: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  labelSm: {
    fontFamily: fontFamily.semiBold,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  labelXs: {
    fontFamily: fontFamily.semiBold,
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  // Buttons — Syne-style
  buttonL: {
    fontFamily: fontFamily.extraBold,
    fontSize: 17,
    lineHeight: 22,
  },
  buttonM: {
    fontFamily: fontFamily.extraBold,
    fontSize: 16,
    lineHeight: 22,
  },
  buttonS: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    lineHeight: 20,
  },
  // Numbers / values — DM Mono style (tabular)
  value: {
    fontFamily: fontFamily.extraBold,
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -1.5,
    fontVariant: ['tabular-nums'],
  },
  valueLg: {
    fontFamily: fontFamily.extraBold,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  valueMd: {
    fontFamily: fontFamily.extraBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  valueSm: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    lineHeight: 24,
    fontVariant: ['tabular-nums'],
  },
  valueXs: {
    fontFamily: fontFamily.bold,
    fontSize: 17,
    lineHeight: 22,
    fontVariant: ['tabular-nums'],
  },
  // Mono-style text (rates, references, timers)
  mono: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    fontVariant: ['tabular-nums'],
  },
  monoSm: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    fontVariant: ['tabular-nums'],
  },
  monoXs: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    lineHeight: 14,
    fontVariant: ['tabular-nums'],
  },
  // Legacy compat
  description: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  main14: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  main12: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  main16: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  main21: {
    fontFamily: fontFamily.bold,
    fontSize: 21,
    lineHeight: 28,
  },
  secondary14: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  secondary12: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  secondary16: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    lineHeight: 22,
  },
  secondary21: {
    fontFamily: fontFamily.medium,
    fontSize: 21,
    lineHeight: 28,
  },
  helperText: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    lineHeight: 14,
  },
};
