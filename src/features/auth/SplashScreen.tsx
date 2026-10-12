import React, {useEffect} from 'react';
import {
  ImageBackground,
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
import {colors, fontSize, radius, scale, spacing, typography} from '../../theme';
import AppImage from '../../components/ui/AppImage';
import images from '../../assets/images';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Onboarding'), 2200);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <ImageBackground
      source={images.auth_splash_bg_ai}
      style={styles.container}
      resizeMode="cover">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <LinearGradient
        colors={[
          'rgba(255,255,255,0.82)',
          'rgba(232,241,250,0.35)',
          'rgba(255,255,255,0.88)',
        ]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.content,
          {paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom + spacing.xxxl},
        ]}>
        <View style={styles.logoCard}>
          <AppImage uri="logo" resizeMode="contain" style={styles.logo} />
        </View>

        <Text style={styles.tagline}>
          High Performance Lubricants{'\n'}for a{' '}
          <Text style={styles.highlight}>Better Tomorrow</Text>
        </Text>

        <View style={styles.footer}>
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <Text style={styles.brand}>Specialty Lubricants & Greases since 1959</Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  logoCard: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    marginBottom: spacing.xxxl,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
  logo: {
    width: scale(200),
    height: scale(44),
  },
  tagline: {
    ...typography.bold,
    fontSize: fontSize.xxl,
    color: colors.text,
    textAlign: 'center',
    lineHeight: fontSize.xxl * 1.3,
  },
  highlight: {
    color: colors.primary,
  },
  footer: {
    position: 'absolute',
    bottom: scale(48),
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  dot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: colors.primaryMuted,
  },
  dotActive: {
    width: scale(22),
    backgroundColor: colors.primary,
  },
  brand: {
    ...typography.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    letterSpacing: 0.4,
  },
});

export default SplashScreen;
