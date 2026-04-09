import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import * as Clipboard from 'expo-clipboard';
import { ScreenHeader, GradientAvatar, CTAButton, BottomSheet } from '../../components';
import { banks, Bank, networks, walletContacts, Network } from '../../data/mockData';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SendFlowParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<SendFlowParamList, 'Recipient'>;

const currencySymbols: Record<string, string> = {
  USDT: '', NGN: '\u20A6', GHS: '\u20B5', KES: 'KSh', INR: '\u20B9', PHP: '\u20B1', MXN: '$', PKR: 'Rs', ZAR: 'R',
};

const contacts = [
  { name: 'Emeka Johnson', initials: 'EJ', colors: ['#1a6fff', '#38BDF8'] as [string, string], method: 'OPay', phone: '0812 456 7890', flag: '\u{1F1F3}\u{1F1EC}', country: 'Nigeria' },
  { name: 'Kofi Mensah', initials: 'KM', colors: ['#FFE55C', '#38BDF8'] as [string, string], method: 'MTN Momo', phone: '0541 234 567', flag: '\u{1F1EC}\u{1F1ED}', country: 'Ghana' },
  { name: 'Adaeze Obi', initials: 'AO', colors: ['#a855f7', '#1a6fff'] as [string, string], method: 'GTBank', phone: '\u00B7\u00B7\u00B7\u00B7 4521', flag: '\u{1F1F3}\u{1F1EC}', country: 'Nigeria' },
];

const isValidWalletAddress = (addr: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
};

const truncateAddress = (addr: string): string => {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 8)}\u2026${addr.slice(-6)}`;
};

export const RecipientScreen: React.FC<Props> = ({ navigation, route }) => {
  const { amount, sendCurrency, receiveCurrency, receiveAmount } = route.params;
  const recvSymbol = currencySymbols[receiveCurrency] || '';
  const sendSymbol = currencySymbols[sendCurrency] || '';
  const isCryptoOut = receiveCurrency === 'USDT';

  // Shared state
  const [inputVal, setInputVal] = useState('');

  // Fiat-out state (bank/mobile money)
  const [resolveState, setResolveState] = useState<'idle' | 'resolving' | 'resolved' | 'error'>('idle');
  const [resolvedContact, setResolvedContact] = useState<(typeof contacts)[0] | null>(null);
  const [showBankSheet, setShowBankSheet] = useState(false);
  const [showBankListSheet, setShowBankListSheet] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  // Crypto-out state (wallet)
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(networks[1]); // Default to Polygon
  const [showNetworkPicker, setShowNetworkPicker] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletAddressTouched, setWalletAddressTouched] = useState(false);

  const countryBanks = banks['Nigeria'] || [];
  const popularBanks = useMemo(() => countryBanks.filter((b) => b.popular), [countryBanks]);
  const filteredBanks = useMemo(() => {
    if (!bankSearch.trim()) return countryBanks;
    const search = bankSearch.toLowerCase();
    return countryBanks.filter((b) => b.name.toLowerCase().includes(search));
  }, [countryBanks, bankSearch]);
  const bankFormValid = selectedBank && bankAccountNumber.length >= 8 && bankAccountName.trim().length >= 2;

  const walletAddressValid = isValidWalletAddress(walletAddress);
  const walletAddressError = walletAddressTouched && walletAddress.length > 0 && !walletAddressValid;

  const selectBank = useCallback((bank: Bank) => {
    setSelectedBank(bank.id);
    setBankName(bank.name);
    setShowBankListSheet(false);
    setBankSearch('');
  }, []);

  const handleInput = useCallback(
    (val: string) => {
      setInputVal(val);
      if (!isCryptoOut && val.length >= 10) {
        setResolveState('resolving');
        setResolvedContact(null);
        setTimeout(() => {
          if (val.startsWith('0')) {
            setResolveState('resolved');
            setResolvedContact(contacts[0]);
          } else {
            setResolveState('error');
          }
        }, 1200);
      } else {
        setResolveState('idle');
        setResolvedContact(null);
      }
    },
    [isCryptoOut]
  );

  const handleWalletAddressChange = useCallback((val: string) => {
    setWalletAddress(val);
    setWalletAddressTouched(true);
  }, []);

  const handlePasteAddress = useCallback(async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setWalletAddress(text.trim());
      setWalletAddressTouched(true);
    }
  }, []);

  const selectContact = useCallback(
    (c: (typeof contacts)[0]) => {
      navigation.navigate('Confirm', {
        amount,
        sendCurrency,
        receiveCurrency,
        receiveAmount,
        recipientName: c.name,
        recipientInitials: c.initials,
        recipientColors: c.colors,
        recipientMethod: c.method,
        recipientPhone: c.phone,
        recipientFlag: c.flag,
      });
    },
    [navigation, amount, sendCurrency, receiveCurrency, receiveAmount]
  );

  const selectWalletContact = useCallback(
    (w: (typeof walletContacts)[0]) => {
      navigation.navigate('Confirm', {
        amount,
        sendCurrency,
        receiveCurrency,
        receiveAmount,
        recipientName: w.name,
        recipientInitials: w.initials,
        recipientColors: w.colors,
        recipientMethod: w.network,
        recipientFlag: '\u{1FA99}',
        recipientWalletAddress: w.walletAddress,
        recipientNetwork: w.network,
      });
    },
    [navigation, amount, sendCurrency, receiveCurrency, receiveAmount]
  );

  const handleContinueWithWallet = useCallback(() => {
    if (!walletAddressValid) return;
    const initials = 'WA';
    navigation.navigate('Confirm', {
      amount,
      sendCurrency,
      receiveCurrency,
      receiveAmount,
      recipientName: truncateAddress(walletAddress),
      recipientInitials: initials,
      recipientColors: ['#38BDF8', '#1a6fff'],
      recipientMethod: selectedNetwork.name,
      recipientFlag: '\u{1FA99}',
      recipientWalletAddress: walletAddress,
      recipientNetwork: selectedNetwork.name,
    });
  }, [navigation, amount, sendCurrency, receiveCurrency, receiveAmount, walletAddress, walletAddressValid, selectedNetwork]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Who are you sending to?" onBack={() => navigation.goBack()} />
      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Swap summary card */}
        <View style={styles.swapSummary}>
          <View style={styles.swapRow}>
            <Text style={styles.swapLabel}>Sending</Text>
            <Text style={styles.swapValue}>{sendSymbol}{amount.toLocaleString()} {sendCurrency}</Text>
          </View>
          <View style={styles.swapArrow}>
            <Ionicons name="arrow-down" size={14} color="#38BDF8" />
          </View>
          <View style={styles.swapRow}>
            <Text style={styles.swapLabel}>They receive</Text>
            <Text style={styles.swapValueGreen}>
              {isCryptoOut
                ? `${receiveAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`
                : `${recvSymbol}${receiveAmount.toLocaleString()} ${receiveCurrency}`}
            </Text>
          </View>
        </View>

        {isCryptoOut ? (
          <>
            {/* Network Selector */}
            <TouchableOpacity
              style={styles.networkSelector}
              onPress={() => setShowNetworkPicker(true)}
              activeOpacity={0.7}
            >
              <View style={styles.networkSelectorLeft}>
                <Text style={styles.networkSelectorLabel}>Network</Text>
                <View style={styles.networkPill}>
                  <Ionicons name={selectedNetwork.icon as any} size={16} color="#38BDF8" />
                  <Text style={styles.networkPillText}>{selectedNetwork.name}</Text>
                  <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.5)" />
                </View>
              </View>
              <Text style={styles.networkGas}>{selectedNetwork.gasEstimate} gas</Text>
            </TouchableOpacity>

            {/* Wallet Address Input */}
            <View style={[styles.walletInputCard, walletAddressError && styles.walletInputCardError, walletAddressValid && styles.walletInputCardValid]}>
              <View style={styles.walletInputHeader}>
                <Text style={styles.walletInputLabel}>Recipient Wallet Address</Text>
                <TouchableOpacity onPress={handlePasteAddress} style={styles.pasteBtn} activeOpacity={0.7}>
                  <Ionicons name="clipboard-outline" size={14} color="#38BDF8" />
                  <Text style={styles.pasteBtnText}>Paste</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.walletInput}
                placeholder="0x..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={walletAddress}
                onChangeText={handleWalletAddressChange}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {walletAddressError && (
                <View style={styles.walletErrorRow}>
                  <Ionicons name="alert-circle" size={14} color="#EF4444" />
                  <Text style={styles.walletErrorText}>Invalid wallet address format</Text>
                </View>
              )}
              {walletAddressValid && (
                <View style={styles.walletValidRow}>
                  <Ionicons name="checkmark-circle" size={14} color="#38BDF8" />
                  <Text style={styles.walletValidText}>Valid {selectedNetwork.name} address</Text>
                </View>
              )}
            </View>

            {/* Continue Button */}
            <View style={styles.walletContinueWrap}>
              <CTAButton
                title="Continue"
                disabled={!walletAddressValid}
                onPress={handleContinueWithWallet}
              />
            </View>

            {/* Saved Wallets */}
            <Text style={styles.sectionLabel}>Saved Wallets</Text>
            <View style={styles.contactList}>
              {walletContacts.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  style={styles.contactItem}
                  onPress={() => selectWalletContact(w)}
                  activeOpacity={0.7}
                >
                  <GradientAvatar
                    initials={w.initials}
                    size={44}
                    colors={w.colors}
                    fontSize={13}
                  />
                  <View style={styles.ciInfo}>
                    <Text style={styles.ciName}>{w.name}</Text>
                    <View style={styles.walletSubRow}>
                      <Text style={styles.walletAddrText}>{truncateAddress(w.walletAddress)}</Text>
                      <View style={styles.networkBadge}>
                        <Ionicons name={w.networkIcon as any} size={10} color="#38BDF8" />
                        <Text style={styles.networkBadgeText}>{w.network}</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Smart input card - Fiat out */}
            <View style={[styles.sendInputCard, resolveState !== 'idle' && styles.sendInputCardActive]}>
              <View style={styles.sicField}>
                <Text style={styles.sicLabel}>To</Text>
                <TextInput
                  style={styles.sicInput}
                  placeholder="Name, phone number, or account\u2026"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={inputVal}
                  onChangeText={handleInput}
                />
              </View>

              {resolveState === 'resolving' && (
                <View style={styles.resolvingRow}>
                  <View style={styles.miniSpin} />
                  <Text style={styles.resolvingText}>Looking up account\u2026</Text>
                </View>
              )}

              {resolveState === 'error' && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={16} color="#EF4444" />
                  <View style={styles.errorInfo}>
                    <Text style={styles.errorTitle}>Account not found</Text>
                    <Text style={styles.errorSub}>Check the number and try again, or add bank details below</Text>
                  </View>
                </View>
              )}

              {resolveState === 'resolved' && resolvedContact && (
                <TouchableOpacity
                  style={styles.resolvedRow}
                  onPress={() => selectContact(resolvedContact)}
                  activeOpacity={0.7}
                >
                  <View style={styles.resolvedCard}>
                    <GradientAvatar
                      initials={resolvedContact.initials}
                      size={36}
                      colors={resolvedContact.colors}
                      fontSize={12}
                    />
                    <View style={styles.rcInfo}>
                      <Text style={styles.rcName}>{resolvedContact.name}</Text>
                      <Text style={styles.rcSub}>
                        {resolvedContact.method} {'\u00B7'} {resolvedContact.phone} {'\u00B7'}{' '}
                        {resolvedContact.country}
                      </Text>
                      <Text style={styles.noAcctNote}>
                        No Qupay account needed — they'll receive a standard{' '}
                        {resolvedContact.method} credit {'\u2713'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.rcCheck}>{'\u2713'}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Add bank account for non-Qupay users */}
            <TouchableOpacity
              style={styles.addBankBtn}
              onPress={() => setShowBankSheet(true)}
              activeOpacity={0.7}
            >
              <View style={styles.addBankIcon}>
                <Ionicons name="business-outline" size={18} color="#38BDF8" />
              </View>
              <View style={styles.addBankInfo}>
                <Text style={styles.addBankTitle}>Bank Transfer</Text>
                <Text style={styles.addBankSub}>Send directly to a bank account</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>

            {/* Recent contacts */}
            <Text style={styles.sectionLabel}>Recent</Text>
            <View style={styles.contactList}>
              {contacts.map((c) => (
                <TouchableOpacity
                  key={c.initials}
                  style={styles.contactItem}
                  onPress={() => selectContact(c)}
                  activeOpacity={0.7}
                >
                  <View style={styles.ciAvWrap}>
                    <GradientAvatar
                      initials={c.initials}
                      size={44}
                      colors={c.colors}
                      fontSize={13}
                    />
                    <View style={styles.ciFlag}>
                      <Text style={styles.ciFlagText}>{c.flag}</Text>
                    </View>
                  </View>
                  <View style={styles.ciInfo}>
                    <Text style={styles.ciName}>{c.name}</Text>
                    <Text style={styles.ciSub}>
                      {c.method} {'\u00B7'} {c.phone} {'\u00B7'} {c.country}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Network Picker Sheet */}
      <BottomSheet
        visible={showNetworkPicker}
        onClose={() => setShowNetworkPicker(false)}
        title="Select Network"
      >
        {networks.map((n) => (
          <TouchableOpacity
            key={n.id}
            style={[styles.networkItem, selectedNetwork.id === n.id && styles.networkItemSelected]}
            onPress={() => { setSelectedNetwork(n); setShowNetworkPicker(false); }}
            activeOpacity={0.7}
          >
            <View style={styles.networkItemIcon}>
              <Ionicons name={n.icon as any} size={20} color={selectedNetwork.id === n.id ? '#38BDF8' : '#FFFFFF'} />
            </View>
            <View style={styles.networkItemInfo}>
              <Text style={[styles.networkItemName, selectedNetwork.id === n.id && styles.networkItemNameSelected]}>{n.name}</Text>
              <Text style={styles.networkItemGas}>Gas {n.gasEstimate}</Text>
            </View>
            {selectedNetwork.id === n.id && <Ionicons name="checkmark" size={18} color="#38BDF8" />}
          </TouchableOpacity>
        ))}
        <View style={{ height: 40 }} />
      </BottomSheet>

      {/* Bank Account Entry Sheet */}
      <BottomSheet
        visible={showBankSheet}
        onClose={() => setShowBankSheet(false)}
        title="Enter Bank Details"
      >
        <View style={styles.bankForm}>
          <Text style={styles.bankLabel}>Select Bank</Text>
          <TouchableOpacity
            style={[styles.bankDropdown, selectedBank && styles.bankDropdownSelected]}
            onPress={() => setShowBankListSheet(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="business-outline" size={18} color={selectedBank ? '#38BDF8' : 'rgba(255,255,255,0.4)'} />
            <Text style={[styles.bankDropdownText, !selectedBank && styles.bankDropdownPlaceholder]}>
              {bankName || 'Choose a bank...'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>

          {popularBanks.length > 0 && (
            <>
              <Text style={styles.bankSubLabel}>Quick Select</Text>
              <View style={styles.bankPicker}>
                {popularBanks.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={[
                      styles.bankChip,
                      selectedBank === b.id && styles.bankChipSelected,
                    ]}
                    onPress={() => selectBank(b)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.bankChipText,
                        selectedBank === b.id && styles.bankChipTextSelected,
                      ]}
                    >
                      {b.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <Text style={styles.bankLabel}>Account Number</Text>
          <TextInput
            style={styles.bankInput}
            placeholder="Enter account number"
            placeholderTextColor="rgba(255,255,255,0.4)"
            keyboardType="number-pad"
            value={bankAccountNumber}
            onChangeText={setBankAccountNumber}
            maxLength={20}
          />

          <Text style={styles.bankLabel}>Account Holder Name</Text>
          <TextInput
            style={styles.bankInput}
            placeholder="Enter account holder name"
            placeholderTextColor="rgba(255,255,255,0.4)"
            autoCapitalize="words"
            value={bankAccountName}
            onChangeText={setBankAccountName}
            maxLength={60}
          />

          <CTAButton
            title="Continue"
            disabled={!bankFormValid}
            onPress={() => {
              setShowBankSheet(false);
              const initials = bankAccountName
                .trim()
                .split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();
              navigation.navigate('Confirm', {
                amount,
                sendCurrency,
                receiveCurrency,
                receiveAmount,
                recipientName: bankAccountName.trim(),
                recipientInitials: initials,
                recipientColors: ['#1a6fff', '#38BDF8'],
                recipientMethod: bankName,
                recipientPhone: bankAccountNumber,
                recipientFlag: '\u{1F1F3}\u{1F1EC}',
              });
            }}
            style={{ marginTop: 16 }}
          />
        </View>
        <View style={{ height: 40 }} />
      </BottomSheet>

      {/* Bank Selection Sheet */}
      <BottomSheet
        visible={showBankListSheet}
        onClose={() => {
          setShowBankListSheet(false);
          setBankSearch('');
        }}
        title="Select Bank"
      >
        <View style={styles.bankListContainer}>
          <View style={styles.bankSearchWrap}>
            <Ionicons name="search" size={18} color="rgba(255,255,255,0.4)" />
            <TextInput
              style={styles.bankSearchInput}
              placeholder="Search banks..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={bankSearch}
              onChangeText={setBankSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {bankSearch.length > 0 && (
              <TouchableOpacity onPress={() => setBankSearch('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={filteredBanks}
            keyExtractor={(item) => item.id}
            style={styles.bankList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.bankListItem,
                  selectedBank === item.id && styles.bankListItemSelected,
                ]}
                onPress={() => selectBank(item)}
                activeOpacity={0.7}
              >
                <View style={styles.bankListIcon}>
                  <Ionicons name="business" size={16} color={selectedBank === item.id ? '#38BDF8' : 'rgba(255,255,255,0.5)'} />
                </View>
                <Text style={[styles.bankListName, selectedBank === item.id && styles.bankListNameSelected]}>
                  {item.name}
                </Text>
                {selectedBank === item.id && (
                  <Ionicons name="checkmark" size={18} color="#38BDF8" />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Ionicons name="search-outline" size={32} color="rgba(255,255,255,0.3)" />
                <Text style={styles.emptyListText}>No banks found</Text>
              </View>
            }
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  scroll: { flex: 1 },
  swapSummary: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(56,189,248,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.15)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  swapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  swapArrow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  swapLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  swapValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  swapValueGreen: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#38BDF8',
  },
  // Network selector for crypto-out
  networkSelector: {
    marginHorizontal: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F1F23',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  networkSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  networkSelectorLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  networkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(56,189,248,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.25)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  networkPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  networkGas: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  // Wallet address input card
  walletInputCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#1F1F23',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
  },
  walletInputCardError: {
    borderColor: 'rgba(239,68,68,0.5)',
  },
  walletInputCardValid: {
    borderColor: 'rgba(56,189,248,0.4)',
  },
  walletInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  walletInputLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.6)',
  },
  pasteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(56,189,248,0.1)',
    borderRadius: 8,
  },
  pasteBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#38BDF8',
  },
  walletInput: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    color: '#FFFFFF',
    backgroundColor: '#17171A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  walletErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  walletErrorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#EF4444',
  },
  walletValidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  walletValidText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#38BDF8',
  },
  walletContinueWrap: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  // Wallet sub row in saved wallets
  walletSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  walletAddrText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56,189,248,0.1)',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  networkBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: '#38BDF8',
  },
  // Network picker item
  networkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  networkItemSelected: {
    backgroundColor: 'rgba(56,189,248,0.08)',
  },
  networkItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkItemInfo: {
    flex: 1,
  },
  networkItemName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  networkItemNameSelected: {
    color: '#38BDF8',
  },
  networkItemGas: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  // Fiat-out styles (existing)
  sendInputCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#1F1F23',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendInputCardActive: {
    borderColor: 'rgba(56,189,248,0.4)',
  },
  sicField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  sicLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    width: 30,
  },
  sicInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#FFFFFF',
  },
  resolvingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  miniSpin: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.2)',
    borderTopColor: '#38BDF8',
    borderRadius: 7,
  },
  resolvingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  resolvedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  resolvedCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rcInfo: { flex: 1 },
  rcName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  rcSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  noAcctNote: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#38BDF8',
    marginTop: 2,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(239,68,68,0.15)',
    backgroundColor: 'rgba(239,68,68,0.05)',
  },
  errorInfo: { flex: 1 },
  errorTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#EF4444',
  },
  errorSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  rcCheck: {
    fontSize: 18,
    color: '#38BDF8',
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.6)',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  contactList: {
    marginHorizontal: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  ciAvWrap: { position: 'relative' },
  ciFlag: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0A0A0C',
    borderWidth: 1,
    borderColor: '#0A0A0C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ciFlagText: { fontSize: 12 },
  ciInfo: { flex: 1 },
  ciName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  ciSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  addBankBtn: {
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(56,189,248,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.15)',
    borderRadius: 12,
  },
  addBankIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(56,189,248,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBankInfo: { flex: 1 },
  addBankTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#38BDF8',
  },
  addBankSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 1,
  },
  bankForm: {
    paddingHorizontal: 20,
  },
  bankLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  bankSubLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 8,
  },
  bankDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1F1F23',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  bankDropdownSelected: {
    borderColor: 'rgba(56,189,248,0.4)',
  },
  bankDropdownText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#FFFFFF',
  },
  bankDropdownPlaceholder: {
    color: 'rgba(255,255,255,0.4)',
  },
  bankPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  bankChip: {
    backgroundColor: '#1F1F23',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  bankChipSelected: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56,189,248,0.12)',
  },
  bankChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  bankChipTextSelected: {
    color: '#38BDF8',
  },
  bankInput: {
    backgroundColor: '#1F1F23',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  bankListContainer: {
    paddingHorizontal: 20,
    maxHeight: 400,
  },
  bankSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1F1F23',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  bankSearchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#FFFFFF',
  },
  bankList: {
    maxHeight: 320,
  },
  bankListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  bankListItemSelected: {
    backgroundColor: 'rgba(56,189,248,0.06)',
    marginHorizontal: -4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  bankListIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankListName: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  bankListNameSelected: {
    color: '#38BDF8',
  },
  emptyList: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyListText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
});
