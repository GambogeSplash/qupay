// TransactionDetailScreen — heavily influenced by /qupay/src/screens/remittance/ReceiptScreen.tsx
// Local Receipt layout: soft mint glow, hero check circle, 42pt amount,
// recipient summary card, details card with row/divider pattern, quick actions
// card with icon-circle rows, two-CTA footer (primary mint pill + ghost pill).
// Status-aware: delivered = mint, pending = blue, failed = red, disputed = yellow.
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '../../components/Icon';
import { Avatar, BankLogo, CryptoIcon } from '../../components';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HistoryStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<HistoryStackParamList, 'TransferDetail'>;
type TransferStatus = 'delivered' | 'pending' | 'failed' | 'disputed';

interface StatusConfig {
  label: string;
  color: string;
  glow: [string, string];
  icon: string;
  showSendAgain: boolean;
}

const STATUS: Record<TransferStatus, StatusConfig> = {
  delivered: {
    label: 'Delivered',
    color: '#38BDF8',
    glow: ['rgba(56,189,248,0.18)', 'rgba(56,189,248,0)'],
    icon: 'checkmark',
    showSendAgain: true,
  },
  pending: {
    label: 'In progress',
    color: '#38BDF8',
    glow: ['rgba(56,189,248,0.18)', 'rgba(56,189,248,0)'],
    icon: 'time',
    showSendAgain: false,
  },
  failed: {
    label: 'Refunded',
    color: '#EF4444',
    glow: ['rgba(239,68,68,0.18)', 'rgba(239,68,68,0)'],
    icon: 'close',
    showSendAgain: false,
  },
  disputed: {
    label: 'Disputed',
    color: '#FFD60A',
    glow: ['rgba(255,214,10,0.18)', 'rgba(255,214,10,0)'],
    icon: 'alert-circle',
    showSendAgain: false,
  },
};

const Row: React.FC<{ label: string; value: string; mono?: boolean; emphasis?: boolean }> = ({
  label,
  value,
  mono,
  emphasis,
}) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text
      style={[
        styles.rowValue,
        mono && styles.rowValueMono,
        emphasis && styles.rowValueEmphasis,
      ]}
    >
      {value}
    </Text>
  </View>
);

const Divider: React.FC = () => <View style={styles.divider} />;

const ActionRow: React.FC<{
  icon: string;
  label: string;
  sub: string;
  onPress: () => void;
}> = ({ icon, label, sub, onPress }) => (
  <TouchableOpacity style={styles.actionRow} activeOpacity={0.6} onPress={onPress}>
    <View style={styles.actionIcon}>
      <Ionicons name={icon} size={18} color="#38BDF8" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.actionLabel}>{label}</Text>
      <Text style={styles.actionSub}>{sub}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.42)" />
  </TouchableOpacity>
);

export const TransactionDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const status = (route.params?.status as TransferStatus) || 'delivered';
  const config = STATUS[status];

  // Mock data — kept consistent with HistoryScreen seed
  const recipientName = 'Emeka Johnson';
  const firstName = recipientName.split(' ')[0];
  const method = 'OPay';
  const country = 'Nigeria';
  const phone = '0812 456 7890';

  const sendAgain = () => navigation.goBack();
  const goHome = () => navigation.goBack();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Soft glow on hero */}
      <LinearGradient
        pointerEvents="none"
        colors={config.glow}
        style={styles.glow}
      />

      {/* Header bar — close X only, no back arrow */}
      <View style={styles.headerBar}>
        <View style={styles.iconBtn} />
        <Text style={styles.headerTitle}>Receipt</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={goHome} activeOpacity={0.7}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Hero — big check circle, label, amount, sub */}
        <View style={styles.hero}>
          <View style={[styles.checkCircle, { backgroundColor: config.color + '22' }]}>
            <Ionicons name={config.icon} size={48} color={config.color} />
          </View>
          <Text style={[styles.heroLabel, { color: config.color }]}>{config.label}</Text>
          <Text style={styles.heroAmount}>{'\u20A6'}329,000</Text>
          <Text style={styles.heroSub}>to {recipientName}</Text>
        </View>

        {/* Recipient summary card with status pill on the right */}
        <View style={styles.recipientCard}>
          <Avatar seed={recipientName} initials="EJ" size={44} bankBadge={method} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.recipientName}>{recipientName}</Text>
            <Text style={styles.recipientSub}>
              {method} {'\u00B7'} {country}
            </Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: config.color + '22' }]}>
            <View style={[styles.statusDot, { backgroundColor: config.color }]} />
            <Text style={[styles.statusPillText, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>

        {/* Details card */}
        <View style={styles.detailsCard}>
          {/* You sent — token icon with Polygon network badge */}
          <View style={styles.sentRow}>
            <Text style={styles.rowLabel}>You sent</Text>
            <View style={styles.sentValueWrap}>
              <CryptoIcon token="USDT" network="Polygon" size={22} ringColor="#17171A" />
              <Text style={styles.sentValueText}>200 USDT</Text>
            </View>
          </View>
          <Divider />
          <Row label="They received" value={'\u20A6329,000'} emphasis />
          <Divider />
          <Row label="Rate" value={'1 USDT = \u20A61,645'} />
          <Divider />
          <Row label="Fee" value={'\u20A63,290 (0.98%)'} />
          <Divider />
          <Row label="Network" value="Polygon (PoS)" />
          <Divider />
          <Row label="Delivered in" value="4m 11s" />
          <Divider />
          <Row label="Delivered at" value={'21 Mar 2026 \u00B7 09:41 SGT'} />
          <Divider />
          <TouchableOpacity activeOpacity={0.6}>
            <Row label="Reference" value="QP-2026-0384-7821" mono />
          </TouchableOpacity>
        </View>

        {/* Bank logo strip — cash-out provider context */}
        <View style={styles.providerCard}>
          <BankLogo name={method} size={36} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.providerLabel}>Cashed out via</Text>
            <Text style={styles.providerName}>{method} {'\u00B7'} {phone}</Text>
          </View>
          <Ionicons name="checkmark-circle" size={18} color={config.color} />
        </View>

        {/* Quick actions card */}
        <View style={styles.actionsCard}>
          <ActionRow
            icon="cloud-download"
            label="Save receipt"
            sub="Download a PDF copy"
            onPress={() => {}}
          />
          <Divider />
          <ActionRow
            icon="share"
            label="Share with recipient"
            sub="Send a link with delivery details"
            onPress={() => {}}
          />
          <Divider />
          <ActionRow
            icon="trending-up"
            label="Watch this rate"
            sub="Get notified when USD/NGN hits your target"
            onPress={() => {}}
          />
          <Divider />
          <ActionRow
            icon="time"
            label="Make this recurring"
            sub={`Send 200 USDT to ${firstName} every month`}
            onPress={() => {}}
          />
        </View>
      </ScrollView>

      {/* Footer CTAs */}
      <View style={styles.footer}>
        {config.showSendAgain && (
          <TouchableOpacity style={styles.ctaPrimary} onPress={sendAgain} activeOpacity={0.85}>
            <Ionicons name="send" size={18} color="#0A0A0C" />
            <Text style={styles.ctaPrimaryText}>Send to {firstName} again</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.ctaSecondary} onPress={goHome} activeOpacity={0.85}>
          <Text style={styles.ctaSecondaryText}>Back to home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 320 },

  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
  },

  // Hero
  hero: { alignItems: 'center', paddingTop: 8, paddingBottom: 24 },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    marginTop: 16,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  heroAmount: {
    fontFamily: 'Inter_700Bold',
    fontSize: 42,
    color: '#FFFFFF',
    marginTop: 6,
    letterSpacing: -0.8,
  },
  heroSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.58)',
    marginTop: 4,
  },

  // Recipient summary card
  recipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#17171A',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 20,
  },
  recipientName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  recipientSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.58)',
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },

  // Details card
  detailsCard: {
    backgroundColor: '#17171A',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.58)',
  },
  rowValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  rowValueMono: {
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.3,
  },
  rowValueEmphasis: {
    color: '#38BDF8',
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  // "You sent" row — left label, right token icon + amount
  sentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sentValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sentValueText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },

  // Provider strip
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#17171A',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 12,
  },
  providerLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.58)',
  },
  providerName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
    marginTop: 1,
  },

  // Actions card
  actionsCard: {
    backgroundColor: '#17171A',
    borderRadius: 16,
    paddingHorizontal: 12,
    marginHorizontal: 20,
    marginTop: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(56,189,248,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  actionSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.58)',
    marginTop: 2,
  },

  // Footer CTAs
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    gap: 8,
  },
  ctaPrimary: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#38BDF8',
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPrimaryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#0A0A0C',
  },
  ctaSecondary: {
    backgroundColor: '#1F1F23',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaSecondaryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
