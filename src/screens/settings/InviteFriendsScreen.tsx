import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import { ScreenHeader, CTAButton } from '../../components';
import * as Clipboard from 'expo-clipboard';

const REFERRAL_CODE = 'QUPAY-FUBA-2026';
const steps = [
  'Share your referral code or link with a friend',
  'They sign up and verify their identity',
  'They complete their first transfer',
  'You both get $5 USDT credited instantly',
];

export const InviteFriendsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const copy = async () => {
    await Clipboard.setStringAsync(REFERRAL_CODE);
    Alert.alert('Copied', 'Referral code copied to clipboard.');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Invite friends" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.giftCircle}>
            <Ionicons name="gift" size={36} color="#38BDF8" />
          </View>
          <Text style={styles.heroTitle}>Get $5, give $5</Text>
          <Text style={styles.heroSub}>
            Invite friends to Qupay. When they send their first transfer, you both earn $5 USDT.
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statVal}>3</Text><Text style={styles.statLabel}>Invited</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.stat}><Text style={styles.statVal}>1</Text><Text style={styles.statLabel}>Joined</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.stat}><Text style={[styles.statVal, { color: '#38BDF8' }]}>$5</Text><Text style={styles.statLabel}>Earned</Text></View>
        </View>

        {/* Referral code */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your referral code</Text>
          <View style={styles.codeRow}>
            <Text style={styles.code}>{REFERRAL_CODE}</Text>
            <TouchableOpacity style={styles.copyPill} onPress={copy} activeOpacity={0.7}>
              <Ionicons name="copy" size={14} color="#38BDF8" />
              <Text style={styles.copyText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* How it works */}
        <Text style={styles.sectionLabel}>How it works</Text>
        <View style={styles.stepsCard}>
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <View style={styles.stepRow}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNum}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
              {i < steps.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CTAButton title="Share invite link" onPress={() => Alert.alert('Share', 'Share sheet coming soon.')} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  hero: { alignItems: 'center', paddingTop: 16, paddingBottom: 20, paddingHorizontal: 40 },
  giftCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(56,189,248,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#FFFFFF', marginTop: 16 },
  heroSub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.58)', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  statsRow: { flexDirection: 'row', backgroundColor: '#17171A', borderRadius: 16, paddingVertical: 16, marginHorizontal: 20 },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#FFFFFF' },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.58)', marginTop: 4 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.06)' },
  codeCard: { backgroundColor: '#17171A', borderRadius: 16, marginHorizontal: 20, padding: 16, marginTop: 16, borderWidth: 1, borderColor: 'rgba(56,189,248,0.15)', borderStyle: 'dashed' },
  codeLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.58)', marginBottom: 8 },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  code: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#FFFFFF', letterSpacing: 1, fontVariant: ['tabular-nums'] },
  copyPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(56,189,248,0.12)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  copyText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#38BDF8' },
  sectionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.58)', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  stepsCard: { backgroundColor: '#17171A', borderRadius: 16, marginHorizontal: 20, paddingHorizontal: 14 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(56,189,248,0.12)', alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#38BDF8' },
  stepText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, color: '#FFFFFF', lineHeight: 19 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  footer: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12 },
});
