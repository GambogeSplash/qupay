// HomeScreen — gradient hero with balance, corridor picker, animated send entry,
// recent contacts carousel, recent activity preview.
import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '../../components/Icon';
import { Avatar, BottomSheet } from '../../components';
import { userProfile } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';
import { MOCK_RECIPIENTS, CORRIDORS, formatMoney } from '../../data/remittance';

const recentActivity = [
  { id: '1', name: 'Emeka Johnson', initials: 'EJ', method: 'OPay', status: 'delivered', amount: '\u20A6329,000', sent: '200 USDT', time: '2 days ago' },
  { id: '2', name: 'Kofi Mensah', initials: 'KM', method: 'MTN Momo', status: 'delivered', amount: '\u20B5690', sent: '50 USDT', time: '5 days ago' },
  { id: '3', name: 'Adaeze Obi', initials: 'AO', method: 'GTBank', status: 'pending', amount: '\u20A6164,500', sent: '100 USDT', time: '3 hours ago' },
];

const statusColor = (s: string) => s === 'delivered' ? '#4ADE80' : s === 'pending' ? '#38BDF8' : '#EF4444';
const statusIcon = (s: string) => s === 'delivered' ? 'checkmark-circle' : s === 'pending' ? 'time' : 'close-circle';
const statusLabel = (s: string) => s === 'delivered' ? 'Delivered' : s === 'pending' ? 'In progress' : 'Failed';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const displayName = user?.firstName || userProfile.name.split(' ')[0];
  const [selectedCorridor, setSelectedCorridor] = useState(CORRIDORS[0]);
  const [showCorridorSheet, setShowCorridorSheet] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Animated send button scale
  const sendScale = useRef(new Animated.Value(1)).current;

  const greeting = useCallback(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const goProfile = () => {
    const parent = navigation.getParent();
    if (parent) parent.navigate('ProfileTab');
  };

  const goSend = () => {
    // Animated press feedback then navigate
    Animated.sequence([
      Animated.spring(sendScale, { toValue: 0.92, useNativeDriver: true, friction: 5 }),
      Animated.spring(sendScale, { toValue: 1, useNativeDriver: true, friction: 5 }),
    ]).start(() => {
      const parent = navigation.getParent();
      if (parent) parent.navigate('SendTab');
    });
  };

  const goActivity = () => {
    const parent = navigation.getParent();
    if (parent) parent.navigate('ActivityTab');
  };

  const recents = MOCK_RECIPIENTS.slice(0, 4);

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
          <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7} onPress={() => Alert.alert('Notifications', 'No new notifications. We\'ll notify you when transfers are delivered.')}>
            <Ionicons name="notifications" size={22} color="rgba(255,255,255,0.58)" />
          </TouchableOpacity>
        </View>

        {/* Gradient hero card — balance + corridor */}
        <View style={styles.heroWrap}>
          <LinearGradient
            colors={['#17171A', '#0A0A0C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={styles.balanceLabel}>Available to send</Text>
            <Text style={styles.balanceAmount}>$450.00</Text>
            <Text style={styles.balanceSub}>USDT on Polygon</Text>

            {/* Corridor selector */}
            <TouchableOpacity style={styles.corridorPill} onPress={() => setShowCorridorSheet(true)} activeOpacity={0.7}>
              <Text style={styles.corridorFlags}>{'\u{1F1F8}\u{1F1EC}'} {'\u2192'} {selectedCorridor.toFlag}</Text>
              <Text style={styles.corridorRate}>
                1 USD = {selectedCorridor.rate.toLocaleString()} {selectedCorridor.toCurrency}
              </Text>
              <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.42)" />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Animated Send button — the primary action */}
        <Animated.View style={{ transform: [{ scale: sendScale }] }}>
          <TouchableOpacity style={styles.sendBtn} onPress={goSend} activeOpacity={0.85}>
            <Ionicons name="send" size={20} color="#0A0A0C" />
            <Text style={styles.sendBtnText}>Send Money</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Send again — horizontal scroll */}
        <Text style={styles.sectionLabel}>Send again</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentsScroll}>
          {recents.map((r) => (
            <TouchableOpacity key={r.id} style={styles.recentItem} onPress={goSend} activeOpacity={0.7}>
              <Avatar seed={r.name} initials={r.initials} size={48} bankBadge={r.payout.provider} />
              <Text style={styles.recentName}>{r.name.split(' ')[0]}</Text>
              {r.lastSendUsd && <Text style={styles.recentAmount}>${r.lastSendUsd}</Text>}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent activity */}
        <View style={styles.activityHeader}>
          <Text style={styles.sectionLabel}>Recent activity</Text>
          <TouchableOpacity onPress={goActivity} activeOpacity={0.7}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activityCard}>
          {recentActivity.map((tx, i) => (
            <View key={tx.id}>
              <TouchableOpacity style={styles.actRow} activeOpacity={0.6} onPress={goActivity}>
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

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Corridor picker sheet */}
      <BottomSheet visible={showCorridorSheet} onClose={() => setShowCorridorSheet(false)} title="Send to">
        {CORRIDORS.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.cpItem, selectedCorridor.id === c.id && styles.cpItemSel]}
            onPress={() => { setSelectedCorridor(c); setShowCorridorSheet(false); }}
            activeOpacity={0.7}
          >
            <Text style={styles.cpFlag}>{c.toFlag}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cpName}>{c.toCountry}</Text>
              <Text style={styles.cpSub}>1 USD = {c.rate.toLocaleString()} {c.toCurrency} · ~{c.speedSeconds}s</Text>
            </View>
            {selectedCorridor.id === c.id && <Ionicons name="checkmark-circle" size={20} color="#38BDF8" />}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  greeting: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.58)' },
  headerName: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#FFFFFF', letterSpacing: -0.2 },
  bellBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  // Gradient hero
  heroWrap: { marginHorizontal: 20, marginBottom: 16, borderRadius: 20, overflow: 'hidden' },
  hero: { padding: 24 },
  balanceLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.58)' },
  balanceAmount: { fontFamily: 'Inter_700Bold', fontSize: 40, color: '#FFFFFF', letterSpacing: -1, marginTop: 4, fontVariant: ['tabular-nums'] },
  balanceSub: { fontFamily: 'Inter_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.42)', marginTop: 2 },
  corridorPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(56,189,248,0.07)', borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 8, marginTop: 16, alignSelf: 'flex-start',
  },
  corridorFlags: { fontSize: 14 },
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
  recentItem: { alignItems: 'center', width: 64, gap: 6 },
  recentName: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.58)' },
  recentAmount: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#38BDF8' },

  // Activity
  activityHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingRight: 20,
  },
  viewAll: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#38BDF8' },
  activityCard: { backgroundColor: '#17171A', borderRadius: 16, marginHorizontal: 20, paddingHorizontal: 12 },
  actRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  actName: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#FFFFFF' },
  actStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  actStatus: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  actAmount: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFFFFF' },
  actSent: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.58)', marginTop: 2 },
  actDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },

  // Corridor picker
  cpItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  cpItemSel: { backgroundColor: 'rgba(56,189,248,0.08)' },
  cpFlag: { fontSize: 24, width: 32, textAlign: 'center' },
  cpName: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#FFFFFF' },
  cpSub: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.58)', marginTop: 1 },
});
