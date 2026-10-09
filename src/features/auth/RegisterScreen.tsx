import React, {useState} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArrowLeft, Building2, IdCard, Lock, Mail, MapPin, Phone, User} from 'lucide-react-native';
import {AuthStackParamList} from '../../navigation/types';
import {colors, fontSize, radius, scale, spacing, typography} from '../../theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import SectionHeader from '../../components/ui/SectionHeader';
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
  const insets = useSafeAreaInsets();
  const [register, {isLoading}] = useRegisterMutation();
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
    const res = await register({...values}).unwrap();
    navigation.navigate('OtpVerify', {
      userId: res.userId,
      email: values.email,
      demoOtp: res.demoOtp,
    });
  };
  return (
    <SafeAreaView style={[styles.flex]}>
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Register to access Axnol dealer portal
        </Text>

        <Card style={styles.card}>
          <SectionHeader title="Account Details" />
         
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
                placeholder="e.g. Rahul Sharma"
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
                placeholder="name@company.com"
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
                placeholder="10-digit mobile number"
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
                placeholder="Min 6 characters"
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
                placeholder="Re-enter password"
              />
            )}
          />
        </Card>

        <Card style={styles.card}>
          <SectionHeader title="Company Details" />
          <Controller
            name="company"
            control={control}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <Input
                label="Company Name"
                value={value}
                onChangeText={onChange}
                error={error?.message}
                leftIcon={Building2}
                placeholder="e.g. Sharma Auto Parts"
              />
            )}
          />
         
          <Controller
            name="address"
            control={control}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <Input
                label="Address"
                value={value}
                onChangeText={onChange}
                error={error?.message}
                leftIcon={MapPin}
                placeholder="Street, area, landmark"
              />
            )}
          />
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
                    placeholder="e.g. 08AABCS1429B1Z6"
                  />
                )}
              />
       
          <View style={styles.row}>
            <View style={styles.half}>
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
                    placeholder="Pincode"
                  />
                )}
              />
            </View>
      
             
          
          </View>
        </Card>

        <Button
          title="Create Account"
          size="medium"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
        />
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}> Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
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
    backgroundColor: colors.background,
  },
  title: {
    ...typography.bold,
    fontSize: fontSize.xxxl,
    color: colors.text,
  },
  subtitle: {
    ...typography.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  card: {marginBottom: spacing.lg},
  label: {
    ...typography.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  roleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    padding: spacing.xs,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  roleBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  roleActive: {backgroundColor: colors.primary},
  roleText: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  roleActiveText: {color: colors.textInverse},
  row: {flexDirection: 'row', gap: spacing.md},
  half: {flex: 1},
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  loginText: {
    ...typography.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  loginLink: {
    ...typography.bold,
    fontSize: fontSize.md,
    color: colors.primary,
  },
});
export default RegisterScreen;
