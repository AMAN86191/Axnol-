import React, {useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../navigation/types';
import {colors, radius, spacing, theme} from '../../theme';
import Input from '../../components/ui/Input';
import {ShieldCheck} from 'lucide-react-native';
import Button from '../../components/ui/Button';
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
  const dispatch = useAppDispatch();
  const [verify, {isLoading}] = useVerifyOtpMutation();
  const [resend, {isLoading: resending}] = useResendOtpMutation();
  const [otp, setOtp] = useState(params.demoOtp ?? '');
  const [seconds, setSeconds] = useState(30);
  useEffect(() => {
    const t = setInterval(() => setSeconds(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const handleVerify = async () => {
    try {
      const res = await verify({userId: params.userId, otp}).unwrap();
      await AsyncStorage.setItem('axnol_token', res.token);
      await AsyncStorage.setItem('axnol_user', JSON.stringify(res.user));
      dispatch(setCredentials({token: res.token, user: res.user}));
      if (res.user.profileCompleted) {
        navigation.getParent()?.navigate('Main');
      } else {
        navigation.navigate('ProfileSetup');
      }
    } catch (err) {
      // ignore
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
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to {params.email}
          </Text>
        </View>
        <View style={styles.card}>
          <Input
            label="OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            leftIcon={ShieldCheck}
          />
          <Button
            title="Verify & Continue"
            onPress={handleVerify}
            loading={isLoading}
          />
          <View style={styles.resendRow}>
            <Text style={styles.resendText}>
              {seconds > 0 ? `Resend in ${seconds}s` : 'Didn’t receive code?'}
            </Text>
            <TouchableOpacity
              disabled={seconds > 0 || resending}
              onPress={handleResend}>
              <Text style={[styles.resendLink, seconds > 0 && {opacity: 0.4}]}>
                {' '}
                Resend OTP
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.demo}>Demo OTP: {params.demoOtp ?? otp}</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  header: {
    paddingTop: spacing.xxxl * 1.2,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  title: {
    ...theme.typography.bold,
    fontSize: theme.fontSize.xxxl,
    color: colors.text,
  },
  subtitle: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.xxl,
    flex: 1,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  resendText: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.md,
    color: colors.textSecondary,
  },
  resendLink: {
    ...theme.typography.bold,
    fontSize: theme.fontSize.md,
    color: colors.primary,
  },
  demo: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
export default OtpVerifyScreen;
