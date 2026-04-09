import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import { ScreenHeader, Avatar, CTAButton } from '../../components';
import { userProfile } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);
const Divider = () => <View style={styles.divider} />;

export const PersonalInfoScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const name = user ? `${user.firstName} ${user.lastName}` : userProfile.name;
  const email = user?.email || userProfile.email;
  const phone = user?.phoneNumber || userProfile.phone;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Personal info" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.avatarWrap}>
          <Avatar seed={name} size={80} />
          <Text style={styles.editAvatar}>Tap to change</Text>
        </View>

        <Text style={styles.sectionLabel}>Details</Text>
        <View style={styles.card}>
          <Row label="Full name" value={name} />
          <Divider />
          <Row label="Email" value={email} />
          <Divider />
          <Row label="Phone" value={phone} />
          <Divider />
          <Row label="Country" value="Singapore" />
        </View>

        <Text style={styles.sectionLabel}>Verification</Text>
        <View style={styles.card}>
          <View style={styles.verRow}>
            <View style={[styles.verDot, { backgroundColor: '#4ADE80' }]} />
            <Text style={styles.verLabel}>Phone verified</Text>
          </View>
          <Divider />
          <View style={styles.verRow}>
            <View style={[styles.verDot, { backgroundColor: '#4ADE80' }]} />
            <Text style={styles.verLabel}>ID verified</Text>
          </View>
          <Divider />
          <View style={styles.verRow}>
            <View style={[styles.verDot, { backgroundColor: '#4ADE80' }]} />
            <Text style={styles.verLabel}>Address verified</Text>
          </View>
        </View>

        <CTAButton
          title="Edit profile"
          onPress={() => Alert.alert('Edit profile', 'Coming soon.')}
          ghost
          style={{ marginHorizontal: 20, marginTop: 20 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  avatarWrap: { alignItems: 'center', paddingVertical: 24 },
  editAvatar: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#38BDF8', marginTop: 10 },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.58)',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
  },
  card: {
    backgroundColor: '#17171A', borderRadius: 16,
    marginHorizontal: 20, paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14,
  },
  rowLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.58)' },
  rowValue: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#FFFFFF' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  verRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14 },
  verDot: { width: 8, height: 8, borderRadius: 4 },
  verLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#FFFFFF' },
});
