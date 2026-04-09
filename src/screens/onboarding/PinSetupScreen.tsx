// PinSetupScreen — create and confirm a 4-digit PIN. Consistent onboarding.
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../components/Icon';
import { ScreenHeader, Numpad } from '../../components';
import { setPin, getProfile } from '../../api/auth';
import { isApiError } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PinSetup'>;
const PIN_LENGTH = 4;

export const PinSetupScreen: React.FC<Props> = ({ navigation }) => {
  const [pinValue, setPinValue] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((s) => s.setUser);

  const currentPin = step === 'create' ? pinValue : confirmPin;
  const setCurrentPin = step === 'create' ? setPinValue : setConfirmPin;

  const handleKey = useCallback((key: string) => {
    setError(null);
    if (key === 'del') {
      setCurrentPin((prev) => prev.slice(0, -1));
    } else if (key === '.' || key === '\u232B') {
      // ignore decimal on PIN
    } else if (currentPin.length < PIN_LENGTH) {
      const next = currentPin + key;
      setCurrentPin(next);
      // Auto-advance when complete
      if (next.length === PIN_LENGTH && step === 'create') {
        setTimeout(() => setStep('confirm'), 200);
      }
    }
  }, [currentPin, setCurrentPin, step]);

  const handleConfirm = useCallback(async () => {
    if (confirmPin !== pinValue) {
      setError('PINs don\'t match');
      setConfirmPin('');
      return;
    }
    setLoading(true);
    try {
      await setPin({ pin: pinValue });
      const profile = await getProfile();
      setUser(profile);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err) {
      Alert.alert('Error', isApiError(err) ? err.message : 'Failed to set PIN.');
    } finally {
      setLoading(false);
    }
  }, [pinValue, confirmPin, navigation, setUser]);

  const handleBack = () => {
    if (step === 'confirm') { setStep('create'); setConfirmPin(''); setError(null); }
  };

  const isComplete = currentPin.length === PIN_LENGTH;

  return (
    <SafeAreaView style={styles.safe}>
      {step === 'confirm' ? (
        <ScreenHeader title="" onBack={handleBack} />
      ) : (
        <View style={{ height: 56 }} />
      )}

      <View style={styles.body}>
        {/* Lock icon */}
        <View style={styles.lockCircle}>
          <Ionicons name={step === 'create' ? 'lock-closed' : 'shield-checkmark'} size={28} color="#38BDF8" />
        </View>

        <Text style={styles.headline}>
          {step === 'create' ? 'Create a PIN' : 'Confirm your PIN'}
        </Text>
        <Text style={styles.sub}>
          {step === 'create'
            ? 'This 4-digit PIN secures your transfers'
            : 'Enter the same PIN to confirm'}
        </Text>

        {/* PIN dots — larger, more visible */}
        <View style={styles.dotsRow}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                currentPin.length > i && styles.dotFilled,
                error && currentPin.length === 0 && styles.dotError,
              ]}
            />
          ))}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Face ID hint */}
        {step === 'create' && (
          <View style={styles.faceIdHint}>
            <Ionicons name="eye" size={14} color="rgba(255,255,255,0.42)" />
            <Text style={styles.faceIdText}>You can also use Face ID after setup</Text>
          </View>
        )}
      </View>

      {/* Numpad + CTA */}
      <View style={styles.bottom}>
        {step === 'confirm' && isComplete && (
          <TouchableOpacity
            style={[styles.cta, loading && styles.ctaDisabled]}
            onPress={handleConfirm}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>{loading ? 'Setting up...' : 'Set PIN'}</Text>
          </TouchableOpacity>
        )}
        <Numpad onKey={handleKey} size="compact" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },

  lockCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(56,189,248,0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  headline: {
    fontFamily: 'Inter_700Bold', fontSize: 28, color: '#FFFFFF',
    letterSpacing: -0.3, marginBottom: 8, textAlign: 'center',
  },
  sub: {
    fontFamily: 'Inter_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.58)',
    textAlign: 'center', marginBottom: 32,
  },

  dotsRow: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  dot: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#17171A',
  },
  dotFilled: { backgroundColor: '#38BDF8' },
  dotError: { backgroundColor: 'rgba(239,68,68,0.3)' },

  errorText: {
    fontFamily: 'Inter_500Medium', fontSize: 13, color: '#EF4444',
    marginTop: 8,
  },

  faceIdHint: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20,
  },
  faceIdText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.42)' },

  bottom: { paddingHorizontal: 20, paddingBottom: 12 },
  cta: {
    backgroundColor: '#38BDF8', borderRadius: 999, paddingVertical: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  ctaDisabled: { backgroundColor: '#1F1F23' },
  ctaText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#0A0A0C' },
});
