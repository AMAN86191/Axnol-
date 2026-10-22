import React, { useEffect, useRef, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react-native';
import { AuthStackParamList } from '../../navigation/types';
import { colors, fontSize, radius, scale, spacing, typography } from '../../theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useForgotPasswordMutation,
  useResendOtpMutation,
  useResetPasswordMutation,
  useVerifyOtpMutation,
} from '../../api/services/authApi';
import Logo from '../../components/ui/Logo';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const schema = z
  .object({
    email: z.string().trim().min(1, 'Required'),
    password: z.string().min(8, 'Minimum 8 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

const STEPS = [
  { n: 1, label: 'Account Email' },
  { n: 2, label: 'Verification' },
  { n: 3, label: 'New Password' },
];

const OTP_LENGTH = 6;

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

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [sendOtp, { isLoading: sending }] = useForgotPasswordMutation();
  const [verify, { isLoading: verifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: resending }] = useResendOtpMutation();
  const [resetPassword, { isLoading: resetting }] = useResetPasswordMutation();

  const [step, setStep] = useState<number>(1);
  const scrollRef = useRef<ScrollView>(null);
  const otpInputRef = useRef<TextInput>(null);

  const [otpData, setOtpData] = useState<{
    userId: string;
    demoOtp?: string;
  } | null>(null);
  const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [otpError, setOtpError] = useState('');
  const [resetError, setResetError] = useState('');

  const { control, handleSubmit, trigger, setError, watch, getValues } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { email: '', password: '', confirmPassword: '' },
    });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  const pwChecks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'An uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'A lowercase letter', ok: /[a-z]/.test(password) },
    { label: 'A number', ok: /[0-9]/.test(password) },
  ];
  const canSubmitPassword =
    pwChecks.every(c => c.ok) && confirmPassword.length > 0;

  // Start the resend countdown whenever the OTP step opens
  useEffect(() => {
    if (step !== 2) return;
    setSeconds(32);
    const t = setInterval(() => setSeconds(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [step]);

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      navigation.goBack();
    }
  };

  const handleSendOtp = async () => {
    const ok = await trigger(['email']);
    if (!ok) return;
    try {
      const res = await sendOtp({ email: getValues('email') }).unwrap();
      setOtpData({ userId: res.userId, demoOtp: res.demoOtp });
      setOtp(res.demoOtp ?? '');
      setOtpError('');
      setStep(2);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } catch (err: any) {
      setError('email', {
        message: err?.data?.message ?? 'No account found with this email.',
      });
    }
  };

  const handleVerify = async () => {
    if (!otpData) return;
    try {
      setOtpError('');
      await verify({ userId: otpData.userId, otp }).unwrap();
      setResetError('');
      setStep(3);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } catch (err: any) {
      setOtpError(err?.data?.message || 'Verification failed. Please try again.');
    }
  };

  const handleResend = async () => {
    if (seconds > 0 || !otpData) return;
    const res = await resendOtp({ userId: otpData.userId }).unwrap();
    setOtp(res.demoOtp);
    setOtpError('');
    setSeconds(32);
  };

  const onSetPassword = async (values: FormValues) => {
    if (!otpData) return;
    try {
      setResetError('');
      await resetPassword({
        userId: otpData.userId,
        password: values.password,
      }).unwrap();
      navigation.navigate('Login');
    } catch (err: any) {
      setResetError(
        err?.data?.message || 'Could not reset password. Please try again.',
      );
    }
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
        </View>,
      );
    }
    return boxes;
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* Ambient tint blobs */}
      <View pointerEvents="none" style={styles.blobBlue} />
      <View pointerEvents="none" style={styles.blobAmber} />

      {/* Fixed Header */}
      <View style={[styles.header, { paddingTop: insets.top + scale(6) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={goBack}
          activeOpacity={0.75}>
          {step > 1 ? (
            <ArrowLeft size={scale(22)} color="#1E293B" />
          ) : (
            <ChevronLeft size={scale(22)} color="#1E293B" />
          )}
        </TouchableOpacity>
        <Logo height={scale(36)} />
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + scale(60),
              paddingBottom: insets.bottom + scale(40),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.eyebrow}>PASSWORD RESET</Text>
            <Text style={styles.title}>
              {step === 3 ? 'Set New Password' : 'Forgot Password?'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1 &&
                'Enter your registered email to receive a verification code.'}
              {step === 2 &&
                'Verify your identity to continue resetting your password.'}
              {step === 3 && 'Create a strong new password for your account.'}
            </Text>
          </View>

          {/* Stepper Progress Indicator */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepperTrack}>
              {STEPS.map((s, idx) => {
                const done = s.n < step;
                const active = s.n === step;
                return (
                  <React.Fragment key={s.n}>
                    {idx > 0 && (
                      <View
                        style={[styles.stepLine, s.n <= step && styles.stepLineDone]}
                      />
                    )}
                    <View style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepCircle,
                          active && styles.stepCircleActive,
                          done && styles.stepCircleDone,
                        ]}>
                        {done ? (
                          <Check size={scale(12)} color="#FFFFFF" strokeWidth={3} />
                        ) : (
                          <Text style={active ? styles.stepNumActive : styles.stepNum}>
                            {s.n}
                          </Text>
                        )}
                      </View>
                      <Text style={active || done ? styles.stepLabelActive : styles.stepLabel}>
                        {s.label}
                      </Text>
                    </View>
                  </React.Fragment>
                );
              })}
            </View>
          </View>

          {/* Main Frosted Glass Card Container */}
          <View style={styles.mainCard}>
            {/* Diagonal light sheen across the glass */}
            <LinearGradient
              colors={[
                'rgba(255,255,255,0.55)',
                'rgba(255,255,255,0.08)',
                'rgba(255,255,255,0)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.glassSheen}
            />

            {step === 1 ? (
              <>
                {/* ================= STEP 1: Account Email ================= */}
                <View style={styles.sectionHeaderRow}>
                  <View style={[styles.sectionBadge, styles.badgeBlue]}>
                    <KeyRound size={scale(19)} color="#0284C7" strokeWidth={2.2} />
                  </View>
                  <View style={styles.sectionHeaderTexts}>
                    <Text style={styles.sectionHeaderTitle}>Find Your Account</Text>
                    <Text style={styles.sectionHeaderSubtitle}>
                      We will send a code to verify it is you
                    </Text>
                  </View>
                </View>

                <Controller
                  name="email"
                  control={control}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <Input
                      variant="clean"
                      required
                      label="Email Address"
                      placeholder="Enter your registered email"
                      value={value}
                      onChangeText={onChange}
                      error={error?.message}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      leftIcon={Mail}
                      containerStyle={styles.fieldSpacing}
                    />
                  )}
                />

                <Button
                  title="Send OTP"
                  variant="outline"
                  size="medium"
                  onPress={handleSendOtp}
                  loading={sending}
                  iconRight={<ArrowRight size={scale(18)} color={colors.primary} strokeWidth={2.2} />}
                  // style={styles.actionBtn}
                  textStyle={styles.actionBtnText}
                />

                <View style={styles.signInRow}>
                  <Text style={styles.signInText}>Remember your password? </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.signInLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : step === 2 ? (
              <>
                {/* ================= STEP 2: OTP Verification ================= */}
                <View style={styles.sectionHeaderRow}>
                  <View style={[styles.sectionBadge, styles.badgeOrange]}>
                    <ShieldCheck size={scale(19)} color="#EA580C" strokeWidth={2.2} />
                  </View>
                  <View style={styles.sectionHeaderTexts}>
                    <Text style={styles.sectionHeaderTitle}>OTP Verification</Text>
                    <Text style={styles.sectionHeaderSubtitle}>
                      Enter the 6-digit code we sent to{'\n'}
                      <Text style={styles.maskedContact}>
                        {maskContact(getValues('email'))}
                      </Text>
                    </Text>
                  </View>
                </View>

                {otpError ? (
                  <View style={styles.inlineErrorBox}>
                    <Text style={styles.inlineErrorText}>{otpError}</Text>
                  </View>
                ) : null}

                <View style={styles.otpContainer}>
                  {renderOtpBoxes()}
                  <TextInput
                    ref={otpInputRef}
                    value={otp}
                    onChangeText={t => {
                      setOtpError('');
                      setOtp(t.replace(/[^0-9]/g, ''));
                    }}
                    keyboardType="number-pad"
                    maxLength={OTP_LENGTH}
                    style={styles.hiddenInput}
                    caretHidden
                    autoFocus
                    textContentType="oneTimeCode"
                    autoComplete="sms-otp"
                    selectionColor="transparent"
                  />
                </View>

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
                  variant="outline"
                  size="medium"
                  onPress={handleVerify}
                  loading={verifying}
                  disabled={otp.length !== OTP_LENGTH}
                  iconRight={<ArrowRight size={scale(18)} color={colors.primary} strokeWidth={2.2} />}
                  // style={styles.actionBtn}
                  textStyle={styles.actionBtnText}
                />

                <TouchableOpacity
                  style={styles.backStepBtn}
                  activeOpacity={0.7}
                  onPress={() => {
                    setStep(1);
                    scrollRef.current?.scrollTo({ y: 0, animated: false });
                  }}>
                  <Text style={styles.backStepText}>← Back to Email</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* ================= STEP 3: New Password ================= */}
                <View style={styles.sectionHeaderRow}>
                  <View style={[styles.sectionBadge, styles.badgeGreen]}>
                    <Lock size={scale(19)} color="#16A34A" strokeWidth={2.2} />
                  </View>
                  <View style={styles.sectionHeaderTexts}>
                    <Text style={styles.sectionHeaderTitle}>Create New Password</Text>
                    <Text style={styles.sectionHeaderSubtitle}>
                      Make it strong and unique
                    </Text>
                  </View>
                </View>

                {resetError ? (
                  <View style={styles.inlineErrorBox}>
                    <Text style={styles.inlineErrorText}>{resetError}</Text>
                  </View>
                ) : null}

                <Controller
                  name="password"
                  control={control}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <Input
                      variant="clean"
                      required
                      secureTextEntry
                      label="New Password"
                      placeholder="Enter new password"
                      value={value}
                      onChangeText={onChange}
                      error={error?.message}
                      leftIcon={Lock}
                      containerStyle={styles.fieldSpacing}
                    />
                  )}
                />

                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <Input
                      variant="clean"
                      required
                      secureTextEntry
                      label="Confirm Password"
                      placeholder="Confirm new password"
                      value={value}
                      onChangeText={onChange}
                      error={error?.message}
                      leftIcon={Lock}
                      containerStyle={styles.fieldSpacing}
                    />
                  )}
                />

                <View style={styles.checkList}>
                  {pwChecks.map(c => (
                    <View key={c.label} style={styles.checkRow}>
                      <CheckCircle2
                        size={scale(16)}
                        color={c.ok ? '#16A34A' : '#CBD5E1'}
                      />
                      <Text style={[styles.checkText, c.ok && styles.checkTextOk]}>
                        {c.label}
                      </Text>
                    </View>
                  ))}
                </View>

                <Button
                  title="Set New Password"
                  variant="outline"
                  size="medium"
                  onPress={handleSubmit(onSetPassword)}
                  loading={resetting}
                  disabled={!canSubmitPassword}
                  iconRight={<ArrowRight size={scale(18)} color={colors.primary} strokeWidth={2.2} />}
                  // style={styles.actionBtn}
                  textStyle={styles.actionBtnText}
                />

                <TouchableOpacity
                  style={styles.backStepBtn}
                  activeOpacity={0.7}
                  onPress={() => {
                    setStep(2);
                    scrollRef.current?.scrollTo({ y: 0, animated: false });
                  }}>
                  <Text style={styles.backStepText}>← Back to Verification</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  blobBlue: {
    position: 'absolute',
    top: scale(120),
    left: -scale(80),
    width: scale(240),
    height: scale(240),
    borderRadius: scale(120),
    backgroundColor: 'rgba(2,132,199,0.10)',
  },
  blobAmber: {
    position: 'absolute',
    top: scale(380),
    right: -scale(70),
    width: scale(220),
    height: scale(220),
    borderRadius: scale(110),
    backgroundColor: 'rgba(2,132,199,0.10)',
  },
  flex: {
    flex: 1,
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
    zIndex: 10,
  },
  backBtn: {
      width: scale(30),
    height: scale(30),
    borderRadius: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  headerSpacer: {
    width: scale(40),
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  titleSection: {
    marginTop: scale(10),
    marginBottom: scale(16),
  },
  eyebrow: {
    fontSize: scale(11.5),
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 1.5,
    marginBottom: scale(4),
  },
  title: {
     fontSize: scale(25),
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.4,
    marginBottom: scale(4),
  },
  subtitle: {
    fontSize: scale(13),
    color: '#64748B',
    lineHeight: scale(18.5),
  },
  stepperContainer: {
    marginBottom: scale(20),
    paddingHorizontal: scale(4),
  },
  stepperTrack: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    width: scale(90),
  },
  stepCircle: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(4),
  },
  stepCircleActive: {
    backgroundColor: '#063970',
  },
  stepCircleDone: {
    backgroundColor: '#063970',
  },
  stepNum: {
    fontSize: scale(11.5),
    fontWeight: '700',
    color: '#64748B',
  },
  stepNumActive: {
    fontSize: scale(11.5),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: scale(10.5),
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  stepLabelActive: {
    fontSize: scale(11),
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  stepLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#CBD5E1',
    marginTop: scale(11),
    marginHorizontal: scale(2),
  },
  stepLineDone: {
    backgroundColor: '#063970',
  },
  mainCard: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: radius.xl,
    paddingVertical: scale(15),
    paddingHorizontal: scale(10),
    borderWidth: 1.2,
    borderColor: 'rgba(203,213,225,0.5)',
    // shadowColor: '#0F172A',
    // shadowOffset: {width: 0, height: 8},
    // shadowOpacity: 0.08,
    // shadowRadius: 16,
    // elevation: 1,
    marginBottom: scale(20),
  },
  glassSheen: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(14),
    gap: scale(10),
  },
  sectionBadge: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeBlue: {
    backgroundColor: '#EFF6FF',
  },
  badgeOrange: {
    backgroundColor: '#FFF7ED',
  },
  badgeGreen: {
    backgroundColor: '#F0FDF4',
  },
  sectionHeaderTexts: {
    justifyContent: 'center',
    flex: 1,
  },
  sectionHeaderTitle: {
    fontSize: scale(15),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  sectionHeaderSubtitle: {
    fontSize: scale(11.5),
    color: '#64748B',
    marginTop: 1,
    lineHeight: scale(16),
  },
  maskedContact: {
    fontWeight: '700',
    color: '#063970',
  },
  fieldSpacing: {
    marginBottom: scale(14),
  },
  actionBtn: {
    height: scale(48),
    borderRadius: scale(12),
    backgroundColor: '#063970',
    shadowColor: '#063970',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
    marginTop: scale(4),
  },
  actionBtnText: {
    fontSize: scale(14.5),
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scale(16),
  },
  signInText: {
    fontSize: scale(12.5),
    color: '#64748B',
    fontWeight: '500',
  },
  signInLink: {
    fontSize: scale(12.5),
    fontWeight: '800',
    color: '#0284C7',
  },
  backStepBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  backStepText: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: '#0284C7',
  },
  inlineErrorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.md,
    padding: scale(10),
    marginBottom: scale(14),
  },
  inlineErrorText: {
    ...typography.medium,
    fontSize: fontSize.sm,
    color: '#DC2626',
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  otpBox: {
    width: scale(44),
    height: scale(52),
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: {
    borderColor: '#063970',
    backgroundColor: '#EFF6FF',
  },
  otpBoxFocused: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  otpText: {
    ...typography.bold,
    fontSize: fontSize.xl,
    color: '#0F172A',
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
  },
  timerText: {
    ...typography.medium,
    fontSize: fontSize.sm,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  resendText: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: '#64748B',
  },
  resendLink: {
    ...typography.bold,
    fontSize: fontSize.sm,
    color: '#0284C7',
  },
  resendOff: { opacity: 0.5 },
  checkList: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkText: {
    ...typography.medium,
    fontSize: fontSize.sm,
    color: '#94A3B8',
  },
  checkTextOk: {
    color: '#16A34A',
  },
});

export default ForgotPasswordScreen;
