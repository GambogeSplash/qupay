// ConfirmScreen — clean review + slide-to-send with rate-lock countdown.
// Two paths: fiat-out (USDT→NGN) shows deposit address, crypto-out shows recipient wallet.
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Animated, PanResponder, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { ScreenHeader, Avatar, CryptoIcon, BankLogo } from '../../components';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SendFlowParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<SendFlowParamList, 'Confirm'>;

const RATE_LOCK_SECONDS = 30;
const SLIDER_WIDTH = Dimensions.get('window').width - 40; // 20px margins
const THUMB_SIZE = 56;
const SLIDE_THRESHOLD = 0.85;

const currencySymbols: Record<string, string> = {
  USDT: '', NGN: '\u20A6', GHS: '\u20B5', KES: 'KSh', INR: '\u20B9', PHP: '\u20B1', MXN: '$', PKR: 'Rs', ZAR: 'R',
};

const DEPOSIT_ADDRESS = '0x4c2A9f8E3d7B6a1C0e5F2d8A9b4C7e6F3a1D5b';

const Row: React.FC<{ label: string; value: string; valueColor?: string }> = ({ label, value, valueColor }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
  </View>
);
const Divider = () => <View style={styles.divider} />;

export const ConfirmScreen: React.FC<Props> = ({ navigation, route }) => {
  const {
    amount, sendCurrency, receiveCurrency, receiveAmount,
    recipientName, recipientInitials, recipientColors,
    recipientMethod, recipientFlag,
    recipientWalletAddress, recipientNetwork,
  } = route.params;

  const isCryptoOut = receiveCurrency === 'USDT';
  const recvSymbol = currencySymbols[receiveCurrency] || '';
  const fee = isCryptoOut ? Math.round(amount * 0.01) : Math.round(receiveAmount * 0.01);
  const feePct = isCryptoOut ? ((fee / amount) * 100).toFixed(1) : ((fee / receiveAmount) * 100).toFixed(1);
  const firstName = recipientName?.split(' ')[0] || 'Recipient';
  const network = recipientNetwork || 'Polygon';

  // Rate-lock countdown
  const [countdown, setCountdown] = useState(RATE_LOCK_SECONDS);
  const rateExpired = countdown <= 0;
  const rateUrgent = countdown <= 5 && countdown > 0;
  // Ref so PanResponder closure always reads current value
  const rateExpiredRef = useRef(false);
  rateExpiredRef.current = rateExpired;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const refreshRate = () => setCountdown(RATE_LOCK_SECONDS);

  // Clipboard
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    const addr = isCryptoOut ? recipientWalletAddress : DEPOSIT_ADDRESS;
    if (addr) {
      await Clipboard.setStringAsync(addr);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [isCryptoOut, recipientWalletAddress]);

  // Slide-to-send
  const slideX = useRef(new Animated.Value(0)).current;
  const [sliding, setSliding] = useState(false);
  const maxSlide = SLIDER_WIDTH - THUMB_SIZE;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !rateExpiredRef.current,
      onMoveShouldSetPanResponder: () => !rateExpiredRef.current,
      onPanResponderGrant: () => {
        setSliding(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gs) => {
        const clamped = Math.max(0, Math.min(gs.dx, maxSlide));
        slideX.setValue(clamped);
      },
      onPanResponderRelease: (_, gs) => {
        const pct = gs.dx / maxSlide;
        if (pct >= SLIDE_THRESHOLD) {
          // Send!
          Animated.timing(slideX, { toValue: maxSlide, duration: 100, useNativeDriver: false }).start(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            navigation.navigate('DepositWaiting', {
              recipientName,
              recipientMethod,
              recipientFlag,
              amount,
              receiveAmount,
              sendCurrency,
              recvCurrency: receiveCurrency,
              walletAddress: DEPOSIT_ADDRESS,
              network,
              recipientWalletAddress,
              recipientNetwork,
            });
          });
        } else {
          // Spring back
          Animated.spring(slideX, { toValue: 0, tension: 80, friction: 10, useNativeDriver: false }).start();
        }
        setSliding(false);
      },
    })
  ).current;

  // Slider fill width for the progress track
  const fillWidth = slideX.interpolate({
    inputRange: [0, maxSlide],
    outputRange: [THUMB_SIZE, SLIDER_WIDTH],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Confirm" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Recipient card */}
        <View style={styles.recipCard}>
          <Avatar seed={recipientName} initials={recipientInitials} size={48} bankBadge={recipientMethod} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.recipName}>{recipientName}</Text>
            <Text style={styles.recipSub}>
              {isCryptoOut
                ? `${(recipientWalletAddress || '').slice(0, 8)}\u2026${(recipientWalletAddress || '').slice(-6)} · ${network}`
                : `${recipientMethod} · ${recipientFlag}`}
            </Text>
          </View>
        </View>

        {/* Amount summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>You send</Text>
            <View style={styles.summaryValueRow}>
              <CryptoIcon token="USDT" network="Polygon" size={20} ringColor="#17171A" />
              <Text style={styles.summaryValue}>{amount.toLocaleString()} {sendCurrency}</Text>
            </View>
          </View>
          <Divider />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>They receive</Text>
            <Text style={[styles.summaryValue, { color: '#38BDF8' }]}>
              {isCryptoOut
                ? `${receiveAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT`
                : `${recvSymbol}${receiveAmount.toLocaleString()}`}
            </Text>
          </View>
        </View>

        {/* Details card */}
        <View style={styles.detailsCard}>
          <Row label="Fee" value={`${isCryptoOut ? '' : recvSymbol}${fee.toLocaleString()} (${feePct}%)`} />
          <Divider />
          <Row label="Delivery" value={`~2 min via ${isCryptoOut ? network : recipientMethod}`} valueColor="#38BDF8" />
          <Divider />
          <Row label="Network" value={`Polygon (PoS)`} />
          {!isCryptoOut && (
            <>
              <Divider />
              <Row label="Pay from" value="Qupay Wallet" />
            </>
          )}
        </View>

        {/* Rate-lock countdown */}
        <TouchableOpacity
          style={[
            styles.ratePill,
            rateExpired ? styles.ratePillExpired : rateUrgent ? styles.ratePillUrgent : null,
          ]}
          onPress={rateExpired ? refreshRate : undefined}
          activeOpacity={rateExpired ? 0.7 : 1}
        >
          <View style={[styles.rateDot, { backgroundColor: rateExpired ? '#EF4444' : rateUrgent ? '#FFD60A' : '#4ADE80' }]} />
          <Text style={[styles.rateText, rateExpired ? styles.rateTextExpired : rateUrgent ? styles.rateTextUrgent : null]}>
            {rateExpired ? 'Rate expired · Tap to refresh' : `Rate locked · ${countdown}s`}
          </Text>
        </TouchableOpacity>

        {/* Deposit address (fiat-out only) */}
        {!isCryptoOut && (
          <View style={styles.depositCard}>
            <Text style={styles.depositLabel}>Deposit {sendCurrency} to this address</Text>
            <TouchableOpacity style={styles.addressBox} onPress={handleCopy} activeOpacity={0.7}>
              <Text style={styles.addressMono} numberOfLines={1}>
                {DEPOSIT_ADDRESS.slice(0, 14)}...{DEPOSIT_ADDRESS.slice(-8)}
              </Text>
              <Ionicons name={copied ? 'checkmark-circle' : 'copy'} size={18} color={copied ? '#4ADE80' : '#38BDF8'} />
            </TouchableOpacity>
            <View style={styles.warnRow}>
              <Ionicons name="alert-circle" size={13} color="#FFD60A" />
              <Text style={styles.warnText}>Only send {sendCurrency} on Polygon. Other tokens or networks may be lost.</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Slide-to-send — pinned to bottom */}
      <View style={styles.sliderWrap}>
        <View style={styles.sliderTrack}>
          {/* Fill */}
          <Animated.View style={[styles.sliderFill, { width: fillWidth }]} />
          {/* Thumb */}
          <Animated.View
            style={[styles.sliderThumb, { transform: [{ translateX: slideX }] }]}
            {...panResponder.panHandlers}
          >
            <Ionicons name="arrow-forward" size={22} color="#0A0A0C" />
          </Animated.View>
          {/* Label */}
          <Text style={styles.sliderLabel}>
            {rateExpired ? 'Refresh rate first' : `Slide to send ${recvSymbol}${receiveAmount.toLocaleString()}`}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },

  // Recipient
  recipCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#17171A', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14,
    marginHorizontal: 20, marginBottom: 12,
  },
  recipName: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#FFFFFF' },
  recipSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.58)', marginTop: 2 },

  // Summary
  summaryCard: {
    backgroundColor: '#17171A', borderRadius: 16,
    paddingHorizontal: 16, marginHorizontal: 20, marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14,
  },
  summaryLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.58)' },
  summaryValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryValue: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#FFFFFF', fontVariant: ['tabular-nums'] },

  // Details
  detailsCard: {
    backgroundColor: '#17171A', borderRadius: 16,
    paddingHorizontal: 16, marginHorizontal: 20, marginBottom: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  rowLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.58)' },
  rowValue: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#FFFFFF', fontVariant: ['tabular-nums'] },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },

  // Rate lock
  ratePill: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: 'rgba(74,222,128,0.1)', borderRadius: 999,
    paddingVertical: 10, marginHorizontal: 20, marginBottom: 12,
  },
  ratePillUrgent: { backgroundColor: 'rgba(255,214,10,0.1)' },
  ratePillExpired: { backgroundColor: 'rgba(239,68,68,0.1)' },
  rateDot: { width: 6, height: 6, borderRadius: 3 },
  rateText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#4ADE80' },
  rateTextUrgent: { color: '#FFD60A' },
  rateTextExpired: { color: '#EF4444' },

  // Deposit address
  depositCard: {
    backgroundColor: '#17171A', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14,
    marginHorizontal: 20, marginBottom: 12,
  },
  depositLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#FFFFFF', marginBottom: 10 },
  addressBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#0A0A0C', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10,
  },
  addressMono: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.7)', fontVariant: ['tabular-nums'] },
  warnRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  warnText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,214,10,0.7)', lineHeight: 16 },

  // Slide-to-send
  sliderWrap: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8 },
  sliderTrack: {
    height: THUMB_SIZE, borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#17171A', overflow: 'hidden',
    justifyContent: 'center',
  },
  sliderFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(56,189,248,0.15)', borderRadius: THUMB_SIZE / 2,
  },
  sliderThumb: {
    position: 'absolute', left: 4, top: 4,
    width: THUMB_SIZE - 8, height: THUMB_SIZE - 8,
    borderRadius: (THUMB_SIZE - 8) / 2,
    backgroundColor: '#38BDF8',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 2,
  },
  sliderLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 14,
    color: 'rgba(255,255,255,0.42)', textAlign: 'center',
    marginLeft: THUMB_SIZE,
  },
});
