import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientAvatarProps {
  initials: string;
  size?: number;
  colors?: readonly [string, string, ...string[]];
  fontSize?: number;
  borderWidth?: number;
  borderColor?: string;
}

const DEFAULT_COLORS: readonly [string, string] = ['#1a6fff', '#38BDF8'];

export const GradientAvatar: React.FC<GradientAvatarProps> = ({
  initials,
  size = 44,
  colors = DEFAULT_COLORS,
  fontSize,
  borderWidth,
  borderColor,
}) => {
  const fs = fontSize || size * 0.3;
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
        },
        borderWidth ? { borderWidth, borderColor: borderColor || 'rgba(255,255,255,0.1)' } : undefined,
      ]}
      accessible
      accessibilityLabel={`Avatar for ${initials}`}
      accessibilityRole="image"
    >
      <LinearGradient
        colors={colors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={[styles.initials, { fontSize: fs }]}>{initials}</Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
});
