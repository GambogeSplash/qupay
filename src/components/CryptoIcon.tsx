// CryptoIcon — token logo with optional network badge overlay.
// Used for stablecoins where the chain matters (USDT on Polygon vs USDT on Tron
// look identical in price but transact very differently — fees, speed, address
// formats). The network badge sits at the bottom-right, ringed by the surface
// color so it visually attaches to the token mark.
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { findCurrencyLogo, findNetworkLogo, BrandLogo } from '../data/logos';

interface CryptoIconProps {
  token: string;          // e.g., "USDT", "USDC", "ETH"
  network?: string;       // e.g., "Polygon", "Ethereum", "Tron"
  size?: number;
  // Surface color used for the badge ring — set to match the parent card.
  ringColor?: string;
}

export const CryptoIcon: React.FC<CryptoIconProps> = ({
  token,
  network,
  size = 40,
  ringColor = '#17171A',
}) => {
  const [tokenErr, setTokenErr] = useState(false);
  const [netErr, setNetErr] = useState(false);

  const tokenLogo: BrandLogo | undefined = findCurrencyLogo(token);
  const netLogo: BrandLogo | undefined = findNetworkLogo(network);

  const radius = size / 2;
  const badgeSize = Math.round(size * 0.42);
  const badgeRadius = badgeSize / 2;

  // Token main circle
  const tokenNode =
    tokenLogo && !tokenErr ? (
      <View
        style={[
          styles.tokenChip,
          { width: size, height: size, borderRadius: radius, backgroundColor: tokenLogo.bg || '#FFFFFF' },
        ]}
      >
        <Image
          source={{ uri: tokenLogo.uri }}
          style={{ width: size, height: size, borderRadius: radius }}
          resizeMode="cover"
          onError={() => setTokenErr(true)}
        />
      </View>
    ) : (
      <View
        style={[
          styles.fallback,
          { width: size, height: size, borderRadius: radius },
        ]}
      >
        <Text style={[styles.fallbackText, { fontSize: size * 0.36 }]}>
          {token.substring(0, 4).toUpperCase()}
        </Text>
      </View>
    );

  // No network specified → just the token
  if (!network) {
    return <View accessible accessibilityLabel={token}>{tokenNode}</View>;
  }

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityLabel={`${token} on ${network}`}
    >
      {tokenNode}
      {/* Network badge — bottom-right with surface ring */}
      <View
        style={[
          styles.badge,
          {
            width: badgeSize + 4,
            height: badgeSize + 4,
            borderRadius: (badgeSize + 4) / 2,
            backgroundColor: ringColor,
            right: -2,
            bottom: -2,
          },
        ]}
      >
        {netLogo && !netErr ? (
          <Image
            source={{ uri: netLogo.uri }}
            style={{
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeRadius,
              backgroundColor: netLogo.bg || '#FFFFFF',
            }}
            resizeMode="cover"
            onError={() => setNetErr(true)}
          />
        ) : (
          <View
            style={{
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeRadius,
              backgroundColor: '#1F1F23',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: badgeSize * 0.5, color: '#FFFFFF' }}>
              {network.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tokenChip: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
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
  badge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
