import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import { ScreenHeader, SearchInput } from '../../components';

const quickActions = [
  { icon: 'chatbubble-ellipses', label: 'Live chat', sub: 'Avg. response < 3 mins', color: '#38BDF8' },
  { icon: 'alert-circle', label: 'File a dispute', sub: 'Unresolved transfer issue', color: '#FFD60A' },
];

const faqs = [
  { q: 'How long does a transfer take?', a: 'Most transfers arrive in under 2 minutes. Some corridors may take up to 5 minutes during peak hours.' },
  { q: 'What fees does Qupay charge?', a: 'Fees vary by corridor — typically 0.5–1.5%. The exact fee is shown before you confirm each transfer.' },
  { q: 'Is my money safe?', a: 'Qupay is non-custodial. Your funds are on-chain until the recipient\'s payout is confirmed. No one can access your wallet.' },
  { q: 'What if the recipient doesn\'t receive the money?', a: 'Contact support or file a dispute. Our team resolves disputes within 2 hours and funds are protected until resolved.' },
  { q: 'Which countries are supported?', a: 'We support sending from Singapore, UK, US, UAE and more — to 40+ countries including Nigeria, Ghana, Kenya, Philippines, India, and Pakistan.' },
  { q: 'How do I increase my sending limit?', a: 'Complete identity verification (KYC). Level 2 raises your monthly limit to $10,000; Level 3 to $50,000.' },
];

export const HelpSupportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  const filteredFaqs = query.trim()
    ? faqs.filter((f) => f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase()))
    : faqs;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Help & support" onBack={() => navigation.goBack()} />
      <View style={styles.searchWrap}>
        <SearchInput value={query} onChangeText={setQuery} placeholder="Search help topics" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Quick actions */}
        <View style={styles.actionsRow}>
          {quickActions.map((a) => (
            <TouchableOpacity key={a.label} style={styles.actionCard} activeOpacity={0.7} onPress={() => Alert.alert(a.label, 'Coming soon.')}>
              <View style={[styles.actionIcon, { backgroundColor: a.color + '1A' }]}>
                <Ionicons name={a.icon} size={22} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
              <Text style={styles.actionSub}>{a.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ */}
        <Text style={styles.sectionLabel}>Frequently asked questions</Text>
        <View style={styles.faqCard}>
          {filteredFaqs.map((faq, i) => (
            <React.Fragment key={i}>
              <TouchableOpacity
                style={styles.faqRow}
                activeOpacity={0.7}
                onPress={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <Text style={styles.faqQ}>{faq.q}</Text>
                <Ionicons name={openIdx === i ? 'chevron-up' : 'chevron-down'} size={16} color="rgba(255,255,255,0.42)" />
              </TouchableOpacity>
              {openIdx === i && (
                <Text style={styles.faqA}>{faq.a}</Text>
              )}
              {i < filteredFaqs.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Legal */}
        <Text style={styles.sectionLabel}>Legal</Text>
        <View style={styles.legalCard}>
          {['Terms of service', 'Privacy policy', 'Licenses'].map((label, i) => (
            <React.Fragment key={label}>
              <TouchableOpacity style={styles.legalRow} activeOpacity={0.6}>
                <Text style={styles.legalText}>{label}</Text>
                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.42)" />
              </TouchableOpacity>
              {i < 2 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  searchWrap: { paddingHorizontal: 20, paddingBottom: 8 },
  actionsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginBottom: 8 },
  actionCard: { flex: 1, backgroundColor: '#17171A', borderRadius: 16, padding: 14, alignItems: 'center', gap: 8 },
  actionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#FFFFFF', textAlign: 'center' },
  actionSub: { fontFamily: 'Inter_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.58)', textAlign: 'center' },
  sectionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.58)', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  faqCard: { backgroundColor: '#17171A', borderRadius: 16, marginHorizontal: 20, paddingHorizontal: 16 },
  faqRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  faqQ: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#FFFFFF', flex: 1, marginRight: 12 },
  faqA: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.58)', lineHeight: 19, paddingBottom: 14 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  legalCard: { backgroundColor: '#17171A', borderRadius: 16, marginHorizontal: 20, paddingHorizontal: 16 },
  legalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  legalText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#FFFFFF' },
});
