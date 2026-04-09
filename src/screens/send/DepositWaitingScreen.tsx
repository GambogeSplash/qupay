// DepositWaitingScreen — 4-step progress tracker showing transfer status.
// Consistent with app visual language: borderless cards, Inter fonts, brand colors.
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SendFlowParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<SendFlowParamList, 'DepositWaiting'>;
type StepState = 'waiting' | 'active' | 'done';

interface Step { label: string; desc: string; state: StepState; }

const currencySymbols: Record<string, string> = {
  USDT: '', NGN: '\u20A6', GHS: '\u20B5', KES: 'KSh', INR: '\u20B9', PHP: '\u20B1', MXN: '$', PKR: 'Rs', ZAR: 'R',
};

export const DepositWaitingScreen: React.FC<Props> = ({ navigation, route }) => {
  const {
    recipientName = 'Emeka Johnson',
    recipientMethod = 'OPay',
    amount = 200,
    receiveAmount = 329000,
    sendCurrency = 'USDT',
    recvCurrency = 'NGN',
    network = 'Polygon',
  } = route.params || {};

  const isCryptoOut = recvCurrency === 'USDT';
  const recvSymbol = currencySymbols[recvCurrency] || '';
  const firstName = recipientName.split(' ')[0];

  const initialSteps: Step[] = useMemo(() => [
    { label: 'Listening for deposit', desc: `Watching ${network} for your ${sendCurrency} transfer`, state: 'active' },
    { label: 'Deposit confirmed', desc: `${amount} ${sendCurrency} received and locked`, state: 'waiting' },
    { label: 'Converting & sending', desc: `Releasing ${recvSymbol}${receiveAmount.toLocaleString()} to ${recipientMethod}`, state: 'waiting' },
    { label: 'Delivered', desc: `${firstName} received ${recvSymbol}${receiveAmount.toLocaleString()} via ${recipientMethod}`, state: 'waiting' },
  ], [network, sendCurrency, amount, recvSymbol, receiveAmount, recipientMethod, firstName]);

  const [steps, setSteps] = useState(initialSteps);
  const [currentStep, setCurrentStep] = useState(0);
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Spinner animation
  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true })
    );
    spin.start();
    return () => spin.stop();
  }, [spinAnim]);

  const spinRotate = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // Simulate step progression
  useEffect(() => {
    const timings = [4000, 3000, 5000]; // ms between steps
    let timer: ReturnType<typeof setTimeout>;

    const advance = (step: number) => {
      if (step >= 3) {
        // Done — navigate to success
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => {
          navigation.navigate('Success', {
            recipientName, recipientMethod, amount, receiveAmount,
            recvCurrency, sendCurrency,
          });
        }, 1200);
        return;
      }

      timer = setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSteps((prev) =>
          prev.map((s, i) =>
            i === step ? { ...s, state: 'done' } :
            i === step + 1 ? { ...s, state: 'active' } : s
          )
        );
        setCurrentStep(step + 1);
        advance(step + 1);
      }, timings[step] || 3000);
    };

    advance(0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sending...</Text>
        <Text style={styles.headerSub}>
          {amount} {sendCurrency} {'\u2192'} {recvSymbol}{receiveAmount.toLocaleString()} {recvCurrency}
        </Text>
      </View>

      {/* Steps */}
      <View style={styles.stepsCard}>
        {steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            {/* Icon column */}
            <View style={styles.stepIconCol}>
              {step.state === 'done' ? (
                <View style={styles.stepDone}>
                  <Ionicons name="checkmark" size={14} color="#0A0A0C" />
                </View>
              ) : step.state === 'active' ? (
                <Animated.View style={[styles.stepActive, { transform: [{ rotate: spinRotate }] }]}>
                  <View style={styles.stepSpinnerCut} />
                </Animated.View>
              ) : (
                <View style={styles.stepWaiting} />
              )}
              {/* Connector line */}
              {i < steps.length - 1 && (
                <View style={[styles.connector, step.state === 'done' && styles.connectorDone]} />
              )}
            </View>

            {/* Text */}
            <View style={styles.stepTextCol}>
              <Text style={[
                styles.stepLabel,
                step.state === 'done' && styles.stepLabelDone,
                step.state === 'waiting' && styles.stepLabelWaiting,
              ]}>
                {step.label}
              </Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Reassurance footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          You can close this screen — we'll notify you when {firstName} receives the money.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C', justifyContent: 'center' },

  header: { alignItems: 'center', marginBottom: 32 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#FFFFFF', letterSpacing: -0.3 },
  headerSub: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.58)', marginTop: 6, fontVariant: ['tabular-nums'] },

  stepsCard: {
    backgroundColor: '#17171A', borderRadius: 16,
    marginHorizontal: 20, padding: 20,
  },
  stepRow: { flexDirection: 'row', minHeight: 64 },
  stepIconCol: { width: 28, alignItems: 'center' },
  stepDone: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#4ADE80',
    alignItems: 'center', justifyContent: 'center',
  },
  stepActive: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2.5, borderColor: '#38BDF8',
    borderTopColor: 'transparent',
  },
  stepSpinnerCut: {},
  stepWaiting: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.12)',
  },
  connector: {
    width: 2, flex: 1, backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 4,
  },
  connectorDone: { backgroundColor: '#4ADE80' },

  stepTextCol: { flex: 1, marginLeft: 12, paddingBottom: 16 },
  stepLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFFFFF' },
  stepLabelDone: { color: '#4ADE80' },
  stepLabelWaiting: { color: 'rgba(255,255,255,0.42)' },
  stepDesc: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.42)', marginTop: 2, lineHeight: 18 },

  footer: { position: 'absolute', bottom: 40, left: 20, right: 20, alignItems: 'center' },
  footerText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 18 },
});
