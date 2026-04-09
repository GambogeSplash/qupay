import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import { QupayLogo, CTAButton, FormField } from '../../components';
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
  const allFieldsValid = emailValid && passwordValid;

  const handleSignIn = useCallback(async () => {
    if (!allFieldsValid) return;
    setLoading(true);

    try {
      if (__DEV__) console.log('🔐 [SignIn] Starting login...');
      const response = await login({ email: email.trim(), password });
      if (__DEV__) console.log('🔐 [SignIn] Login successful, setting tokens...');
      
      await setTokens(response);
      if (__DEV__) console.log('🔐 [SignIn] Tokens stored, fetching profile...');
      
      const profile = await getProfile();
      if (__DEV__) console.log('🔐 [SignIn] Profile fetched, pinSet:', profile.pinSet);
      
      setUser(profile, true);
      if (__DEV__) console.log('🔐 [SignIn] User set with lock, navigation will update automatically');
    } catch (error) {
      if (__DEV__) console.error('🔐 [SignIn] Error:', error);
      const message = isApiError(error) ? error.message : 'Invalid email or password';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  }, [allFieldsValid, email, password, setTokens, setUser]);

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
            Welcome{'\n'}
            <Text style={styles.greenText}>back</Text>
          </Text>
          <Text style={styles.desc}>
            Sign in to continue sending crypto to cash instantly.
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
            accessibilityLabel="Password"
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="rgba(255,255,255,0.4)" />
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

          <View style={{ height: 8 }} />
        </View>
      </ScrollView>

      <View style={styles.bottomArea}>
        <CTAButton
          title="Sign In"
          onPress={handleSignIn}
          disabled={!allFieldsValid}
          loading={loading}
          style={styles.cta}
        />
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')} activeOpacity={0.7}>
          <Text style={styles.switchText}>
            Don't have an account?{' '}
            <Text style={styles.switchLink}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 8,
  },
  forgotText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#38BDF8',
  },
  bottomArea: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  cta: { marginBottom: 12 },
  switchText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 8,
    paddingBottom: 8,
  },
  switchLink: {
    color: '#38BDF8',
    fontFamily: 'Inter_600SemiBold',
  },
});
