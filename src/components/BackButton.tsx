import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from './Icon';

interface BackButtonProps {
  onPress: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel="Go back"
      accessibilityRole="button"
    >
      <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1F1F23', // P.cardInner
    // No border — local back buttons sit clean on dark surfaces
    alignItems: 'center',
    justifyContent: 'center',
  },
});
