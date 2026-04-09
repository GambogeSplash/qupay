import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, borderRadius, shadows, spacing } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  // `inner` = nested card (P.cardInner @ R.lg). `default` = outer (P.card @ R.xl).
  variant?: 'default' | 'elevated' | 'surface' | 'warm' | 'inner';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'default' }) => {
  const { theme, mode } = useTheme();

  const bgMap = {
    default: theme.background.paper,    // P.card #17171A — outer
    elevated: theme.background.paper,
    surface: theme.background.surface,  // P.cardInner #1F1F23
    warm: theme.background.warm,
    inner: theme.background.surface,    // P.cardInner #1F1F23
  };

  const radius = variant === 'inner' || variant === 'surface'
    ? borderRadius.lg   // 14 — inner
    : borderRadius.xl;  // 16 — outer (matches local R.xl)

  // Local outer cards are paddingH:16 paddingV:12-14 → match with H4 V3
  const horizontalPadding = spacing(4);
  const verticalPadding = variant === 'inner' || variant === 'surface' ? spacing(3) : spacing(3.5);

  return (
    <View
      style={[
        { borderRadius: radius, paddingHorizontal: horizontalPadding, paddingVertical: verticalPadding },
        { backgroundColor: bgMap[variant] },
        mode === 'light' && { borderWidth: 1, borderColor: theme.divider },
        variant === 'elevated' && shadows.card,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({});
