// SettingsScreen — heavily influenced by /qupay/src/screens/profile/QupayProfileScreen.tsx
// Local Profile layout: soft mint glow backdrop, big identity hero (circular avatar
// + name + handle + email), lifetime stats card, sectioned link cards with
// icon-circle rows, red soft sign-out pill, version footer.
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '../../components/Icon';
import { Avatar } from '../../components';
import { userProfile } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';

const Stat: React.FC<{ label: string; value: string; emphasis?: boolean }> = ({
  label,
  value,
  emphasis,
}) => (
  <View style={styles.stat}>
    <Text style={[styles.statValue, emphasis && styles.statValueEmphasis]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const LinkRow: React.FC<{
  icon: string;
  label: string;
  sub: string;
  onPress?: () => void;
  rightSwitch?: { value: boolean; onChange: (v: boolean) => void };
}> = ({ icon, label, sub, onPress, rightSwitch }) => (
  <TouchableOpacity
    style={styles.link}
    activeOpacity={rightSwitch ? 1 : 0.6}
    onPress={onPress}
    disabled={!!rightSwitch}
  >
    <View style={styles.linkIcon}>
      <Ionicons name={icon} size={18} color="#38BDF8" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.linkLabel}>{label}</Text>
      <Text style={styles.linkSub}>{sub}</Text>
    </View>
    {rightSwitch ? (
      <Switch
        value={rightSwitch.value}
        onValueChange={rightSwitch.onChange}
        trackColor={{ false: '#26262A', true: '#38BDF8' }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#26262A"
      />
    ) : (
      <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.42)" />
    )}
  </TouchableOpacity>
);

const Divider: React.FC = () => <View style={styles.divider} />;

export const ProfileScreen: React.FC<{ navigation?: any }> = () => {
  const nav = useNavigation<any>();
  const [notifOn, setNotifOn] = useState(true);
  const [biometricOn, setBiometricOn] = useState(true);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const go = (screen: string) => nav.navigate(screen as never);

  const goPinReset = () => {
    try {
      nav.getParent()?.navigate('PinReset' as never);
    } catch {
      Alert.alert('Transaction PIN', 'Navigate to PinReset failed.');
    }
  };

  const displayName = user ? `${user.firstName} ${user.lastName}` : userProfile.name;
  const displayEmail = user?.email || userProfile.email;
  const displayPhone = user?.phoneNumber || userProfile.phone;
  const handle = '@' + (displayName?.split(' ')[0] || 'you').toLowerCase();
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : userProfile.initials;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Soft mint glow backdrop */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(56,189,248,0.16)', 'rgba(56,189,248,0)']}
        style={styles.glow}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Identity hero */}
        <View style={styles.identity}>
          <View style={styles.bigAvatar}>
            <Avatar seed={displayName || 'qupay user'} initials={initials} size={96} />
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.handle}>{handle}</Text>
          <Text style={styles.email}>{displayEmail}</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => Alert.alert('Edit profile', 'Coming soon.')}>
            <Text style={styles.editProfileLink}>Edit profile</Text>
          </TouchableOpacity>

          {/* Verified pill */}
          <View style={styles.verifiedPill}>
            <Ionicons name="shield-checkmark" size={13} color="#38BDF8" />
            <Text style={styles.verifiedText}>Verified · Phone, ID, Address</Text>
          </View>
        </View>

        {/* Lifetime stats card */}
        <View style={styles.statsRow}>
          <Stat label="Total sent" value={`$${userProfile.totalSent.toLocaleString()}`} emphasis />
          <View style={styles.statDivider} />
          <Stat label="Transfers" value={String(userProfile.totalTransfers)} />
          <View style={styles.statDivider} />
          <Stat label="Member" value="Nov '25" />
        </View>

        {/* Account section */}
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.linksCard}>
          <LinkRow
            icon="person"
            label="Personal info"
            sub={displayPhone || 'Add your details'}
            onPress={() => go('PersonalInfo')}
          />
          <Divider />
          <LinkRow
            icon="card"
            label="Wallets & cards"
            sub="Linked payout sources"
            onPress={() => go('Wallets')}
          />
          <Divider />
          <LinkRow
            icon="business"
            label="Linked banks"
            sub="3 banks saved"
            onPress={() => go('Wallets')}
          />
          <Divider />
          <LinkRow
            icon="people"
            label="Recipients"
            sub="Saved beneficiaries"
            onPress={() => go('Recipients')}
          />
        </View>

        {/* Security section */}
        <Text style={styles.sectionLabel}>Security</Text>
        <View style={styles.linksCard}>
          <LinkRow
            icon="lock-closed"
            label="Transaction PIN"
            sub="Change your 4-digit PIN"
            onPress={goPinReset}
          />
          <Divider />
          <LinkRow
            icon="shield-checkmark"
            label="Biometrics"
            sub="Face ID for quick approvals"
            rightSwitch={{ value: biometricOn, onChange: setBiometricOn }}
          />
          <Divider />
          <LinkRow
            icon="notifications"
            label="Notifications"
            sub="Push · SMS"
            rightSwitch={{ value: notifOn, onChange: setNotifOn }}
          />
        </View>

        {/* Preferences section */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.linksCard}>
          <LinkRow
            icon="options"
            label="Currency & language"
            sub="USD · English"
            onPress={() => go('CurrencyLanguage')}
          />
          <Divider />
          <LinkRow
            icon="trending-up"
            label="Rate alerts"
            sub="Get notified when your target hits"
            onPress={() => go('RateAlerts')}
          />
          <Divider />
          <LinkRow
            icon="gift"
            label="Invite friends"
            sub="Earn $5 when they send their first transfer"
            onPress={() => go('InviteFriends')}
          />
        </View>

        {/* Support section */}
        <Text style={styles.sectionLabel}>Support</Text>
        <View style={styles.linksCard}>
          <LinkRow
            icon="chatbubble-ellipses"
            label="Help & support"
            sub="Avg. response < 3 mins"
            onPress={() => go('HelpSupport')}
          />
          <Divider />
          <LinkRow
            icon="help-circle"
            label="FAQs"
            sub="Common questions"
            onPress={() => go('HelpSupport')}
          />
        </View>

        {/* Sign out pill */}
        <TouchableOpacity
          style={styles.signOutBtn}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={18} color="#EF4444" />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Qupay · v1.0 · Built non-custodially</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 360 },

  // Identity hero
  identity: { alignItems: 'center', paddingTop: 24, paddingBottom: 20 },
  bigAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
  },
  name: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
    color: '#FFFFFF',
    marginTop: 16,
    letterSpacing: -0.3,
  },
  handle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#38BDF8',
    marginTop: 4,
  },
  email: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.58)',
    marginTop: 2,
  },
  editProfileLink: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#38BDF8',
    marginTop: 6,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(56,189,248,0.12)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 12,
  },
  verifiedText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#38BDF8',
  },

  // Lifetime stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#17171A',
    borderRadius: 16,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 8,
  },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  statValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  statValueEmphasis: { color: '#38BDF8' },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.58)',
    marginTop: 4,
  },

  // Section headers
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.58)',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },

  // Link cards
  linksCard: {
    backgroundColor: '#17171A',
    borderRadius: 16,
    marginHorizontal: 20,
    paddingHorizontal: 12,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(56,189,248,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  linkSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.58)',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginLeft: 48,
  },

  // Sign out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderRadius: 999,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginTop: 24,
  },
  signOutText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#EF4444',
  },
  versionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.42)',
    textAlign: 'center',
    marginTop: 16,
  },
});
