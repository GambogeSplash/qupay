import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type BadgeVariant = 'green' | 'yellow' | 'red';

interface StatusBadgeProps {
  label: string;
  variant: BadgeVariant;
}

const bgMap: Record<BadgeVariant, string> = {
  green: 'rgba(56,189,248,0.12)',
  yellow: 'rgba(255,214,10,0.1)',
  red: 'rgba(239,68,68,0.1)',
};

const colorMap: Record<BadgeVariant, string> = {
  green: '#38BDF8',
  yellow: '#FFD60A',
  red: '#EF4444',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, variant }) => {
  return (
    <View
      style={[styles.badge, { backgroundColor: bgMap[variant] }]}
      accessible
      accessibilityLabel={`Status: ${label}`}
      accessibilityRole="text"
    >
      <Text style={[styles.text, { color: colorMap[variant] }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  text: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
  },
});
