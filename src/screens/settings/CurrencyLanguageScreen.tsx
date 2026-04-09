import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import { ScreenHeader } from '../../components';

const currencies = [
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'SGD', label: 'Singapore Dollar', symbol: 'S$' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'AED', label: 'UAE Dirham', symbol: 'د.إ' },
];

const languages = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'yo', label: 'Yorùbá' },
  { code: 'ig', label: 'Igbo' },
  { code: 'ha', label: 'Hausa' },
];

export const CurrencyLanguageScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedLang, setSelectedLang] = useState('en');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Currency & language" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.sectionLabel}>Display currency</Text>
        <View style={styles.card}>
          {currencies.map((c, i) => (
            <React.Fragment key={c.code}>
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.7}
                onPress={() => setSelectedCurrency(c.code)}
              >
                <Text style={styles.symbol}>{c.symbol}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{c.label}</Text>
                  <Text style={styles.rowCode}>{c.code}</Text>
                </View>
                {selectedCurrency === c.code && (
                  <Ionicons name="checkmark-circle" size={20} color="#38BDF8" />
                )}
              </TouchableOpacity>
              {i < currencies.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Language</Text>
        <View style={styles.card}>
          {languages.map((l, i) => (
            <React.Fragment key={l.code}>
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.7}
                onPress={() => setSelectedLang(l.code)}
              >
                <Text style={[styles.rowLabel, { flex: 1 }]}>{l.label}</Text>
                {selectedLang === l.code && (
                  <Ionicons name="checkmark-circle" size={20} color="#38BDF8" />
                )}
              </TouchableOpacity>
              {i < languages.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.58)',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
  },
  card: { backgroundColor: '#17171A', borderRadius: 16, marginHorizontal: 20, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  symbol: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#FFFFFF', width: 32, textAlign: 'center' },
  rowLabel: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#FFFFFF' },
  rowCode: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.58)', marginTop: 1 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
});
