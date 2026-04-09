import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SendFlowParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<SendFlowParamList, 'DepositWaiting'>;

type StepState = 'waiting' | 'active' | 'done';

interface Step {
  label: string;
  desc: string;
  state: StepState;
}

const currencySymbols: Record<string, string> = {
  USDT: '', NGN: '\u20A6', GHS: '\u20B5', KES: 'KSh', INR: '\u20B9', PHP: '\u20B1', MXN: '$', PKR: 'Rs', ZAR: 'R',
};

const truncateAddress = (addr: string): string => {
  if (!addr || addr.length <= 14) return addr || '';
  return `${addr.slice(0, 8)}\u2026${addr.slice(-6)}`;
};

export const DepositWaitingScreen: React.FC<Props> = ({ navigation, route }) => {
  const {
    recipientName = 'Emeka Johnson',
    recipientMethod = 'OPay',
    recipientFlag = '\u{1F1F3}\u{1F1EC}',
    amount = 200,
    receiveAmount = 329000,
    sendCurrency = 'USDT',
    recvCurrency = 'NGN',
    network = 'Polygon',
    recipientWalletAddress,
    recipientNetwork,
  } = route.params || {};

  const isCryptoOut = recvCurrency === 'USDT';
  const sendSymbol = currencySymbols[sendCurrency] || '';
  const recvSymbol = currencySymbols[recvCurrency] || '';

  const formatUSDT = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const initialSteps: Step[] = useMemo(() => {
    if (isCryptoOut) {
      return [
        { label: 'Processing payment', desc: `Confirming your ${sendSymbol}${amount.toLocaleString()} ${sendCurrency} payment`, state: 'active' },
        { label: 'Payment confirmed', desc: `${sendSymbol}${amount.toLocaleString()} ${sendCurrency} received`, state: 'waiting' },
        { label: 'Converting & sending', desc: `Sending ${formatUSDT(receiveAmount)} USDT to ${truncateAddress(recipientWalletAddress || '')}`, state: 'waiting' },
        { label: 'Delivered', desc: `USDT sent to recipient's wallet on ${recipientNetwork}`, state: 'waiting' },
      ];
    }
    return [
      { label: 'Listening for deposit', desc: `Watching ${network} for your ${sendCurrency} transfer`, state: 'active' },
      { label: 'Deposit confirmed', desc: `${amount} ${sendCurrency} received and locked`, state: 'waiting' },
      { label: 'Converting & sending', desc: `Releasing ${recvSymbol}${receiveAmount.toLocaleString()} to ${recipientMethod}`, state: 'waiting' },
      { label: 'Delivered', desc: `${recipientName.split(' ')[0]} received the funds`, state: 'waiting' },
    ];
  }, [isCryptoOut, sendSymbol, amount, sendCurrency, receiveAmount, recipientWalletAddress, recipientNetwork, network, recvSymbol, recipientMethod, recipientName]);

  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [detected, setDetected] = useState(false);

  const pulseAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1500, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  useEffect(() => {
    const t1 = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setDetected(true);
      setSteps((prev) => prev.map((s, i) =>
        i === 0 ? { ...s, state: 'done' }
        : i === 1 ? { ...s, state: 'active' }
        : s
      ));
    }, 4000);

    const t2 = setTimeout(() => {
      setSteps((prev) => prev.map((s, i) =>
        i <= 1 ? { ...s, state: 'done' }
        : i === 2 ? { ...s, state: 'active' }
        : s
      ));
    }, 6000);

    const t3 = setTimeout(() => {
      setSteps((prev) => prev.map((s) => ({ ...s, state: 'done' })));
    }, 8000);

    const t4 = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace('Success', {
        recipientName,
        recipientMethod,
        recipientFlag,
        amount,
        receiveAmount,
        recvCurrency,
        sendCurrency,
        recipientWalletAddress,
        recipientNetwork,
      });
    }, 9500);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [navigation, recipientName, recipientMethod, recipientFlag, amount, receiveAmount, recvCurrency, sendCurrency, recipientWalletAddress, recipientNetwork]);

  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] });

  const getTitle = () => {
    if (isCryptoOut) {
      return detected ? 'Payment confirmed' : 'Processing payment';
    }
    return detected ? 'Deposit received' : 'Waiting for deposit';
  };

  const getSubtitle = () => {
    if (isCryptoOut) {
      return detected
        ? `${sendSymbol}${amount.toLocaleString()} ${sendCurrency} confirmed`
        : `Processing your ${sendSymbol}${amount.toLocaleString()} ${sendCurrency} payment`;
    }
    return detected
      ? `${amount} ${sendCurrency} confirmed on ${network}`
      : `Send ${amount} ${sendCurrency} to complete this transfer`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Top section */}
        <View style={styles.top}>
          {/* Scanning indicator */}
          <View style={styles.scanWrap}>
            {!detected && (
              <Animated.View
                style={[
                  styles.pulseRing,
                  { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
                ]}
              />
            )}
            <View style={[styles.scanIcon, detected && styles.scanIconDone]}>
              {detected ? (
                <Ionicons name="checkmark" size={32} color="#38BDF8" />
              ) : (
                <Ionicons name={isCryptoOut ? 'card-outline' : 'radio-outline'} size={32} color="#38BDF8" />
              )}
            </View>
          </View>

          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={styles.subtitle}>{getSubtitle()}</Text>

          {/* Amount badge */}
          <View style={styles.amountBadge}>
            <Text style={styles.amountBadgeText}>
              {sendSymbol}{amount.toLocaleString()} {sendCurrency} {'\u2192'} {isCryptoOut ? `${formatUSDT(receiveAmount)} USDT` : `${recvSymbol}${receiveAmount.toLocaleString()} ${recvCurrency}`}
            </Text>
          </View>
        </View>

        {/* Steps timeline */}
        <View style={styles.timeline}>
          {steps.map((step, i) => (
            <View key={i} style={styles.timelineStep}>
              {i > 0 && (
                <View
                  style={[
                    styles.connector,
                    step.state !== 'waiting' && styles.connectorActive,
                  ]}
                />
              )}
              <View style={styles.stepRow}>
                <View style={[
                  styles.stepDot,
                  step.state === 'active' && styles.stepDotActive,
                  step.state === 'done' && styles.stepDotDone,
                ]}>
                  {step.state === 'done' && (
                    <Ionicons name="checkmark" size={12} color="#0A0A0C" />
                  )}
                  {step.state === 'active' && (
                    <View style={styles.stepDotPulse} />
                  )}
                </View>
                <View style={styles.stepText}>
                  <Text style={[
                    styles.stepLabel,
                    step.state === 'active' && styles.stepLabelActive,
                    step.state === 'done' && styles.stepLabelDone,
                  ]}>
                    {step.label}
                  </Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom */}
        <View style={styles.bottom}>
          <Text style={styles.bottomNote}>
            {detected
              ? 'Processing your transfer\u2026'
              : isCryptoOut
                ? 'Please wait while we process your payment'
                : 'You can leave the app \u2014 we\u2019ll notify you when we detect your deposit'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  container: { flex: 1, justifyContent: 'space-between' },
  top: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 20 },
  scanWrap: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  pulseRing: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    borderWidth: 1, borderColor: '#38BDF8',
  },
  scanIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(56,189,248,0.08)', borderWidth: 1, borderColor: 'rgba(56,189,248,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  scanIconDone: {
    backgroundColor: 'rgba(56,189,248,0.15)', borderColor: '#38BDF8',
  },
  title: {
    fontFamily: 'Inter_700Bold', fontSize: 22, letterSpacing: -0.3,
    color: '#FFFFFF', marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.6)',
    textAlign: 'center', lineHeight: 20, marginBottom: 16,
  },
  amountBadge: {
    backgroundColor: 'rgba(56,189,248,0.07)', borderWidth: 1, borderColor: 'rgba(56,189,248,0.15)',
    borderRadius: 20, paddingVertical: 8, paddingHorizontal: 18,
  },
  amountBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#38BDF8' },
  timeline: { paddingHorizontal: 32, paddingVertical: 8 },
  timelineStep: { position: 'relative' },
  connector: {
    position: 'absolute', left: 10, top: -8, width: 2, height: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  connectorActive: { backgroundColor: 'rgba(56,189,248,0.4)' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 10 },
  stepDot: {
    width: 22, height: 22, borderRadius: 11, marginTop: 1,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'transparent',
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { borderColor: '#38BDF8', backgroundColor: 'rgba(56,189,248,0.12)' },
  stepDotDone: { borderColor: '#38BDF8', backgroundColor: '#38BDF8' },
  stepDotPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#38BDF8' },
  stepText: { flex: 1 },
  stepLabel: {
    fontFamily: 'Inter_500Medium', fontSize: 14, color: 'rgba(255,255,255,0.3)',
  },
  stepLabelActive: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' },
  stepLabelDone: { color: '#38BDF8', fontFamily: 'Inter_600SemiBold' },
  stepDesc: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  bottom: { paddingHorizontal: 20, paddingBottom: 36 },
  bottomNote: {
    fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.35)',
    textAlign: 'center', lineHeight: 18,
  },
});
