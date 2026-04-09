import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import { QupayLogo, CTAButton, FormField } from '../../components';
import { completePasswordReset, resendOtp } from '../../api/auth';
import { isApiError } from '../../api/client';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ResetPassword'>;

const OTP_LENGTH = 6;

export const ResetPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email, cooldownSeconds: initialCooldown } = route.params;
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(initialCooldown);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

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
        email,
        purpose: 'PASSWORD_RESET',
      });
      setResendTimer(response.cooldownSeconds);
      setCode('');
      setError(null);
    } catch (err) {
      const message = isApiError(err) ? err.message : 'Failed to resend code';
      Alert.alert('Error', message);
    }
  }, [resendTimer, email]);

  const codeComplete = code.length === OTP_LENGTH;
  const passwordValid = newPassword.length >= 8;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const allFieldsValid = codeComplete && passwordValid && passwordsMatch;

  const handleSubmit = useCallback(async () => {
    if (!allFieldsValid) return;
    setLoading(true);
    setError(null);

    try {
      await completePasswordReset({
        email,
        otp: code,
        newPassword,
      });
      Alert.alert(
        'Password Reset',
        'Your password has been reset successfully.',
        [{ text: 'OK', onPress: () => navigation.navigate('SignIn') }]
      );
    } catch (err) {
      const message = isApiError(err) ? err.message : 'Failed to reset password. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [allFieldsValid, email, code, newPassword, navigation]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <QupayLogo size={22} />
          <View style={{ height: 28 }} />
          <Text style={styles.headline}>
            Create new{'\n'}
            <Text style={styles.greenText}>password</Text>
          </Text>
          <Text style={styles.desc}>
            Enter the 6-digit code sent to {email} and your new password.
          </Text>

          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={code}
            onChangeText={handleCodeChange}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            autoFocus
          />

          <Text style={styles.label}>Verification Code</Text>
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

          <FormField
            label="New Password"
            placeholder="Enter new password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            value={newPassword}
            onChangeText={setNewPassword}
            maxLength={64}
            isValid={passwordValid}
            accessibilityLabel="New password"
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            }
          />

          <FormField
            label="Confirm Password"
            placeholder="Confirm new password"
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            maxLength={64}
            isValid={passwordsMatch}
            accessibilityLabel="Confirm password"
            rightIcon={
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            }
          />

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <View style={{ height: 8 }} />
        </View>
      </ScrollView>

      <View style={styles.bottomArea}>
        <CTAButton
          title="Reset Password"
          onPress={handleSubmit}
          disabled={!allFieldsValid}
          loading={loading}
          style={styles.cta}
        />
        <CTAButton
          title="Back"
          onPress={() => navigation.goBack()}
          ghost
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
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
    lineHeight: 21,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
  },
  otpGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  otpCell: {
    flex: 1,
    height: 58,
    backgroundColor: '#1F1F23',
    borderWidth: 1,
    borderColor: 'transparent',
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
    marginTop: 8,
  },
  resendRow: {
    alignItems: 'center',
    paddingVertical: 16,
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
  bottomArea: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  cta: { marginBottom: 0 },
});
