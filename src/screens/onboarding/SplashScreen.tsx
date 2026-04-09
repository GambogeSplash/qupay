// SplashScreen — first impression. Clear value prop, honest numbers, visual energy.
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '../../components/Icon';
import { QupayLogo } from '../../components';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const heroFade = useRef(new Animated.Value(0)).current;
  const statsFade = useRef(new Animated.Value(0)).current;
  const ctaFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(heroFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(statsFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(ctaFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.safe}>
      {/* Gradient background — sky blue top fading to dark */}
      <LinearGradient
        colors={['#0C4A6E', '#0A0A0C', '#0A0A0C']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Top — logo */}
        <View style={styles.top}>
          <QupayLogo size={24} />
        </View>

        {/* Hero — brand mark + value prop */}
        <Animated.View style={[styles.hero, { opacity: heroFade, transform: [{ translateY: heroFade.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          {/* Paper plane brand mark — large, iconic */}
          <View style={styles.brandMark}>
            <Animated.View style={[styles.brandGlow, {
              transform: [{ scale: heroFade.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
              opacity: heroFade.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }),
            }]} />
            <View style={styles.brandCircle}>
              <Ionicons name="bird" size={52} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.headline}>
            Send crypto.{'\n'}They get cash.
          </Text>
          <Text style={styles.sub}>
            USDT to local currency in under 2 minutes.
          </Text>

          {/* Stats — inside hero so it all centers together */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>40+</Text>
              <Text style={styles.statLabel}>Countries</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>$1.50</Text>
              <Text style={styles.statLabel}>Flat fee</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{'\u003C'}2 min</Text>
              <Text style={styles.statLabel}>Delivery</Text>
            </View>
          </View>
        </Animated.View>

        {/* CTAs — pinned to bottom */}
        <Animated.View style={[styles.bottom, { opacity: ctaFade }]}>
          <TouchableOpacity
            style={styles.cta}
            onPress={() => navigation.navigate('SignUp')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>Get started</Text>
            <Ionicons name="arrow-forward" size={18} color="#0A0A0C" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('SignIn')} activeOpacity={0.7}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginLink}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },
  top: { paddingHorizontal: 24, paddingTop: 12 },

  // Hero — centered in the middle of the screen
  hero: { flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  brandMark: { alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  brandCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#38BDF8',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 2,
  },
  brandGlow: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(56,189,248,0.08)',
  },

  headline: {
    fontFamily: 'Inter_700Bold', fontSize: 34, lineHeight: 40,
    letterSpacing: -0.8, color: '#FFFFFF', marginBottom: 12, textAlign: 'center',
  },
  sub: {
    fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 23,
    color: 'rgba(255,255,255,0.58)', textAlign: 'center', paddingHorizontal: 8,
    marginBottom: 20,
  },

  // Stats
  statsCard: {
    flexDirection: 'row', backgroundColor: '#17171A', borderRadius: 16,
    overflow: 'hidden', alignSelf: 'stretch',
  },
  statItem: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  statVal: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#38BDF8', fontVariant: ['tabular-nums'] },
  statLabel: {
    fontFamily: 'Inter_500Medium', fontSize: 10, color: 'rgba(255,255,255,0.42)',
    textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2,
  },

  // Steps
  stepsRow: { flexDirection: 'row', justifyContent: 'center', gap: 24, paddingHorizontal: 24 },
  stepItem: { alignItems: 'center', gap: 6 },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(56,189,248,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  stepNum: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#38BDF8' },
  stepLabel: { fontFamily: 'Inter_500Medium', fontSize: 11, color: 'rgba(255,255,255,0.58)' },

  // CTAs
  bottom: { paddingHorizontal: 24, paddingBottom: 16 },
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#38BDF8', borderRadius: 999, paddingVertical: 18, marginBottom: 14,
  },
  ctaText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#0A0A0C' },
  loginText: {
    fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.42)',
    textAlign: 'center',
  },
  loginLink: { color: '#38BDF8', fontFamily: 'Inter_600SemiBold' },
});
