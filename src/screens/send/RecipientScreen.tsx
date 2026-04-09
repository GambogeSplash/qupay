// RecipientScreen — ported from /qupay/src/screens/remittance/PickRecipientScreen.tsx
// First step in send flow: pick who's receiving. Rotating search placeholder,
// "Send again" carousel, all recipients in grouped card, new recipient action.
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import { Avatar } from '../../components';
import { MOCK_RECIPIENTS, Recipient } from '../../data/remittance';
import { useAuthStore } from '../../store/authStore';
import { userProfile } from '../../data/mockData';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SendFlowParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<SendFlowParamList, 'Recipient'>;

const PLACEHOLDERS = [
  'Search by name',
  'Try a country \u2014 "Nigeria"',
  'Try a phone number',
  'Try a name \u2014 "Adaeze"',
];

export const RecipientScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const displayName = user?.firstName || userProfile.name.split(' ')[0];
  const [query, setQuery] = useState('');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  const goProfile = () => {
    try {
      (navigation as any).getParent()?.getParent()?.navigate('ProfileStack');
    } catch {}
  };

  // Rotate placeholder text while user hasn't typed
  useEffect(() => {
    if (query.length > 0) return;
    const t = setInterval(() => setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length), 2400);
    return () => clearInterval(t);
  }, [query.length]);

  const filtered = useMemo(() => {
    if (!query.trim()) return MOCK_RECIPIENTS;
    const q = query.toLowerCase();
    return MOCK_RECIPIENTS.filter(
      (r) => r.name.toLowerCase().includes(q) || r.country.toLowerCase().includes(q) || r.phone.includes(q),
    );
  }, [query]);

  const recents = MOCK_RECIPIENTS.slice(0, 4);

  const goNext = (recipient: Recipient) => {
    navigation.navigate('Amount', { recipient } as any);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header — avatar left + title + bell right */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goProfile} activeOpacity={0.8}>
          <Avatar seed={displayName} size={36} />
        </TouchableOpacity>
        <Text style={styles.title}>Send</Text>
        <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
          <Ionicons name="notifications" size={20} color="rgba(255,255,255,0.58)" />
        </TouchableOpacity>
      </View>

      {/* Search bar with rotating placeholder */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="rgba(255,255,255,0.42)" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={PLACEHOLDERS[placeholderIdx]}
          placeholderTextColor="rgba(255,255,255,0.42)"
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.42)" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Add new recipient */}
        <TouchableOpacity style={styles.addRow} activeOpacity={0.7}>
          <View style={styles.addIcon}>
            <Ionicons name="person" size={20} color="#38BDF8" />
          </View>
          <Text style={styles.addLabel}>New recipient</Text>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.42)" />
        </TouchableOpacity>

        {/* Recents carousel — only when no search query */}
        {!query && (
          <>
            <Text style={styles.sectionLabel}>Send again</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
              {recents.map((r) => (
                <TouchableOpacity key={r.id} style={styles.recentTile} onPress={() => goNext(r)} activeOpacity={0.7}>
                  <Avatar seed={r.name} initials={r.initials} size={56} bankBadge={r.payout.provider} />
                  <Text style={styles.recentName} numberOfLines={1}>{r.name.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* All recipients / search results */}
        <Text style={styles.sectionLabel}>{query ? 'Results' : 'All recipients'}</Text>
        <View style={styles.listCard}>
          {filtered.map((r, i) => (
            <TouchableOpacity
              key={r.id}
              style={[styles.row, i < filtered.length - 1 && styles.rowBorder]}
              onPress={() => goNext(r)}
              activeOpacity={0.6}
            >
              <Avatar seed={r.name} initials={r.initials} size={44} bankBadge={r.payout.provider} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.rowName}>{r.name}</Text>
                <Text style={styles.rowSub}>{r.payout.provider} · {r.country}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.42)" />
            </TouchableOpacity>
          ))}
          {filtered.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No matches</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
  },
  title: { fontFamily: 'Inter_700Bold', fontSize: 20, color: '#FFFFFF', flex: 1, textAlign: 'center' },
  bellBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#17171A', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    marginHorizontal: 20, marginBottom: 12,
  },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#FFFFFF', padding: 0 },

  addRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#17171A', borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 14,
    marginHorizontal: 20, marginBottom: 8,
  },
  addIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(56,189,248,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  addLabel: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#FFFFFF' },

  sectionLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.58)',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  recentRow: { gap: 14, paddingHorizontal: 20, paddingBottom: 8 },
  recentTile: { alignItems: 'center', width: 64 },
  recentName: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#FFFFFF', marginTop: 8 },

  listCard: {
    backgroundColor: '#17171A', borderRadius: 16,
    marginHorizontal: 20, paddingHorizontal: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  rowName: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#FFFFFF' },
  rowSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.58)', marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.42)' },
});
