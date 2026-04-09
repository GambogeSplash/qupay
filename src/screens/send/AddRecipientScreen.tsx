// AddRecipientScreen — country → bank detection → account entry.
// Flow: pick country → enter account number → auto-detect bank OR pick bank
// from a list with real logos. Then enter recipient name and proceed to Amount.
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import { BankLogo, ScreenHeader, BottomSheet } from '../../components';
import { Recipient } from '../../data/remittance';

interface Country {
  name: string;
  flag: string;
  code: string;
  currency: string;
  corridorId: string;
  banks: { id: string; name: string; prefixes?: string[] }[];
}

const COUNTRIES: Country[] = [
  {
    name: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}', code: 'NG', currency: 'NGN', corridorId: 'sg-ng',
    banks: [
      { id: 'opay', name: 'OPay', prefixes: ['080', '081'] },
      { id: 'gtbank', name: 'GTBank', prefixes: ['058'] },
      { id: 'access', name: 'Access Bank', prefixes: ['044'] },
      { id: 'zenith', name: 'Zenith Bank', prefixes: ['057'] },
      { id: 'kuda', name: 'Kuda', prefixes: ['090'] },
      { id: 'palmpay', name: 'PalmPay', prefixes: ['082'] },
      { id: 'firstbank', name: 'First Bank', prefixes: ['011'] },
      { id: 'uba', name: 'UBA', prefixes: ['033'] },
      { id: 'fcmb', name: 'FCMB', prefixes: ['214'] },
      { id: 'fidelity', name: 'Fidelity Bank', prefixes: ['070'] },
      { id: 'moniepoint', name: 'Moniepoint' },
      { id: 'sterling', name: 'Sterling Bank' },
      { id: 'wema', name: 'Wema Bank' },
      { id: 'stanbic', name: 'Stanbic IBTC' },
      { id: 'ecobank', name: 'Ecobank' },
    ],
  },
  {
    name: 'Ghana', flag: '\u{1F1EC}\u{1F1ED}', code: 'GH', currency: 'GHS', corridorId: 'sg-gh',
    banks: [
      { id: 'mtn', name: 'MTN Momo' },
      { id: 'vodafone', name: 'Vodafone Cash' },
      { id: 'airteltigo', name: 'AirtelTigo Money' },
      { id: 'ecobank-gh', name: 'Ecobank Ghana' },
      { id: 'gcb', name: 'GCB Bank' },
      { id: 'calbank', name: 'Calbank' },
      { id: 'fidelity-gh', name: 'Fidelity Bank Ghana' },
      { id: 'absa-gh', name: 'Absa Ghana' },
    ],
  },
  {
    name: 'Kenya', flag: '\u{1F1F0}\u{1F1EA}', code: 'KE', currency: 'KES', corridorId: 'sg-ke',
    banks: [
      { id: 'mpesa', name: 'M-Pesa' },
      { id: 'airtel', name: 'Airtel Money' },
      { id: 'equity', name: 'Equity Bank' },
      { id: 'kcb', name: 'KCB Bank' },
      { id: 'coop', name: 'Co-operative Bank' },
      { id: 'ncba', name: 'NCBA' },
      { id: 'stanbic-ke', name: 'Stanbic Kenya' },
      { id: 'im', name: 'I&M Bank' },
      { id: 'dtb-ke', name: 'DTB Kenya' },
    ],
  },
  {
    name: 'Philippines', flag: '\u{1F1F5}\u{1F1ED}', code: 'PH', currency: 'PHP', corridorId: 'sg-ph',
    banks: [
      { id: 'gcash', name: 'GCash' },
      { id: 'maya', name: 'Maya' },
      { id: 'bpi', name: 'BPI' },
      { id: 'bdo', name: 'BDO' },
      { id: 'metrobank', name: 'Metrobank' },
      { id: 'unionbank-ph', name: 'UnionBank PH' },
      { id: 'cimb-ph', name: 'CIMB PH' },
    ],
  },
  {
    name: 'India', flag: '\u{1F1EE}\u{1F1F3}', code: 'IN', currency: 'INR', corridorId: 'sg-in',
    banks: [
      { id: 'upi', name: 'UPI' },
      { id: 'paytm', name: 'Paytm' },
      { id: 'phonepe', name: 'PhonePe' },
    ],
  },
  {
    name: 'Pakistan', flag: '\u{1F1F5}\u{1F1F0}', code: 'PK', currency: 'PKR', corridorId: 'sg-pk',
    banks: [
      { id: 'easypaisa', name: 'EasyPaisa' },
      { id: 'jazzcash', name: 'JazzCash' },
    ],
  },
];

// Auto-detect bank from account number prefix (Nigerian NUBAN codes)
function detectBank(country: Country, accountNumber: string): typeof country.banks[0] | null {
  if (accountNumber.length < 3) return null;
  const prefix = accountNumber.slice(0, 3);
  return country.banks.find((b) => b.prefixes?.includes(prefix)) ?? null;
}

// Mock account name resolution (simulates NIP lookup for Nigeria)
function mockResolveName(bank: string, account: string): string {
  const names: Record<string, string> = {
    '0812456': 'JOHNSON EMEKA CHUKWUDI',
    '0541234': 'MENSAH KOFI ASANTE',
    '0813567': 'OBI ADAEZE CHIDINMA',
  };
  const key = account.slice(0, 7);
  return names[key] || 'OKONKWO CHISOM FAVOUR';
}

type Step = 'country' | 'details';

export const AddRecipientScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [step, setStep] = useState<Step>('country');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedBank, setSelectedBank] = useState<typeof COUNTRIES[0]['banks'][0] | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [resolving, setResolving] = useState(false);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [resolveError, setResolveError] = useState(false);

  const bankFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (selectedBank) {
      bankFade.setValue(0);
      Animated.spring(bankFade, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }).start();
    }
  }, [selectedBank?.id]);

  // Auto-detect bank as user types account number
  useEffect(() => {
    if (!selectedCountry || accountNumber.length < 3) {
      if (!selectedBank) return;
      return;
    }
    const detected = detectBank(selectedCountry, accountNumber);
    if (detected && detected.id !== selectedBank?.id) {
      setSelectedBank(detected);
    }
  }, [accountNumber, selectedCountry]);

  // Auto-resolve account name when we have bank + 10-digit account
  useEffect(() => {
    if (!selectedBank || accountNumber.length < 10) {
      setAccountName('');
      setResolveError(false);
      return;
    }
    setResolving(true);
    setResolveError(false);
    const timer = setTimeout(() => {
      if (Math.random() < 0.1) { setResolveError(true); setResolving(false); return; }
      setAccountName(mockResolveName(selectedBank.name, accountNumber));
      setResolving(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [selectedBank, accountNumber]);

  const filteredBanks = useMemo(() => {
    if (!selectedCountry) return [];
    if (!bankSearch.trim()) return selectedCountry.banks;
    const q = bankSearch.toLowerCase();
    return selectedCountry.banks.filter((b) => b.name.toLowerCase().includes(q));
  }, [selectedCountry, bankSearch]);

  const canProceed = selectedCountry && selectedBank && accountNumber.length >= 8 && accountName.length > 0;

  const handleProceed = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!selectedCountry || !selectedBank) return;
    const initials = accountName.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
    const recipient: Recipient = {
      id: `new-${Date.now()}`,
      name: accountName.split(' ').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' '),
      initials,
      phone: accountNumber,
      country: selectedCountry.name,
      flag: selectedCountry.flag,
      corridorId: selectedCountry.corridorId,
      payout: { kind: 'bank', provider: selectedBank.name, accountTail: accountNumber.slice(-4) },
    };
    navigation.navigate('Amount', { recipient });
  };

  // ─── Step 1: Country picker ───
  if (step === 'country') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="New recipient" onBack={() => navigation.goBack()} />
        <Text style={styles.stepLabel}>Where are they?</Text>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {COUNTRIES.map((c) => (
            <TouchableOpacity
              key={c.code}
              style={styles.countryRow}
              activeOpacity={0.7}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedCountry(c); setStep('details'); }}
            >
              <Text style={styles.countryFlag}>{c.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.countryName}>{c.name}</Text>
                <Text style={styles.countrySub}>{c.banks.length} providers · {c.currency}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.42)" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Step 2: Bank + account details ───
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={`Send to ${selectedCountry!.flag} ${selectedCountry!.name}`} onBack={() => setStep('country')} />

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Account number input */}
        <Text style={styles.fieldLabel}>Account number or phone</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={accountNumber}
            onChangeText={setAccountNumber}
            placeholder="Enter account or phone number"
            placeholderTextColor="rgba(255,255,255,0.3)"
            keyboardType="number-pad"
            maxLength={20}
          />
          {accountNumber.length >= 3 && selectedBank && (
            <View style={styles.detectedBadge}>
              <BankLogo name={selectedBank.name} size={20} />
            </View>
          )}
        </View>

        {/* Bank selection — auto-detected or manual pick */}
        <Text style={styles.fieldLabel}>Bank or provider</Text>
        {selectedBank ? (
          <Animated.View style={{ opacity: bankFade, transform: [{ translateX: bankFade.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
            <TouchableOpacity style={styles.bankSelected} onPress={() => setShowBankPicker(true)} activeOpacity={0.7}>
              <BankLogo name={selectedBank.name} size={32} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.bankName}>{selectedBank.name}</Text>
                <Text style={styles.bankDetected}>
                  {accountNumber.length >= 3 ? 'Auto-detected' : 'Tap to change'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.42)" />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <TouchableOpacity style={styles.bankPicker} onPress={() => setShowBankPicker(true)} activeOpacity={0.7}>
            <Ionicons name="business" size={18} color="rgba(255,255,255,0.42)" />
            <Text style={styles.bankPickerText}>Select a bank or provider</Text>
            <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.42)" />
          </TouchableOpacity>
        )}

        {/* Popular banks quick-pick */}
        <Text style={styles.fieldLabel}>Popular in {selectedCountry!.name}</Text>
        <View style={styles.bankGrid}>
          {selectedCountry!.banks.slice(0, 8).map((b) => (
            <TouchableOpacity
              key={b.id}
              style={[styles.bankChip, selectedBank?.id === b.id && styles.bankChipSel]}
              onPress={() => setSelectedBank(b)}
              activeOpacity={0.7}
            >
              <BankLogo name={b.name} size={28} />
              <Text style={[styles.bankChipText, selectedBank?.id === b.id && styles.bankChipTextSel]} numberOfLines={1}>
                {b.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Account name — auto-resolved */}
        {accountNumber.length >= 8 && (
          <View style={styles.nameCard}>
            {resolving ? (
              <View style={styles.resolvingRow}>
                <View style={styles.miniSpin} />
                <Text style={styles.resolvingText}>Looking up account...</Text>
              </View>
            ) : resolveError ? (
              <View style={styles.resolvedRow}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.resolvedName, { color: '#EF4444' }]}>Account not found</Text>
                  <Text style={styles.resolvedSub}>Check the number and try again</Text>
                </View>
              </View>
            ) : accountName ? (
              <View style={styles.resolvedRow}>
                <Ionicons name="checkmark-circle" size={18} color="#4ADE80" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.resolvedName}>{accountName}</Text>
                  <Text style={styles.resolvedSub}>Account holder verified</Text>
                </View>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* Continue CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, !canProceed && styles.ctaDisabled]}
          onPress={handleProceed}
          disabled={!canProceed}
          activeOpacity={0.85}
        >
          <Text style={[styles.ctaText, !canProceed && styles.ctaTextDisabled]}>Continue to amount</Text>
        </TouchableOpacity>
      </View>

      {/* Bank picker sheet */}
      <BottomSheet visible={showBankPicker} onClose={() => { setShowBankPicker(false); setBankSearch(''); }} title="Select bank">
        <View style={styles.sheetSearch}>
          <Ionicons name="search" size={16} color="rgba(255,255,255,0.42)" />
          <TextInput
            style={styles.sheetSearchInput}
            value={bankSearch}
            onChangeText={setBankSearch}
            placeholder="Search banks"
            placeholderTextColor="rgba(255,255,255,0.42)"
          />
        </View>
        <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
          {filteredBanks.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={[styles.sheetRow, selectedBank?.id === b.id && styles.sheetRowSel]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedBank(b); setShowBankPicker(false); setBankSearch(''); }}
              activeOpacity={0.7}
            >
              <BankLogo name={b.name} size={36} />
              <Text style={styles.sheetBankName}>{b.name}</Text>
              {selectedBank?.id === b.id && <Ionicons name="checkmark-circle" size={20} color="#38BDF8" />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },

  // Step labels
  stepLabel: {
    fontFamily: 'Inter_700Bold', fontSize: 20, color: '#FFFFFF',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
  },

  // Country list
  countryRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  countryFlag: { fontSize: 28 },
  countryName: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#FFFFFF' },
  countrySub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.58)', marginTop: 2 },

  // Detail step
  fieldLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.58)',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#17171A', borderRadius: 12,
    marginHorizontal: 20, paddingHorizontal: 16,
  },
  input: {
    flex: 1, fontFamily: 'Inter_500Medium', fontSize: 16, color: '#FFFFFF',
    paddingVertical: 14,
  },
  detectedBadge: { marginLeft: 8 },

  // Bank selected
  bankSelected: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#17171A', borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 12,
    marginHorizontal: 20,
  },
  bankName: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFFFFF' },
  bankDetected: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#38BDF8', marginTop: 1 },
  bankPicker: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#17171A', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14,
    marginHorizontal: 20,
  },
  bankPickerText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.42)' },

  // Bank grid
  bankGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: 20,
  },
  bankChip: {
    width: '22%', minWidth: 72, alignItems: 'center', gap: 6,
    backgroundColor: '#17171A', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 4,
  },
  bankChipSel: { backgroundColor: 'rgba(56,189,248,0.12)' },
  bankChipText: { fontFamily: 'Inter_500Medium', fontSize: 10, color: 'rgba(255,255,255,0.58)', textAlign: 'center' },
  bankChipTextSel: { color: '#38BDF8' },

  // Name resolution
  nameCard: {
    backgroundColor: '#17171A', borderRadius: 16,
    marginHorizontal: 20, marginTop: 16, padding: 14,
  },
  resolvingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  miniSpin: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 2, borderColor: '#38BDF8', borderTopColor: 'transparent',
  },
  resolvingText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.58)' },
  resolvedRow: { flexDirection: 'row', alignItems: 'center' },
  resolvedName: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#FFFFFF' },
  resolvedSub: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#4ADE80', marginTop: 2 },

  // Footer
  footer: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8 },
  cta: { backgroundColor: '#38BDF8', borderRadius: 999, paddingVertical: 18, alignItems: 'center' },
  ctaDisabled: { backgroundColor: '#1F1F23' },
  ctaText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#0A0A0C' },
  ctaTextDisabled: { color: 'rgba(255,255,255,0.25)' },

  // Bank picker sheet
  sheetSearch: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1F1F23', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    marginHorizontal: 20, marginBottom: 12,
  },
  sheetSearchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#FFFFFF', padding: 0 },
  sheetRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  sheetRowSel: { backgroundColor: 'rgba(56,189,248,0.08)' },
  sheetBankName: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 14, color: '#FFFFFF' },
});
