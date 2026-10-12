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
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AuthStackParamList} from '../../navigation/types';
import {colors, fontSize, radius, scale, spacing, typography} from '../../theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AppImage from '../../components/ui/AppImage';
import {AppleIcon, GoogleIcon} from '../../components/ui/BrandIcons';
import {Controller, useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useLoginMutation} from '../../api/services/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAppDispatch} from '../../store';
import {ArrowLeft, Lock, User} from 'lucide-react-native';
import {setCredentials} from './authSlice';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const SCRIM: string[] = [
  'rgba(6,32,60,0.72)',
  'rgba(10,77,140,0.30)',
  'rgba(6,32,60,0.78)',
  'rgba(5,20,38,0.95)',
];

const schema = z.object({
  email: z.string().trim().min(1, 'Required'),
  password: z.string().min(6, 'Minimum 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [login, {isLoading}] = useLoginMutation();

  const {
    control,
    handleSubmit,
    setError,
    formState: {errors},
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {email: 'demo@axnol.in', password: 'axnol123'},
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await login(values).unwrap();
      await AsyncStorage.setItem('axnol_token', res.token);
      await AsyncStorage.setItem('axnol_user', JSON.stringify(res.user));
      dispatch(setCredentials({token: res.token, user: res.user}));
      navigation.navigate('ApprovalPending', {email: res.user.email});
    } catch (err: any) {
      setError('root', {message: err?.data?.message || 'Login failed'});
    }
  };

  const goBack = () =>
    navigation.canGoBack()
      ? navigation.goBack()
      : navigation.navigate('Welcome');

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
        locations={[0, 0.25, 0.55, 1]}
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
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.eyebrow}>WELCOME BACK</Text>
          <Text style={styles.title}>Login to Your Account</Text>
          <Text style={styles.subtitle}>
            Access your products, orders, invoices and more.
          </Text>

          {errors.root?.message ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errors.root.message}</Text>
            </View>
          ) : null}

          <Controller
            name="email"
            control={control}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <Input
                label="Email or Mobile Number"
                value={value}
                onChangeText={onChange}
                error={error?.message}
                autoCapitalize="none"
                keyboardType="email-address"
                leftIcon={User}
                placeholder="Enter email or mobile"
                variant="dark"
                labelStyle={styles.inputLabel}
                containerStyle={styles.inputContainer}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <Input
                label="Password"
                value={value}
                onChangeText={onChange}
                error={error?.message}
                secureTextEntry
                leftIcon={Lock}
                placeholder="Enter your password"
                variant="dark"
                labelStyle={styles.inputLabel}
                containerStyle={styles.inputContainer}
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
            size="medium"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
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
              <AppleIcon size={scale(20)} color={colors.textInverse} />
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
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.header, {paddingTop: insets.top + spacing.sm}]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={goBack}
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
    paddingHorizontal: spacing.lg,
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
    marginBottom: spacing.xl,
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
  inputLabel: {
    color: colors.textInverse,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
    marginTop: -spacing.xs,
  },
  forgotText: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.accent,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  dividerText: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.7)',
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
    height: scale(52),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    gap: spacing.sm,
  },
  socialText: {
    ...typography.medium,
    fontSize: fontSize.sm,
    color: colors.textInverse,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  registerText: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  registerLink: {
    ...typography.bold,
    fontSize: fontSize.sm,
    color: colors.accent,
  },
});

export default LoginScreen;
