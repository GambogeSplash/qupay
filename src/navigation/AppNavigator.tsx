import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '../components/Icon';
import { useAuthStore } from '../store/authStore';
import type { InitiateRegistrationRequest } from '../types/auth';

// Screens
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { SignUpScreen } from '../screens/onboarding/SignUpScreen';
import { SignInScreen } from '../screens/onboarding/SignInScreen';
import { OTPScreen } from '../screens/onboarding/OTPScreen';
import { PinSetupScreen } from '../screens/onboarding/PinSetupScreen';
import { PinVerifyScreen } from '../screens/onboarding/PinVerifyScreen';
import { PinResetScreen } from '../screens/onboarding/PinResetScreen';
import { ForgotPasswordScreen } from '../screens/onboarding/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/onboarding/ResetPasswordScreen';

export interface DestInfo {
  flag: string;
  name: string;
  code: string;
  symbol: string;
  rate: number;
  providers: string;
}
import { HistoryScreen } from '../screens/portfolio/PortfolioScreen';
import { TransactionDetailScreen } from '../screens/transaction/TransactionDetailScreen';
import { ProfileScreen } from '../screens/settings/SettingsScreen';
import { PersonalInfoScreen } from '../screens/settings/PersonalInfoScreen';
import { WalletsScreen } from '../screens/settings/WalletsScreen';
import { RecipientsScreen as RecipientsProfileScreen } from '../screens/settings/RecipientsScreen';
import { RateAlertsScreen } from '../screens/settings/RateAlertsScreen';
import { InviteFriendsScreen } from '../screens/settings/InviteFriendsScreen';
import { HelpSupportScreen } from '../screens/settings/HelpSupportScreen';
import { CurrencyLanguageScreen } from '../screens/settings/CurrencyLanguageScreen';
import { RecipientScreen } from '../screens/send/RecipientScreen';
import { AmountScreen } from '../screens/send/AmountScreen';
import { ConfirmScreen } from '../screens/send/ConfirmScreen';
import { DepositWaitingScreen } from '../screens/send/DepositWaitingScreen';
import { SuccessScreen } from '../screens/send/SuccessScreen';

// ─── Param lists ───
export type OnboardingStackParamList = {
  Splash: undefined;
  SignUp: undefined;
  SignIn: undefined;
  OTP: {
    phoneNumber: string;
    cooldownSeconds: number;
    registrationPayload: InitiateRegistrationRequest;
  };
  ForgotPassword: undefined;
  ResetPassword: {
    email: string;
    cooldownSeconds: number;
  };
};

export type HistoryStackParamList = {
  History: undefined;
  TransferDetail: { transferId?: string; status?: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  PersonalInfo: undefined;
  Wallets: undefined;
  Recipients: undefined;
  RateAlerts: undefined;
  InviteFriends: undefined;
  HelpSupport: undefined;
  CurrencyLanguage: undefined;
};

export type SendFlowParamList = {
  Amount: undefined;
  Recipient: {
    amount: number;
    sendCurrency: string;
    receiveCurrency: string;
    receiveAmount: number;
  };
  Confirm: {
    amount: number;
    sendCurrency: string;
    receiveCurrency: string;
    receiveAmount: number;
    recipientName: string;
    recipientInitials: string;
    recipientColors: [string, string];
    recipientMethod: string;
    recipientPhone?: string;
    recipientFlag: string;
    recipientWalletAddress?: string;
    recipientNetwork?: string;
  };
  DepositWaiting: {
    recipientName?: string;
    recipientInitials?: string;
    recipientMethod?: string;
    recipientFlag?: string;
    amount?: number;
    receiveAmount?: number;
    sendCurrency?: string;
    recvCurrency?: string;
    walletAddress?: string;
    network?: string;
    recipientWalletAddress?: string;
    recipientNetwork?: string;
  };
  Success: {
    recipientName?: string;
    recipientInitials?: string;
    recipientMethod?: string;
    recipientFlag?: string;
    amount?: number;
    receiveAmount?: number;
    recvCurrency?: string;
    sendCurrency?: string;
    recipientWalletAddress?: string;
    recipientNetwork?: string;
  };
};

export type MainTabParamList = {
  HistoryTab: undefined;
  SendTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  PinSetup: undefined;
  PinVerify: undefined;
  PinReset: { cooldownSeconds: number };
  Main: undefined;
};

// ─── Navigators ───
const RootStack = createNativeStackNavigator<RootStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const HistoryStackNav = createNativeStackNavigator<HistoryStackParamList>();
const ProfileStackNav = createNativeStackNavigator<ProfileStackParamList>();
const SendFlowStack = createNativeStackNavigator<SendFlowParamList>();

// ─── Stack screens ───
function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <OnboardingStack.Screen name="Splash" component={SplashScreen} options={{ animation: 'fade' }} />
      <OnboardingStack.Screen name="SignUp" component={SignUpScreen} />
      <OnboardingStack.Screen name="SignIn" component={SignInScreen} />
      <OnboardingStack.Screen name="OTP" component={OTPScreen} />
      <OnboardingStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <OnboardingStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </OnboardingStack.Navigator>
  );
}

function HistoryStackNavigator() {
  return (
    <HistoryStackNav.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <HistoryStackNav.Screen name="History" component={HistoryScreen} />
      <HistoryStackNav.Screen name="TransferDetail" component={TransactionDetailScreen} />
    </HistoryStackNav.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStackNav.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <ProfileStackNav.Screen name="Profile" component={ProfileScreen} />
      <ProfileStackNav.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <ProfileStackNav.Screen name="Wallets" component={WalletsScreen} />
      <ProfileStackNav.Screen name="Recipients" component={RecipientsProfileScreen} />
      <ProfileStackNav.Screen name="RateAlerts" component={RateAlertsScreen} />
      <ProfileStackNav.Screen name="InviteFriends" component={InviteFriendsScreen} />
      <ProfileStackNav.Screen name="HelpSupport" component={HelpSupportScreen} />
      <ProfileStackNav.Screen name="CurrencyLanguage" component={CurrencyLanguageScreen} />
    </ProfileStackNav.Navigator>
  );
}

function SendTabNavigator() {
  return (
    <SendFlowStack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      {/* Flow: Recipient (who) → Amount (how much) → Confirm → Deposit → Success */}
      <SendFlowStack.Screen name="Recipient" component={RecipientScreen} />
      <SendFlowStack.Screen name="Amount" component={AmountScreen} />
      <SendFlowStack.Screen name="Confirm" component={ConfirmScreen} />
      <SendFlowStack.Screen name="DepositWaiting" component={DepositWaitingScreen} options={{ animation: 'fade_from_bottom', gestureEnabled: false }} />
      <SendFlowStack.Screen name="Success" component={SuccessScreen} options={{ animation: 'fade_from_bottom', gestureEnabled: false }} />
    </SendFlowStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="SendTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0A0C',
          borderTopColor: 'rgba(255,255,245,0.08)',
          borderTopWidth: 1,
          height: 88,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: 'rgba(255,255,245,0.4)',
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 9,
          letterSpacing: 0.6,
          textTransform: 'uppercase' as const,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'ellipse';
          switch (route.name) {
            case 'HistoryTab':
              iconName = focused ? 'time' : 'time-outline';
              break;
            case 'SendTab':
              iconName = focused ? 'send' : 'send-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }
          return <Ionicons name={iconName} size={20} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HistoryTab"
        component={HistoryStackNavigator}
        options={{ tabBarLabel: 'HISTORY' }}
      />
      <Tab.Screen
        name="SendTab"
        component={SendTabNavigator}
        options={{ tabBarLabel: 'SEND' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ tabBarLabel: 'PROFILE' }}
      />
    </Tab.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#38BDF8" />
    </View>
  );
}

export const AppNavigator: React.FC = () => {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const isPinLocked = useAuthStore((state) => state.isPinLocked);
  
  const hasPin = user?.pinSet ?? false;

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {!isAuthenticated ? (
        <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : isPinLocked ? (
        <>
          <RootStack.Screen name="PinVerify" component={PinVerifyScreen} />
          <RootStack.Screen name="PinReset" component={PinResetScreen} />
        </>
      ) : !hasPin ? (
        <RootStack.Screen name="PinSetup" component={PinSetupScreen} />
      ) : (
        <RootStack.Screen name="Main" component={MainTabs} />
      )}
    </RootStack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0C',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
