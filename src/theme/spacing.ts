// Qupay spacing — reskinned to match /Users/fubara/qupay literal-clone tokens
// Source of truth: /Users/fubara/qupay/src/qupay/tokens.ts (R)
// Tighter radii than the original Phantom-soft set (measured from screenshots).
const BASE = 4;

export const spacing = (multiplier: number) => BASE * multiplier;

// Radii — measured from local screenshots (tighter than Phantom defaults)
export const borderRadius = {
  xs: 6,
  sm: 10,
  md: 12,    // chips, search inputs
  lg: 14,    // action squares (Send/Swap/Receive/Buy)
  xl: 16,    // outer cards, list cards
  xxl: 24,   // bottom sheet top corners, QR frame
  pill: 999, // primary CTA, account pills
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  // CTA glow recolored to brand purple (local design uses purple CTAs, not green)
  ctaGlow: {
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  purpleGlow: {
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
};
