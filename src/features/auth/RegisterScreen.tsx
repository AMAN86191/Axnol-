import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
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
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  Clock3,
  Lock,
  Mail,
  Percent,
  Phone,
  ShieldCheck,
  Smartphone,
  User,
} from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParamList } from '../../navigation/types';
import { colors, fontSize, radius, scale, spacing, typography } from '../../theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AppImage from '../../components/ui/AppImage';
import images from '../../assets/images';
import {
  useRegisterMutation,
  useResendOtpMutation,
  useVerifyOtpMutation,
} from '../../api/services/authApi';
import { useAppDispatch } from '../../store';
import { logout, setCredentials } from './authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name'),
  phone: z.string().trim().min(10, 'Please enter a valid 10-digit mobile number'),
  email: z.string().trim().email('Please enter a valid email address'),
  company: z.string().trim().min(2, 'Please enter company name'),
  gstin: z.string().trim().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

const STEPS = [
  { n: 1, label: 'Account Details' },
  { n: 2, label: 'Company Details' },
  { n: 3, label: 'Verification' },
];

const STEP1_FIELDS: (keyof FormValues)[] = ['name', 'phone', 'email'];

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

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  const [verify, { isLoading: verifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: resending }] = useResendOtpMutation();
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState<number>(1);
  const scrollRef = useRef<ScrollView>(null);
  const otpInputRef = useRef<TextInput>(null);

  // Credentials returned by the register API, used for the OTP step
  const [otpData, setOtpData] = useState<{
    userId: string;
    email: string;
    demoOtp?: string;
  } | null>(null);
  const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [otpError, setOtpError] = useState('');

  // Start the resend countdown whenever the OTP step opens
  useEffect(() => {
    if (step !== 3) return;
    setSeconds(32);
    const t = setInterval(() => setSeconds(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [step]);

  // Success-step celebration: medallion pops in, halo ring pings
  const popAnim = useRef(new Animated.Value(0)).current;
  const pingAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (step !== 4) return;
    popAnim.setValue(0);
    Animated.spring(popAnim, {
      toValue: 1,
      friction: 7,
      tension: 90,
      useNativeDriver: true,
    }).start();
    pingAnim.setValue(0);
    const loop = Animated.loop(
      Animated.timing(pingAnim, {
        toValue: 1,
        duration: 2200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [step, popAnim, pingAnim]);

  const pingScale = pingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.4],
  });
  const pingOpacity = pingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 0],
  });

  const { control, handleSubmit, trigger } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      company: '',
      gstin: '',
      password: '',
    },
  });

  const goStep2 = async () => {
    const ok = await trigger(STEP1_FIELDS);
    if (ok) {
      setStep(2);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const clearSession = async () => {
    dispatch(logout());
    await AsyncStorage.removeItem('axnol_token');
    await AsyncStorage.removeItem('axnol_user');
  };

  const goToLoginFresh = async () => {
    await clearSession();
    navigation.navigate('Login');
  };

  const goBack = () => {
    if (step === 4) {
      goToLoginFresh();
    } else if (step > 1) {
      setStep(step - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      navigation.goBack();
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!agreed) {
      Alert.alert(
        'Terms & Conditions',
        'Please agree to the Terms & Conditions and Privacy Policy to continue.',
      );
      return;
    }
    try {
      const res = await register(values).unwrap();
      setOtpData({
        userId: res.userId,
        email: values.email,
        demoOtp: res.demoOtp,
      });
      setOtp(res.demoOtp ?? '');
      setOtpError('');
      setStep(3);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } catch (err: any) {
      Alert.alert(
        'Registration Failed',
        err?.data?.message ?? 'Could not create account. Please try again.',
      );
    }
  };

  const handleVerify = async () => {
    if (!otpData) return;
    try {
      setOtpError('');
      const res = await verify({ userId: otpData.userId, otp }).unwrap();
      await AsyncStorage.setItem('axnol_token', res.token);
      await AsyncStorage.setItem('axnol_user', JSON.stringify(res.user));
      dispatch(setCredentials({ token: res.token, user: res.user }));
      setStep(4);
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



      {/* Ambient tint blobs so the frosted glass card has light to catch */}
      <View pointerEvents="none" style={styles.blobBlue} />
      <View pointerEvents="none" style={styles.blobAmber} />
      <View pointerEvents="none" style={styles.blobSky} />



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
          {/* Fixed Header */}
          <View style={[styles.header, { paddingTop: insets.top + scale(6) }]}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={goBack}
              activeOpacity={0.75}>
              {step > 1 ? (
                <ArrowLeft size={scale(20)} color="#1E293B" />
              ) : (
                <ChevronLeft size={scale(20)} color="#1E293B" />
              )}
            </TouchableOpacity>
            <AppImage uri="logo" resizeMode="contain" style={styles.headerLogo} />
            <View style={styles.headerSpacer} />
          </View>
          {/* Top Right Background Art (Gears and Oil Splash) */}
          <Image
            source={images.register_corner_bg}
            style={styles.cornerBg}
            resizeMode="contain"
          />
          {/* Title and Eyebrow Section */}
          <View style={styles.titleSection}>
            <Text style={styles.eyebrow}>
              {step === 4 ? 'ALL DONE' : 'GET STARTED'}
            </Text>
            <Text style={styles.title}>
              {step === 4 ? 'Account Created!' : 'Create Your Account'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 4 ? (
                "You're one step away from accessing the Axnol portal."
              ) : (
                <>
                  Join Axnol Lubetech to access products,{'\n'}request pricing
                  and more.
                </>
              )}
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
                {/* ================= STEP 1: Personal Details ================= */}
                <View style={styles.sectionHeaderRow}>
                  <View style={[styles.sectionBadge, styles.badgeBlue]}>
                    <User size={scale(19)} color="#0284C7" strokeWidth={2.2} />
                  </View>
                  <View style={styles.sectionHeaderTexts}>
                    <Text style={styles.sectionHeaderTitle}>Personal Details</Text>
                    <Text style={styles.sectionHeaderSubtitle}>Tell us about yourself</Text>
                  </View>
                </View>

                {/* Full Name */}
                <Controller
                  name="name"
                  control={control}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <Input
                      variant="clean"
                      required
                      label="Full Name"
                      placeholder="Enter your full name"
                      value={value}
                      onChangeText={onChange}
                      error={error?.message}
                      leftIcon={User}
                      containerStyle={styles.fieldSpacing}
                    />
                  )}
                />

                {/* Mobile Number with Phone Country Code dropdown */}
                <Controller
                  name="phone"
                  control={control}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <Input
                      variant="clean"
                      required
                      label="Mobile Number"
                      placeholder="Enter mobile number"
                      value={value}
                      onChangeText={onChange}
                      error={error?.message}
                      keyboardType="phone-pad"
                      leftComponent={
                        <View style={styles.phonePrefixWrap}>
                          <Phone size={scale(17)} color="#94A3B8" />
                          <Text style={styles.phoneCountryCode}>+91</Text>
                          <ChevronDown size={scale(13)} color="#64748B" />
                          <View style={styles.phoneDivider} />
                        </View>
                      }
                      containerStyle={styles.fieldSpacing}
                    />
                  )}
                />

                {/* Email Address */}
                <Controller
                  name="email"
                  control={control}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <Input
                      variant="clean"
                      required
                      label="Email Address"
                      placeholder="Enter your email address"
                      value={value}
                      onChangeText={onChange}
                      error={error?.message}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      leftIcon={Mail}
                      containerStyle={styles.fieldSpacing}
                    />
                  )}
                />

                {/* Continue to Step 2 */}
                <Button
                  title="Continue"
                  variant="outline"
                  size="medium"
                  onPress={goStep2}
                  iconRight={<ArrowRight size={scale(18)} color={colors.primary} strokeWidth={2.2} />}
                  // style={styles.registerBtn}
                  textStyle={styles.registerBtnText}
                />

                {/* Already have an account? Sign In */}
                <View style={styles.signInRow}>
                  <Text style={styles.signInText}>Already have an account? </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.signInLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : step === 2 ? (
              <>
                {/* ================= STEP 2: Company Details ================= */}
                <View style={styles.sectionHeaderRow}>
                  <View style={[styles.sectionBadge, styles.badgeOrange]}>
                    <Building2 size={scale(19)} color="#EA580C" strokeWidth={2.2} />
                  </View>
                  <View style={styles.sectionHeaderTexts}>
                    <Text style={styles.sectionHeaderTitle}>Company Details</Text>
                    <Text style={styles.sectionHeaderSubtitle}>
                      Provide your company information
                    </Text>
                  </View>
                </View>

                {/* Company Name */}
                <Controller
                  name="company"
                  control={control}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <Input
                      variant="clean"
                      required
                      label="Company Name"
                      placeholder="Enter company name"
                      value={value}
                      onChangeText={onChange}
                      error={error?.message}
                      leftIcon={Building2}
                      containerStyle={styles.fieldSpacing}
                    />
                  )}
                />

                {/* GST Number (Optional) */}
                <Controller
                  name="gstin"
                  control={control}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <Input
                      variant="clean"
                      label="GST Number"
                      placeholder="Enter GST number"
                      value={value}
                      onChangeText={onChange}
                      error={error?.message}
                      autoCapitalize="characters"
                      leftIcon={Percent}
                      containerStyle={styles.fieldSpacing}
                    />
                  )}
                />

                {/* Divider between Company and Security */}
                <View style={styles.sectionDivider} />

                {/* ================= Account Security ================= */}
                <View style={styles.sectionHeaderRow}>
                  <View style={[styles.sectionBadge, styles.badgeGreen]}>
                    <Lock size={scale(19)} color="#16A34A" strokeWidth={2.2} />
                  </View>
                  <View style={styles.sectionHeaderTexts}>
                    <Text style={styles.sectionHeaderTitle}>Account Security</Text>
                    <Text style={styles.sectionHeaderSubtitle}>Create a strong password</Text>
                  </View>
                </View>

                {/* Password */}
                <Controller
                  name="password"
                  control={control}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <View>
                      <Input
                        variant="clean"
                        required
                        secureTextEntry
                        label="Password"
                        placeholder="Create a password"
                        value={value}
                        onChangeText={onChange}
                        error={error?.message}
                        leftIcon={Lock}
                        containerStyle={{ marginBottom: scale(6) }}
                      />
                      {/* Password requirements bullets */}
                      <View style={styles.pwHintsRow}>
                        <Text style={styles.pwHintItem}>• Minimum 6 characters</Text>
                        <Text style={styles.pwHintItem}>• At least one letter</Text>
                        <Text style={styles.pwHintItem}>• At least one number</Text>
                      </View>
                    </View>
                  )}
                />

                {/* Agreement Terms Checkbox Box */}
                <TouchableOpacity
                  style={styles.termsBox}
                  activeOpacity={0.8}
                  onPress={() => setAgreed(!agreed)}>
                  <View style={[styles.checkboxSquare, agreed && styles.checkboxSquareChecked]}>
                    {agreed && <Check size={scale(12)} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                  <Text style={styles.termsText}>
                    I agree to the{' '}
                    <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>

                {/* Register Account Action Button */}
                <Button
                  title="Register Account"
                  variant="outline"
                  size="medium"
                  onPress={handleSubmit(onSubmit)}
                  loading={isLoading}
                  iconRight={<ArrowRight size={scale(18)} color={colors.primary} strokeWidth={2.2} />}
                  // style={styles.registerBtn}
                  textStyle={styles.registerBtnText}
                />

                {/* Back to Step 1 */}
                <TouchableOpacity
                  style={styles.backStepBtn}
                  activeOpacity={0.7}
                  onPress={() => {
                    setStep(1);
                    scrollRef.current?.scrollTo({ y: 0, animated: false });
                  }}>
                  <Text style={styles.backStepText}>← Back to Personal Details</Text>
                </TouchableOpacity>

                {/* Already have an account? Sign In */}
                <View style={styles.signInRow}>
                  <Text style={styles.signInText}>Already have an account? </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.signInLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : step === 3 ? (
              <>
                {/* ================= STEP 3: OTP Verification ================= */}
                <View style={styles.sectionHeaderRow}>
                  <View style={[styles.sectionBadge, styles.badgeBlue]}>
                    <Smartphone size={scale(19)} color="#0284C7" strokeWidth={2.2} />
                  </View>
                  <View style={styles.sectionHeaderTexts}>
                    <Text style={styles.sectionHeaderTitle}>OTP Verification</Text>
                    <Text style={styles.sectionHeaderSubtitle}>
                      Enter the 6-digit code we sent to{'\n'}
                      <Text style={styles.maskedContact}>
                        {otpData ? maskContact(otpData.email) : ''}
                      </Text>
                    </Text>
                  </View>
                </View>

                {otpError ? (
                  <View style={styles.otpErrorBox}>
                    <Text style={styles.otpErrorText}>{otpError}</Text>
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
                  title="Verify & Complete Registration"
                  variant="outline"
                  size="medium"
                  onPress={handleVerify}
                  loading={verifying}
                  disabled={otp.length !== OTP_LENGTH}
                  iconRight={<ArrowRight size={scale(18)} color={colors.primary} strokeWidth={2.2} />}
                  // style={styles.registerBtn}
                  textStyle={styles.registerBtnText}
                />

                <View style={styles.secureRow}>
                  <ShieldCheck size={scale(14)} color="#16A34A" />
                  <Text style={styles.secureText}>Your details are safe and secure</Text>
                </View>

                {otpData?.demoOtp ? (
                  <View style={styles.demoPill}>
                    <Text style={styles.demoText}>Demo OTP: {otpData.demoOtp}</Text>
                  </View>
                ) : null}
              </>
            ) : (
              <>
                {/* ================= STEP 4: Success ================= */}
                <View style={styles.successArt}>
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.pingRing,
                      {transform: [{scale: pingScale}], opacity: pingOpacity},
                    ]}
                  />
                  <View style={styles.successHalo} />
                  <Animated.View
                    style={[styles.successMedal, {transform: [{scale: popAnim}]}]}>
                    <Check size={scale(52)} color="#FFFFFF" strokeWidth={2.5} />
                  </Animated.View>
                </View>

                <Text style={styles.successTitle}>
                  Account Created Successfully
                </Text>
                <Text style={styles.successSubtitle}>
                  Your Axnol Lubetech account has been created. Our team will
                  review your details and activate your account shortly.
                </Text>

                <View style={styles.pendingPill}>
                  <Clock3 size={scale(16)} color="#B45309" />
                  <Text style={styles.pendingText}>
                    Pending administrator approval
                  </Text>
                </View>

                <View style={styles.noteRow}>
                  <ShieldCheck size={scale(14)} color="#16A34A" />
                  <Text style={styles.noteText}>
                    You will be notified once your account is approved.
                  </Text>
                </View>

                <Button
                  title="Go to Login"
                  variant="outline"
                  size="medium"
                  onPress={goToLoginFresh}
                  iconRight={<ArrowRight size={scale(18)} color={colors.primary} strokeWidth={2.2} />}
                  style={styles.registerBtn}
                  textStyle={styles.registerBtnText}
                />
                {/* <Button
                  title="Continue as Guest"
                  variant="outline"
                  size="medium"
                  onPress={goToLoginFresh}
                  style={styles.guestBtn}
                  textStyle={styles.guestBtnText}
                /> */}
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
  cornerBg: {
    position: 'absolute',
    top: 0,
    right: -spacing.lg,
    width: scale(230),
    height: scale(220),
    zIndex: 0,
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
  headerLogo: {
    width: scale(135),
    height: scale(36),
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
  blobSky: {
    position: 'absolute',
    bottom: scale(40),
    left: -scale(60),
    width: scale(200),
    height: scale(200),
    borderRadius: scale(100),
    backgroundColor: 'rgba(57,184,253,0.10)',
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
  },
  fieldSpacing: {
    marginBottom: scale(14),
  },
  phonePrefixWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: scale(2),
    paddingRight: scale(8),
    gap: scale(4),
  },
  phoneCountryCode: {
    fontSize: scale(13.5),
    fontWeight: '700',
    color: '#1E293B',
  },
  phoneDivider: {
    width: 1,
    height: scale(22),
    backgroundColor: '#E2E8F0',
    marginLeft: scale(6),
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: scale(14),
  },
  pwHintsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: scale(2),
    marginBottom: scale(14),
  },
  pwHintItem: {
    fontSize: scale(9.5),
    color: '#64748B',
    fontWeight: '500',
  },
  termsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    marginBottom: scale(16),
    gap: scale(10),
  },
  checkboxSquare: {
    width: scale(18),
    height: scale(18),
    borderRadius: scale(4),
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSquareChecked: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  termsText: {
    fontSize: scale(11.5),
    color: '#334155',
    flex: 1,
    lineHeight: scale(16),
  },
  termsLink: {
    color: '#0284C7',
    fontWeight: '700',
  },
  registerBtn: {
    height: scale(48),
    borderRadius: scale(12),
    backgroundColor: '#063970',
    shadowColor: '#063970',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  registerBtnText: {
    fontSize: scale(13.5),
    fontWeight: '700',
    letterSpacing: 0.2,
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
  maskedContact: {
    fontWeight: '700',
    color: '#063970',
  },
  otpErrorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.md,
    padding: scale(10),
    marginBottom: scale(14),
  },
  otpErrorText: {
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
  resendOff: {opacity: 0.5},
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  secureText: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: '#64748B',
  },
  demoPill: {
    alignSelf: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.lg,
  },
  demoText: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    color: '#B45309',
  },
  successArt: {
    alignItems: 'center',
    justifyContent: 'center',
    height: scale(170),
    marginBottom: spacing.lg,
  },
  pingRing: {
    position: 'absolute',
    width: scale(140),
    height: scale(140),
    borderRadius: scale(70),
    borderWidth: 1.5,
    borderColor: '#0284C7',
  },
  successHalo: {
    position: 'absolute',
    width: scale(148),
    height: scale(148),
    borderRadius: scale(74),
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  successMedal: {
    width: scale(108),
    height: scale(108),
    borderRadius: scale(54),
    backgroundColor: '#063970',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#063970',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  successTitle: {
    ...typography.bold,
    fontSize: fontSize.xxl,
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: fontSize.xxl * 1.25,
  },
  successSubtitle: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: '#64748B',
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: fontSize.sm * 1.5,
    paddingHorizontal: spacing.sm,
  },
  pendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    alignSelf: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.xl,
  },
  pendingText: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    color: '#B45309',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  noteText: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: '#64748B',
  },
  guestBtn: {
    borderColor: '#E2E8F0',
    marginTop: spacing.md,
  },
  guestBtnText: {
    color: '#0F172A',
  },
});

export default RegisterScreen;
