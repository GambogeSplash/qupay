import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import { ScreenHeader, CryptoIcon } from '../../components';

const wallets = [
  { id: '1', label: 'Qupay Wallet', network: 'Polygon', token: 'USDT', balance: '450.00', primary: true },
  { id: '2', label: 'External Wallet', network: 'Ethereum', token: 'USDT', balance: '0.00', primary: false },
];

export const WalletsScreen: React.FC<{ navigation: any }> = ({ navigation }) => (
  <SafeAreaView style={styles.safe} edges={['top']}>
    <ScreenHeader title="Wallets & cards" onBack={() => navigation.goBack()} />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.sectionLabel}>Linked wallets</Text>
      <View style={styles.card}>
        {wallets.map((w, i) => (
          <React.Fragment key={w.id}>
            <TouchableOpacity style={styles.row} activeOpacity={0.6} onPress={() => Alert.alert(w.label)}>
              <CryptoIcon token={w.token} network={w.network} size={40} ringColor="#17171A" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.rowTitle}>{w.label}</Text>
                <Text style={styles.rowSub}>{w.network} · {w.token}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.balance}>${w.balance}</Text>
                {w.primary && <Text style={styles.primaryBadge}>Primary</Text>}
              </View>
            </TouchableOpacity>
            {i < wallets.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>

      <TouchableOpacity
        style={styles.addBtn}
        activeOpacity={0.7}
        onPress={() => Alert.alert('Add wallet', 'Coming soon.')}
      >
        <View style={styles.addIcon}>
          <Ionicons name="add" size={20} color="#38BDF8" />
        </View>
        <Text style={styles.addText}>Connect another wallet</Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.58)',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
  },
  card: { backgroundColor: '#17171A', borderRadius: 16, marginHorizontal: 20, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  rowTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFFFFF' },
  rowSub: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.58)', marginTop: 2 },
  balance: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#FFFFFF', fontVariant: ['tabular-nums'] },
  primaryBadge: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#38BDF8', marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 20, marginTop: 16, paddingVertical: 14,
    paddingHorizontal: 16, backgroundColor: '#17171A', borderRadius: 16,
  },
  addIcon: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(56,189,248,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  addText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#38BDF8' },
});
