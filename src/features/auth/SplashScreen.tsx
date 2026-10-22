import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { scale, spacing } from '../../theme';
import AppImage from '../../components/ui/AppImage';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

const DS = {
  surface: '#FFFFFF',
  primary: '#00288E',
};

const DOT_COUNT = 3;
const DOT_LIFT = scale(6);

const Dot: React.FC<{ index: number }> = ({ index }) => {
  const v = useSharedValue(0);

  useEffect(() => {
    v.value = withDelay(
      index * 160,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 350, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 350, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 300 }),
        ),
        -1,
        false,
      ),
    );
  }, [index, v]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + v.value * 0.65,
    transform: [{ translateY: -v.value * DOT_LIFT }],
  }));

  return <Animated.View style={[styles.dot, style]} />;
};

export const SplashScreenView: React.FC = () => {
  const enter = useSharedValue(0);

  useEffect(() => {
    enter.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [enter]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ scale: 0.9 + enter.value * 0.1 }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <Animated.View style={logoStyle}>
        <AppImage uri="logo" resizeMode="contain" style={styles.logo} />
      </Animated.View>
      <View style={styles.dots}>
        {Array.from({ length: DOT_COUNT }).map((_, i) => (
          <Dot key={i} index={i} />
        ))}
      </View>
    </View>
  );
};

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Onboarding'), 2400);
    return () => clearTimeout(t);
  }, [navigation]);

  return <SplashScreenView />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: scale(80),
    height: scale(80),
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    height: scale(20),
    marginTop: spacing.xl,
  },
  dot: {
    width: scale(7),
    height: scale(7),
    borderRadius: scale(4),
    backgroundColor: DS.primary,
    marginHorizontal: scale(4),
  },
});

export default SplashScreen;
