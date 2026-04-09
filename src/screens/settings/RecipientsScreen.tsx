import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import { ScreenHeader, SearchInput, Avatar, BankLogo } from '../../components';

interface Recipient {
  id: string; name: string; initials: string; country: string; flag: string;
  method: string; phone: string;
}

const recipients: Recipient[] = [
  { id: '1', name: 'Emeka Johnson', initials: 'EJ', country: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}', method: 'OPay', phone: '0812 456 7890' },
  { id: '2', name: 'Kofi Mensah', initials: 'KM', country: 'Ghana', flag: '\u{1F1EC}\u{1F1ED}', method: 'MTN Momo', phone: '0541 234 567' },
  { id: '3', name: 'Adaeze Obi', initials: 'AO', country: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}', method: 'GTBank', phone: '0813 567 8901' },
  { id: '4', name: 'Chidi Nwosu', initials: 'CN', country: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}', method: 'PalmPay', phone: '0813 456 7890' },
  { id: '5', name: 'Tunde Kareem', initials: 'TK', country: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}', method: 'Kuda', phone: '0901 234 5678' },
];

export const RecipientsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recipients;
    return recipients.filter((r) => r.name.toLowerCase().includes(q) || r.method.toLowerCase().includes(q));
  }, [query]);

  // Group by country
  const grouped = useMemo(() => {
    const map: Record<string, Recipient[]> = {};
    for (const r of filtered) { (map[r.country] ??= []).push(r); }
    return Object.entries(map);
  }, [filtered]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Recipients" onBack={() => navigation.goBack()} />
      <View style={styles.searchWrap}>
        <SearchInput value={query} onChangeText={setQuery} placeholder="Search recipients" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Add new */}
        <TouchableOpacity style={styles.addRow} activeOpacity={0.7}>
          <View style={styles.addIcon}>
            <Ionicons name="add" size={20} color="#38BDF8" />
          </View>
          <Text style={styles.addText}>Add new recipient</Text>
        </TouchableOpacity>

        {grouped.map(([country, items]) => (
          <View key={country} style={{ marginTop: 12 }}>
            <Text style={styles.groupLabel}>{items[0].flag} {country}</Text>
            <View style={styles.card}>
              {items.map((r, i) => (
                <React.Fragment key={r.id}>
                  <TouchableOpacity style={styles.row} activeOpacity={0.6}>
                    <Avatar seed={r.name} initials={r.initials} size={44} bankBadge={r.method} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.rowName}>{r.name}</Text>
                      <Text style={styles.rowSub}>{r.method} · {r.phone}</Text>
                    </View>
                    <TouchableOpacity style={styles.sendPill} activeOpacity={0.7}>
                      <Ionicons name="send" size={14} color="#38BDF8" />
                      <Text style={styles.sendText}>Send</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                  {i < items.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No recipients found</Text>
            <Text style={styles.emptySub}>Try a different search or add a new recipient.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  searchWrap: { paddingHorizontal: 20, paddingBottom: 8 },
  addRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 20, paddingVertical: 14, paddingHorizontal: 16,
    backgroundColor: '#17171A', borderRadius: 16,
  },
  addIcon: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(56,189,248,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  addText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#38BDF8' },
  groupLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.58)',
    paddingHorizontal: 20, paddingBottom: 8,
  },
  card: { backgroundColor: '#17171A', borderRadius: 16, marginHorizontal: 20, paddingHorizontal: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  rowName: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#FFFFFF' },
  rowSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.58)', marginTop: 2 },
  sendPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(56,189,248,0.12)', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  sendText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#38BDF8' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#FFFFFF', marginBottom: 6 },
  emptySub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.58)' },
});
