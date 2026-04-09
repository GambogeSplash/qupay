import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from './Icon';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

interface NumpadProps {
  onKey: (key: string) => void;
  size?: 'default' | 'compact';
}

export const Numpad: React.FC<NumpadProps> = ({ onKey, size = 'default' }) => {
  const isCompact = size === 'compact';

  return (
    <View style={[styles.numpad, isCompact && styles.numpadCompact]}>
      {KEYS.map((key, idx) => (
        <TouchableOpacity
          key={idx}
          style={[
            styles.numKey,
            isCompact && styles.numKeyCompact,
            key === '' && styles.numKeyEmpty,
          ]}
          onPress={() => key !== '' && onKey(key)}
          activeOpacity={key === '' ? 1 : 0.5}
          disabled={key === ''}
          accessibilityLabel={key === 'del' ? 'Delete' : key || undefined}
          accessibilityRole="button"
        >
          {key === 'del' ? (
            <Ionicons name="backspace-outline" size={isCompact ? 20 : 24} color="#FFFFFF" />
          ) : (
            <Text style={[styles.numKeyText, isCompact && styles.numKeyTextCompact]}>
              {key}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 40,
    paddingBottom: 32,
  },
  numpadCompact: {
    paddingHorizontal: 0,
    paddingBottom: 12,
    width: 260,
    alignSelf: 'center',
  },
  numKey: {
    width: '33.33%',
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numKeyCompact: {
    height: 56,
  },
  numKeyEmpty: {
    opacity: 0,
  },
  numKeyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 28,
    color: '#FFFFFF',
  },
  numKeyTextCompact: {
    fontSize: 24,
  },
});
