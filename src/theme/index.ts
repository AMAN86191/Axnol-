import {Dimensions, Platform} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {RFValue} from 'react-native-responsive-fontsize';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export {hp, wp};

export const rfValue = (size: number): number => RFValue(size, BASE_HEIGHT);

export const scale = (size: number): number => wp((size / BASE_WIDTH) * 100);

export const verticalScale = (size: number): number =>
  hp((size / BASE_HEIGHT) * 100);

export const moderateScale = (size: number, factor: number = 0.75): number =>
  size + (scale(size) - size) * factor;

export const SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: SCREEN_WIDTH < 360,
  isLarge: SCREEN_WIDTH >= 410,
};

export const colors = {
  primary: '#0A4D8C',
  primaryDark: '#073660',
  primaryLight: '#E8F1FA',
  primaryMuted: '#B9D2EA',

  accent: '#F5A623',
  accentDark: '#D98A0B',
  accentLight: '#FFF4E0',

  background: '#F4F6FA',
  surface: '#FFFFFF',
  surfaceAlt: '#EDF1F7',
  overlay: 'rgba(7, 24, 44, 0.55)',

  text: '#16202E',
  textSecondary: '#4A5A6E',
  textMuted: '#8595A8',
  textInverse: '#FFFFFF',

  border: '#E1E7EF',
  borderLight: '#EEF2F7',

  success: '#158F5C',
  successLight: '#E4F6EE',
  warning: '#D98A0B',
  warningLight: '#FFF4E0',
  danger: '#D64545',
  dangerLight: '#FCEAEA',
  info: '#1E7FC2',
  infoLight: '#E6F2FB',

  pending: '#D98A0B',
  approved: '#158F5C',
  rejected: '#D64545',
  newStatus: '#1E7FC2',

  shadow: '#0F172A',
};

export const spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(24),
  xxxl: scale(32),
};

export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
};

export const fontSize = {
  xs: rfValue(11),
  sm: rfValue(13),
  md: rfValue(14),
  lg: rfValue(16),
  xl: rfValue(18),
  xxl: rfValue(22),
  xxxl: rfValue(26),
  display: rfValue(32),
};

export const typography = {
  regular: {
    fontFamily: Platform.select({ios: 'System', android: 'sans-serif'}),
    fontWeight: '400' as const,
  },
  medium: {
    fontFamily: Platform.select({ios: 'System', android: 'sans-serif-medium'}),
    fontWeight: '500' as const,
  },
  bold: {
    fontFamily: Platform.select({ios: 'System', android: 'sans-serif-black'}),
    fontWeight: '700' as const,
  },
};

export const shadows = {
  small: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    android: {elevation: 2},
    default: {},
  }) as object,
  medium: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.1,
      shadowRadius: 10,
    },
    android: {elevation: 5},
    default: {},
  }) as object,
  large: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.14,
      shadowRadius: 18,
    },
    android: {elevation: 10},
    default: {},
  }) as object,
};

export const theme = {
  colors,
  spacing,
  radius,
  fontSize,
  typography,
  shadows,
  scale,
  verticalScale,
  moderateScale,
  rfValue,
  wp,
  hp,
  SCREEN,
};

export default theme;
