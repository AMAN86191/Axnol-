import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../navigation/types';
import {colors, fontSize, scale, spacing, typography} from '../../theme';
import AppImage from '../../components/ui/AppImage';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Onboarding'), 1600);
    return () => clearTimeout(t);
  }, [navigation]);
  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <AppImage uri="logo" resizeMode="contain" style={styles.logo} />
      </View>
      <Text style={styles.title}>AXNOL</Text>
      <View style={styles.rule} />
      <Text style={styles.tagline}>Solution of energy since 1959</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
  },
  logoWrap: {
    width: scale(160),
    height: scale(96),
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {width: '100%', height: '100%'},
  title: {
    ...typography.bold,
    fontSize: fontSize.xxl,
    color: colors.textInverse,
    letterSpacing: 6,
    marginTop: spacing.xl,
  },
  rule: {
    width: scale(48),
    height: scale(3),
    borderRadius: scale(2),
    backgroundColor: colors.accent,
    marginTop: spacing.md,
  },
  tagline: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: colors.primaryMuted,
    marginTop: spacing.md,
    letterSpacing: 0.4,
  },
});
export default SplashScreen;
