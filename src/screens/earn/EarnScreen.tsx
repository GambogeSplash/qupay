// EarnScreen — referral rewards, streak bonuses, rate alert earnings.
// Growth lever: incentivize users to invite friends and keep sending.
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import * as Clipboard from 'expo-clipboard';

const REFERRAL_CODE = 'QUPAY-FUBA-2026';

const rewards = [
  { icon: 'gift', label: 'Invite a friend', sub: 'You both earn $5 USDT when they complete their first send', value: '$5', earned: false },
  { icon: 'flame', label: '5-send streak', sub: 'Send 5 transfers in a month to earn a bonus', value: '$2', earned: true },
  { icon: 'trending-up', label: 'Rate alert save', sub: 'Set a rate alert and send when it triggers — earn $1', value: '$1', earned: false },
  { icon: 'people', label: 'Refer 5 friends', sub: 'Hit 5 successful referrals to unlock premium corridors', value: 'Unlock', earned: false },
];

export const EarnScreen: React.FC = () => {
  const copy = async () => {
    await Clipboard.setStringAsync(REFERRAL_CODE);
    Alert.alert('Copied', 'Referral code copied to clipboard.');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Earn</Text>
        </View>

        {/* Earnings summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryLabel}>Total earned</Text>
            <Text style={styles.summaryValue}>$7.00</Text>
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.summaryLabel}>Referrals</Text>
            <Text style={styles.summaryValue}>1</Text>
          </View>
        </View>

        {/* Referral code card */}
        <View style={styles.codeCard}>
          <View style={styles.codeTop}>
            <View style={styles.codeIcon}>
              <Ionicons name="gift" size={22} color="#38BDF8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.codeTitle}>Your referral code</Text>
              <Text style={styles.codeSub}>Share with friends — $5 for you, $5 for them</Text>
            </View>
          </View>
          <View style={styles.codeRow}>
            <Text style={styles.code}>{REFERRAL_CODE}</Text>
            <TouchableOpacity style={styles.copyPill} onPress={copy} activeOpacity={0.7}>
              <Ionicons name="copy" size={14} color="#38BDF8" />
              <Text style={styles.copyText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Share CTA */}
        <TouchableOpacity style={styles.shareCta} activeOpacity={0.85} onPress={() => Alert.alert('Share', 'Share sheet coming soon.')}>
          <Ionicons name="share" size={18} color="#0A0A0C" />
          <Text style={styles.shareCtaText}>Share invite link</Text>
        </TouchableOpacity>

        {/* Rewards list */}
        <Text style={styles.sectionLabel}>Rewards</Text>
        <View style={styles.rewardsCard}>
          {rewards.map((r, i) => (
            <View key={i}>
              <View style={styles.rewardRow}>
                <View style={[styles.rewardIcon, r.earned && styles.rewardIconEarned]}>
                  <Ionicons name={r.icon as any} size={18} color={r.earned ? '#4ADE80' : '#38BDF8'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rewardLabel}>{r.label}</Text>
                  <Text style={styles.rewardSub}>{r.sub}</Text>
                </View>
                <View style={[styles.rewardBadge, r.earned && styles.rewardBadgeEarned]}>
                  <Text style={[styles.rewardBadgeText, r.earned && styles.rewardBadgeTextEarned]}>
                    {r.earned ? '\u2713 Earned' : r.value}
                  </Text>
                </View>
              </View>
              {i < rewards.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* How it works */}
        <Text style={styles.sectionLabel}>How referrals work</Text>
        <View style={styles.stepsCard}>
          {[
            'Share your code or invite link with a friend',
            'They sign up and verify their identity',
            'They complete their first transfer',
            'You both get $5 USDT credited instantly',
          ].map((step, i) => (
            <View key={i}>
              <View style={styles.stepRow}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNum}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
              {i < 3 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#FFFFFF' },

  summaryCard: {
    flexDirection: 'row', backgroundColor: '#17171A', borderRadius: 16,
    marginHorizontal: 20, marginBottom: 16, padding: 20,
  },
  summaryLeft: { flex: 1 },
  summaryRight: { flex: 1, alignItems: 'flex-end' },
  summaryLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.58)' },
  summaryValue: { fontFamily: 'Inter_700Bold', fontSize: 28, color: '#38BDF8', marginTop: 4, fontVariant: ['tabular-nums'] },

  codeCard: {
    backgroundColor: '#17171A', borderRadius: 16,
    marginHorizontal: 20, padding: 16, marginBottom: 12,
  },
  codeTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  codeIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(56,189,248,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  codeTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#FFFFFF' },
  codeSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.58)', marginTop: 2 },
  codeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#0A0A0C', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  code: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#FFFFFF', letterSpacing: 1, fontVariant: ['tabular-nums'] },
  copyPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(56,189,248,0.12)', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  copyText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#38BDF8' },

  shareCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#38BDF8', borderRadius: 999,
    paddingVertical: 16, marginHorizontal: 20, marginBottom: 8,
  },
  shareCtaText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#0A0A0C' },

  sectionLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.58)',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
  },
  rewardsCard: { backgroundColor: '#17171A', borderRadius: 16, marginHorizontal: 20, paddingHorizontal: 14 },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  rewardIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(56,189,248,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  rewardIconEarned: { backgroundColor: 'rgba(74,222,128,0.12)' },
  rewardLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFFFFF' },
  rewardSub: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.58)', marginTop: 2, lineHeight: 16 },
  rewardBadge: {
    backgroundColor: 'rgba(56,189,248,0.12)', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  rewardBadgeEarned: { backgroundColor: 'rgba(74,222,128,0.12)' },
  rewardBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#38BDF8' },
  rewardBadgeTextEarned: { color: '#4ADE80' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },

  stepsCard: { backgroundColor: '#17171A', borderRadius: 16, marginHorizontal: 20, paddingHorizontal: 14 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(56,189,248,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  stepNum: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#38BDF8' },
  stepText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, color: '#FFFFFF', lineHeight: 19 },
});
