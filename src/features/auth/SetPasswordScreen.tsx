import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CheckCircle2, Lock} from 'lucide-react-native';
import {AuthStackParamList} from '../../navigation/types';
import {
  colors,
  fontSize,
  radius,
  scale,
  shadows,
  spacing,
  typography,
} from '../../theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AuthLayout from '../../components/ui/AuthLayout';
import {Controller, useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'SetPassword'>;
type Route = RouteProp<AuthStackParamList, 'SetPassword'>;

const schema = z
  .object({
    password: z.string().min(8, 'Minimum 8 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

const ValidationItem = ({
  label,
  isValid,
}: {
  label: string;
  isValid: boolean;
}) => (
  <View style={styles.validationItem}>
    <CheckCircle2
      size={scale(16)}
      color={isValid ? colors.success : colors.textMuted}
    />
    <Text
      style={[styles.validationText, isValid && styles.validationTextValid]}>
      {label}
    </Text>
  </View>
);

export const SetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const {params} = useRoute<Route>();
  const insets = useSafeAreaInsets();

  const {control, handleSubmit, watch} = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {password: '', confirmPassword: ''},
  });

  const password = watch('password');

  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const onSubmit = () => {
    if (params?.email) {
      navigation.navigate('ApprovalPending', {
        userId: params.userId,
        email: params.email,
      });
      return;
    }
    navigation.navigate('Login');
  };

  return (
    <AuthLayout onBack={() => navigation.goBack()}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {paddingBottom: insets.bottom + spacing.xxl},
        ]}
        bounces={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>ACCOUNT SECURITY</Text>
          <Text style={styles.title}>Set Your Password</Text>
          <Text style={styles.subtitle}>
            Create a strong password to keep your account secure.
          </Text>
        </View>

        <View style={styles.iconContainer}>
          <View style={styles.iconRing}>
            <View style={styles.iconCircle}>
              <Lock size={scale(42)} color={colors.primary} strokeWidth={1.5} />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Controller
            name="password"
            control={control}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <Input
                label="New Password"
                value={value}
                onChangeText={onChange}
                error={error?.message}
                secureTextEntry
                leftIcon={Lock}
                placeholder="Enter new password"
                containerStyle={styles.inputSpacing}
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
                placeholder="Confirm new password"
                containerStyle={styles.inputSpacingLast}
              />
            )}
          />
        </View>

        <View style={styles.validationCard}>
          <Text style={styles.validationTitle}>Password must contain</Text>
          <ValidationItem label="At least 8 characters" isValid={hasMinLength} />
          <ValidationItem
            label="An uppercase letter"
            isValid={hasUpper}
          />
          <ValidationItem
            label="A lowercase letter"
            isValid={hasLower}
          />
          <ValidationItem label="A number" isValid={hasNumber} />
        </View>

        <Button
          title="Set Password"
          size="large"
          onPress={handleSubmit(onSubmit)}
          disabled={!(hasMinLength && hasUpper && hasLower && hasNumber)}
        />
      </ScrollView>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  intro: {
    alignItems: 'center',
  },
  eyebrow: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    color: colors.accent,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.bold,
    fontSize: fontSize.xxl,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: fontSize.sm * 1.5,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: spacing.xxl,
  },
  iconRing: {
    width: scale(104),
    height: scale(104),
    borderRadius: scale(52),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: scale(78),
    height: scale(78),
    borderRadius: scale(39),
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.medium,
  },
  inputSpacing: {
    marginBottom: spacing.lg,
  },
  inputSpacingLast: {
    marginBottom: 0,
  },
  validationCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
    ...shadows.small,
  },
  validationTitle: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  validationText: {
    ...typography.medium,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  validationTextValid: {
    color: colors.success,
  },
});

export default SetPasswordScreen;
