import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { QupayLogo, GradientAvatar, BottomSheet } from '../../components';
import { shadows } from '../../theme/spacing';
import { userProfile } from '../../data/mockData';

type Props = { navigation: any };

const recentContacts = [
  { name: 'Emeka', initials: 'EJ', fullName: 'Emeka Johnson', colors: ['#1a6fff', '#38BDF8'] as [string, string], method: 'OPay', phone: '0812 456 7890', flag: '\u{1F1F3}\u{1F1EC}', amount: 200 },
  { name: 'Adaeze', initials: 'AO', fullName: 'Adaeze Obi', colors: ['#a855f7', '#1a6fff'] as [string, string], method: 'GTBank', phone: '\u00B7\u00B7\u00B7\u00B7 4521', flag: '\u{1F1F3}\u{1F1EC}', amount: 100 },
  { name: 'Kofi', initials: 'KM', fullName: 'Kofi Mensah', colors: ['#FFE55C', '#38BDF8'] as [string, string], method: 'MTN Momo', phone: '0541 234 567', flag: '\u{1F1EC}\u{1F1ED}', amount: 50 },
  { name: 'Chidi', initials: 'CN', fullName: 'Chidi Nwosu', colors: ['#EF4444', '#FFD60A'] as [string, string], method: 'PalmPay', phone: '0813 456 7890', flag: '\u{1F1F3}\u{1F1EC}', amount: 30 },
];

export interface DestInfo {
  flag: string;
  name: string;
  code: string;
  symbol: string;
  rate: number;
  providers: string;
}

const destinationList: DestInfo[] = [
  { flag: '\u{1F1F3}\u{1F1EC}', name: 'Nigeria', code: 'NGN', symbol: '\u20A6', rate: 1645, providers: 'OPay \u00B7 GTBank \u00B7 PalmPay \u00B7 Kuda' },
  { flag: '\u{1F1EC}\u{1F1ED}', name: 'Ghana', code: 'GHS', symbol: '\u20B5', rate: 13.8, providers: 'MTN Momo \u00B7 Vodafone Cash \u00B7 AirtelTigo' },
  { flag: '\u{1F1F0}\u{1F1EA}', name: 'Kenya', code: 'KES', symbol: 'KSh', rate: 143, providers: 'M-Pesa \u00B7 Airtel Money \u00B7 Bank' },
  { flag: '\u{1F1F5}\u{1F1ED}', name: 'Philippines', code: 'PHP', symbol: '\u20B1', rate: 58.5, providers: 'GCash \u00B7 Maya \u00B7 Bank' },
  { flag: '\u{1F1EE}\u{1F1F3}', name: 'India', code: 'INR', symbol: '\u20B9', rate: 83.2, providers: 'UPI \u00B7 Bank transfer' },
  { flag: '\u{1F1F5}\u{1F1F0}', name: 'Pakistan', code: 'PKR', symbol: '\u20A8', rate: 278, providers: 'EasyPaisa \u00B7 JazzCash \u00B7 Bank' },
];

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedDest, setSelectedDest] = useState(destinationList[0]);
  const [showCorridorSheet, setShowCorridorSheet] = useState(false);

  const greeting = useCallback(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <QupayLogo size={22} />
          <TouchableOpacity
            onPress={() => {
              const parent = navigation.getParent();
              if (parent) parent.navigate('ProfileTab');
            }}
            activeOpacity={0.8}
          >
            <GradientAvatar initials={userProfile.initials} size={38} />
          </TouchableOpacity>
        </View>

        {/* Hero card */}
        <View style={styles.heroWrap}>
          <LinearGradient
            colors={['#17171A', '#0A0A0C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={styles.heroName}>
              {greeting()}, {userProfile.name} {'\u{1F44B}'}
            </Text>
            <TouchableOpacity
              style={styles.corridorBtn}
              onPress={() => setShowCorridorSheet(true)}
              activeOpacity={0.7}
            >
              <View style={styles.corridorFlags}>
                <Text style={styles.flagText}>{'\u{1F1F8}\u{1F1EC}'}</Text>
                <Text style={styles.arrowGreen}>{'\u2192'}</Text>
                <Text style={styles.flagText}>{selectedDest.flag}</Text>
              </View>
              <Text style={styles.corridorName}>
                Singapore {'\u2192'} {selectedDest.name}
              </Text>
              <Text style={styles.cbRate}>
                {selectedDest.symbol}
                {selectedDest.rate.toLocaleString()}/USDT
              </Text>
              <Text style={styles.tapText}>tap to change</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Send Money button */}
        <TouchableOpacity
          style={[styles.sendBtn, shadows.ctaGlow]}
          onPress={() => {
            const rootNav = navigation.getParent()?.getParent();
            if (rootNav) {
              rootNav.navigate('SendFlow' as never, {
                screen: 'Recipient',
                params: { dest: selectedDest },
              } as never);
            }
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-forward" size={20} color="#0A0A0C" />
          <Text style={styles.sendBtnText}>Send Money</Text>
        </TouchableOpacity>

        {/* Send again */}
        <Text style={styles.sectionLabel}>Send again</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentsScroll}
        >
          {recentContacts.map((c) => (
            <TouchableOpacity
              key={c.initials}
              style={styles.recentItem}
              onPress={() => {
                const rootNav = navigation.getParent()?.getParent();
                if (rootNav) {
                  rootNav.navigate('SendFlow' as never, {
                    screen: 'Amount',
                    params: {
                      recipientName: c.fullName,
                      recipientInitials: c.initials,
                      recipientColors: c.colors,
                      recipientMethod: c.method,
                      recipientPhone: c.phone,
                      recipientFlag: c.flag,
                      lastAmount: c.amount,
                      dest: selectedDest,
                    },
                  } as never);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.avRing}>
                <GradientAvatar
                  initials={c.initials}
                  size={46}
                  colors={c.colors}
                />
              </View>
              <Text style={styles.recentName}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Corridor picker sheet */}
      <BottomSheet
        visible={showCorridorSheet}
        onClose={() => setShowCorridorSheet(false)}
        title="Send to"
      >
        <Text style={styles.corrFromLabel}>
          From{' '}
          <Text style={styles.corrFromVal}>
            Singapore {'\u{1F1F8}\u{1F1EC}'}
          </Text>
        </Text>
        {destinationList.map((d) => (
          <TouchableOpacity
            key={d.name}
            style={[
              styles.cpItem,
              selectedDest.name === d.name && styles.cpItemSel,
            ]}
            onPress={() => {
              setSelectedDest(d);
              setShowCorridorSheet(false);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.cpFlag}>{d.flag}</Text>
            <View style={styles.cpInfo}>
              <Text style={styles.cpName}>{d.name}</Text>
              <Text style={styles.cpSub}>
                {d.symbol}
                {d.rate.toLocaleString()}/USDT {'\u00B7'} {d.providers}
              </Text>
            </View>
            {selectedDest.name === d.name && (
              <Text style={styles.cpCheck}>{'\u2713'}</Text>
            )}
          </TouchableOpacity>
        ))}
        <View style={{ height: 40 }} />
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  heroWrap: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.12)',
  },
  hero: {
    padding: 20,
  },
  heroName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    letterSpacing: -0.3,
    color: '#FFFFFF',
    marginBottom: 14,
  },
  corridorBtn: {
    backgroundColor: 'rgba(56,189,248,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.1)',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  corridorFlags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  flagText: { fontSize: 16 },
  arrowGreen: { color: '#38BDF8', fontSize: 14 },
  corridorName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  cbRate: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#38BDF8',
    marginLeft: 'auto',
    fontVariant: ['tabular-nums'],
  },
  tapText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
  sendBtn: {
    marginHorizontal: 20,
    marginBottom: 24,
    paddingVertical: 18,
    backgroundColor: '#38BDF8',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  sendBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    color: '#0A0A0C',
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.6)',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  recentsScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  recentItem: {
    alignItems: 'center',
    width: 60,
  },
  avRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  recentName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },
  corrFromLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  corrFromVal: {
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  cpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  cpItemSel: {
    backgroundColor: 'rgba(56,189,248,0.12)',
  },
  cpFlag: { fontSize: 24, width: 32, textAlign: 'center' },
  cpInfo: { flex: 1 },
  cpName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  cpSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 1,
  },
  cpCheck: {
    fontSize: 16,
    color: '#38BDF8',
    fontFamily: 'Inter_700Bold',
  },
});
