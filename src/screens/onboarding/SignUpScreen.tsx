// SignUpScreen — 2-step progressive form. Phone first → details after OTP.
// Consistent with inner pages: dark bg, #17171A cards, 20px margins, pill CTAs.
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import { ScreenHeader, FormField, BottomSheet, Toast } from '../../components';
import { countries } from '../../data/mockData';
import { initiateRegistration } from '../../api/auth';
import { isApiError } from '../../api/client';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/AppNavigator';
import type { InitiateRegistrationRequest } from '../../types/auth';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SignUp'>;

type Step = 'phone' | 'details';

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [step, setStep] = useState<Step>('phone');

  // Step 1: Phone
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);

  // Step 2: Details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const phoneValid = phone.length >= 8;
  const firstNameValid = firstName.trim().length >= 2;
  const lastNameValid = lastName.trim().length >= 2;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length >= 8;

  const canContinuePhone = phoneValid;
  const canContinueDetails = firstNameValid && lastNameValid && emailValid && passwordValid;

  const handlePhoneContinue = () => {
    if (!canContinuePhone) return;
    setStep('details');
  };

  const handleSignUp = useCallback(async () => {
    if (!canContinueDetails) return;
    setLoading(true);
    setShowError(false);

    const normalizedPhone = phone.replace(/^0+/, '');
    const phoneNumber = `${selectedCountry.code}${normalizedPhone}`;
    const registrationPayload: InitiateRegistrationRequest = {
      phoneNumber,
      role: 'PAYER',
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
    };

    try {
      const response = await initiateRegistration(registrationPayload);
      navigation.navigate('OTP', {
        phoneNumber,
        cooldownSeconds: response.cooldownSeconds,
        registrationPayload,
      });
    } catch (error) {
      const message = isApiError(error) ? error.message : 'Something went wrong. Please try again.';
      setErrorMessage(message);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  }, [canContinueDetails, phone, selectedCountry, navigation, firstName, lastName, email, password]);

  // ─── Step 1: Phone number ───
  if (step === 'phone') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="" onBack={() => navigation.goBack()} />
        <View style={styles.body}>
          <Text style={styles.headline}>What's your{'\n'}phone number?</Text>
          <Text style={styles.sub}>We'll send you a verification code</Text>

          <View style={styles.phoneCard}>
            {/* Country picker */}
            <TouchableOpacity
              style={styles.countryRow}
              onPress={() => setShowCountryPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
              <Text style={styles.countryName}>{selectedCountry.name}</Text>
              <Text style={styles.countryCode}>{selectedCountry.code}</Text>
              <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.42)" />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Phone input */}
            <View style={styles.phoneInputRow}>
              <Text style={styles.phonePrefix}>{selectedCountry.code}</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="Phone number"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={12}
                autoFocus
              />
              {phoneValid && <Ionicons name="checkmark-circle" size={20} color="#4ADE80" />}
            </View>
          </View>

          <View style={{ flex: 1 }} />

          <TouchableOpacity
            style={[styles.cta, !canContinuePhone && styles.ctaDisabled]}
            onPress={handlePhoneContinue}
            disabled={!canContinuePhone}
            activeOpacity={0.85}
          >
            <Text style={[styles.ctaText, !canContinuePhone && styles.ctaTextDisabled]}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('SignIn')} activeOpacity={0.7}>
            <Text style={styles.switchText}>
              Already have an account? <Text style={styles.switchLink}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Country picker sheet */}
        <BottomSheet visible={showCountryPicker} onClose={() => setShowCountryPicker(false)} title="Select country">
          <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
            {countries.map((c: any) => (
              <TouchableOpacity
                key={c.code}
                style={[styles.cpRow, selectedCountry.code === c.code && styles.cpRowSel]}
                onPress={() => { setSelectedCountry(c); setShowCountryPicker(false); }}
                activeOpacity={0.7}
              >
                <Text style={styles.cpFlag}>{c.flag}</Text>
                <Text style={styles.cpName}>{c.name}</Text>
                <Text style={styles.cpCode}>{c.code}</Text>
                {selectedCountry.code === c.code && <Ionicons name="checkmark-circle" size={20} color="#38BDF8" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </BottomSheet>
      </SafeAreaView>
    );
  }

  // ─── Step 2: Details ───
  return (
    <SafeAreaView style={styles.safe}>
      <Toast visible={showError} message={errorMessage} type="error" onDismiss={() => setShowError(false)} />
      <ScreenHeader title="" onBack={() => setStep('phone')} />
      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <Text style={styles.headline}>A few more{'\n'}details</Text>
          <Text style={styles.sub}>This helps us verify your identity and keep your transfers secure</Text>

          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <FormField
                label="First name"
                placeholder="First name"
                autoCapitalize="words"
                value={firstName}
                onChangeText={setFirstName}
                maxLength={30}
                isValid={firstNameValid}
              />
            </View>
            <View style={{ flex: 1 }}>
              <FormField
                label="Last name"
                placeholder="Last name"
                autoCapitalize="words"
                value={lastName}
                onChangeText={setLastName}
                maxLength={30}
                isValid={lastNameValid}
              />
            </View>
          </View>

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
            placeholder="Min 8 characters"
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
        </View>
      </ScrollView>

      <View style={styles.footerWrap}>
        <TouchableOpacity
          style={[styles.cta, !canContinueDetails && styles.ctaDisabled]}
          onPress={handleSignUp}
          disabled={!canContinueDetails || loading}
          activeOpacity={0.85}
        >
          <Text style={[styles.ctaText, !canContinueDetails && styles.ctaTextDisabled]}>
            {loading ? 'Creating account...' : 'Create account'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },

  headline: {
    fontFamily: 'Inter_700Bold', fontSize: 32, color: '#FFFFFF',
    letterSpacing: -0.5, lineHeight: 38, marginBottom: 8,
  },
  sub: {
    fontFamily: 'Inter_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.58)',
    lineHeight: 22, marginBottom: 32,
  },

  // Phone card — consistent #17171A card style
  phoneCard: {
    backgroundColor: '#17171A', borderRadius: 16, overflow: 'hidden',
  },
  countryRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  countryFlag: { fontSize: 20 },
  countryName: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 14, color: '#FFFFFF' },
  countryCode: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.58)' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 16 },
  phoneInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  phonePrefix: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: 'rgba(255,255,255,0.58)' },
  phoneInput: {
    flex: 1, fontFamily: 'Inter_500Medium', fontSize: 18, color: '#FFFFFF', padding: 0,
  },

  // Name row
  nameRow: { flexDirection: 'row', gap: 12 },

  // CTAs
  cta: {
    backgroundColor: '#38BDF8', borderRadius: 999, paddingVertical: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  ctaDisabled: { backgroundColor: '#1F1F23' },
  ctaText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#0A0A0C' },
  ctaTextDisabled: { color: 'rgba(255,255,255,0.25)' },

  switchText: {
    fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.42)',
    textAlign: 'center', marginBottom: 16,
  },
  switchLink: { color: '#38BDF8', fontFamily: 'Inter_600SemiBold' },

  footerWrap: { paddingHorizontal: 20, paddingBottom: 16 },
  termsText: {
    fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.3)',
    textAlign: 'center', lineHeight: 16,
  },

  // Country picker
  cpRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  cpRowSel: { backgroundColor: 'rgba(56,189,248,0.08)' },
  cpFlag: { fontSize: 22 },
  cpName: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 14, color: '#FFFFFF' },
  cpCode: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.42)' },
});
