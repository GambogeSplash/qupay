// Qupay — reskinned to match /Users/fubara/qupay literal-clone tokens
// Source of truth: /Users/fubara/qupay/src/qupay/tokens.ts (P)
// Neutral dark gray (no purple tint), single brand purple, semantic colors
// used sparingly. The original ThemeContext API is preserved so screens
// don't need to change.

export const colors = {
  light: {
    // Light mode is secondary — app is dark-first. Kept usable.
    primary: { main: '#0A0A0C', light: '#17171A', dark: '#000000', contrast: '#FFFFFF' },
    secondary: { main: '#38BDF8', light: '#7DD3FC', dark: '#0284C7' },
    text: { primary: '#0A0A0C', secondary: 'rgba(10,10,12,0.58)', disabled: 'rgba(10,10,12,0.25)', muted: 'rgba(10,10,12,0.42)', highlight: '#38BDF8' },
    background: { default: '#FFFFFF', paper: '#FFFFFF', surface: '#F5F5F7', surface2: '#EBEBF0', header: '#FFFFFF', disabled: '#E5E5EA', accent: '#FAF9FF', warm: '#F0EEFF' },
    divider: 'rgba(10,10,12,0.06)',
    error: { main: '#EF4444', light: '#F87171', dark: '#B91C1C', text: '#7F1D1D', bg: 'rgba(239,68,68,0.10)' },
    warning: { main: '#FFD60A', light: '#FFE04D', dark: '#CCAB08', text: '#0A0A0C', bg: 'rgba(255,214,10,0.12)' },
    info: { main: '#38BDF8', light: '#7DD3FC', dark: '#0284C7', text: '#2D1F6E', bg: 'rgba(56,189,248,0.12)' },
    success: { main: '#4ADE80', light: '#86EFAC', dark: '#16A34A', text: '#0A3D2A', bg: 'rgba(74,222,128,0.12)' },
    action: { active: 'rgba(10,10,12,0.58)', hover: '#F5F5F7', selected: '#EBEBF0', disabled: 'rgba(10,10,12,0.25)', disabledBg: '#F5F5F7', focus: '#EBEBF0' },
    inputBorder: 'rgba(10,10,12,0.10)',
  },
  dark: {
    // Primary text/foreground — pure white (matches local P.text)
    primary: { main: '#FFFFFF', light: '#FFFFFF', dark: '#E8E8E8', contrast: '#0A0A0C' },
    secondary: { main: '#38BDF8', light: '#7DD3FC', dark: '#0284C7' },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255,255,255,0.58)',
      disabled: 'rgba(255,255,255,0.25)',
      muted: 'rgba(255,255,255,0.42)',
      highlight: '#38BDF8',
    },
    // Surfaces — neutral dark gray, no purple tint (P.bg → P.cardHigher)
    background: {
      default: '#0A0A0C',     // P.bg — root background, near-pure black
      paper: '#17171A',       // P.card — outer card
      surface: '#1F1F23',     // P.cardInner — nested card / action squares
      surface2: '#26262A',    // P.cardHigher — 3rd-level surface
      header: '#0A0A0C',
      disabled: 'rgba(255,255,255,0.06)',
      accent: '#17171A',
      warm: '#1F1F23',
    },
    divider: 'rgba(255,255,255,0.06)',
    error: { main: '#EF4444', light: '#F87171', dark: '#B91C1C', text: '#FCA5A5', bg: 'rgba(239,68,68,0.15)' },
    warning: { main: '#FFD60A', light: '#FFE04D', dark: '#CCAB08', text: '#FFE04D', bg: 'rgba(255,214,10,0.15)' },
    info: { main: '#38BDF8', light: '#7DD3FC', dark: '#0284C7', text: '#D4CCFF', bg: 'rgba(56,189,248,0.15)' },
    success: { main: '#4ADE80', light: '#86EFAC', dark: '#16A34A', text: '#4ADE80', bg: 'rgba(74,222,128,0.15)' },
    action: {
      active: 'rgba(255,255,255,0.58)',
      hover: 'rgba(255,255,255,0.06)',
      selected: 'rgba(255,255,255,0.10)',
      disabled: 'rgba(255,255,255,0.25)',
      disabledBg: 'rgba(255,255,255,0.06)',
      focus: 'rgba(255,255,255,0.08)',
    },
    inputBorder: 'rgba(255,255,255,0.08)',
  },
  brand: {
    // Single brand purple (local uses one purple, not two)
    green: '#4ADE80',
    greenDark: '#16A34A',
    purple: '#38BDF8',
    purpleDark: '#0284C7',
    blue: '#38BDF8',
    red: '#EF4444',
    yellow: '#FFD60A',
    // Soft tints
    greenDim: 'rgba(74,222,128,0.15)',
    greenDim2: 'rgba(74,222,128,0.06)',
    purpleDim: 'rgba(56,189,248,0.15)',
    purpleDim2: 'rgba(56,189,248,0.06)',
    blueDim: 'rgba(56,189,248,0.12)',
    redDim: 'rgba(239,68,68,0.15)',
    yellowDim: 'rgba(255,214,10,0.15)',
  },
  gradient: {
    // Brand gradient is purple-only (single-purple system, no green CTA)
    brand: ['#38BDF8', '#0284C7'] as const,
    phantom: ['#38BDF8', '#0284C7'] as const,
    hero: ['#17171A', '#0A0A0C'] as const,
    avatar1: ['#38BDF8', '#0284C7'] as const,
    avatar2: ['#38BDF8', '#38BDF8'] as const,
    avatar3: ['#FFE55C', '#FFD60A'] as const,
    avatar4: ['#EF4444', '#FFD60A'] as const,
    avatar5: ['#A855F7', '#38BDF8'] as const,
  },
};

export type ColorMode = 'light' | 'dark';
export type ThemeColors = typeof colors.light;
