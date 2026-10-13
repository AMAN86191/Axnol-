import React, {useEffect} from 'react';
import {StatusBar, StyleSheet, Text, View} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AuthStackParamList} from '../../navigation/types';
import {fontSize, scale, spacing, typography} from '../../theme';
import AppImage from '../../components/ui/AppImage';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

const DS = {
  surface: '#FAF8FF',
  primary: '#00288E',
  secondary: '#006591',
  onSurface: '#131B2E',
  onVariant: '#444653',
  container: '#EAEDFF',
};

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {duration: 2200, easing: Easing.linear});
    const t = setTimeout(() => navigation.replace('Onboarding'), 2400);
    return () => clearTimeout(t);
  }, [navigation, progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, Math.max(0, progress.value * 100))}%`,
  }));

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.xl,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}>
        <AppImage uri="logo" resizeMode="contain" style={styles.logo} />

        <Text style={styles.tagline}>
          High Performance Lubricants{'\n'}for a{' '}
          <Text style={styles.highlight}>Better Tomorrow</Text>
        </Text>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, barStyle]} />
        </View>
        <Text style={styles.loading}>Setting up your terminal…</Text>
      </View>

      <View style={[styles.footer, {paddingBottom: insets.bottom + spacing.lg}]}>
        <Text style={styles.brand}>Specialty Lubricants & Greases since 1959</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS.surface,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  logo: {
    width: scale(190),
    height: scale(40),
  },
  tagline: {
    ...typography.bold,
    fontSize: fontSize.xl,
    color: DS.onSurface,
    textAlign: 'center',
    lineHeight: fontSize.xxl * 1.3,
    marginTop: spacing.xl,
  },
  highlight: {
    color: DS.primary,
  },
  progressTrack: {
    width: '60%',
    height: scale(5),
    borderRadius: scale(3),
    backgroundColor: DS.container,
    marginTop: spacing.xl,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: scale(3),
    backgroundColor: DS.secondary,
  },
  loading: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: DS.onVariant,
    marginTop: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  brand: {
    ...typography.medium,
    fontSize: fontSize.xs,
    color: DS.onVariant,
    letterSpacing: 0.4,
  },
});

export default SplashScreen;
