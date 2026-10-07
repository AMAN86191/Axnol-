import React, {useState} from 'react';
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
import {AuthStackParamList} from '../../navigation/types';
import {colors, radius, spacing, theme} from '../../theme';
import Input from '../../components/ui/Input';
import {
  Building2,
  IdCard,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react-native';
import Button from '../../components/ui/Button';
import {Controller, useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useRegisterMutation} from '../../api/services/authApi';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const schema = z
  .object({
    name: z.string().trim().min(2, 'Enter full name'),
    email: z.string().trim().email('Invalid email'),
    phone: z.string().trim().min(10, 'Enter valid phone'),
    password: z.string().min(6, 'Min 6 characters'),
    confirmPassword: z.string(),
    company: z.string().trim().optional(),
    designation: z.string().trim().optional(),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    pincode: z.string().trim().optional(),
    gstin: z.string().trim().optional(),
  })
  .refine(d => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type FormValues = z.infer<typeof schema>;

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [register, {isLoading}] = useRegisterMutation();
  const [role, setRole] = useState<'dealer' | 'customer'>('dealer');
  const {control, handleSubmit} = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });
  const onSubmit = async (values: FormValues) => {
    const res = await register({...values, role}).unwrap();
    navigation.navigate('OtpVerify', {
      userId: res.userId,
      email: values.email,
      demoOtp: res.demoOtp,
    });
  };
  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Register to access Axnol dealer portal
          </Text>
        </View>
        <View style={styles.card}>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'dealer' && styles.roleActive]}
              onPress={() => setRole('dealer')}>
              <Text
                style={[
                  styles.roleText,
                  role === 'dealer' && styles.roleActiveText,
                ]}>
                Dealer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'customer' && styles.roleActive]}
              onPress={() => setRole('customer')}>
              <Text
                style={[
                  styles.roleText,
                  role === 'customer' && styles.roleActiveText,
                ]}>
                Customer
              </Text>
            </TouchableOpacity>
          </View>
          <Controller
            name="name"
            control={control}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <Input
                label="Full Name"
                value={value}
                onChangeText={onChange}
                error={error?.message}
                leftIcon={User}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <Input
                label="Email"
                value={value}
                onChangeText={onChange}
                error={error?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={Mail}
              />
            )}
          />
          <Controller
            name="phone"
            control={control}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <Input
                label="Phone"
                value={value}
                onChangeText={onChange}
                error={error?.message}
                keyboardType="phone-pad"
                leftIcon={Phone}
              />
            )}
          />
          <Controller
            name="company"
            control={control}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <Input
                label="Company (Optional)"
                value={value}
                onChangeText={onChange}
                error={error?.message}
                leftIcon={Building2}
              />
            )}
          />
          <Controller
            name="designation"
            control={control}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <Input
                label="Designation (Optional)"
                value={value}
                onChangeText={onChange}
                error={error?.message}
                leftIcon={IdCard}
              />
            )}
          />
          <Controller
            name="address"
            control={control}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <Input
                label="Address (Optional)"
                value={value}
                onChangeText={onChange}
                error={error?.message}
                leftIcon={MapPin}
              />
            )}
          />
          <View style={{flexDirection: 'row', gap: spacing.md}}>
            <View style={{flex: 1}}>
              <Controller
                name="city"
                control={control}
                render={({field: {onChange, value}, fieldState: {error}}) => (
                  <Input
                    label="City"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                  />
                )}
              />
            </View>
            <View style={{flex: 1}}>
              <Controller
                name="state"
                control={control}
                render={({field: {onChange, value}, fieldState: {error}}) => (
                  <Input
                    label="State"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                  />
                )}
              />
            </View>
          </View>
          <View style={{flexDirection: 'row', gap: spacing.md}}>
            <View style={{flex: 1}}>
              <Controller
                name="pincode"
                control={control}
                render={({field: {onChange, value}, fieldState: {error}}) => (
                  <Input
                    label="Pincode"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    keyboardType="numeric"
                  />
                )}
              />
            </View>
            <View style={{flex: 1}}>
              <Controller
                name="gstin"
                control={control}
                render={({field: {onChange, value}, fieldState: {error}}) => (
                  <Input
                    label="GSTIN (Dealer)"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    autoCapitalize="characters"
                  />
                )}
              />
            </View>
          </View>
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
          <Controller
            name="confirmPassword"
            control={control}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <Input
                label="Confirm Password"
                value={value}
                onChangeText={onChange}
                error={error?.message}
                secureTextEntry
                leftIcon={Lock}
              />
            )}
          />
          <Button
            title="Register & Get OTP"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
          />
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}> Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: {flexGrow: 1, backgroundColor: colors.background},
  header: {
    paddingTop: spacing.xxxl,
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
  roleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    padding: spacing.xs,
    marginBottom: spacing.xl,
  },
  roleBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  roleActive: {backgroundColor: colors.primary},
  roleText: {
    ...theme.typography.medium,
    fontSize: theme.fontSize.sm,
    color: colors.textSecondary,
  },
  roleActiveText: {color: colors.textInverse},
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  loginText: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.md,
    color: colors.textSecondary,
  },
  loginLink: {
    ...theme.typography.bold,
    fontSize: theme.fontSize.md,
    color: colors.primary,
  },
});
export default RegisterScreen;
