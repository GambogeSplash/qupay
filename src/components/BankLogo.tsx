// BankLogo — circular chip showing a real bank or currency logo via remote URI.
// Falls back to a tinted initial circle if the logo can't be resolved/loaded.
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { findBankLogo, findCurrencyLogo, BrandLogo } from '../data/logos';

interface BankLogoProps {
  // Either pass a bank/provider name, or a currency code (USDT/USDC/etc.)
  name?: string;
  currency?: string;
  size?: number;
  // Visual variant — default = solid bg chip, ghost = transparent
  variant?: 'default' | 'ghost';
}

export const BankLogo: React.FC<BankLogoProps> = ({
  name,
  currency,
  size = 40,
  variant = 'default',
}) => {
  const [errored, setErrored] = useState(false);
  const logo: BrandLogo | undefined = currency
    ? findCurrencyLogo(currency)
    : findBankLogo(name);

  const label = currency || name || '?';
  const initial = label.trim().charAt(0).toUpperCase();
  const radius = size / 2;

  // Fallback chip — used when no logo, or remote image failed
  if (!logo || errored) {
    return (
      <View
        style={[
          styles.fallback,
          { width: size, height: size, borderRadius: radius },
          variant === 'ghost' && { backgroundColor: 'transparent' },
        ]}
        accessible
        accessibilityLabel={label}
      >
        <Text style={[styles.fallbackText, { fontSize: size * 0.42 }]}>{initial}</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.chip,
        { width: size, height: size, borderRadius: radius, backgroundColor: variant === 'ghost' ? 'transparent' : '#FFFFFF' },
      ]}
      accessible
      accessibilityLabel={label}
    >
      <Image
        source={{ uri: logo.uri }}
        style={{ width: size * 0.7, height: size * 0.7, borderRadius: radius }}
        resizeMode="contain"
        onError={() => setErrored(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: '#1F1F23',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
});
