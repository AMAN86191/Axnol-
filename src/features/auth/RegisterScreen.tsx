import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
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
import {
  ArrowLeft,
  Building2,
  CheckSquare,
  Lock,
  Mail,
  Phone,
  Square,
  Tag,
  User,
} from 'lucide-react-native';
import {AuthStackParamList} from '../../navigation/types';
import {colors, fontSize, scale, spacing, typography} from '../../theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AppImage from '../../components/ui/AppImage';
import {Controller, useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useRegisterMutation} from '../../api/services/authApi';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const SCRIM: string[] = [
  'rgba(6,32,60,0.80)',
  'rgba(10,77,140,0.42)',
  'rgba(6,32,60,0.82)',
  'rgba(5,20,38,0.96)',
];

const schema = z.object({
  name: z.string().trim().min(2, 'Enter full name'),
  company: z.string().trim().min(2, 'Enter company name'),
  gstin: z.string().trim().optional(),
  phone: z.string().trim().min(10, 'Enter valid phone'),
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [register, {isLoading}] = useRegisterMutation();
  const [agreed, setAgreed] = useState(false);

  const {control, handleSubmit} = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      company: '',
      gstin: '',
      phone: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!agreed) return;
    const res = await register(values).unwrap();
    navigation.navigate('OtpVerify', {
      userId: res.userId,
      email: values.email,
      demoOtp: res.demoOtp,
    });
  };

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
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + scale(72),
              paddingBottom: insets.bottom + spacing.xxl,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets>
          <Text style={styles.eyebrow}>GET STARTED</Text>
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>
            Join Axnol Lubetech to access products, request pricing and more.
          </Text>

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
                placeholder="Enter your full name"
                variant="dark"
                labelStyle={styles.inputLabel}
                containerStyle={styles.inputSpacing}
              />
            )}
          />
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
                placeholder="Enter company name"
                variant="dark"
                labelStyle={styles.inputLabel}
                containerStyle={styles.inputSpacing}
              />
            )}
          />
          <Controller
            name="gstin"
            control={control}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <Input
                label="GST Number (Optional)"
                value={value}
                onChangeText={onChange}
                error={error?.message}
                autoCapitalize="characters"
                leftIcon={Tag}
                placeholder="Enter GST number"
                variant="dark"
                labelStyle={styles.inputLabel}
                containerStyle={styles.inputSpacing}
              />
            )}
          />
          <Controller
            name="phone"
            control={control}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <Input
                label="Mobile Number"
                value={value}
                onChangeText={onChange}
                error={error?.message}
                keyboardType="phone-pad"
                leftIcon={Phone}
                placeholder="Enter mobile number"
                variant="dark"
                labelStyle={styles.inputLabel}
                containerStyle={styles.inputSpacing}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <Input
                label="Email Address"
                value={value}
                onChangeText={onChange}
                error={error?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={Mail}
                placeholder="Enter your email address"
                variant="dark"
                labelStyle={styles.inputLabel}
                containerStyle={styles.inputSpacing}
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
                placeholder="Create a password"
                variant="dark"
                labelStyle={styles.inputLabel}
                containerStyle={styles.inputSpacingLast}
              />
            )}
          />

          <TouchableOpacity
            style={styles.checkboxRow}
            activeOpacity={0.7}
            onPress={() => setAgreed(!agreed)}>
            {agreed ? (
              <CheckSquare color={colors.accent} size={scale(20)} />
            ) : (
              <Square color="rgba(255,255,255,0.7)" size={scale(20)} />
            )}
            <Text style={styles.checkboxText}>
              I agree to the{' '}
              <Text style={styles.link}>Terms & Conditions</Text> and{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          <Button
            title="Register"
            size="medium"
            disabled={!agreed}
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

      <View style={[styles.header, {paddingTop: insets.top + spacing.sm}]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
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
    paddingHorizontal: spacing.xxl,
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
  inputLabel: {
    color: colors.textInverse,
  },
  inputSpacing: {
    marginBottom: spacing.md,
  },
  inputSpacingLast: {
    marginBottom: spacing.lg,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingRight: spacing.md,
  },
  checkboxText: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: spacing.sm,
    lineHeight: fontSize.xs * 1.5,
    flex: 1,
  },
  link: {
    color: colors.accent,
    ...typography.medium,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  loginText: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loginLink: {
    ...typography.bold,
    fontSize: fontSize.sm,
    color: colors.accent,
  },
});

export default RegisterScreen;
