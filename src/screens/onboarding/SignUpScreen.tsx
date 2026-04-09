import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import { QupayLogo, CTAButton, FormField, BottomSheet, Toast } from '../../components';
import { countries } from '../../data/mockData';
import { initiateRegistration } from '../../api/auth';
import { isApiError } from '../../api/client';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/AppNavigator';
import type { InitiateRegistrationRequest } from '../../types/auth';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SignUp'>;

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const firstNameValid = firstName.trim().length >= 2;
  const lastNameValid = lastName.trim().length >= 2;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneValid = phone.length >= 8;
  const passwordValid = password.length >= 8;
  const confirmPasswordValid = confirmPassword === password && confirmPassword.length > 0;
  const allFieldsValid = firstNameValid && lastNameValid && emailValid && phoneValid && passwordValid && confirmPasswordValid;

  const getFieldError = (field: string): string | undefined => {
    if (fieldErrors[field]) return fieldErrors[field];
    if (!touched[field]) return undefined;
    
    switch (field) {
      case 'firstName':
        return !firstNameValid ? 'First name must be at least 2 characters' : undefined;
      case 'lastName':
        return !lastNameValid ? 'Last name must be at least 2 characters' : undefined;
      case 'email':
        return !emailValid ? 'Please enter a valid email address' : undefined;
      case 'phone':
        return !phoneValid ? 'Please enter a valid phone number' : undefined;
      case 'password':
        return !passwordValid ? 'Password must be at least 8 characters' : undefined;
      case 'confirmPassword':
        if (!confirmPassword) return 'Please confirm your password';
        return !confirmPasswordValid ? 'Passwords do not match' : undefined;
      default:
        return undefined;
    }
  };

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSendCode = useCallback(async () => {
    if (!allFieldsValid) return;
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
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('phone')) {
        setFieldErrors((prev) => ({ ...prev, phone: message }));
      } else if (lowerMessage.includes('email')) {
        setFieldErrors((prev) => ({ ...prev, email: message }));
      } else {
        setErrorMessage(message);
        setShowError(true);
      }
    } finally {
      setLoading(false);
    }
  }, [allFieldsValid, phone, selectedCountry, navigation, firstName, lastName, email, password]);

  return (
    <SafeAreaView style={styles.safe}>
      <Toast
        visible={showError}
        message={errorMessage}
        type="error"
        onDismiss={() => setShowError(false)}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <QupayLogo size={22} />
          <View style={{ height: 28 }} />
          <Text style={styles.headline}>
            Create your{'\n'}
            <Text style={styles.greenText}>account</Text>
          </Text>
          <Text style={styles.desc}>
            Takes 30 seconds. Start sending crypto to cash instantly.
          </Text>

          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <FormField
                label="First Name"
                placeholder="First name"
                autoCapitalize="words"
                value={firstName}
                onChangeText={setFirstName}
                onBlur={() => markTouched('firstName')}
                maxLength={30}
                isValid={firstNameValid}
                error={getFieldError('firstName')}
                accessibilityLabel="First name"
              />
            </View>
            <View style={styles.nameField}>
              <FormField
                label="Last Name"
                placeholder="Last name"
                autoCapitalize="words"
                value={lastName}
                onChangeText={setLastName}
                onBlur={() => markTouched('lastName')}
                maxLength={30}
                isValid={lastNameValid}
                error={getFieldError('lastName')}
                accessibilityLabel="Last name"
              />
            </View>
          </View>

          <FormField
            label="Email Address"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            onBlur={() => markTouched('email')}
            maxLength={80}
            isValid={emailValid}
            error={getFieldError('email')}
            accessibilityLabel="Email address"
          />

          <Text style={styles.phoneLabel}>Phone Number</Text>
          <View style={styles.phoneGroup}>
            <TouchableOpacity
              style={styles.prefixBtn}
              onPress={() => setShowCountryPicker(true)}
              activeOpacity={0.7}
              accessibilityLabel={`Country: ${selectedCountry.name}. Tap to change`}
              accessibilityRole="button"
            >
              <Text style={styles.prefixFlag}>{selectedCountry.flag}</Text>
              <Text style={styles.prefixCode}>{selectedCountry.code}</Text>
              <Ionicons name="chevron-down" size={12} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
            <View
              style={[
                styles.phoneField,
                phoneFocused && styles.phoneFieldFocused,
                phoneValid && !getFieldError('phone') && styles.phoneFieldOk,
                getFieldError('phone') && styles.phoneFieldError,
              ]}
            >
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter number"
                placeholderTextColor="rgba(255,255,255,0.4)"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  setFieldErrors((prev) => ({ ...prev, phone: '' }));
                }}
                maxLength={12}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => {
                  setPhoneFocused(false);
                  markTouched('phone');
                }}
                accessibilityLabel="Phone number"
              />
              {phoneValid && !getFieldError('phone') && (
                <Ionicons name="checkmark" size={16} color="#38BDF8" />
              )}
              {getFieldError('phone') && (
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
              )}
            </View>
          </View>
          {getFieldError('phone') && (
            <Text style={styles.phoneError}>{getFieldError('phone')}</Text>
          )}

          <FormField
            label="Password"
            placeholder="Create a password (min 8 characters)"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={setPassword}
            onBlur={() => markTouched('password')}
            maxLength={64}
            isValid={passwordValid}
            error={getFieldError('password')}
            accessibilityLabel="Password"
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            }
          />

          <FormField
            label="Confirm Password"
            placeholder="Confirm your password"
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onBlur={() => markTouched('confirmPassword')}
            maxLength={64}
            isValid={confirmPasswordValid}
            error={getFieldError('confirmPassword')}
            accessibilityLabel="Confirm password"
            rightIcon={
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            }
          />

          <View style={{ height: 8 }} />
        </View>
      </ScrollView>

      <View style={styles.bottomArea}>
        <CTAButton
          title="Send Code"
          onPress={handleSendCode}
          disabled={!allFieldsValid}
          loading={loading}
          style={styles.cta}
        />
        <Text style={styles.termsText}>
          By continuing you agree to our{' '}
          <Text style={styles.termsLink}>Terms</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignIn')} activeOpacity={0.7}>
          <Text style={styles.switchText}>
            Already have an account?{' '}
            <Text style={styles.switchLink}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <BottomSheet
        visible={showCountryPicker}
        onClose={() => setShowCountryPicker(false)}
        title="Select Country"
      >
        {countries.map((c) => (
          <TouchableOpacity
            key={c.code}
            style={[
              styles.countryItem,
              selectedCountry.code === c.code && styles.countryItemSel,
            ]}
            onPress={() => {
              setSelectedCountry(c);
              setShowCountryPicker(false);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.countryFlag}>{c.flag}</Text>
            <View style={styles.countryInfo}>
              <Text style={styles.countryName}>{c.name}</Text>
              <Text style={styles.countrySub}>{c.reg} {'\u00B7'} {c.code}</Text>
            </View>
            {selectedCountry.code === c.code && (
              <Ionicons name="checkmark" size={18} color="#38BDF8" />
            )}
          </TouchableOpacity>
        ))}
        <View style={{ height: 40 }} />
      </BottomSheet>
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
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameField: {
    flex: 1,
  },
  phoneLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  phoneGroup: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  prefixBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1F1F23',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  prefixFlag: { fontSize: 16 },
  prefixCode: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  phoneField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F23',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  phoneFieldFocused: {
    borderColor: 'rgba(56,189,248,0.4)',
  },
  phoneFieldOk: {
    borderColor: 'rgba(56,189,248,0.5)',
  },
  phoneFieldError: {
    borderColor: 'rgba(255,107,107,0.6)',
  },
  phoneError: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 12,
    marginTop: -6,
  },
  phoneInput: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 14,
    letterSpacing: 1,
  },
  bottomArea: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  cta: { marginBottom: 12 },
  termsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    paddingBottom: 8,
  },
  termsLink: {
    color: '#38BDF8',
    fontFamily: 'Inter_600SemiBold',
  },
  switchText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 16,
  },
  switchLink: {
    color: '#38BDF8',
    fontFamily: 'Inter_600SemiBold',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  countryItemSel: {
    backgroundColor: 'rgba(56,189,248,0.08)',
  },
  countryFlag: { fontSize: 24 },
  countryInfo: { flex: 1 },
  countryName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  countrySub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 1,
  },
});
