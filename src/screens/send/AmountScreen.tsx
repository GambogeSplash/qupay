// AmountScreen — custom numpad keeps both amounts visible simultaneously.
// Inline fee, balance validation, quick-amount chips, MAX button.
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import { Numpad, BottomSheet, CryptoIcon } from '../../components';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SendFlowParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<SendFlowParamList, 'Amount'>;

const currencies = [
  { code: 'USDT', name: 'Tether (Polygon)', flag: '', color: '#26A17B', symbol: '' },
  { code: 'NGN', name: 'Nigerian Naira', flag: '\u{1F1F3}\u{1F1EC}', color: '#008751', symbol: '\u20A6' },
  { code: 'GHS', name: 'Ghanaian Cedi', flag: '\u{1F1EC}\u{1F1ED}', color: '#CE1126', symbol: '\u20B5' },
  { code: 'KES', name: 'Kenyan Shilling', flag: '\u{1F1F0}\u{1F1EA}', color: '#006600', symbol: 'KSh' },
  { code: 'INR', name: 'Indian Rupee', flag: '\u{1F1EE}\u{1F1F3}', color: '#FF9933', symbol: '\u20B9' },
  { code: 'PHP', name: 'Philippine Peso', flag: '\u{1F1F5}\u{1F1ED}', color: '#0038A8', symbol: '\u20B1' },
  { code: 'PKR', name: 'Pakistani Rupee', flag: '\u{1F1F5}\u{1F1F0}', color: '#01411C', symbol: 'Rs' },
];

const usdtRates: Record<string, number> = {
  USDT: 1, NGN: 1645, GHS: 15.16, KES: 128.7, INR: 83.5, PHP: 56.78, PKR: 278.5,
};

const WALLET_BALANCE = 450; // Mock USDT balance
const FEE_PCT = 0.008; // 0.8%
const QUICK_AMOUNTS = [25, 50, 100, 250];

export const AmountScreen: React.FC<Props> = ({ navigation }) => {
  const [sendCurrency] = useState(currencies[0]); // USDT — the wallet currency
  const [receiveCurrency, setReceiveCurrency] = useState(currencies[1]); // NGN default
  const [showRecvPicker, setShowRecvPicker] = useState(false);
  const [amountStr, setAmountStr] = useState('');

  const numAmount = parseFloat(amountStr) || 0;
  const rate = usdtRates[receiveCurrency.code] || 1;
  const receiveAmount = Math.round(numAmount * rate);
  const fee = Math.round(numAmount * FEE_PCT * 100) / 100;
  const totalDebit = numAmount + fee;
  const overBalance = totalDebit > WALLET_BALANCE;
  const canContinue = numAmount > 0 && !overBalance;

  const handleKey = useCallback((key: string) => {
    if (key === 'del') {
      setAmountStr((prev) => prev.slice(0, -1));
    } else if (key === '.') {
      if (!amountStr.includes('.')) setAmountStr((prev) => prev + '.');
    } else {
      // Limit to 2 decimal places
      const parts = amountStr.split('.');
      if (parts[1] && parts[1].length >= 2) return;
      // Limit total length
      if (amountStr.length >= 8) return;
      setAmountStr((prev) => prev + key);
    }
  }, [amountStr]);

  const setQuick = (v: number) => setAmountStr(String(v));
  const setMax = () => setAmountStr(String(Math.floor(WALLET_BALANCE / (1 + FEE_PCT))));

  const handleContinue = () => {
    navigation.navigate('Recipient', {
      amount: numAmount,
      sendCurrency: sendCurrency.code,
      receiveCurrency: receiveCurrency.code,
      receiveAmount,
    });
  };

  // Fiat-only receive currencies (exclude USDT from receive picker)
  const recvCurrencies = currencies.filter((c) => c.code !== 'USDT');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* No back button — tab handles navigation */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Send</Text>
      </View>

      {/* Amount display area — both amounts always visible above numpad */}
      <View style={styles.displayArea}>
        {/* You send */}
        <View style={styles.sendSection}>
          <Text style={styles.label}>You send</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.amountText, !amountStr && styles.amountPlaceholder]}>
              {amountStr || '0'}
            </Text>
            <View style={styles.currBadge}>
              <CryptoIcon token="USDT" network="Polygon" size={24} ringColor="#1F1F23" />
              <Text style={styles.currCode}>USDT</Text>
            </View>
          </View>
          {/* Balance + MAX */}
          <View style={styles.balanceRow}>
            <Text style={[styles.balanceText, overBalance && styles.balanceError]}>
              Balance: {WALLET_BALANCE} USDT
            </Text>
            <TouchableOpacity onPress={setMax} activeOpacity={0.7}>
              <Text style={styles.maxBtn}>MAX</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rate divider */}
        <View style={styles.rateDivider}>
          <View style={styles.rateLine} />
          <View style={styles.ratePill}>
            <Ionicons name="swap-horizontal" size={12} color="#38BDF8" />
            <Text style={styles.rateText}>
              1 USDT = {receiveCurrency.symbol}{rate.toLocaleString()} {receiveCurrency.code}
            </Text>
          </View>
          <View style={styles.rateLine} />
        </View>

        {/* They receive */}
        <View style={styles.recvSection}>
          <Text style={styles.label}>They receive</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.recvText, !numAmount && styles.amountPlaceholder]}>
              {numAmount > 0 ? `${receiveCurrency.symbol}${receiveAmount.toLocaleString()}` : '0'}
            </Text>
            <TouchableOpacity style={styles.recvCurrBadge} onPress={() => setShowRecvPicker(true)} activeOpacity={0.7}>
              <Text style={styles.currFlag}>{receiveCurrency.flag}</Text>
              <Text style={styles.currCode}>{receiveCurrency.code}</Text>
              <Ionicons name="chevron-down" size={12} color="rgba(255,255,255,0.42)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Inline fee */}
        {numAmount > 0 && (
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Fee</Text>
            <Text style={styles.feeValue}>{fee} USDT ({(FEE_PCT * 100).toFixed(1)}%)</Text>
          </View>
        )}

        {/* Validation error */}
        {overBalance && (
          <View style={styles.errorPill}>
            <Ionicons name="alert-circle" size={14} color="#EF4444" />
            <Text style={styles.errorText}>Exceeds balance — max send is {Math.floor(WALLET_BALANCE / (1 + FEE_PCT))} USDT</Text>
          </View>
        )}

        {/* Quick amount chips — shown when amount is empty */}
        {!amountStr && (
          <View style={styles.quickRow}>
            {QUICK_AMOUNTS.map((v) => (
              <TouchableOpacity key={v} style={styles.quickChip} onPress={() => setQuick(v)} activeOpacity={0.7}>
                <Text style={styles.quickText}>${v}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Numpad + CTA pinned to bottom */}
      <View style={styles.bottom}>
        <Numpad onKey={handleKey} />
        <TouchableOpacity
          style={[styles.cta, !canContinue && styles.ctaDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
          activeOpacity={0.85}
        >
          <Text style={[styles.ctaText, !canContinue && styles.ctaTextDisabled]}>Continue</Text>
        </TouchableOpacity>
      </View>

      {/* Receive currency picker */}
      <BottomSheet visible={showRecvPicker} onClose={() => setShowRecvPicker(false)} title="Receive currency">
        {recvCurrencies.map((c) => (
          <TouchableOpacity
            key={c.code}
            style={[styles.cpItem, receiveCurrency.code === c.code && styles.cpItemSel]}
            onPress={() => { setReceiveCurrency(c); setShowRecvPicker(false); }}
            activeOpacity={0.7}
          >
            <View style={[styles.cpIconWrap, { backgroundColor: c.color + '20' }]}>
              <Text style={{ fontSize: 18 }}>{c.flag}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cpName}>{c.code}</Text>
              <Text style={styles.cpSub}>{c.name} · {c.symbol}{usdtRates[c.code]?.toLocaleString()}/USDT</Text>
            </View>
            {receiveCurrency.code === c.code && <Ionicons name="checkmark-circle" size={20} color="#38BDF8" />}
          </TouchableOpacity>
        ))}
        <View style={{ height: 40 }} />
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },

  // Header
  headerRow: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#FFFFFF' },

  // Display area — grows to fill space above numpad
  displayArea: { flex: 1, paddingHorizontal: 20, paddingTop: 8, justifyContent: 'center' },

  label: {
    fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 0.8,
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.58)', marginBottom: 6,
  },
  sendSection: { marginBottom: 4 },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amountText: {
    fontFamily: 'Inter_700Bold', fontSize: 42, color: '#FFFFFF',
    letterSpacing: -1, fontVariant: ['tabular-nums'],
  },
  amountPlaceholder: { color: 'rgba(255,255,255,0.2)' },
  currBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#1F1F23', borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  currFlag: { fontSize: 16 },
  currCode: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#FFFFFF' },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  balanceText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.42)', fontVariant: ['tabular-nums'] },
  balanceError: { color: '#EF4444' },
  maxBtn: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#38BDF8', letterSpacing: 0.5 },

  // Rate divider
  rateDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 12 },
  rateLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  ratePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#17171A', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  rateText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#38BDF8', fontVariant: ['tabular-nums'] },

  // Receive section
  recvSection: { marginBottom: 8 },
  recvText: {
    fontFamily: 'Inter_700Bold', fontSize: 36, color: '#38BDF8',
    letterSpacing: -0.8, fontVariant: ['tabular-nums'],
  },
  recvCurrBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#1F1F23', borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 8,
  },

  // Fee
  feeRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8,
  },
  feeLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.42)' },
  feeValue: { fontFamily: 'Inter_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.58)', fontVariant: ['tabular-nums'] },

  // Error
  errorPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 8, marginTop: 4,
  },
  errorText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#EF4444', flex: 1 },

  // Quick amounts
  quickRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  quickChip: {
    backgroundColor: '#17171A', borderRadius: 999,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  quickText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#FFFFFF' },

  // Bottom — numpad + CTA
  bottom: { paddingHorizontal: 20, paddingBottom: 12 },
  cta: {
    backgroundColor: '#38BDF8', borderRadius: 999,
    paddingVertical: 18, alignItems: 'center', justifyContent: 'center',
  },
  ctaDisabled: { backgroundColor: '#1F1F23' },
  ctaText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#0A0A0C' },
  ctaTextDisabled: { color: 'rgba(255,255,255,0.25)' },

  // Currency picker
  cpItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  cpItemSel: { backgroundColor: 'rgba(56,189,248,0.08)' },
  cpIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  cpName: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFFFFF' },
  cpSub: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.58)', marginTop: 1 },
});
