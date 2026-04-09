// HomeScreen — hybrid of local Activity-first layout and clone's corridor/send capabilities.
// Local influence: greeting header with avatar, activity feed, pull-to-refresh.
// Clone additions: corridor selector, quick send contacts, send CTA.
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { Avatar, BottomSheet, BankLogo } from '../../components';
import { userProfile } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';

export interface DestInfo {
  flag: string; name: string; code: string; symbol: string; rate: number; providers: string;
}

const destinationList: DestInfo[] = [
  { flag: '\u{1F1F3}\u{1F1EC}', name: 'Nigeria', code: 'NGN', symbol: '\u20A6', rate: 1645, providers: 'OPay \u00B7 GTBank \u00B7 PalmPay' },
  { flag: '\u{1F1EC}\u{1F1ED}', name: 'Ghana', code: 'GHS', symbol: '\u20B5', rate: 13.8, providers: 'MTN Momo \u00B7 Vodafone Cash' },
  { flag: '\u{1F1F0}\u{1F1EA}', name: 'Kenya', code: 'KES', symbol: 'KSh', rate: 143, providers: 'M-Pesa \u00B7 Airtel Money' },
  { flag: '\u{1F1F5}\u{1F1ED}', name: 'Philippines', code: 'PHP', symbol: '\u20B1', rate: 58.5, providers: 'GCash \u00B7 Maya' },
  { flag: '\u{1F1EE}\u{1F1F3}', name: 'India', code: 'INR', symbol: '\u20B9', rate: 83.2, providers: 'UPI \u00B7 Bank' },
  { flag: '\u{1F1F5}\u{1F1F0}', name: 'Pakistan', code: 'PKR', symbol: '\u20A8', rate: 278, providers: 'EasyPaisa \u00B7 JazzCash' },
];

const recentContacts = [
  { name: 'Emeka Johnson', first: 'Emeka', initials: 'EJ', method: 'OPay', flag: '\u{1F1F3}\u{1F1EC}', amount: 200 },
  { name: 'Adaeze Obi', first: 'Adaeze', initials: 'AO', method: 'GTBank', flag: '\u{1F1F3}\u{1F1EC}', amount: 100 },
  { name: 'Kofi Mensah', first: 'Kofi', initials: 'KM', method: 'MTN Momo', flag: '\u{1F1EC}\u{1F1ED}', amount: 50 },
  { name: 'Chidi Nwosu', first: 'Chidi', initials: 'CN', method: 'PalmPay', flag: '\u{1F1F3}\u{1F1EC}', amount: 30 },
];

const recentActivity = [
  { id: '1', name: 'Emeka Johnson', initials: 'EJ', method: 'OPay', status: 'delivered' as const, amount: '\u20A6329,000', sent: '200 USDT', time: '2 days ago' },
  { id: '2', name: 'Kofi Mensah', initials: 'KM', method: 'MTN Momo', status: 'delivered' as const, amount: '\u20B5690', sent: '50 USDT', time: '5 days ago' },
  { id: '3', name: 'Adaeze Obi', initials: 'AO', method: 'GTBank', status: 'pending' as const, amount: '\u20A6164,500', sent: '100 USDT', time: '3 hours ago' },
];

const statusColor = (s: string) => s === 'delivered' ? '#4ADE80' : s === 'pending' ? '#38BDF8' : '#EF4444';
const statusIcon = (s: string) => s === 'delivered' ? 'checkmark-circle' : s === 'pending' ? 'time' : 'close-circle';
const statusLabel = (s: string) => s === 'delivered' ? 'Delivered' : s === 'pending' ? 'In progress' : 'Failed';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const displayName = user?.firstName || userProfile.name.split(' ')[0];
  const [selectedDest, setSelectedDest] = useState(destinationList[0]);
  const [showSheet, setShowSheet] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const greeting = useCallback(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const goSend = () => {
    const root = navigation.getParent()?.getParent();
    if (root) root.navigate('SendFlow' as never, { screen: 'Recipient' } as never);
  };

  const goProfile = () => {
    const parent = navigation.getParent();
    if (parent) parent.navigate('ProfileTab');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" colors={['#38BDF8']} progressBackgroundColor="#1F1F23" />
        }
      >
        {/* Header — avatar + greeting + bell */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goProfile} activeOpacity={0.8} style={styles.headerLeft}>
            <Avatar seed={displayName} size={40} />
            <View>
              <Text style={styles.greeting}>{greeting()}</Text>
              <Text style={styles.headerName}>{displayName} {'\u{1F44B}'}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="notifications" size={22} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>

        {/* Balance + corridor card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available balance</Text>
          <Text style={styles.balanceAmount}>$450.00</Text>
          <TouchableOpacity style={styles.corridorPill} onPress={() => setShowSheet(true)} activeOpacity={0.7}>
            <Text style={styles.corridorFlags}>{'\u{1F1F8}\u{1F1EC}'} {'\u2192'} {selectedDest.flag}</Text>
            <Text style={styles.corridorRate}>{selectedDest.symbol}{selectedDest.rate.toLocaleString()}/USDT</Text>
            <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.42)" />
          </TouchableOpacity>
        </View>

        {/* Send CTA */}
        <TouchableOpacity style={styles.sendBtn} onPress={goSend} activeOpacity={0.85}>
          <Ionicons name="send" size={18} color="#0A0A0C" />
          <Text style={styles.sendBtnText}>Send Money</Text>
        </TouchableOpacity>

        {/* Send again — horizontal scroll */}
        <Text style={styles.sectionLabel}>Send again</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentsScroll}>
          {recentContacts.map((c) => (
            <TouchableOpacity key={c.initials} style={styles.recentItem} onPress={goSend} activeOpacity={0.7}>
              <Avatar seed={c.name} initials={c.initials} size={48} bankBadge={c.method} />
              <Text style={styles.recentName}>{c.first}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent activity */}
        <Text style={styles.sectionLabel}>Recent activity</Text>
        <View style={styles.activityCard}>
          {recentActivity.map((tx, i) => (
            <View key={tx.id}>
              <TouchableOpacity
                style={styles.actRow}
                activeOpacity={0.6}
                onPress={() => {
                  const parent = navigation.getParent();
                  if (parent) parent.navigate('HistoryTab');
                }}
              >
                <Avatar seed={tx.name} initials={tx.initials} size={44} bankBadge={tx.method} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.actName}>{tx.name}</Text>
                  <View style={styles.actStatusRow}>
                    <Ionicons name={statusIcon(tx.status)} size={12} color={statusColor(tx.status)} />
                    <Text style={[styles.actStatus, { color: statusColor(tx.status) }]}>
                      {statusLabel(tx.status)} {'\u00B7'} {tx.time}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.actAmount}>{tx.amount}</Text>
                  <Text style={styles.actSent}>{tx.sent}</Text>
                </View>
              </TouchableOpacity>
              {i < recentActivity.length - 1 && <View style={styles.actDivider} />}
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.viewAll}
          activeOpacity={0.7}
          onPress={() => {
            const parent = navigation.getParent();
            if (parent) parent.navigate('HistoryTab');
          }}
        >
          <Text style={styles.viewAllText}>View all activity</Text>
          <Ionicons name="arrow-forward" size={16} color="#38BDF8" />
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Corridor picker sheet */}
      <BottomSheet visible={showSheet} onClose={() => setShowSheet(false)} title="Send to">
        {destinationList.map((d) => (
          <TouchableOpacity
            key={d.name}
            style={[styles.cpItem, selectedDest.name === d.name && styles.cpItemSel]}
            onPress={() => { setSelectedDest(d); setShowSheet(false); }}
            activeOpacity={0.7}
          >
            <Text style={styles.cpFlag}>{d.flag}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cpName}>{d.name}</Text>
              <Text style={styles.cpSub}>{d.symbol}{d.rate.toLocaleString()}/USDT {'\u00B7'} {d.providers}</Text>
            </View>
            {selectedDest.name === d.name && <Ionicons name="checkmark-circle" size={20} color="#38BDF8" />}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  greeting: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.58)' },
  headerName: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#FFFFFF', letterSpacing: -0.2 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  // Balance card
  balanceCard: { backgroundColor: '#17171A', borderRadius: 16, marginHorizontal: 20, padding: 20, marginBottom: 16 },
  balanceLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.58)' },
  balanceAmount: { fontFamily: 'Inter_700Bold', fontSize: 36, color: '#FFFFFF', letterSpacing: -1, marginTop: 4, fontVariant: ['tabular-nums'] },
  corridorPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(56,189,248,0.07)', borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 8, marginTop: 14, alignSelf: 'flex-start',
  },
  corridorFlags: { fontSize: 13 },
  corridorRate: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#38BDF8', fontVariant: ['tabular-nums'] },

  // Send CTA
  sendBtn: {
    marginHorizontal: 20, marginBottom: 20, paddingVertical: 18,
    backgroundColor: '#38BDF8', borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  sendBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#0A0A0C' },

  // Send again
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.58)',
    paddingHorizontal: 20, marginBottom: 10,
  },
  recentsScroll: { paddingHorizontal: 20, gap: 16, marginBottom: 20 },
  recentItem: { alignItems: 'center', width: 60, gap: 6 },
  recentName: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.58)' },

  // Recent activity
  activityCard: { backgroundColor: '#17171A', borderRadius: 16, marginHorizontal: 20, paddingHorizontal: 12 },
  actRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  actName: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#FFFFFF' },
  actStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  actStatus: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  actAmount: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFFFFF' },
  actSent: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.58)', marginTop: 2 },
  actDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },

  // View all
  viewAll: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginHorizontal: 20, marginTop: 12, paddingVertical: 12,
  },
  viewAllText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#38BDF8' },

  // Corridor picker
  cpItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  cpItemSel: { backgroundColor: 'rgba(56,189,248,0.08)' },
  cpFlag: { fontSize: 24, width: 32, textAlign: 'center' },
  cpName: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#FFFFFF' },
  cpSub: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.58)', marginTop: 1 },
});
