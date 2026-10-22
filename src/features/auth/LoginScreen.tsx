import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthStackParamList } from '../../navigation/types';
import { colors, fontSize, radius, scale, spacing, typography } from '../../theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { AppleIcon, GoogleIcon } from '../../components/ui/BrandIcons';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLoginMutation } from '../../api/services/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch } from '../../store';
import { ArrowRight, ChevronLeft, Lock, User } from 'lucide-react-native';
import { logout, setCredentials } from './authSlice';
import Logo from '../../components/ui/Logo';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const schema = z.object({
  email: z.string().trim().min(1, 'Required'),
  password: z.string().min(6, 'Minimum 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'demo@axnol.in', password: 'axnol123' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await login(values).unwrap();
      await AsyncStorage.setItem('axnol_token', res.token);
      await AsyncStorage.setItem('axnol_user', JSON.stringify(res.user));
      dispatch(setCredentials({ token: res.token, user: res.user }));
      if (res.user.status === 'active' && res.user.profileCompleted) {
        return; // RootNavigator switches to Main automatically
      }
      await AsyncStorage.removeItem('axnol_token');
      await AsyncStorage.removeItem('axnol_user');
      dispatch(logout());
      setError('root', {
        message: `Welcome ${res.user.name}! Your account is pending administrator approval. You will be notified once it is activated.`,
      });
    } catch (err: any) {
      setError('root', { message: err?.data?.message || 'Login failed' });
    }
  };

  const goBack = () =>
    navigation.canGoBack()
      ? navigation.goBack()
      : navigation.navigate('Onboarding');

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
          <ChevronLeft size={scale(22)} color="#1E293B" />
        </TouchableOpacity>
        <Logo showText={false} height={scale(52)} />
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
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
            <Text style={styles.eyebrow}>WELCOME BACK</Text>
            <Text style={styles.title}>Login to Your Account</Text>
            <Text style={styles.subtitle}>
              Access your products, orders, invoices and more.
            </Text>
          </View>

          {/* Main Glass Card Container */}
          <View style={styles.mainCard}>
            {errors.root?.message ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errors.root.message}</Text>
              </View>
            ) : null}

            <Controller
              name="email"
              control={control}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <Input
                  variant="clean"
                  required
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  error={error?.message}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  leftIcon={User}
                  placeholder="Enter email or mobile"
                  containerStyle={styles.fieldSpacing}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <Input
                  variant="clean"
                  required
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  error={error?.message}
                  secureTextEntry
                  leftIcon={Lock}
                  placeholder="Enter your password"
                  containerStyle={styles.fieldSpacing}
                />
              )}
            />

            <TouchableOpacity
              style={styles.forgot}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Login"
              variant="outline"
              size="medium"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              iconRight={<ArrowRight size={scale(18)} color={colors.primary} strokeWidth={2.2} />}
              // style={styles.loginBtn}
              textStyle={styles.loginBtnText}
            />

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                <GoogleIcon size={scale(20)} />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                <AppleIcon size={scale(20)} color="#0F172A" />
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Don't have an account?</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}> Create New Account</Text>
              </TouchableOpacity>
            </View>
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
    top: scale(100),
    left: -scale(80),
    width: scale(240),
    height: scale(240),
    borderRadius: scale(120),
    backgroundColor: 'rgba(2,132,199,0.10)',
  },
  blobAmber: {
    position: 'absolute',
    bottom: scale(60),
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
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.md,
    padding: scale(10),
    marginBottom: scale(14),
  },
  errorText: {
    ...typography.medium,
    fontSize: fontSize.sm,
    color: '#DC2626',
    textAlign: 'center',
  },
  fieldSpacing: {
    marginBottom: scale(14),
  },
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
    marginTop: scale(2),
  },
  forgotText: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: '#0284C7',
  },
  loginBtn: {
    height: scale(48),
    borderRadius: scale(12),
    backgroundColor: '#063970',
    shadowColor: '#063970',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  loginBtnText: {
    fontSize: scale(13.5),
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: '#64748B',
    paddingHorizontal: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    height: scale(48),
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    gap: spacing.sm,
  },
  socialText: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: '#0F172A',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scale(16),
  },
  registerText: {
    fontSize: scale(12.5),
    color: '#64748B',
    fontWeight: '500',
  },
  registerLink: {
    fontSize: scale(12.5),
    fontWeight: '800',
    color: '#0284C7',
  },
});

export default LoginScreen;
