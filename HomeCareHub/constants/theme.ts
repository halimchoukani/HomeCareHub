import { Platform } from 'react-native';

export const Colors = {
  // Boilerplate templates and Expo Router tab bar support (unified premium dark theme)
  light: {
    text: '#FFFFFF',
    background: '#0D0D1A',
    tint: '#7C3AED',
    icon: '#A78BFA',
    tabIconDefault: '#8A8FAB',
    tabIconSelected: '#7C3AED',
  },
  dark: {
    text: '#FFFFFF',
    background: '#0D0D1A',
    tint: '#7C3AED',
    icon: '#A78BFA',
    tabIconDefault: '#8A8FAB',
    tabIconSelected: '#7C3AED',
  },

  // Brand specific premium styling flat tokens
  background: '#0D0D1A',
  card: '#13132A',
  border: '#2E2B52',
  borderAlt: '#2A2750',
  primary: '#7C3AED',
  primaryMuted: '#1E1B3A',
  accent: '#A78BFA',
  accentMuted: '#2D1B6B',
  text: '#FFFFFF',
  textSecondary: '#B0B8D4',
  textMuted: '#8A8FAB',
  textSubtle: '#6B7A99',
  
  // Status Colors
  success: '#4ADE80',
  successMuted: '#0D2D1A',
  successBorder: '#16A34A',
  
  danger: '#F87171',
  dangerMuted: '#2D1010',
  dangerMutedAlt: '#1A0808',
  dangerBorder: '#EF4444',
  
  warning: '#FACC15',
  warningMuted: '#1A1200',
  warningBorder: '#713F12',
  
  info: '#06B6D4',
  infoMuted: '#051A22',
  infoBorder: '#0E4A5A',
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
