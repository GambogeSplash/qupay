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
type Stage = 'address' | 'processing';

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

  // Demo: user taps "I sent it" or auto-detected → processing → success
  const handleMarkSent = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setStage('processing');
    // Simulate 3-step processing
    setTimeout(() => { setProcessingStep(1); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }, 2000);
    setTimeout(() => { setProcessingStep(2); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }, 4000);
    setTimeout(() => {
      setProcessingStep(3);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate('Success', {
        recipientName, recipientMethod, amount, receiveAmount, recvCurrency, sendCurrency,
      });
    }, 6000);
  };

  // ─── Processing stage ───
  if (stage === 'processing') {
    const steps = [
      { label: 'Deposit detected', desc: `${amount} ${sendCurrency} received on ${network}` },
      { label: 'Converting', desc: `Converting to ${recvSymbol}${receiveAmount.toLocaleString()} ${recvCurrency}` },
      { label: 'Sending to recipient', desc: `Releasing to ${recipientMethod} for ${firstName}` },
    ];
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center' }]} edges={['top']}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={styles.processingTitle}>Processing...</Text>
          <Text style={styles.processingSub}>{amount} {sendCurrency} {'\u2192'} {recvSymbol}{receiveAmount.toLocaleString()}</Text>
        </View>
        <View style={styles.stepsCard}>
          {steps.map((s, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepIconCol}>
                {i < processingStep ? (
                  <View style={styles.stepDone}><Ionicons name="checkmark" size={14} color="#0A0A0C" /></View>
                ) : i === processingStep ? (
                  <Animated.View style={[styles.stepActive, { transform: [{ rotate: spinRotate }] }]} />
                ) : (
                  <View style={styles.stepWaiting} />
                )}
                {i < steps.length - 1 && <View style={[styles.connector, i < processingStep && styles.connectorDone]} />}
              </View>
              <View style={styles.stepTextCol}>
                <Text style={[styles.stepLabel, i < processingStep && styles.stepLabelDone, i > processingStep && styles.stepLabelWait]}>{s.label}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            </View>
          ))}
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

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24, alignItems: 'center' }}>
        {/* Compact caution banner */}
        <View style={styles.cautionBanner}>
          <Ionicons name="alert-circle" size={16} color="#FFD60A" />
          <Text style={styles.cautionText}>
            Only send <Text style={{ fontFamily: 'Inter_700Bold', color: '#FFFFFF' }}>{amount} {sendCurrency}</Text> on <Text style={{ fontFamily: 'Inter_700Bold', color: '#FFFFFF' }}>{network}</Text>. Wrong network or token = lost funds.
          </Text>
        </View>

        {/* Instruction */}
        <Text style={styles.instrTitle}>
          Send <Text style={{ color: '#38BDF8' }}>{amount} {sendCurrency}</Text>
        </Text>
        <Text style={styles.instrSub}>to the address below</Text>

        {/* Network pill */}
        <View style={styles.networkPill}>
          <Ionicons name="globe" size={14} color="#FFFFFF" />
          <Text style={styles.networkText}>{network}</Text>
        </View>

        {/* QR code */}
        <FakeQR />

        {/* Address with copy */}
        <View style={styles.addressCard}>
          <Text style={styles.addressLabel}>Deposit address</Text>
          <TouchableOpacity style={styles.addressRow} onPress={handleCopy} activeOpacity={0.7}>
            <Text style={styles.addressText} numberOfLines={1}>{DEPOSIT_ADDRESS}</Text>
            <Ionicons name={copied ? 'checkmark-circle' : 'copy'} size={18} color={copied ? '#4ADE80' : '#38BDF8'} />
          </TouchableOpacity>
        </View>

        {/* Status + countdown */}
        <View style={styles.statusCard}>
          <Animated.View style={[styles.statusDot, { opacity: pulse }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>{expired ? 'Address expired' : 'Waiting for deposit...'}</Text>
            <Text style={styles.statusSub}>
              {expired ? 'Go back and generate a fresh address.' : `Send ${amount} ${sendCurrency} on ${network}`}
            </Text>
          </View>
          {!expired && (
            <View style={styles.countdownPill}>
              <Ionicons name="time" size={11} color="#38BDF8" />
              <Text style={styles.countdownText}>{formatCountdown(secondsLeft)}</Text>
            </View>
          )}
        </View>

        {/* Demo helper */}
        {!expired && (
          <TouchableOpacity style={styles.demoBtn} onPress={handleMarkSent} activeOpacity={0.7}>
            <Ionicons name="flash" size={14} color="rgba(255,255,255,0.42)" />
            <Text style={styles.demoBtnText}>I sent the deposit (demo)</Text>
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

  // Address stage
  instrTitle: { fontFamily: 'Inter_700Bold', fontSize: 26, color: '#FFFFFF', marginTop: 8, letterSpacing: -0.3 },
  instrSub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.58)', marginTop: 4 },
  networkPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#8247E5', borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 8, marginTop: 16,
  },
  networkText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#FFFFFF' },
  qrBox: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
    marginTop: 20, alignItems: 'center', justifyContent: 'center',
  },
  qrGrid: { flexDirection: 'row', flexWrap: 'wrap', width: 195, height: 195 },
  qrCell: { width: 15, height: 15 },
  qrCellFilled: { backgroundColor: '#0A0A0C' },
  addressCard: {
    backgroundColor: '#17171A', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14,
    marginHorizontal: 20, marginTop: 16, width: '100%',
    paddingLeft: 36, paddingRight: 36,
  },
  addressLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.58)', marginBottom: 6 },
  addressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  addressText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 12, color: '#FFFFFF', fontVariant: ['tabular-nums'] },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#17171A', borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 14,
    marginHorizontal: 20, marginTop: 12, width: '100%',
    paddingLeft: 36, paddingRight: 36,
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
  demoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 14, marginTop: 8,
  },
  demoBtnText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.42)' },

  // Processing stage
  processingTitle: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#FFFFFF', letterSpacing: -0.3 },
  processingSub: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.58)', marginTop: 6, fontVariant: ['tabular-nums'] },
  stepsCard: { backgroundColor: '#17171A', borderRadius: 16, marginHorizontal: 20, padding: 20 },
  stepRow: { flexDirection: 'row', minHeight: 64 },
  stepIconCol: { width: 28, alignItems: 'center' },
  stepDone: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#4ADE80', alignItems: 'center', justifyContent: 'center' },
  stepActive: { width: 24, height: 24, borderRadius: 12, borderWidth: 2.5, borderColor: '#38BDF8', borderTopColor: 'transparent' },
  stepWaiting: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.12)' },
  connector: { width: 2, flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 4 },
  connectorDone: { backgroundColor: '#4ADE80' },
  stepTextCol: { flex: 1, marginLeft: 12, paddingBottom: 16 },
  stepLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFFFFF' },
  stepLabelDone: { color: '#4ADE80' },
  stepLabelWait: { color: 'rgba(255,255,255,0.42)' },
  stepDesc: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.42)', marginTop: 2, lineHeight: 18 },
});
