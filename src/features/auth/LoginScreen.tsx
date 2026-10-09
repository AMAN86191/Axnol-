import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AuthStackParamList} from '../../navigation/types';
import {
  colors,
  fontSize,
  radius,
  scale,
  spacing,
  typography,
  verticalScale,
} from '../../theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AppImage from '../../components/ui/AppImage';
import {Controller, useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useLoginMutation} from '../../api/services/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAppDispatch} from '../../store';
import {Lock, Mail} from 'lucide-react-native';
import {setCredentials} from './authSlice';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const schema = z.object({
  email: z.string().trim().email('Invalid email address'),
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
      if (res.user.status === 'pending') {
        navigation.navigate('ApprovalPending', {email: res.user.email});
      } else if (!res.user.profileCompleted) {
        navigation.navigate('ProfileSetup');
      }
    } catch (err: any) {
      setError('root', {message: err?.data?.message || 'Login failed'});
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        bounces={false}
        keyboardShouldPersistTaps="handled">
        <View style={[styles.header, {paddingTop: insets.top + spacing.xxl}]}>
          <AppImage uri="logo" resizeMode="contain" style={styles.logo} />
          <Text style={styles.brand}>AXNOL</Text>
          <Text style={styles.tagline}>Solution of energy since 1959</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.welcome}>Welcome back</Text>
          <Text style={styles.welcomeSub}>
            Sign in to continue to your dealer portal
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
                label="Email"
                value={value}
                onChangeText={onChange}
                error={error?.message}
                autoCapitalize="none"
                keyboardType="email-address"
                leftIcon={Mail}
                placeholder="Enter your email"
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
              />
            )}
          />
          <TouchableOpacity
            style={styles.forgot}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
          <Button
            title="Sign In"
            size="medium"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
          />
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>New here?</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}> Create an account</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>Demo: demo@axnol.in / axnol123</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  scroll: {flexGrow: 1, backgroundColor: colors.primary},
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
  },
  logo: {width: scale(150), height: verticalScale(64)},
  brand: {
    ...typography.bold,
    fontSize: fontSize.xxl,
    color: colors.textInverse,
    letterSpacing: 5,
    marginTop: spacing.md,
  },
  tagline: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: colors.primaryMuted,
    marginTop: spacing.xs,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    marginTop: -spacing.xl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  welcome: {
    ...typography.bold,
    fontSize: fontSize.xl,
    color: colors.text,
  },
  welcomeSub: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
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
  },
  forgot: {alignSelf: 'flex-end', marginBottom: spacing.xl},
  forgotText: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  registerText: {
    ...typography.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  registerLink: {
    ...typography.bold,
    fontSize: fontSize.md,
    color: colors.primary,
  },
  hint: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
export default LoginScreen;
