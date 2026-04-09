import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import { ScreenHeader } from '../../components';

interface RateAlert { id: string; from: string; to: string; flags: string; rate: number; target: number; active: boolean; }

const initialAlerts: RateAlert[] = [
  { id: '1', from: 'USD', to: 'NGN', flags: '\u{1F1FA}\u{1F1F8}\u2192\u{1F1F3}\u{1F1EC}', rate: 1645, target: 1700, active: true },
];
const suggested = [
  { from: 'USD', to: 'GHS', flags: '\u{1F1FA}\u{1F1F8}\u2192\u{1F1EC}\u{1F1ED}', rate: 13.8 },
  { from: 'USD', to: 'KES', flags: '\u{1F1FA}\u{1F1F8}\u2192\u{1F1F0}\u{1F1EA}', rate: 129.5 },
  { from: 'SGD', to: 'PHP', flags: '\u{1F1F8}\u{1F1EC}\u2192\u{1F1F5}\u{1F1ED}', rate: 42.1 },
];

export const RateAlertsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [alerts, setAlerts] = useState(initialAlerts);

  const toggle = (id: string) =>
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));
  const remove = (id: string) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Rate alerts" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.blurb}>Get notified when exchange rates hit your target.</Text>

        {alerts.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Active alerts</Text>
            {alerts.map((a) => (
              <View key={a.id} style={styles.alertCard}>
                <Text style={styles.alertFlags}>{a.flags}</Text>
                <Text style={styles.alertCorridor}>{a.from} / {a.to}</Text>
                <Text style={styles.alertTarget}>Notify when above {a.target.toLocaleString()}</Text>
                <View style={styles.alertRow}>
                  <Text style={styles.alertCurrent}>Current: {a.rate.toLocaleString()}</Text>
                  <Switch
                    value={a.active}
                    onValueChange={() => toggle(a.id)}
                    trackColor={{ false: '#26262A', true: '#38BDF8' }}
                    thumbColor="#fff"
                    ios_backgroundColor="#26262A"
                  />
                </View>
                <TouchableOpacity style={styles.removeBtn} onPress={() => remove(a.id)} activeOpacity={0.7}>
                  <Text style={styles.removeText}>Remove alert</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionLabel}>Suggested corridors</Text>
        <View style={styles.card}>
          {suggested.map((s, i) => (
            <React.Fragment key={i}>
              <View style={styles.sugRow}>
                <Text style={styles.sugFlags}>{s.flags}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sugCorridor}>{s.from}/{s.to}</Text>
                  <Text style={styles.sugRate}>Current: {s.rate}</Text>
                </View>
                <TouchableOpacity style={styles.setPill} activeOpacity={0.7}>
                  <Text style={styles.setPillText}>+ Set</Text>
                </TouchableOpacity>
              </View>
              {i < suggested.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  blurb: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.58)', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  sectionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.58)', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  alertCard: { backgroundColor: '#17171A', borderRadius: 16, marginHorizontal: 20, padding: 16, marginBottom: 8 },
  alertFlags: { fontSize: 20, marginBottom: 4 },
  alertCorridor: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#FFFFFF' },
  alertTarget: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#38BDF8', marginTop: 4 },
  alertRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  alertCurrent: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.58)', fontVariant: ['tabular-nums'] },
  removeBtn: { marginTop: 12, alignSelf: 'flex-start' },
  removeText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#EF4444' },
  card: { backgroundColor: '#17171A', borderRadius: 16, marginHorizontal: 20, paddingHorizontal: 14 },
  sugRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  sugFlags: { fontSize: 18 },
  sugCorridor: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFFFFF' },
  sugRate: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.58)', marginTop: 2, fontVariant: ['tabular-nums'] },
  setPill: { backgroundColor: 'rgba(56,189,248,0.12)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  setPillText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#38BDF8' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
});
