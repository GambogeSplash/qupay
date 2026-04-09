// SuccessScreen — delivery confirmation with animated checkmark.
// Consistent visual language: borderless cards, brand colors, Inter fonts.
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import { CTAButton } from '../../components';
import { CommonActions } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SendFlowParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<SendFlowParamList, 'Success'>;

const currencySymbols: Record<string, string> = {
  USDT: '', NGN: '\u20A6', GHS: '\u20B5', KES: 'KSh', INR: '\u20B9', PHP: '\u20B1', MXN: '$', PKR: 'Rs', ZAR: 'R',
};

export const SuccessScreen: React.FC<Props> = ({ navigation, route }) => {
  const {
    recipientName = 'Emeka Johnson',
    recipientMethod = 'OPay',
    amount = 200,
    receiveAmount = 329000,
    recvCurrency = 'NGN',
  } = route.params || {};

  const symbol = currencySymbols[recvCurrency] || '';
  const firstName = recipientName.split(' ')[0];

  const iconScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(iconScale, { toValue: 1, damping: 12, stiffness: 200, mass: 0.8, useNativeDriver: true }),
      Animated.timing(contentOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const goHome = () => {
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Amount' }] })
    );
  };

  const goReceipt = () => {
    // Navigate to History tab → TransferDetail
    const root = navigation.getParent()?.getParent();
    if (root) {
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Amount' }] }));
      setTimeout(() => {
        root.navigate('HistoryTab', { screen: 'TransferDetail', params: { transferId: '1', status: 'delivered' } });
      }, 100);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Animated check circle */}
        <Animated.View style={[styles.checkCircle, { transform: [{ scale: iconScale }] }]}>
          <Ionicons name="checkmark" size={48} color="#4ADE80" />
        </Animated.View>

        <Animated.View style={[styles.textArea, { opacity: contentOpacity }]}>
          <Text style={styles.title}>Delivered</Text>
          <Text style={styles.amount}>{symbol}{receiveAmount.toLocaleString()}</Text>
          <Text style={styles.sub}>
            {firstName} received {symbol}{receiveAmount.toLocaleString()} via {recipientMethod}
          </Text>
        </Animated.View>
      </View>

      {/* Bottom CTAs */}
      <Animated.View style={[styles.footer, { opacity: contentOpacity }]}>
        <TouchableOpacity style={styles.receiptBtn} onPress={goReceipt} activeOpacity={0.7}>
          <Ionicons name="document-text" size={16} color="#38BDF8" />
          <Text style={styles.receiptText}>View receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareBtn} onPress={() => {}} activeOpacity={0.7}>
          <Ionicons name="share" size={16} color="#38BDF8" />
          <Text style={styles.shareText}>Share with {firstName}</Text>
        </TouchableOpacity>

        <CTAButton title="Done" onPress={goHome} style={{ marginTop: 8 }} />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },

  checkCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(74,222,128,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },

  textArea: { alignItems: 'center', marginTop: 24 },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#4ADE80', letterSpacing: 0.3, textTransform: 'uppercase' },
  amount: {
    fontFamily: 'Inter_700Bold', fontSize: 42, color: '#FFFFFF',
    marginTop: 8, letterSpacing: -0.8, fontVariant: ['tabular-nums'],
  },
  sub: {
    fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.58)',
    textAlign: 'center', marginTop: 8, lineHeight: 20,
  },

  footer: { paddingHorizontal: 20, paddingBottom: 24, gap: 8 },
  receiptBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#17171A', borderRadius: 999, paddingVertical: 14,
  },
  receiptText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#38BDF8' },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#1F1F23', borderRadius: 999, paddingVertical: 14,
  },
  shareText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#38BDF8' },
});
