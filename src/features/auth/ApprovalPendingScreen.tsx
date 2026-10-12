import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CheckCircle2, Clock3, ShieldCheck} from 'lucide-react-native';
import {colors, fontSize, radius, scale, spacing, typography} from '../../theme';
import Button from '../../components/ui/Button';
import AppImage from '../../components/ui/AppImage';
import {useAppDispatch} from '../../store';
import {logout} from './authSlice';

const SCRIM: string[] = [
  'rgba(6,32,60,0.80)',
  'rgba(10,77,140,0.42)',
  'rgba(6,32,60,0.82)',
  'rgba(5,20,38,0.97)',
];

export const ApprovalPendingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const clearSession = async () => {
    dispatch(logout());
    await AsyncStorage.removeItem('axnol_token');
    await AsyncStorage.removeItem('axnol_user');
  };

  const onLogin = async () => {
    await clearSession();
    navigation.navigate('Login');
  };

  const onGuest = async () => {
    await clearSession();
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <AppImage
        uri="auth_splash_bg_ai"
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={SCRIM}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, {paddingTop: insets.top + spacing.sm}]}>
        <AppImage uri="logo" resizeMode="contain" style={styles.headerLogo} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + scale(96),
            paddingBottom: insets.bottom + spacing.xxl,
          },
        ]}
        bounces={false}>
        <View style={styles.content}>
          <View style={styles.successRing}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.successCircle}>
              <CheckCircle2
                size={scale(64)}
                color={colors.textInverse}
                fill="transparent"
                strokeWidth={1.6}
              />
            </LinearGradient>
          </View>

          <Text style={styles.title}>
            Account Created{'\n'}Successfully
          </Text>
          <Text style={styles.subtitle}>
            Your Axnol Lubetech account has been created. Our team will review
            your details and activate your account shortly.
          </Text>

          <View style={styles.pendingCard}>
            <Clock3 size={scale(18)} color={colors.accent} />
            <Text style={styles.pendingText}>
              Pending administrator approval
            </Text>
          </View>

          <View style={styles.noteRow}>
            <ShieldCheck size={scale(16)} color="rgba(255,255,255,0.65)" />
            <Text style={styles.noteText}>
              You will be notified once your account is approved.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Go to Login"
            size="large"
            onPress={onLogin}
            style={styles.loginBtn}
          />
          <Button
            title="Continue as Guest"
            variant="outline"
            size="large"
            style={styles.glassBtn}
            textStyle={styles.glassText}
            onPress={onGuest}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  headerLogo: {
    width: scale(120),
    height: scale(40),
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'center',
  },
  successRing: {
    width: scale(146),
    height: scale(146),
    borderRadius: scale(73),
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  successCircle: {
    width: scale(108),
    height: scale(108),
    borderRadius: scale(54),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.bold,
    fontSize: fontSize.xxl,
    color: colors.textInverse,
    textAlign: 'center',
    lineHeight: fontSize.xxl * 1.25,
  },
  subtitle: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: fontSize.sm * 1.5,
    paddingHorizontal: spacing.sm,
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(245, 166, 35, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.4)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.xxl,
  },
  pendingText: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    color: colors.accent,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  noteText: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  footer: {
    marginTop: spacing.xxxl,
  },
  loginBtn: {
    marginBottom: spacing.md,
  },
  glassBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderColor: 'rgba(255, 255, 255, 0.42)',
  },
  glassText: {
    color: colors.textInverse,
  },
});

export default ApprovalPendingScreen;
