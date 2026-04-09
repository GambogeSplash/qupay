import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import { ScreenHeader, CTAButton, BottomSheet } from '../../components';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SendFlowParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<SendFlowParamList, 'Amount'>;

const currencies = [
  { code: 'USDT', name: 'Tether', icon: '\u{1FA99}', color: '#26A17B', symbol: '' },
  { code: 'NGN', name: 'Nigerian Naira', icon: '\u{1F1F3}\u{1F1EC}', color: '#008751', symbol: '\u20A6' },
  { code: 'GHS', name: 'Ghanaian Cedi', icon: '\u{1F1EC}\u{1F1ED}', color: '#CE1126', symbol: '\u20B5' },
  { code: 'KES', name: 'Kenyan Shilling', icon: '\u{1F1F0}\u{1F1EA}', color: '#006600', symbol: 'KSh' },
  { code: 'INR', name: 'Indian Rupee', icon: '\u{1F1EE}\u{1F1F3}', color: '#FF9933', symbol: '\u20B9' },
  { code: 'PHP', name: 'Philippine Peso', icon: '\u{1F1F5}\u{1F1ED}', color: '#0038A8', symbol: '\u20B1' },
  { code: 'MXN', name: 'Mexican Peso', icon: '\u{1F1F2}\u{1F1FD}', color: '#006847', symbol: '$' },
  { code: 'PKR', name: 'Pakistani Rupee', icon: '\u{1F1F5}\u{1F1F0}', color: '#01411C', symbol: 'Rs' },
  { code: 'ZAR', name: 'South African Rand', icon: '\u{1F1FF}\u{1F1E6}', color: '#007749', symbol: 'R' },
];

const usdtRates: Record<string, number> = {
  USDT: 1, NGN: 1645, GHS: 15.16, KES: 128.7, INR: 83.5, PHP: 56.78, MXN: 17.24, PKR: 278.5, ZAR: 18.9,
};

const currencySymbols: Record<string, string> = {
  USDT: '', NGN: '\u20A6', GHS: '\u20B5', KES: 'KSh', INR: '\u20B9', PHP: '\u20B1', MXN: '$', PKR: 'Rs', ZAR: 'R',
};

const getRate = (from: string, to: string): number => {
  if (from === to) return 1;
  const fromToUsdt = 1 / (usdtRates[from] || 1);
  const usdtToTo = usdtRates[to] || 1;
  return fromToUsdt * usdtToTo;
};

const isCrypto = (code: string): boolean => code === 'USDT';

export const AmountScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedSendCurrency, setSelectedSendCurrency] = useState(currencies[0]);
  const [selectedReceiveCurrency, setSelectedReceiveCurrency] = useState(currencies[1]);
  const [showSendPicker, setShowSendPicker] = useState(false);
  const [showReceivePicker, setShowReceivePicker] = useState(false);
  const [amount, setAmount] = useState('');

  const rate = getRate(selectedSendCurrency.code, selectedReceiveCurrency.code);
  const numAmount = parseFloat(amount) || 0;
  const receivingCrypto = isCrypto(selectedReceiveCurrency.code);
  const receiveAmount = receivingCrypto
    ? parseFloat((numAmount * rate).toFixed(2))
    : Math.round(numAmount * rate);

  const handleContinue = () => {
    navigation.navigate('Recipient', {
      amount: numAmount,
      sendCurrency: selectedSendCurrency.code,
      receiveCurrency: selectedReceiveCurrency.code,
      receiveAmount,
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Send" />
      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.amountCard}>
          <View style={styles.acSection}>
            <Text style={styles.acLabel}>You send</Text>
            <View style={styles.acRowSpaced}>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.25)"
              />
              <TouchableOpacity style={styles.sendCurrPill} onPress={() => setShowSendPicker(true)} activeOpacity={0.7}>
                <View style={[styles.cpIconWrapSmall, { backgroundColor: selectedSendCurrency.color + '20' }]}>
                  <Text style={styles.currFlagIcon}>{selectedSendCurrency.icon}</Text>
                </View>
                <Text style={styles.currText}>{selectedSendCurrency.code}</Text>
                <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.rateDivider}>
            <View style={styles.rateLine} />
            <View style={styles.ratePill}>
              <Text style={styles.ratePillText}>
                {receivingCrypto
                  ? `1 USDT = ${currencySymbols[selectedSendCurrency.code] || ''}${usdtRates[selectedSendCurrency.code]?.toLocaleString() || '1'} ${selectedSendCurrency.code}`
                  : `1 ${selectedSendCurrency.code} = ${selectedReceiveCurrency.symbol}${rate.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
              </Text>
            </View>
            <View style={styles.rateLine} />
          </View>

          <View style={styles.acSectionRecv}>
            <Text style={styles.acLabel}>They receive</Text>
            <View style={styles.acRowSpaced}>
              <Text style={styles.recvAmount}>
                {numAmount > 0
                  ? receivingCrypto
                    ? receiveAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : `${selectedReceiveCurrency.symbol}${receiveAmount.toLocaleString()}`
                  : '\u2014'}
              </Text>
              <TouchableOpacity style={styles.recvCurrPill} onPress={() => setShowReceivePicker(true)} activeOpacity={0.7}>
                <View style={[styles.cpIconWrapSmall, { backgroundColor: selectedReceiveCurrency.color + '20' }]}>
                  <Text style={styles.currFlagIcon}>{selectedReceiveCurrency.icon}</Text>
                </View>
                <Text style={styles.currText}>{selectedReceiveCurrency.code}</Text>
                <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.ctaWrap}>
          <CTAButton
            title="Continue"
            onPress={handleContinue}
            disabled={numAmount <= 0}
          />
        </View>
      </ScrollView>

      <BottomSheet visible={showSendPicker} onClose={() => setShowSendPicker(false)} title="Send Currency">
        {currencies.map((c) => (
          <TouchableOpacity
            key={c.code}
            style={[styles.cpItem, selectedSendCurrency.code === c.code && styles.cpItemSel]}
            onPress={() => { setSelectedSendCurrency(c); setShowSendPicker(false); }}
            activeOpacity={0.7}
          >
            <View style={[styles.cpIconWrap, { backgroundColor: c.color + '20' }]}>
              <Text style={styles.cpIcon}>{c.icon}</Text>
            </View>
            <View style={styles.cpInfo}>
              <Text style={styles.cpName}>{c.code}</Text>
              <Text style={styles.cpSub}>{c.name}</Text>
            </View>
            {selectedSendCurrency.code === c.code && <Ionicons name="checkmark" size={18} color="#38BDF8" />}
          </TouchableOpacity>
        ))}
        <View style={{ height: 40 }} />
      </BottomSheet>

      <BottomSheet visible={showReceivePicker} onClose={() => setShowReceivePicker(false)} title="Receive Currency">
        {currencies.map((c) => (
          <TouchableOpacity
            key={c.code}
            style={[styles.cpItem, selectedReceiveCurrency.code === c.code && styles.cpItemSel]}
            onPress={() => { setSelectedReceiveCurrency(c); setShowReceivePicker(false); }}
            activeOpacity={0.7}
          >
            <View style={[styles.cpIconWrap, { backgroundColor: c.color + '20' }]}>
              <Text style={styles.cpIcon}>{c.icon}</Text>
            </View>
            <View style={styles.cpInfo}>
              <Text style={styles.cpName}>{c.code}</Text>
              <Text style={styles.cpSub}>{c.name}</Text>
            </View>
            {selectedReceiveCurrency.code === c.code && <Ionicons name="checkmark" size={18} color="#38BDF8" />}
          </TouchableOpacity>
        ))}
        <View style={{ height: 40 }} />
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  scroll: { flex: 1 },
  amountCard: {
    marginHorizontal: 20, marginTop: 8, marginBottom: 12, backgroundColor: '#1F1F23',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden',
  },
  acSection: { paddingVertical: 20, paddingHorizontal: 20 },
  acSectionRecv: { paddingVertical: 16, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#26262A' },
  acLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1,
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 8,
  },
  acRowSpaced: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amountInput: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 36, color: '#FFFFFF', minWidth: 60, maxWidth: '55%' },
  recvAmount: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 32, color: '#38BDF8' },
  sendCurrPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#26262A', borderWidth: 1, borderColor: 'rgba(56,189,248,0.3)',
    borderRadius: 24, paddingVertical: 10, paddingHorizontal: 14,
    minWidth: 125,
  },
  recvCurrPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#333350', borderWidth: 1, borderColor: 'rgba(56,189,248,0.25)',
    borderRadius: 24, paddingVertical: 8, paddingHorizontal: 12,
    minWidth: 125,
  },
  cpIconWrapSmall: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  currFlagIcon: { fontSize: 16 },
  currText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#FFFFFF' },
  rateDivider: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 10 },
  rateLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  ratePill: {
    backgroundColor: '#0A0A0C', borderWidth: 1, borderColor: 'rgba(56,189,248,0.25)',
    borderRadius: 24, paddingVertical: 5, paddingHorizontal: 12,
  },
  ratePillText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#38BDF8', fontVariant: ['tabular-nums'] },
  ctaWrap: { paddingHorizontal: 20, paddingBottom: 24 },
  cpItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  cpItemSel: { backgroundColor: 'rgba(56,189,248,0.08)' },
  cpIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  cpIcon: { fontSize: 18 },
  cpInfo: { flex: 1 },
  cpName: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFFFFF' },
  cpSub: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.6)' },
});
