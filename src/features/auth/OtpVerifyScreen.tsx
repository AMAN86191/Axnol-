import React, {useEffect, useRef, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
  Smartphone,
} from 'lucide-react-native';
import {AuthStackParamList} from '../../navigation/types';
import {colors, fontSize, radius, scale, spacing, typography} from '../../theme';
import Button from '../../components/ui/Button';
import AppImage from '../../components/ui/AppImage';
import {
  useResendOtpMutation,
  useVerifyOtpMutation,
} from '../../api/services/authApi';
import {useAppDispatch} from '../../store';
import {setCredentials} from './authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'OtpVerify'>;
type Route = RouteProp<AuthStackParamList, 'OtpVerify'>;

const OTP_LENGTH = 6;

const SCRIM: string[] = [
  'rgba(6,32,60,0.72)',
  'rgba(10,77,140,0.30)',
  'rgba(6,32,60,0.80)',
  'rgba(5,20,38,0.96)',
];

const maskContact = (value?: string): string => {
  if (!value) return '';
  if (value.includes('@')) {
    const [name, domain] = value.split('@');
    const visible = name.slice(0, 2);
    return `${visible}${'•'.repeat(Math.max(name.length - 2, 2))}@${domain}`;
  }
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 4) return value;
  return `${'•'.repeat(digits.length - 4)}${digits.slice(-4)}`;
};

export const OtpVerifyScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const {params} = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const [verify, {isLoading}] = useVerifyOtpMutation();
  const [resend, {isLoading: resending}] = useResendOtpMutation();

  const [otp, setOtp] = useState(params.demoOtp ?? '');
  const [seconds, setSeconds] = useState(32);
  const [errorMsg, setErrorMsg] = useState('');

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const handleVerify = async () => {
    try {
      setErrorMsg('');
      const res = await verify({userId: params.userId, otp}).unwrap();
      await AsyncStorage.setItem('axnol_token', res.token);
      await AsyncStorage.setItem('axnol_user', JSON.stringify(res.user));
      dispatch(setCredentials({token: res.token, user: res.user}));
      navigation.navigate('ApprovalPending', {
        userId: params.userId,
        email: params.email,
      });
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Verification failed. Please try again.');
    }
  };

  const handleResend = async () => {
    if (seconds > 0) return;
    const res = await resend({userId: params.userId}).unwrap();
    setOtp(res.demoOtp);
    setSeconds(32);
  };

  const renderOtpBoxes = () => {
    const boxes = [];
    for (let i = 0; i < OTP_LENGTH; i++) {
      const isFocused = otp.length === i;
      const isFilled = Boolean(otp[i]);
      boxes.push(
        <View
          key={i}
          style={[
            styles.otpBox,
            isFilled && styles.otpBoxFilled,
            isFocused && styles.otpBoxFocused,
          ]}>
          <Text style={styles.otpText}>{otp[i] || ''}</Text>
        </View>
      );
    }
    return boxes;
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <AppImage
        uri="auth_welcome_bg_ai"
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={SCRIM}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + scale(72),
              paddingBottom: insets.bottom + spacing.xxl,
            },
          ]}
          bounces={false}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.eyebrow}>VERIFICATION</Text>
          <Text style={styles.title}>Verify Your Mobile Number</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code we sent to{'\n'}
            <Text style={styles.highlight}>{maskContact(params.email)}</Text>
          </Text>

          <View style={styles.iconContainer}>
            <View style={styles.iconRing}>
              <View style={styles.iconCircle}>
                <Smartphone
                  size={scale(44)}
                  color={colors.accent}
                  strokeWidth={1.6}
                />
              </View>
              <View style={styles.badge}>
                <MessageSquare
                  size={scale(15)}
                  color={colors.textInverse}
                  fill={colors.textInverse}
                />
              </View>
            </View>
          </View>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            activeOpacity={1}
            style={styles.otpContainer}
            onPress={() => inputRef.current?.focus()}>
            {renderOtpBoxes()}
            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={t => {
                setErrorMsg('');
                setOtp(t.replace(/[^0-9]/g, ''));
              }}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              style={styles.hiddenInput}
              caretHidden
              autoFocus
            />
          </TouchableOpacity>

          <Text style={styles.timerText}>
            {seconds > 0
              ? `Resend code in 00:${seconds.toString().padStart(2, '0')}`
              : "Didn't receive the code?"}
          </Text>

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={seconds > 0 || resending}
              onPress={handleResend}>
              <Text style={[styles.resendLink, seconds > 0 && styles.resendOff]}>
                {' '}
                Resend OTP
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Verify & Continue"
            size="medium"
            onPress={handleVerify}
            loading={isLoading}
            disabled={otp.length !== OTP_LENGTH}
          />

          <View style={styles.secureRow}>
            <ShieldCheck size={scale(14)} color="rgba(255,255,255,0.65)" />
            <Text style={styles.secureText}>Your details are safe and secure</Text>
          </View>

          <View style={styles.demoPill}>
            <Text style={styles.demoText}>Demo OTP: {params.demoOtp ?? otp}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.header, {paddingTop: insets.top + spacing.sm}]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <ArrowLeft size={scale(20)} color={colors.textInverse} />
        </TouchableOpacity>
        <AppImage uri="logo" resizeMode="contain" style={styles.headerLogo} />
        <View style={styles.headerSpacer} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  flex: {flex: 1},
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  backBtn: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(21),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  headerLogo: {
    width: scale(120),
    height: scale(40),
  },
  headerSpacer: {
    width: scale(42),
  },
  eyebrow: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    color: colors.accent,
    letterSpacing: 1.8,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.bold,
    fontSize: fontSize.xxl,
    color: colors.textInverse,
    lineHeight: fontSize.xxl * 1.2,
  },
  subtitle: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: fontSize.sm * 1.5,
    marginTop: spacing.sm,
  },
  highlight: {
    ...typography.semibold,
    color: colors.accent,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: spacing.xxl,
  },
  iconRing: {
    width: scale(112),
    height: scale(112),
    borderRadius: scale(56),
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: scale(84),
    height: scale(84),
    borderRadius: scale(42),
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: scale(6),
    right: scale(10),
    backgroundColor: colors.accent,
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primaryDark,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  otpBox: {
    width: scale(46),
    height: scale(56),
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.32)',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: {
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  otpBoxFocused: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(255, 255, 255, 0.26)',
  },
  otpText: {
    ...typography.bold,
    fontSize: fontSize.xl,
    color: colors.textInverse,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  errorBox: {
    backgroundColor: 'rgba(220, 38, 38, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.medium,
    fontSize: fontSize.sm,
    color: '#FFD1D1',
    textAlign: 'center',
  },
  timerText: {
    ...typography.medium,
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  resendText: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  resendLink: {
    ...typography.bold,
    fontSize: fontSize.sm,
    color: colors.accent,
  },
  resendOff: {opacity: 0.5},
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  secureText: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  demoPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(245, 166, 35, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.4)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.lg,
  },
  demoText: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    color: colors.accent,
  },
});

export default OtpVerifyScreen;
