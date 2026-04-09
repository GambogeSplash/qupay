import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QupayLogo, CTAButton, FormField } from '../../components';
import { initiatePasswordReset } from '../../api/auth';
import { isApiError } from '../../api/client';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = useCallback(async () => {
    if (!emailValid) return;
    setLoading(true);

    try {
      const response = await initiatePasswordReset({ email: email.trim() });
      navigation.navigate('ResetPassword', {
        email: email.trim(),
        cooldownSeconds: response.cooldownSeconds,
      });
    } catch (error) {
      const message = isApiError(error) ? error.message : 'Failed to send reset code';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }, [emailValid, email, navigation]);

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
            Reset your{'\n'}
            <Text style={styles.greenText}>password</Text>
          </Text>
          <Text style={styles.desc}>
            Enter your email address and we'll send you a code to reset your password.
          </Text>

          <FormField
            label="Email Address"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            maxLength={80}
            isValid={emailValid}
            accessibilityLabel="Email address"
          />

          <View style={{ height: 8 }} />
        </View>
      </ScrollView>

      <View style={styles.bottomArea}>
        <CTAButton
          title="Send Reset Code"
          onPress={handleSubmit}
          disabled={!emailValid}
          loading={loading}
          style={styles.cta}
        />
        <CTAButton
          title="Back to Sign In"
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
  bottomArea: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  cta: { marginBottom: 0 },
});
