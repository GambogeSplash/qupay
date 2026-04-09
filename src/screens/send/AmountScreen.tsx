// AmountScreen — ported from /qupay/src/screens/remittance/SendAmountScreen.tsx
// Swap-style layout: "You send" card + arrow + "They receive" card.
// Custom 4x3 numpad always visible, both amounts update live.
// Recipient locked from upstream (PickRecipient). Includes: inline fee,
// balance + MAX, quick chips, KYC/balance validation pills.
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import { Avatar, CryptoIcon, BottomSheet } from '../../components';
import { Recipient, getCorridor, formatMoney } from '../../data/remittance';
import { getRate, fetchLiveRates } from '../../data/rates';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SendFlowParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<SendFlowParamList, 'Amount'>;

interface StablecoinOption {
  token: string;
  network: string;
  networkShort: string;
  balance: number;
  color: string;
}

const STABLECOINS: StablecoinOption[] = [
  { token: 'USDT', network: 'Polygon', networkShort: 'POL', balance: 450, color: '#8247E5' },
  { token: 'USDT', network: 'Ethereum', networkShort: 'ETH', balance: 0, color: '#627EEA' },
  { token: 'USDC', network: 'Solana', networkShort: 'SOL', balance: 125, color: '#9945FF' },
  { token: 'USDC', network: 'Base', networkShort: 'BASE', balance: 0, color: '#0052FF' },
  { token: 'USDT', network: 'BSC', networkShort: 'BNB', balance: 0, color: '#F0B90B' },
];

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '\u232B'],
];

const FEE_OVERRIDE = 1.50; // Fixed USD fee per corridor

export const AmountScreen: React.FC<Props> = ({ navigation, route }) => {
  const recipient: Recipient | undefined = (route.params as any)?.recipient;
  const corridor = useMemo(
    () => (recipient ? getCorridor(recipient.corridorId) : getCorridor('sg-ng')),
    [recipient],
  );

  // Fetch live rates on mount (non-blocking, falls back to hardcoded)
  const [liveRate, setLiveRate] = useState(corridor.rate);
  useEffect(() => {
    fetchLiveRates().then((rates) => {
      const r = rates[corridor.toCurrency];
      if (r) setLiveRate(r);
    });
  }, [corridor.toCurrency]);

  // Stablecoin + blockchain selection
  const [selectedCoin, setSelectedCoin] = useState(STABLECOINS[0]);
  const [showCoinPicker, setShowCoinPicker] = useState(false);
  const WALLET_BALANCE = selectedCoin.balance;

  const amountPulse = useRef(new Animated.Value(1)).current;

  const [sendStr, setSendStr] = useState('0');
  const sendNum = parseFloat(sendStr) || 0;
  const receiveNum = sendNum * liveRate;
  const fee = FEE_OVERRIDE;
  const maxSendable = Math.max(0, WALLET_BALANCE - fee);
  const overBalance = sendNum + fee > WALLET_BALANCE;
  const canNext = sendNum > 0 && !overBalance;

  const press = (k: string) => {
    if (k === '\u232B') {
      setSendStr((a) => (a.length > 1 ? a.slice(0, -1) : '0'));
    } else if (k === '.') {
      if (!sendStr.includes('.')) setSendStr(sendStr + '.');
    } else {
      // Limit decimal places to 2
      const parts = sendStr.split('.');
      if (parts[1] && parts[1].length >= 2) return;
      if (sendStr.length >= 8) return;
      setSendStr((a) => (a === '0' ? k : a + k));
    }
    Animated.sequence([
      Animated.timing(amountPulse, { toValue: 1.03, duration: 80, useNativeDriver: true }),
      Animated.timing(amountPulse, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const setQuick = (n: number) => setSendStr(String(n));
  const setMax = () => setSendStr(maxSendable.toFixed(2).replace(/\.00$/, ''));

  const handleContinue = () => {
    navigation.navigate('Confirm', {
      amount: sendNum,
      sendCurrency: selectedCoin.token,
      receiveCurrency: corridor.toCurrency,
      receiveAmount: Math.round(receiveNum),
      recipientName: recipient?.name ?? 'Recipient',
      recipientInitials: recipient?.initials ?? '??',
      recipientColors: ['#1a6fff', '#38BDF8'] as [string, string],
      recipientMethod: recipient?.payout.provider ?? 'Bank',
      recipientFlag: recipient?.flag ?? '',
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Compact recipient strip — tap to go back and change */}
      {recipient && (
        <TouchableOpacity style={styles.recipientRow} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Avatar seed={recipient.name} initials={recipient.initials} size={32} bankBadge={recipient.payout.provider} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.recipientName}>To {recipient.name}</Text>
            <Text style={styles.recipientSub}>
              {recipient.flag} {recipient.country} · {recipient.payout.provider}
            </Text>
          </View>
          <Ionicons name="swap-horizontal" size={16} color="rgba(255,255,255,0.42)" />
        </TouchableOpacity>
      )}

      {/* Top card: You send */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>You send</Text>
        </View>
        <View style={styles.cardRow}>
          <Animated.Text style={[styles.cardAmount, { transform: [{ scale: amountPulse }] }]} numberOfLines={1}>
            <Text style={styles.dollar}>$</Text>{sendStr}
          </Animated.Text>
          <TouchableOpacity style={styles.sourceBadge} onPress={() => setShowCoinPicker(true)} activeOpacity={0.7}>
            <CryptoIcon token={selectedCoin.token} network={selectedCoin.network} size={22} ringColor="#17171A" />
            <Text style={styles.sourceText}>{selectedCoin.token}</Text>
            <View style={[styles.chainTag, { backgroundColor: selectedCoin.color }]}>
              <Text style={styles.chainTagText}>{selectedCoin.networkShort}</Text>
            </View>
            <Ionicons name="chevron-down" size={12} color="rgba(255,255,255,0.42)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Arrow divider */}
      <View style={styles.dividerWrap}>
        <Ionicons name="arrow-down" size={20} color="rgba(255,255,255,0.25)" />
      </View>

      {/* Bottom card: They receive */}
      <View style={[styles.card, { marginTop: -2 }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>They receive</Text>
          <Text style={styles.cardAvailable}>
            ~{corridor.speedSeconds}s delivery
          </Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={[styles.cardAmount, { color: '#38BDF8' }]} numberOfLines={1}>
            {formatMoney(receiveNum, corridor.toCurrency)}
          </Text>
          <View style={styles.currencyChip}>
            <Text style={styles.currencyFlag}>{corridor.toFlag}</Text>
            <Text style={styles.sourceText}>{corridor.toCurrency}</Text>
          </View>
        </View>
        <Text style={styles.feeInline}>
          1 USD = {liveRate.toFixed(2)} {corridor.toCurrency} · {formatMoney(fee, 'USD')} fee
        </Text>
      </View>

      {/* Validation pills */}
      {sendNum > 0 && overBalance && (
        <View style={styles.errorPill}>
          <Ionicons name="alert-circle" size={14} color="#EF4444" />
          <Text style={styles.errorText}>
            Not enough USDT. Max {formatMoney(maxSendable, 'USD')}
          </Text>
        </View>
      )}

      {/* Quick chips — shown when amount is 0 */}
      {sendNum === 0 && (
        <View style={styles.quickRow}>
          {[25, 50, 100, 250].map((v) => (
            <TouchableOpacity key={v} style={styles.quickPill} activeOpacity={0.7} onPress={() => setQuick(v)}>
              <Text style={styles.quickText}>${v}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ flex: 1 }} />

      {/* Continue CTA — above numpad so it's always visible */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, !canNext && styles.ctaDisabled]}
          disabled={!canNext}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={[styles.ctaText, !canNext && styles.ctaTextDisabled]}>Continue</Text>
        </TouchableOpacity>
      </View>

      {/* Custom numpad */}
      <View style={styles.numpad}>
        {KEYS.map((row, ri) => (
          <View key={ri} style={styles.numRow}>
            {row.map((k) => (
              <TouchableOpacity key={k} style={styles.key} activeOpacity={0.6} onPress={() => press(k)}>
                {k === '\u232B' ? (
                  <Ionicons name="backspace" size={24} color="#FFFFFF" />
                ) : (
                  <Text style={styles.keyText}>{k}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
      {/* Stablecoin + blockchain picker */}
      <BottomSheet visible={showCoinPicker} onClose={() => setShowCoinPicker(false)} title="Pay with">
        {STABLECOINS.map((c, i) => (
          <TouchableOpacity
            key={`${c.token}-${c.network}`}
            style={[styles.coinItem, selectedCoin.token === c.token && selectedCoin.network === c.network && styles.coinItemSel]}
            onPress={() => { setSelectedCoin(c); setShowCoinPicker(false); }}
            activeOpacity={0.7}
          >
            <CryptoIcon token={c.token} network={c.network} size={36} ringColor="#17171A" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.coinName}>{c.token} on {c.network}</Text>
              <Text style={styles.coinBalance}>{c.balance > 0 ? `${c.balance} ${c.token} available` : 'No balance'}</Text>
            </View>
            {selectedCoin.token === c.token && selectedCoin.network === c.network && (
              <Ionicons name="checkmark-circle" size={20} color="#38BDF8" />
            )}
          </TouchableOpacity>
        ))}
        <View style={{ height: 40 }} />
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8,
  },
  iconBtn: { padding: 4 },
  headerTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 17, color: '#FFFFFF' },

  recipientRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#17171A', borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 10,
    marginHorizontal: 20, marginBottom: 12,
  },
  recipientName: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFFFFF' },
  recipientSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.58)', marginTop: 1 },

  card: {
    backgroundColor: '#17171A', borderRadius: 16,
    paddingHorizontal: 18, paddingVertical: 20,
    marginHorizontal: 20,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.58)' },
  cardAvailable: { fontFamily: 'Inter_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.42)' },
  maxPill: {
    backgroundColor: 'rgba(56,189,248,0.12)', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  maxText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#38BDF8', letterSpacing: 0.5 },
  feeInline: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.42)', marginTop: 8 },

  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardAmount: {
    fontFamily: 'Inter_700Bold', fontSize: 42, color: '#FFFFFF',
    letterSpacing: -1, flex: 1, marginRight: 8, fontVariant: ['tabular-nums'],
  },
  dollar: { color: 'rgba(255,255,255,0.42)', fontSize: 32 },

  sourceBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#1F1F23', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  sourceText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#FFFFFF' },
  currencyChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#1F1F23', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  currencyFlag: { fontSize: 16 },

  dividerWrap: { alignItems: 'center', paddingVertical: 6 },

  errorPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8,
    marginHorizontal: 20, marginTop: 12,
  },
  errorText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 12, color: '#EF4444', lineHeight: 16 },

  quickRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 10,
    paddingHorizontal: 20, marginTop: 16,
  },
  quickPill: {
    backgroundColor: '#17171A', borderRadius: 999,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  quickText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#FFFFFF' },

  numpad: { paddingTop: 4, paddingBottom: 4 },
  numRow: { flexDirection: 'row' },
  key: {
    flex: 1, paddingVertical: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  keyText: { fontFamily: 'Inter_400Regular', fontSize: 26, color: '#FFFFFF' },

  footer: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 4 },
  cta: {
    backgroundColor: '#38BDF8', borderRadius: 999,
    paddingVertical: 18, alignItems: 'center',
  },
  ctaDisabled: { backgroundColor: '#1F1F23' },
  ctaText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#0A0A0C' },
  ctaTextDisabled: { color: 'rgba(255,255,255,0.25)' },

  // Chain tag on source badge
  chainTag: { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  chainTagText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#FFFFFF' },

  // Coin picker
  coinItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  coinItemSel: { backgroundColor: 'rgba(56,189,248,0.08)' },
  coinName: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFFFFF' },
  coinBalance: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.58)', marginTop: 2 },
});
