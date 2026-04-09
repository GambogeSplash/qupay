import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QupayLogo, Numpad } from '../../components';
import { verifyPin, initiatePinReset } from '../../api/auth';
import { isApiError } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PinVerify'>;

const PIN_LENGTH = 4;

export const PinVerifyScreen: React.FC<Props> = ({ navigation }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setPinLocked = useAuthStore((state) => state.setPinLocked);
  const user = useAuthStore((state) => state.user);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handleKey = useCallback((key: string) => {
    setError(null);
    if (key === 'del') {
      setPin((prev) => prev.slice(0, -1));
    } else if (pin.length < PIN_LENGTH) {
      setPin((prev) => prev + key);
    }
  }, [pin]);

  const handleVerify = useCallback(async () => {
    if (pin.length !== PIN_LENGTH) return;
    setLoading(true);

    try {
      const response = await verifyPin({ pin });
      if (__DEV__) console.log('🔐 [PinVerify] Response:', response);
      if (response.valid) {
        setPinLocked(false);
      } else {
        setError('Incorrect PIN');
        setPin('');
        shake();
      }
    } catch (err) {
      if (__DEV__) console.error('PIN verify error:', err);
      const message = isApiError(err) ? err.message : 'Verification failed';
      setError(message);
      setPin('');
      shake();
    } finally {
      setLoading(false);
    }
  }, [pin, setPinLocked, shake]);

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      handleVerify();
    }
  }, [pin, handleVerify]);

  const handleForgotPin = useCallback(async () => {
    setResetting(true);
    try {
      const response = await initiatePinReset();
      if (__DEV__) console.log('🔐 [PinVerify] Reset initiated:', response);
      navigation.navigate('PinReset', { cooldownSeconds: response.cooldownSeconds });
    } catch (err) {
      if (__DEV__) console.error('PIN reset initiate error:', err);
      const message = isApiError(err) ? err.message : 'Failed to initiate PIN reset';
      Alert.alert('Error', message);
    } finally {
      setResetting(false);
    }
  }, [navigation]);

  const firstName = user?.firstName || 'there';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <QupayLogo size={22} />
          <View style={{ height: 28 }} />
          <Text style={styles.headline}>
            Welcome back,{'\n'}
            <Text style={styles.greenText}>{firstName}</Text>
          </Text>
          <Text style={styles.desc}>Enter your PIN to continue</Text>
        </View>

        <Animated.View style={[styles.pinArea, { transform: [{ translateX: shakeAnim }] }]}>
          <View style={styles.dotsRow}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  pin.length > i && styles.dotFilled,
                  error && styles.dotError,
                ]}
              />
            ))}
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
          {loading && <Text style={styles.loadingText}>Verifying...</Text>}
        </Animated.View>

        <View style={styles.bottom}>
          <Numpad onKey={handleKey} />
          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={handleForgotPin}
            disabled={resetting}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>
              {resetting ? 'Please wait...' : 'Forgot PIN?'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  container: { flex: 1, justifyContent: 'space-between' },
  header: { paddingHorizontal: 28, paddingTop: 36 },
  headline: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
    letterSpacing: -0.3,
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 31,
  },
  greenText: { color: '#38BDF8' },
  desc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 21,
  },
  pinArea: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  dotError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#EF4444',
    marginTop: 16,
  },
  loadingText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 16,
  },
  bottom: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  forgotBtn: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  forgotText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#38BDF8',
  },
});
