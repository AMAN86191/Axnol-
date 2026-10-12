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
import {ArrowLeft, KeyRound, Mail} from 'lucide-react-native';
import {AuthStackParamList} from '../../navigation/types';
import {colors, fontSize, scale, spacing, typography} from '../../theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AppImage from '../../components/ui/AppImage';
import {Controller, useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForgotPasswordMutation} from '../../api/services/authApi';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const SCRIM: string[] = [
  'rgba(6,32,60,0.72)',
  'rgba(10,77,140,0.30)',
  'rgba(6,32,60,0.80)',
  'rgba(5,20,38,0.96)',
];

const schema = z.object({
  email: z.string().trim().min(1, 'Required'),
});

type FormValues = z.infer<typeof schema>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [sendReset] = useForgotPasswordMutation();

  const {control, handleSubmit} = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {email: ''},
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await sendReset({email: values.email}).unwrap();
    } catch {
      // Mock backend - proceed regardless
    }
    navigation.navigate('SetPassword', {email: values.email});
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
          keyboardShouldPersistTaps="handled">
          <Text style={styles.eyebrow}>PASSWORD RESET</Text>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your registered email or mobile number to reset your password.
          </Text>

          <View style={styles.iconContainer}>
            <View style={styles.iconRing}>
              <View style={styles.iconCircle}>
                <KeyRound
                  size={scale(38)}
                  color={colors.accent}
                  strokeWidth={1.6}
                />
              </View>
            </View>
          </View>

          <Controller
            name="email"
            control={control}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <Input
                value={value}
                onChangeText={onChange}
                error={error?.message}
                autoCapitalize="none"
                keyboardType="email-address"
                leftIcon={Mail}
                placeholder="Email or Mobile Number"
                variant="dark"
                label="Email or Mobile Number"
                containerStyle={styles.inputSpacing}
              />
            )}
          />

          <Button
            title="Send Reset Link"
            size="large"
            onPress={handleSubmit(onSubmit)}
          />
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
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: spacing.xxxl,
  },
  iconRing: {
    width: scale(104),
    height: scale(104),
    borderRadius: scale(52),
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: scale(76),
    height: scale(76),
    borderRadius: scale(38),
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputSpacing: {
    marginBottom: spacing.xl,
  },
});

export default ForgotPasswordScreen;
