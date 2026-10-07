import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {colors, radius, spacing, theme} from '../../theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import {Controller, useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForgotPasswordMutation} from '../../api/services/authApi';

const schema = z.object({email: z.string().trim().email('Invalid email')});
type FormValues = z.infer<typeof schema>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [forgot, {isLoading, isSuccess}] = useForgotPasswordMutation();
  const {control, handleSubmit} = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const onSubmit = async (values: FormValues) => {
    await forgot(values).unwrap();
  };
  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email to receive reset instructions
          </Text>
        </View>
        <View style={styles.card}>
          {isSuccess ? (
            <Text style={styles.success}>
              Password reset instructions sent to your email.
            </Text>
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
                  />
                )}
              />
              <Button
                title="Send Reset Link"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
              />
            </>
          )}
          <Button
            title="Back to Login"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={{marginTop: spacing.md}}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  header: {
    paddingTop: spacing.xxxl * 1.2,
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
  success: {
    ...theme.typography.medium,
    fontSize: theme.fontSize.md,
    color: colors.success,
    marginBottom: spacing.xl,
  },
});
export default ForgotPasswordScreen;
