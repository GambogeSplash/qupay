import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QupayLogo, CTAButton } from '../../components';
import { completeRegistration, resendOtp, getProfile } from '../../api/auth';
import { isApiError } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OTP'>;

const OTP_LENGTH = 6;

export const OTPScreen: React.FC<Props> = ({ navigation, route }) => {
  const { phoneNumber, cooldownSeconds: initialCooldown, registrationPayload } = route.params;
  const [code, setCode] = useState('');
  const [resendTimer, setResendTimer] = useState(initialCooldown);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);

  const blinkAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0, duration: 500, easing: Easing.step0, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 500, easing: Easing.step0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [blinkAnim]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const handleCodeChange = useCallback((text: string) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    setCode(digits);
    setError(null);
  }, []);

  const handleResend = useCallback(async () => {
    if (resendTimer > 0) return;
    try {
      const response = await resendOtp({
        email: registrationPayload.email,
        purpose: 'REGISTRATION',
      });
      setResendTimer(response.cooldownSeconds);
      setCode('');
      setError(null);
    } catch (err) {
      const message = isApiError(err) ? err.message : 'Failed to resend code';
      Alert.alert('Error', message);
    }
  }, [resendTimer, registrationPayload.email]);

  const handleVerify = useCallback(async () => {
    if (code.length !== OTP_LENGTH) return;
    setLoading(true);
    setError(null);

    try {
      const response = await completeRegistration({
        phoneNumber,
        otp: code,
      });
      await setTokens(response);
      
      const profile = await getProfile();
      setUser(profile);

      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'PinSetup' as never }],
      });
    } catch (err) {
      const message = isApiError(err) ? err.message : 'Verification failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [code, phoneNumber, navigation, setTokens, setUser]);

  const codeComplete = code.length === OTP_LENGTH;

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.form}>
          <QupayLogo size={22} />
          <View style={{ height: 28 }} />
          <Text style={styles.headline}>
            Enter the{'\n'}
            <Text style={styles.greenText}>code</Text>
          </Text>
          <Text style={styles.desc}>We sent a 6-digit code to {registrationPayload.email}</Text>

          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={code}
            onChangeText={handleCodeChange}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            autoFocus
          />

          <TouchableOpacity
            style={styles.otpGrid}
            onPress={focusInput}
            activeOpacity={0.8}
          >
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.otpCell,
                  code[i] ? styles.otpCellFill : undefined,
                  !code[i] && i === code.length ? styles.otpCellCur : undefined,
                  error ? styles.otpCellError : undefined,
                ]}
              >
                {code[i] ? (
                  <Text style={styles.otpDigit}>{code[i]}</Text>
                ) : i === code.length ? (
                  <Animated.View style={[styles.curLine, { opacity: blinkAnim }]} />
                ) : null}
              </View>
            ))}
          </TouchableOpacity>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

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
                  {' '}
                  {'\u00B7'} 0:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
                </Text>
              )}
            </Text>
          </View>
        </View>

        <View style={styles.bottom}>
          <CTAButton
            title="Verify & Continue"
            onPress={handleVerify}
            disabled={!codeComplete}
            loading={loading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  container: { flex: 1, justifyContent: 'space-between' },
  form: { paddingHorizontal: 28, paddingTop: 36 },
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
    marginBottom: 24,
    lineHeight: 21,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
  },
  otpGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  otpCell: {
    flex: 1,
    height: 58,
    backgroundColor: '#1F1F23',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpCellFill: {
    borderColor: 'rgba(56,189,248,0.4)',
    backgroundColor: 'rgba(56,189,248,0.12)',
  },
  otpCellCur: {
    borderColor: '#38BDF8',
  },
  otpCellError: {
    borderColor: '#EF4444',
  },
  otpDigit: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  curLine: {
    width: 2,
    height: 24,
    backgroundColor: '#38BDF8',
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  resendRow: {
    alignItems: 'center',
    paddingVertical: 20,
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
});
