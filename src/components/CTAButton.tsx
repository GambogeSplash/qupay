import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
// shadows intentionally not imported — local CTAs don't use a glow.

interface CTAButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  ghost?: boolean;
  danger?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  ghost = false,
  danger = false,
  style,
  textStyle,
}) => {
  if (danger) {
    return (
      <TouchableOpacity
        style={[styles.danger, disabled && styles.disabled, style]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        accessibilityLabel={title}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading }}
      >
        <Text style={[styles.dangerText, textStyle]}>{title}</Text>
      </TouchableOpacity>
    );
  }

  if (ghost) {
    return (
      <TouchableOpacity
        style={[styles.ghost, disabled && styles.disabled, style]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        accessibilityLabel={title}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading }}
      >
        {loading ? (
          <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" />
        ) : (
          <Text style={[styles.ghostText, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.cta, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      accessibilityLabel={title}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#0A0A0C" />
      ) : (
        <Text style={[styles.ctaText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cta: {
    backgroundColor: '#38BDF8',
    borderRadius: 999, // local CTAs are pill-shaped (R.pill)
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ctaText: {
    fontFamily: 'Inter_600SemiBold', // T.ctaPurple — semibold, not extraBold
    fontSize: 16,
    color: '#0A0A0C',
  },
  ghost: {
    backgroundColor: '#1F1F23', // P.cardInner
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    // No border on dark surfaces in local design
  },
  ghostText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: 'rgba(255,255,255,0.58)',
  },
  danger: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 999,
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    flexDirection: 'row',
    gap: 8,
  },
  dangerText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#EF4444',
  },
  disabled: {
    opacity: 0.4,
  },
});
