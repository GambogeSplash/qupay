import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Qupay',
  slug: 'qupay',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
    output: 'single',
    themeColor: '#0A0A0C',
    backgroundColor: '#0A0A0C',
    name: 'Qupay',
    shortName: 'Qupay',
    description: 'Send crypto. They get cash.',
  },
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    environment: process.env.EXPO_PUBLIC_ENV ?? 'development',
  },
});
