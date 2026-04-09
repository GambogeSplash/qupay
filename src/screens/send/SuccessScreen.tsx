// SuccessScreen — clean delivery confirmation. Two actions: view receipt, done.
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import { CTAButton, Avatar } from '../../components';
import { CommonActions } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SendFlowParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<SendFlowParamList, 'Success'>;

const currencySymbols: Record<string, string> = {
  USDT: '', NGN: '\u20A6', GHS: '\u20B5', KES: 'KSh', INR: '\u20B9', PHP: '\u20B1', PKR: 'Rs',
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

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, damping: 10, stiffness: 180, mass: 0.8, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const goReceipt = () => {
    // Navigate to receipt first, then reset send stack in background
    const root = navigation.getParent()?.getParent();
    if (root) {
      root.navigate('ActivityTab', {
        screen: 'TransferDetail',
        params: { transferId: '1', status: 'delivered' },
      });
      // Reset send stack after a delay so it's clean when user returns
      setTimeout(() => {
        try {
          navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Recipient' }] }));
        } catch {}
      }, 500);
    }
  };

  const goDone = () => {
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Recipient' }] })
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Avatar + animated check overlay */}
        <View style={styles.avatarWrap}>
          <Avatar seed={recipientName} size={72} />
          <Animated.View style={[styles.checkBadge, { transform: [{ scale: scaleAnim }] }]}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          </Animated.View>
        </View>

        <Animated.View style={[styles.textWrap, { opacity: fadeAnim }]}>
          <Text style={styles.amount}>{symbol}{receiveAmount.toLocaleString()}</Text>
          <Text style={styles.deliveredLabel}>Delivered to {firstName}</Text>
          <Text style={styles.sub}>via {recipientMethod} · {amount} {route.params?.sendCurrency || 'USDT'} sent</Text>
        </Animated.View>
      </View>

      {/* Two CTAs only — clean */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <CTAButton title="View receipt" onPress={goReceipt} ghost />
        <CTAButton title="Done" onPress={goDone} />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },

  avatarWrap: { position: 'relative', marginBottom: 24 },
  checkBadge: {
    position: 'absolute', bottom: -4, right: -4,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#4ADE80',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#0A0A0C',
  },

  textWrap: { alignItems: 'center' },
  amount: {
    fontFamily: 'Inter_700Bold', fontSize: 40, color: '#FFFFFF',
    letterSpacing: -1, fontVariant: ['tabular-nums'],
  },
  deliveredLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#4ADE80', marginTop: 8,
  },
  sub: {
    fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.58)',
    textAlign: 'center', marginTop: 6,
  },

  footer: { paddingHorizontal: 20, paddingBottom: 24, gap: 8 },
});
