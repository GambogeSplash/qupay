// Legacy placeholder — onboarding now uses SplashScreen, SignUpScreen, OTPScreen
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WelcomeScreenProps {
  onComplete?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Deprecated</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0C', alignItems: 'center', justifyContent: 'center' },
  text: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
});
