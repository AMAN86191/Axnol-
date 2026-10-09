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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArrowLeft, CircleCheck, Mail} from 'lucide-react-native';
import {colors, fontSize, radius, scale, spacing, typography} from '../../theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import {Controller, useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForgotPasswordMutation} from '../../api/services/authApi';

const schema = z.object({email: z.string().trim().email('Invalid email')});
type FormValues = z.infer<typeof schema>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [forgot, {isLoading, isSuccess}] = useForgotPasswordMutation();
  const {control, handleSubmit} = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const onSubmit = async (values: FormValues) => {
    await forgot(values).unwrap();
  };
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.topRow, {paddingTop: insets.top + spacing.sm}]}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backBtn}
          hitSlop={12}
          onPress={() => navigation.goBack()}>
          <ArrowLeft size={scale(20)} color={colors.text} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        <View style={styles.iconCircle}>
          {isSuccess ? (
            <CircleCheck size={scale(28)} color={colors.success} />
          ) : (
            <Mail size={scale(28)} color={colors.primary} />
          )}
        </View>
        <Text style={styles.title}>
          {isSuccess ? 'Check Your Email' : 'Forgot Password'}
        </Text>
        <Text style={styles.subtitle}>
          {isSuccess
            ? 'Password reset instructions have been sent to your email.'
            : 'Enter your email to receive reset instructions'}
        </Text>
        <Card>
          {isSuccess ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>
                Password reset instructions sent to your email.
              </Text>
            </View>
          ) : (
            <>
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
                    placeholder="you@company.com"
                  />
                )}
              />
              <Button
                title="Send Reset Link"
                size="large"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
              />
            </>
          )}
          <Button
            title="Back to Login"
            variant="ghost"
            onPress={() => navigation.goBack()}
            style={styles.ghostSpacing}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
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
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  iconCircle: {
    alignSelf: 'center',
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.bold,
    fontSize: fontSize.xl,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    lineHeight: fontSize.sm * 1.5,
  },
  successBox: {
    backgroundColor: colors.successLight,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  successText: {
    ...typography.medium,
    fontSize: fontSize.sm,
    color: colors.success,
    textAlign: 'center',
    lineHeight: fontSize.sm * 1.5,
  },
  ghostSpacing: {marginTop: spacing.sm},
});
export default ForgotPasswordScreen;
