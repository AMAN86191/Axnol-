import React from 'react';
import {
  Image,
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
import {AuthStackParamList} from '../../navigation/types';
import {
  colors,
  radius,
  scale,
  spacing,
  theme,
  verticalScale,
} from '../../theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
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
  const dispatch = useAppDispatch();
  const [login, {isLoading}] = useLoginMutation();
  const {control, handleSubmit, setError} = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {email: 'demo@axnol.in', password: 'axnol123'},
  });
  const onSubmit = async (values: FormValues) => {
    try {
      const res = await login(values).unwrap();
      await AsyncStorage.setItem('axnol_token', res.token);
      await AsyncStorage.setItem('axnol_user', JSON.stringify(res.user));
      dispatch(setCredentials({token: res.token, user: res.user}));
    } catch (err: any) {
      setError('root', {message: err?.data?.message || 'Login failed'});
    }
  };
  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo.png')}
            resizeMode="contain"
            style={styles.logo}
          />
          <Text style={styles.subtitle}>Welcome back to Axnol Lubetech</Text>
        </View>
        <View style={styles.card}>
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
              />
            )}
          />
          <TouchableOpacity
            style={styles.forgot}
            onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
          <Button
            title="Login"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
          />
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don’t have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}> Register</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>Demo: demo@axnol.in / axnol123</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: {flexGrow: 1, backgroundColor: colors.background},
  header: {
    paddingTop: spacing.xxxl * 1.5,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  logo: {width: scale(180), height: verticalScale(70)},
  subtitle: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    marginTop: spacing.lg,
    padding: spacing.xxl,
    flex: 1,
  },
  forgot: {alignSelf: 'flex-end', marginBottom: spacing.xl},
  forgotText: {
    ...theme.typography.medium,
    fontSize: theme.fontSize.sm,
    color: colors.primary,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  registerText: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.md,
    color: colors.textSecondary,
  },
  registerLink: {
    ...theme.typography.bold,
    fontSize: theme.fontSize.md,
    color: colors.primary,
  },
  hint: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
export default LoginScreen;
