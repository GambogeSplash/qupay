import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QupayLogo, CTAButton, Numpad } from '../../components';
import { completePinReset, resendOtp, getProfile } from '../../api/auth';
import { isApiError } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PinReset'>;

const OTP_LENGTH = 6;
const PIN_LENGTH = 4;

type Step = 'otp' | 'newPin' | 'confirmPin';

export const PinResetScreen: React.FC<Props> = ({ route, navigation }) => {
  const { cooldownSeconds: initialCooldown } = route.params;
  const [step, setStep] = useState<Step>('otp');
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(initialCooldown);

  const setUser = useAuthStore((state) => state.setUser);
  const setPinLocked = useAuthStore((state) => state.setPinLocked);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const currentValue = step === 'otp' ? otp : step === 'newPin' ? newPin : confirmPin;
  const currentLength = step === 'otp' ? OTP_LENGTH : PIN_LENGTH;
  const setCurrentValue = step === 'otp' ? setOtp : step === 'newPin' ? setNewPin : setConfirmPin;

  const handleKey = useCallback((key: string) => {
    setError(null);
    if (key === 'del') {
      setCurrentValue((prev) => prev.slice(0, -1));
    } else if (currentValue.length < currentLength) {
      setCurrentValue((prev) => prev + key);
    }
  }, [currentValue, currentLength, setCurrentValue]);

  const handleResend = useCallback(async () => {
    if (resendTimer > 0 || !user?.email) return;
    try {
      const response = await resendOtp({
        email: user.email,
        purpose: 'PIN_RESET',
      });
      setResendTimer(response.cooldownSeconds);
      setOtp('');
      setError(null);
    } catch (err) {
      const message = isApiError(err) ? err.message : 'Failed to resend code';
      Alert.alert('Error', message);
    }
  }, [resendTimer, user?.email]);

  const handleContinue = useCallback(async () => {
    if (step === 'otp') {
      if (otp.length !== OTP_LENGTH) return;
      setStep('newPin');
      return;
    }

    if (step === 'newPin') {
      if (newPin.length !== PIN_LENGTH) return;
      setStep('confirmPin');
      return;
    }

    if (confirmPin !== newPin) {
      setError('PINs do not match');
      setConfirmPin('');
      return;
    }

    setLoading(true);
    try {
      await completePinReset({ otp, newPin });
      const profile = await getProfile();
      setUser(profile);
      setPinLocked(false);
      Alert.alert('Success', 'Your PIN has been reset successfully.', [
        { text: 'OK' },
      ]);
    } catch (err) {
      if (__DEV__) console.error('PIN reset error:', err);
      const message = isApiError(err) ? err.message : 'Failed to reset PIN';
      setError(message);
      if (message.toLowerCase().includes('otp') || message.toLowerCase().includes('code')) {
        setStep('otp');
        setOtp('');
        setNewPin('');
        setConfirmPin('');
      }
    } finally {
      setLoading(false);
    }
  }, [step, otp, newPin, confirmPin, setUser, setPinLocked]);

  const handleBack = useCallback(() => {
    if (step === 'confirmPin') {
      setStep('newPin');
      setConfirmPin('');
      setError(null);
    } else if (step === 'newPin') {
      setStep('otp');
      setNewPin('');
      setError(null);
    } else {
      navigation.goBack();
    }
  }, [step, navigation]);

  const getHeadline = () => {
    switch (step) {
      case 'otp':
        return 'Enter the code';
      case 'newPin':
        return 'Create new PIN';
      case 'confirmPin':
        return 'Confirm PIN';
    }
  };

  const getDescription = () => {
    switch (step) {
      case 'otp':
        return `We sent a 6-digit code to ${user?.email}`;
      case 'newPin':
        return 'Set a new 4-digit PIN to secure your account';
      case 'confirmPin':
        return 'Enter your new PIN again to confirm';
    }
  };

  const isComplete = currentValue.length === currentLength;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <QupayLogo size={22} />
          <View style={{ height: 28 }} />
          <Text style={styles.headline}>
            {getHeadline().split(' ').slice(0, -1).join(' ')}{'\n'}
            <Text style={styles.greenText}>{getHeadline().split(' ').slice(-1)}</Text>
          </Text>
          <Text style={styles.desc}>{getDescription()}</Text>
        </View>

        <View style={styles.pinArea}>
          <View style={styles.dotsRow}>
            {Array.from({ length: currentLength }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  currentValue.length > i && styles.dotFilled,
                  error && styles.dotError,
                ]}
              />
            ))}
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}

          {step === 'otp' && (
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>
                Didn't get it?{' '}
                <Text
                  style={[styles.resendLink, resendTimer > 0 && styles.resendLinkDisabled]}
                  onPress={handleResend}
                >
                  Resend
                </Text>
                {resendTimer > 0 && (
                  <Text style={styles.resendTimer}>
                    {' '}· 0:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
                  </Text>
                )}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottom}>
          <Numpad onKey={handleKey} />
          <View style={styles.btnRow}>
            <CTAButton
              title="Back"
              onPress={handleBack}
              ghost
              style={styles.btn}
            />
            <CTAButton
              title={step === 'confirmPin' ? 'Reset PIN' : 'Continue'}
              onPress={handleContinue}
              disabled={!isComplete}
              loading={loading}
              style={styles.btn}
            />
          </View>
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
    gap: 16,
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
  resendRow: {
    marginTop: 20,
  },
  resendText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  resendLink: {
    color: '#38BDF8',
    fontFamily: 'Inter_600SemiBold',
  },
  resendLinkDisabled: {
    color: 'rgba(255,255,255,0.4)',
  },
  resendTimer: {
    color: 'rgba(255,255,255,0.4)',
  },
  bottom: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
  },
});
