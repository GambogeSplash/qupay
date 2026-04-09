// DepositWaitingScreen — deposit address with QR, copy, detection, processing.
// Ported from /qupay/src/screens/remittance/DepositAddressScreen.tsx.
// Flow: safety interstitial → QR + address → user sends from external wallet →
// detection → processing steps → navigate to Success.
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SendFlowParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<SendFlowParamList, 'DepositWaiting'>;
type Stage = 'address' | 'detecting';

const ADDRESS_TTL = 15 * 60; // 15 min
const DEPOSIT_ADDRESS = '0x4c2A9f8E3d7B6a1C0e5F2d8A9b4C7e6F3a1D5b';

const currencySymbols: Record<string, string> = {
  USDT: '', NGN: '\u20A6', GHS: '\u20B5', KES: 'KSh', INR: '\u20B9', PHP: '\u20B1', PKR: 'Rs',
};

function formatCountdown(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// Fake QR grid (real app would use react-native-qrcode-svg)
const FakeQR: React.FC = () => (
  <View style={styles.qrBox}>
    <View style={styles.qrGrid}>
      {Array.from({ length: 169 }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.qrCell,
            (i * 7 + i * i * 3) % 3 !== 0 && styles.qrCellFilled,
            ((i % 13 < 3 && Math.floor(i / 13) < 3) ||
             (i % 13 > 9 && Math.floor(i / 13) < 3) ||
             (i % 13 < 3 && Math.floor(i / 13) > 9)) && styles.qrCellFilled,
          ]}
        />
      ))}
    </View>
  </View>
);

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

  const recvSymbol = currencySymbols[recvCurrency] || '';
  const firstName = recipientName.split(' ')[0];

  const [stage, setStage] = useState<Stage>('address');
  const [secondsLeft, setSecondsLeft] = useState(ADDRESS_TTL);
  const [copied, setCopied] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  const pulse = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Pulse for waiting dot
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);

  // Spinner for processing
  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true })
    );
    spin.start();
    return () => spin.stop();
  }, [spinAnim]);
  const spinRotate = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // Countdown
  useEffect(() => {
    if (stage !== 'address' || secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, stage]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(DEPOSIT_ADDRESS);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Auto-advance: simulate blockchain detection after 30s on address stage.
  // User can also tap "I sent it" to skip the wait.
  useEffect(() => {
    if (stage !== 'address') return;
    const autoDetect = setTimeout(() => handleMarkSent(), 30000);
    return () => clearTimeout(autoDetect);
  }, [stage]);

  // Radar status messages — progressive updates shown on the radar screen
  const RADAR_STEPS = [
    { label: 'Scanning blockchain...', sub: `Looking for ${amount} ${sendCurrency} on ${network}`, icon: 'search' },
    { label: 'Deposit detected', sub: `${amount} ${sendCurrency} confirmed on ${network}`, icon: 'checkmark-circle' },
    { label: 'Converting to local currency', sub: `${recvSymbol}${receiveAmount.toLocaleString()} ${recvCurrency} being prepared`, icon: 'swap-horizontal' },
    { label: `Sending to ${firstName}`, sub: `Releasing to ${recipientMethod}`, icon: 'send' },
    { label: 'Delivered!', sub: `${firstName} received ${recvSymbol}${receiveAmount.toLocaleString()}`, icon: 'checkmark' },
  ];

  const handleMarkSent = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setStage('detecting');
    // Progressive radar updates — all on one screen
    setTimeout(() => { setProcessingStep(1); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }, 3000);
    setTimeout(() => { setProcessingStep(2); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }, 5500);
    setTimeout(() => { setProcessingStep(3); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }, 8000);
    setTimeout(() => {
      setProcessingStep(4);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        navigation.navigate('Success', {
          recipientName, recipientMethod, amount, receiveAmount, recvCurrency, sendCurrency,
        });
      }, 1500);
    }, 10000);
  };

  // ─── Radar stage — unified detection + processing ───
  if (stage === 'detecting') {
    const currentStep = RADAR_STEPS[processingStep] || RADAR_STEPS[0];
    const isDone = processingStep >= 4;
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]} edges={['top']}>
        {/* Radar pulse rings */}
        <View style={styles.radarWrap}>
          <Animated.View style={[styles.radarRing3, { opacity: pulse, borderColor: isDone ? 'rgba(74,222,128,0.15)' : 'rgba(56,189,248,0.1)' }]} />
          <Animated.View style={[styles.radarRing2, { opacity: pulse, borderColor: isDone ? 'rgba(74,222,128,0.25)' : 'rgba(56,189,248,0.2)', transform: [{ scale: pulse.interpolate({ inputRange: [0.4, 1], outputRange: [1.1, 1] }) }] }]} />
          <View style={[styles.radarCenter, isDone && { backgroundColor: 'rgba(74,222,128,0.12)' }]}>
            <Ionicons name={currentStep.icon as any} size={32} color={isDone ? '#4ADE80' : '#38BDF8'} />
          </View>
        </View>

        {/* Status text — updates progressively */}
        <Text style={[styles.detectingTitle, isDone && { color: '#4ADE80' }]}>{currentStep.label}</Text>
        <Text style={styles.detectingSub}>{currentStep.sub}</Text>

        {/* Step indicators */}
        <View style={styles.radarDots}>
          {RADAR_STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.radarDot,
                i <= processingStep && styles.radarDotActive,
                i <= processingStep && processingStep >= 4 && styles.radarDotDone,
              ]}
            />
          ))}
        </View>

        {/* Transfer summary */}
        <View style={styles.radarSummary}>
          <Text style={styles.radarSummaryText}>
            {amount} {sendCurrency} {'\u2192'} {recvSymbol}{receiveAmount.toLocaleString()} {recvCurrency}
          </Text>
          <Text style={styles.radarSummaryRecipient}>to {recipientName} via {recipientMethod}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Address stage ───
  const expired = secondsLeft <= 0;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send {sendCurrency}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Compact caution banner */}
        <View style={styles.cautionBanner}>
          <Ionicons name="alert-circle" size={16} color="#FFD60A" />
          <Text style={styles.cautionText}>
            Only send <Text style={{ fontFamily: 'Inter_700Bold', color: '#FFFFFF' }}>{amount} {sendCurrency}</Text> on <Text style={{ fontFamily: 'Inter_700Bold', color: '#FFFFFF' }}>{network}</Text>. Wrong network or token = lost funds.
          </Text>
        </View>

        {/* QR card — consistent with app card style */}
        <View style={styles.qrCard}>
          <Text style={styles.qrCardTitle}>Scan to deposit</Text>
          <Text style={styles.qrCardSub}>
            Send exactly {amount} {sendCurrency} on {network}
          </Text>
          <View style={styles.qrCenter}>
            <FakeQR />
          </View>
          {/* Network badge */}
          <View style={styles.networkPill}>
            <Ionicons name="globe" size={13} color="#FFFFFF" />
            <Text style={styles.networkText}>{network}</Text>
          </View>
        </View>

        {/* Address card */}
        <View style={styles.addressCard}>
          <Text style={styles.addressLabel}>Deposit address</Text>
          <TouchableOpacity style={styles.addressRow} onPress={handleCopy} activeOpacity={0.7}>
            <Text style={styles.addressText} numberOfLines={1}>{DEPOSIT_ADDRESS}</Text>
            <View style={styles.copyBadge}>
              <Ionicons name={copied ? 'checkmark-circle' : 'copy'} size={16} color={copied ? '#4ADE80' : '#38BDF8'} />
              <Text style={[styles.copyText, copied && { color: '#4ADE80' }]}>{copied ? 'Copied' : 'Copy'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Status + countdown */}
        <View style={styles.statusCard}>
          <Animated.View style={[styles.statusDot, { opacity: pulse }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>{expired ? 'Address expired' : 'Waiting for deposit...'}</Text>
            <Text style={styles.statusSub}>
              {expired ? 'Go back and generate a fresh address.' : `Open your wallet and send ${amount} ${sendCurrency}`}
            </Text>
          </View>
          {!expired && (
            <View style={styles.countdownPill}>
              <Ionicons name="time" size={11} color="#38BDF8" />
              <Text style={styles.countdownText}>{formatCountdown(secondsLeft)}</Text>
            </View>
          )}
        </View>

        {/* I sent it CTA */}
        {!expired && (
          <TouchableOpacity style={styles.sentCta} onPress={handleMarkSent} activeOpacity={0.85}>
            <Ionicons name="checkmark-circle" size={18} color="#0A0A0C" />
            <Text style={styles.sentCtaText}>I've sent {amount} {sendCurrency}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
  },
  iconBtn: { padding: 4 },
  headerTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 17, color: '#FFFFFF' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },

  // Compact caution banner
  cautionBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,214,10,0.08)', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    marginHorizontal: 20, marginBottom: 16, alignSelf: 'stretch',
  },
  cautionText: {
    flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12,
    color: 'rgba(255,214,10,0.8)', lineHeight: 17,
  },

  // Radar detecting
  radarWrap: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  radarRing3: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    borderWidth: 1, borderColor: 'rgba(56,189,248,0.1)',
  },
  radarRing2: {
    position: 'absolute', width: 110, height: 110, borderRadius: 55,
    borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)',
  },
  radarCenter: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(56,189,248,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  detectingTitle: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#FFFFFF', marginBottom: 8, textAlign: 'center' },
  detectingSub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.58)', textAlign: 'center', paddingHorizontal: 40 },
  radarDots: { flexDirection: 'row', gap: 6, marginTop: 24 },
  radarDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.12)' },
  radarDotActive: { backgroundColor: '#38BDF8' },
  radarDotDone: { backgroundColor: '#4ADE80' },
  radarSummary: { alignItems: 'center', marginTop: 32, backgroundColor: '#17171A', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 16 },
  radarSummaryText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#FFFFFF', fontVariant: ['tabular-nums'] },
  radarSummaryRecipient: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.58)', marginTop: 4 },

  // Address stage — consistent card layout
  qrCard: {
    backgroundColor: '#17171A', borderRadius: 16,
    marginHorizontal: 20, padding: 20, alignItems: 'center', marginBottom: 12,
  },
  qrCardTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#FFFFFF' },
  qrCardSub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.58)', marginTop: 4, marginBottom: 16 },
  qrCenter: { marginBottom: 16 },
  networkPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#8247E5', borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  networkText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#FFFFFF' },
  qrBox: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  qrGrid: { flexDirection: 'row', flexWrap: 'wrap', width: 195, height: 195 },
  qrCell: { width: 15, height: 15 },
  qrCellFilled: { backgroundColor: '#0A0A0C' },
  addressCard: {
    backgroundColor: '#17171A', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14,
    marginHorizontal: 20, marginBottom: 12,
  },
  addressLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.58)', marginBottom: 8 },
  addressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  addressText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 12, color: '#FFFFFF', fontVariant: ['tabular-nums'] },
  copyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(56,189,248,0.12)', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  copyText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#38BDF8' },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#17171A', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14,
    marginHorizontal: 20, marginBottom: 12,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#38BDF8' },
  statusTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFFFFF' },
  statusSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.58)', marginTop: 2, lineHeight: 17 },
  countdownPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(56,189,248,0.12)', borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  countdownText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#38BDF8', fontVariant: ['tabular-nums'] },
  sentCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#38BDF8', borderRadius: 999, paddingVertical: 18,
    marginHorizontal: 20,
  },
  sentCtaText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#0A0A0C' },

});
