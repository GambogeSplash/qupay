import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import { QupayLogo, CTAButton } from '../../components';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Splash'>;

const words = ['anyone', 'anywhere'];

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(prev => (prev + 1) % words.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [fadeAnim]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.content}>
          <QupayLogo size={28} />
          <View style={styles.spacer} />
          <Text style={styles.headline}>
            Quick payments,{'\n'}in any currency,{'\n'}
            <Text style={styles.greenText}>
              to <Animated.Text style={{ opacity: fadeAnim }}>{words[currentIndex]}</Animated.Text>
            </Text>
          </Text>
          <Text style={styles.description}>
            Send or receive money, in any currency, to & from anyone, anywhere, with just a mobile number.
          </Text>
          {/* Stats row */}
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>54+</Text>
              <Text style={styles.statLabel}>Countries</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>No fees</Text>
              <Text style={styles.statLabel}>Zero cost</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>Quick</Text>
              <Text style={styles.statLabel}>Delivery</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottom}>
          <CTAButton
            title="Get Started"
            onPress={() => navigation.navigate('SignUp')}
            style={styles.ctaBtn}
          />
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')} activeOpacity={0.7}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginLink}>Log in</Text>
            </Text>
          </TouchableOpacity>
          <View style={styles.footer}>
            <Ionicons name="shield-checkmark-outline" size={11} color="rgba(255,255,255,0.4)" />
            <Text style={styles.footerText}>Licensed & regulated globally</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0A0A0C',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 40,
  },
  spacer: {
    height: 36,
  },
  headline: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    lineHeight: 35,
    letterSpacing: -0.5,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  greenText: {
    color: '#38BDF8',
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 23,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 32,
  },
  statRow: {
    flexDirection: 'row',
    backgroundColor: '#1F1F23',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
  },
  statItem: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  statVal: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#38BDF8',
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  bottom: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  ctaBtn: {
    marginBottom: 16,
  },
  loginText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginLink: {
    color: '#38BDF8',
    fontFamily: 'Inter_600SemiBold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 8,
  },
  footerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
});
