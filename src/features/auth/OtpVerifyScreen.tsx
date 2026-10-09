import React, {useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArrowLeft, ShieldCheck} from 'lucide-react-native';
import {AuthStackParamList} from '../../navigation/types';
import {colors, fontSize, radius, scale, spacing, typography} from '../../theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import {
  useResendOtpMutation,
  useVerifyOtpMutation,
} from '../../api/services/authApi';
import {useAppDispatch} from '../../store';
import {setCredentials} from './authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'OtpVerify'>;
type Route = RouteProp<AuthStackParamList, 'OtpVerify'>;

export const OtpVerifyScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const {params} = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [verify, {isLoading}] = useVerifyOtpMutation();
  const [resend, {isLoading: resending}] = useResendOtpMutation();
  const [otp, setOtp] = useState(params.demoOtp ?? '');
  const [seconds, setSeconds] = useState(30);
  const [errorMsg, setErrorMsg] = useState('');
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
      if (res.user.status === 'pending') {
        navigation.navigate('ApprovalPending', {
          userId: params.userId,
          email: params.email,
        });
      } else if (!res.user.profileCompleted) {
        navigation.navigate('ProfileSetup');
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Verification failed. Please try again.');
    }
  };
  const handleResend = async () => {
    if (seconds > 0) {
      return;
    }
    const res = await resend({userId: params.userId}).unwrap();
    setOtp(res.demoOtp);
    setSeconds(30);
  };
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.topRow, {paddingTop: insets.top + spacing.sm}]}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backBtn}
          hitSlop={12}
          onPress={() => navigation.goBack()}>
          <ArrowLeft size={scale(20)} color={colors.text} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        <Card style={styles.card}>
          <View style={styles.iconCircle}>
            <ShieldCheck size={scale(28)} color={colors.primary} />
          </View>
          <Text style={styles.title}>Verify your account</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to {params.email}
          </Text>
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}
          <Input
            label="6-digit code"
            value={otp}
            onChangeText={t => {
              setErrorMsg('');
              setOtp(t);
            }}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
          />
          <Button
            title="Verify"
            size="large"
            onPress={handleVerify}
            loading={isLoading}
          />
          <View style={styles.resendRow}>
            <Text style={styles.resendText}>
              {seconds > 0 ? `Resend in ${seconds}s` : "Didn't receive code?"}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={seconds > 0 || resending}
              onPress={handleResend}>
              <Text
                style={[styles.resendLink, seconds > 0 && styles.resendOff]}>
                Resend OTP
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.demoPill}>
            <Text style={styles.demoText}>
              Demo OTP: {params.demoOtp ?? otp}
            </Text>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  topRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  backBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  card: {alignItems: 'stretch'},
  iconCircle: {
    alignSelf: 'center',
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.bold,
    fontSize: fontSize.xl,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    lineHeight: fontSize.sm * 1.5,
  },
  errorBox: {
    backgroundColor: colors.dangerLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.medium,
    fontSize: fontSize.sm,
    color: colors.danger,
    textAlign: 'center',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  resendText: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  resendLink: {
    ...typography.bold,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  resendOff: {opacity: 0.4},
  demoPill: {
    alignSelf: 'center',
    backgroundColor: colors.accentLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.xl,
  },
  demoText: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    color: colors.accentDark,
  },
});
export default OtpVerifyScreen;
