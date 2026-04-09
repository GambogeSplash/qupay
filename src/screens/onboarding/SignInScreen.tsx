// SignInScreen — clean, minimal. Consistent with inner pages.
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import { ScreenHeader, FormField } from '../../components';
import { login, getProfile } from '../../api/auth';
import { isApiError } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SignIn'>;

export const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length >= 8;
  const canSignIn = emailValid && passwordValid;

  const handleSignIn = useCallback(async () => {
    if (!canSignIn) return;
    setLoading(true);
    try {
      const response = await login({ email: email.trim(), password });
      await setTokens(response);
      const profile = await getProfile();
      setUser(profile, true);
    } catch (error) {
      const message = isApiError(error) ? error.message : 'Invalid email or password';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  }, [canSignIn, email, password, setTokens, setUser]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="" onBack={() => navigation.goBack()} />

      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <Text style={styles.headline}>Welcome back</Text>
          <Text style={styles.sub}>Sign in to continue</Text>

          <FormField
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            maxLength={80}
            isValid={emailValid}
          />

          <FormField
            label="Password"
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={setPassword}
            maxLength={64}
            isValid={passwordValid}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            }
          />

          <TouchableOpacity
            style={styles.forgotBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, !canSignIn && styles.ctaDisabled]}
          onPress={handleSignIn}
          disabled={!canSignIn || loading}
          activeOpacity={0.85}
        >
          <Text style={[styles.ctaText, !canSignIn && styles.ctaTextDisabled]}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')} activeOpacity={0.7}>
          <Text style={styles.switchText}>
            Don't have an account? <Text style={styles.switchLink}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  body: { paddingHorizontal: 24, paddingTop: 16 },

  headline: {
    fontFamily: 'Inter_700Bold', fontSize: 32, color: '#FFFFFF',
    letterSpacing: -0.5, marginBottom: 8,
  },
  sub: {
    fontFamily: 'Inter_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.58)',
    marginBottom: 32, lineHeight: 22,
  },
  forgotBtn: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#38BDF8' },

  footer: { paddingHorizontal: 20, paddingBottom: 16 },
  cta: {
    backgroundColor: '#38BDF8', borderRadius: 999, paddingVertical: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  ctaDisabled: { backgroundColor: '#1F1F23' },
  ctaText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#0A0A0C' },
  ctaTextDisabled: { color: 'rgba(255,255,255,0.25)' },
  switchText: {
    fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.42)',
    textAlign: 'center',
  },
  switchLink: { color: '#38BDF8', fontFamily: 'Inter_600SemiBold' },
});
