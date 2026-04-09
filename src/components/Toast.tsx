import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from './Icon';
import { useTheme, typography, spacing, borderRadius } from '../theme';
// shadows intentionally not imported — local design has no toast shadow

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  onDismiss: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'success',
  onDismiss,
  duration = 3000,
}) => {
  const { theme, brand } = useTheme();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        dismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -100, duration: 250, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onDismiss());
  };

  const config = {
    success: { icon: 'checkmark-circle' as const, color: brand.green, bg: theme.background.paper },
    error: { icon: 'close-circle' as const, color: theme.error.main, bg: theme.background.paper },
    info: { icon: 'information-circle' as const, color: brand.blue, bg: theme.background.paper },
  };

  const c = config[type];

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: c.bg, transform: [{ translateY }], opacity },
      ]}
    >
      <TouchableOpacity style={styles.content} onPress={dismiss} activeOpacity={0.8}>
        <Ionicons name={c.icon} size={22} color={c.color} />
        <Text style={[typography.main14, { color: theme.text.primary, flex: 1 }]} numberOfLines={2}>
          {message}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing(14),
    left: spacing(4),
    right: spacing(4),
    borderRadius: borderRadius.md, // R.md — local toast radius
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    padding: spacing(4),
  },
});
