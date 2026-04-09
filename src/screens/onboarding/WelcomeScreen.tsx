// WelcomeScreen — 3-step onboarding walkthrough for first-time users.
// Shown after PIN setup, before the main app. Explains the core flow.
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';

const STEPS = [
  {
    icon: 'people',
    title: 'Pick who to send to',
    sub: 'Choose a saved recipient or add a new one with their bank details. We support 40+ countries.',
    color: '#38BDF8',
  },
  {
    icon: 'cash',
    title: 'Enter the amount',
    sub: 'Type how much to send in stablecoins. See the live conversion to their local currency instantly.',
    color: '#4ADE80',
  },
  {
    icon: 'flash',
    title: 'We handle the rest',
    sub: 'Deposit crypto to a QR address. We detect it, convert it, and deliver cash to your recipient in under 2 minutes.',
    color: '#FFD60A',
  },
];

export const WelcomeScreen: React.FC<{ onDone?: () => void; navigation?: any }> = ({ onDone, navigation }) => {
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const done = () => {
    if (onDone) onDone();
    else if (navigation) navigation.replace('Main');
  };

  const goNext = () => {
    if (step < STEPS.length - 1) {
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
        setStep((s) => s + 1);
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      });
    } else {
      done();
    }
  };

  const current = STEPS[step];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Top bar with dots + skip */}
      <View style={styles.topBar}>
        <View style={{ width: 40 }} />
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity onPress={done} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={[styles.iconCircle, { backgroundColor: current.color + '18' }]}>
          <Ionicons name={current.icon as any} size={48} color={current.color} />
        </View>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.sub}>{current.sub}</Text>
      </Animated.View>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cta} onPress={goNext} activeOpacity={0.85}>
          <Text style={styles.ctaText}>
            {step < STEPS.length - 1 ? 'Next' : 'Get started'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#0A0A0C" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)' },
  dotActive: { backgroundColor: '#38BDF8', width: 24 },
  skipText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: 'rgba(255,255,255,0.42)' },

  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  iconCircle: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center', marginBottom: 32,
  },
  title: {
    fontFamily: 'Inter_700Bold', fontSize: 28, color: '#FFFFFF',
    textAlign: 'center', letterSpacing: -0.3, marginBottom: 12,
  },
  sub: {
    fontFamily: 'Inter_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.58)',
    textAlign: 'center', lineHeight: 22,
  },

  footer: { paddingHorizontal: 20, paddingBottom: 24 },
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#38BDF8', borderRadius: 999, paddingVertical: 18,
  },
  ctaText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#0A0A0C' },
});
