// HistoryScreen — heavily influenced by /Users/fubara/qupay/src/screens/activity/ActivityScreen.tsx
// Local Activity layout: big title header, total-sent stat card, pill filter chips,
// date-grouped sections wrapped in P.card containers, status icon+text rows.
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import { Avatar, SearchInput } from '../../components';
import { useAuthStore } from '../../store/authStore';
import { userProfile } from '../../data/mockData';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HistoryStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<HistoryStackParamList, 'History'>;

type TransferStatus = 'delivered' | 'pending' | 'failed' | 'disputed';

interface HistoryItem {
  id: string;
  name: string;
  initials: string;
  colors: [string, string];
  method: string;
  timeLabel: string;
  bucket: 'Today' | 'This week' | 'Earlier';
  corridor: string;
  receiveAmount: string;
  sentLabel: string;
  status: TransferStatus;
}

const historyItems: HistoryItem[] = [
  { id: '3', name: 'Adaeze Obi', initials: 'AO', colors: ['#a855f7', '#1a6fff'], method: 'GTBank', timeLabel: '3 hours ago', bucket: 'Today', corridor: '\u{1F1F8}\u{1F1EC}\u2192\u{1F1F3}\u{1F1EC}', receiveAmount: '\u20A6164,500', sentLabel: '100 USDT \u00B7 In progress', status: 'pending' },
  { id: '1', name: 'Emeka Johnson', initials: 'EJ', colors: ['#1a6fff', '#38BDF8'], method: 'OPay', timeLabel: '2 days ago', bucket: 'This week', corridor: '\u{1F1F8}\u{1F1EC}\u2192\u{1F1F3}\u{1F1EC}', receiveAmount: '\u20A6329,000', sentLabel: '200 USDT \u00B7 4m 11s', status: 'delivered' },
  { id: '2', name: 'Kofi Mensah', initials: 'KM', colors: ['#FFE55C', '#38BDF8'], method: 'MTN Momo', timeLabel: '5 days ago', bucket: 'This week', corridor: '\u{1F1F8}\u{1F1EC}\u2192\u{1F1EC}\u{1F1ED}', receiveAmount: '\u20B5690', sentLabel: '50 USDT \u00B7 3m 42s', status: 'delivered' },
  { id: '5', name: 'Tunde Kareem', initials: 'TK', colors: ['#FFE55C', '#ee5a24'], method: '', timeLabel: '1 week ago', bucket: 'This week', corridor: 'Recipient disputed \u00B7 Tap to resolve', receiveAmount: '\u20A682,250', sentLabel: '50 USDT', status: 'disputed' },
  { id: '4', name: 'Chidi Nwosu', initials: 'CN', colors: ['#EF4444', '#FFD60A'], method: 'PalmPay', timeLabel: '2 weeks ago', bucket: 'Earlier', corridor: 'Node failed \u00B7 Refunded', receiveAmount: '\u21A9 Refunded', sentLabel: '50 USDT returned', status: 'failed' },
];

// Local convention: green = delivered/success, sky blue = in-progress/CTA,
// red = failed, yellow = disputed/warning. Matches /qupay/tokens P.green semantic.
const StatusIcon: React.FC<{ status: TransferStatus }> = ({ status }) => {
  if (status === 'delivered') {
    return <Ionicons name="checkmark-circle" size={12} color="#4ADE80" />;
  }
  if (status === 'failed') {
    return <Ionicons name="close-circle" size={12} color="#EF4444" />;
  }
  if (status === 'disputed') {
    return <Ionicons name="alert-circle" size={12} color="#FFD60A" />;
  }
  // pending — small purple dot (in-progress is the "active" color)
  return <View style={styles.spinnerDot} />;
};

const statusText = (status: TransferStatus): string => {
  switch (status) {
    case 'delivered': return 'Delivered';
    case 'pending': return 'In progress';
    case 'failed': return 'Refunded';
    case 'disputed': return 'Disputed';
  }
};

const statusColor = (status: TransferStatus): string => {
  switch (status) {
    case 'delivered': return '#4ADE80';
    case 'pending': return '#38BDF8';
    case 'failed': return '#EF4444';
    case 'disputed': return '#FFD60A';
  }
};

export const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const displayName = user?.firstName || userProfile.name.split(' ')[0];
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');

  const goProfile = () => {
    try {
      (navigation as any).getParent()?.getParent()?.navigate('ProfileStack');
    } catch {}
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Filter by name/method/country, then group into time buckets
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return historyItems;
    return historyItems.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.method.toLowerCase().includes(q) ||
        t.corridor.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const order: HistoryItem['bucket'][] = ['Today', 'This week', 'Earlier'];
    return order
      .map((bucket) => ({ bucket, items: filtered.filter((t) => t.bucket === bucket) }))
      .filter((g) => g.items.length > 0);
  }, [filtered]);

  const isEmpty = historyItems.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header — avatar left + title + search */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={goProfile} activeOpacity={0.8}>
          <Avatar seed={displayName} size={36} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Total sent stat card */}
      <View style={styles.totalSentCard}>
        <Text style={styles.totalSentLabel}>Total sent · <Text style={styles.totalSentValue}>$450.00</Text></Text>
        <Text style={styles.totalSentCount}>5 transfers</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search transfers"
        />
      </View>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="paper-plane-outline" size={32} color="rgba(255,255,255,0.42)" />
          </View>
          <Text style={styles.emptyTitle}>No transfers yet</Text>
          <Text style={styles.emptySub}>
            Your sends will appear here. Tap Send to make your first transfer.
          </Text>
        </View>
      ) : (
        <>
          {/* Grouped list */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#38BDF8"
                colors={['#38BDF8']}
                progressBackgroundColor="#1F1F23"
              />
            }
          >
            {grouped.map((g) => (
              <View key={g.bucket} style={{ marginTop: 12 }}>
                <Text style={styles.dateLabel}>{g.bucket}</Text>
                <View style={styles.groupCard}>
                  {g.items.map((tx, i) => (
                    <TouchableOpacity
                      key={tx.id}
                      style={[styles.row, i < g.items.length - 1 && styles.itemBorder]}
                      activeOpacity={0.6}
                      onPress={() =>
                        navigation.navigate('TransferDetail', { transferId: tx.id, status: tx.status })
                      }
                    >
                      <Avatar
                        seed={tx.name}
                        initials={tx.initials}
                        size={44}
                        bankBadge={tx.method}
                      />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.rowName}>{tx.name}</Text>
                        <View style={styles.statusRow}>
                          <StatusIcon status={tx.status} />
                          <Text style={[styles.statusText, { color: statusColor(tx.status) }]}>
                            {statusText(tx.status)} {'\u00B7'} {tx.timeLabel}
                          </Text>
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text
                          style={[
                            styles.amount,
                            tx.status === 'failed' && {
                              textDecorationLine: 'line-through',
                              color: 'rgba(255,255,255,0.42)',
                            },
                          ]}
                        >
                          {tx.receiveAmount}
                        </Text>
                        <Text style={styles.sentLabel}>{tx.sentLabel}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },

  // Header
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold', fontSize: 20, color: '#FFFFFF',
    flex: 1, textAlign: 'center',
  },

  // Total sent stat card
  totalSentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#17171A',
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  totalSentLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.58)',
  },
  totalSentValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  totalSentCount: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.58)',
  },

  // Search bar
  searchWrap: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },

  // Group date label
  dateLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.58)',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },

  // Group card wrapping rows
  groupCard: {
    backgroundColor: '#17171A',
    borderRadius: 16,
    marginHorizontal: 20,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  rowName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  spinnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38BDF8',
  },
  avWrap: { position: 'relative' },
  bankBadge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#17171A',
    overflow: 'hidden',
  },
  amount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  sentLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.58)',
    marginTop: 2,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#17171A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.58)',
    textAlign: 'center',
    lineHeight: 20,
  },
});
