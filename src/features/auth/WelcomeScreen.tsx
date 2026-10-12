import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AuthStackParamList} from '../../navigation/types';
import {colors, fontSize, scale, spacing, typography} from '../../theme';
import Button from '../../components/ui/Button';
import AppImage from '../../components/ui/AppImage';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

const SCRIM: string[] = [
  'rgba(6,20,38,0.78)',
  'rgba(6,20,38,0)',
  'rgba(6,20,38,0.35)',
  'rgba(6,20,38,0.97)',
];

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

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
        locations={[0, 0.3, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, {paddingTop: insets.top + spacing.sm}]}>
        <AppImage uri="logo" resizeMode="contain" style={styles.logo} />
      </View>

      <View
        style={[styles.content, {paddingBottom: insets.bottom + spacing.xxl}]}>
        <Text style={styles.eyebrow}>WELCOME TO</Text>
        <Text style={styles.title}>Axnol Lubetech</Text>
        <Text style={styles.subtitle}>
          High performance lubricants and greases engineered for every industry.
          Login to explore our products, request pricing and manage your orders.
        </Text>

        <View style={styles.actions}>
          <Button
            title="Login"
            size="large"
            onPress={() => navigation.navigate('Login')}
          />
          <Button
            title="Create New Account"
            variant="outline"
            size="large"
            style={styles.glassBtn}
            textStyle={styles.glassText}
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </View>
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
    paddingHorizontal: spacing.xl,
  },
  logo: {
    width: scale(150),
    height: scale(38),
  },
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xxl,
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
    fontSize: fontSize.xxxl,
    color: colors.textInverse,
    lineHeight: fontSize.xxxl * 1.2,
  },
  subtitle: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.82)',
    lineHeight: fontSize.sm * 1.5,
    marginTop: spacing.md,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  glassBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderColor: 'rgba(255, 255, 255, 0.42)',
  },
  glassText: {
    color: colors.textInverse,
  },
});

export default WelcomeScreen;
