// OTPScreen — 6-digit code verification. Clean, focused, consistent.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components';
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
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  // Blinking cursor
  const blinkAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0, duration: 500, easing: Easing.step0, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 500, easing: Easing.step0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Resend countdown
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
      const response = await resendOtp({ email: registrationPayload.email, purpose: 'REGISTRATION' });
      setResendTimer(response.cooldownSeconds);
      setCode('');
      setError(null);
    } catch (err) {
      Alert.alert('Error', isApiError(err) ? err.message : 'Failed to resend code');
    }
  }, [resendTimer, registrationPayload.email]);

  const handleVerify = useCallback(async () => {
    if (code.length !== OTP_LENGTH) return;
    setLoading(true);
    setError(null);
    try {
      const response = await completeRegistration({ phoneNumber, otp: code });
      await setTokens(response);
      const profile = await getProfile();
      setUser(profile);
      navigation.getParent()?.reset({ index: 0, routes: [{ name: 'PinSetup' as never }] });
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [code, phoneNumber, navigation, setTokens, setUser]);

  const codeComplete = code.length === OTP_LENGTH;

  // Format phone for display: show last 4 digits
  const maskedPhone = phoneNumber.length > 4
    ? `${'\u2022'.repeat(phoneNumber.length - 4)}${phoneNumber.slice(-4)}`
    : phoneNumber;

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="" onBack={() => navigation.goBack()} />

      <View style={styles.body}>
        <Text style={styles.headline}>Enter verification code</Text>
        <Text style={styles.sub}>
          We sent a 6-digit code to {maskedPhone}
        </Text>

        {/* Hidden input for keyboard */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={code}
          onChangeText={handleCodeChange}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          autoFocus
        />

        {/* OTP cells */}
        <TouchableOpacity style={styles.otpGrid} onPress={() => inputRef.current?.focus()} activeOpacity={0.9}>
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.otpCell,
                code[i] && styles.otpCellFill,
                !code[i] && i === code.length && styles.otpCellCur,
                error && styles.otpCellError,
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

        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={styles.resendText}>
            Didn't get it?{' '}
          </Text>
          <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0} activeOpacity={0.7}>
            <Text style={[styles.resendLink, resendTimer > 0 && styles.resendLinkDisabled]}>
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, (!codeComplete || loading) && styles.ctaDisabled]}
          onPress={handleVerify}
          disabled={!codeComplete || loading}
          activeOpacity={0.85}
        >
          <Text style={[styles.ctaText, (!codeComplete || loading) && styles.ctaTextDisabled]}>
            {loading ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },

  headline: {
    fontFamily: 'Inter_700Bold', fontSize: 32, color: '#FFFFFF',
    letterSpacing: -0.5, marginBottom: 8,
  },
  sub: {
    fontFamily: 'Inter_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.58)',
    lineHeight: 22, marginBottom: 32,
  },

  hiddenInput: { position: 'absolute', opacity: 0, height: 0 },

  otpGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  otpCell: {
    flex: 1, height: 58,
    backgroundColor: '#17171A', borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  otpCellFill: { backgroundColor: 'rgba(56,189,248,0.08)' },
  otpCellCur: { backgroundColor: '#1F1F23' },
  otpCellError: { backgroundColor: 'rgba(239,68,68,0.08)' },
  otpDigit: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#FFFFFF' },
  curLine: { width: 2, height: 24, backgroundColor: '#38BDF8', borderRadius: 1 },

  errorText: {
    fontFamily: 'Inter_500Medium', fontSize: 13, color: '#EF4444',
    textAlign: 'center', marginBottom: 8,
  },

  resendRow: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 16 },
  resendText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.42)' },
  resendLink: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#38BDF8' },
  resendLinkDisabled: { color: 'rgba(255,255,255,0.25)' },

  footer: { paddingHorizontal: 24, paddingBottom: 16 },
  cta: {
    backgroundColor: '#38BDF8', borderRadius: 999, paddingVertical: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaDisabled: { backgroundColor: '#1F1F23' },
  ctaText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#0A0A0C' },
  ctaTextDisabled: { color: 'rgba(255,255,255,0.25)' },
});
