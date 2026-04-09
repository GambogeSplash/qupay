import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Ionicons } from './Icon';
import { useTheme, typography, spacing, borderRadius } from '../theme';
import { useHaptics } from '../hooks/useHaptics';

interface AnimatedSuccessProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  color?: string;
  children?: React.ReactNode;
}

export const AnimatedSuccess: React.FC<AnimatedSuccessProps> = ({
  icon = 'checkmark',
  title,
  subtitle,
  color,
  children,
}) => {
  const { theme, brand } = useTheme();
  const haptics = useHaptics();
  const iconColor = color || brand.green;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    haptics.success();

    // Icon bounce in
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 6,
      useNativeDriver: true,
    }).start();

    // Text fade in with slight slide up
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background.default }]}>
      <Animated.View
        style={[
          styles.iconCircle,
          { backgroundColor: iconColor + '18', transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Ionicons name={icon} size={40} color={iconColor} />
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
        <Text style={[typography.display2, { color: theme.text.primary, marginTop: spacing(6) }]}>
          {title}
        </Text>
        <Text style={[typography.body, { color: theme.text.secondary, textAlign: 'center', marginTop: spacing(2), paddingHorizontal: spacing(4) }]}>
          {subtitle}
        </Text>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, width: '100%', marginTop: spacing(8) }}>
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(6),
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
