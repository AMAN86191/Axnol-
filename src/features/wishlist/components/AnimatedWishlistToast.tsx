import React, {useEffect} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import Svg, {Path, G} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {scale, radius} from '../../../theme';

interface AnimatedWishlistToastProps {
  visible: boolean;
  action: 'added' | 'removed';
  productName?: string;
  onHide: () => void;
  duration?: number;
}

const AnimatedWishlistToast: React.FC<AnimatedWishlistToastProps> = ({
  visible,
  action,
  productName,
  onHide,
  duration = 1500,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);
  const heartScale = useSharedValue(0);
  const heartRotate = useSharedValue(-12);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (visible && action === 'added') {
      translateY.value = 80;
      opacity.value = 0;
      heartScale.value = 0;
      heartRotate.value = -12;
      pulse.value = 0;

      opacity.value = withTiming(1, {duration: 180});
      translateY.value = withSpring(0, {damping: 14, stiffness: 180});
      heartScale.value = withSequence(withSpring(1.25, {damping: 9}), withSpring(1, {damping: 11}));
      heartRotate.value = withSequence(withSpring(10, {damping: 9}), withSpring(0, {damping: 12}));
      pulse.value = withSequence(withTiming(1, {duration: 220}), withTiming(0, {duration: 260}));

      const timer = setTimeout(() => {
        opacity.value = withTiming(0, {duration: 160}, finished => {
          if (finished) runOnJS(onHide)();
        });
        translateY.value = withTiming(70, {duration: 160});
      }, duration);
      return () => clearTimeout(timer);
    }
    if (visible) {
      onHide();
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, action]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
    opacity: opacity.value,
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{scale: heartScale.value}, {rotate: `${heartRotate.value}deg`}],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{scale: 0.8 + pulse.value * 0.4}],
    opacity: 0.22 * (1 - pulse.value),
  }));

  if (!visible || action !== 'added') return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {bottom: insets.bottom + scale(14), right: scale(12)},
        containerStyle,
      ]}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Animated.View style={[styles.pulse, pulseStyle]}>
            <Svg width={scale(36)} height={scale(36)} viewBox="0 0 36 36">
              <Path
                d="M18 30s-9.45-6.15-13.2-11.46A7.77 7.77 0 0118 8.63a7.77 7.77 0 0113.2 9.91C27.45 23.85 18 30 18 30z"
                fill="rgba(239,68,68,0.16)"
              />
            </Svg>
          </Animated.View>
          <Animated.View style={heartStyle}>
            <Svg width={scale(28)} height={scale(28)} viewBox="0 0 24 24">
              <G>
                <Path
                  d="M12 21s-6.7-4.35-9.33-8.11A5.5 5.5 0 0112 6.09a5.5 5.5 0 019.33 6.8C18.7 16.65 12 21 12 21z"
                  fill="#EF4444"
                  stroke="#EF4444"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </G>
            </Svg>
          </Animated.View>
        </View>
        {/* <View style={styles.textCol}>
          <Text style={styles.title}>Added to wishlist</Text>
          {productName ? <Text style={styles.subtitle} numberOfLines={1}>{productName}</Text> : null}
        </View> */}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 9999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    paddingVertical: scale(9),
    paddingHorizontal: scale(12),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.12,
    shadowRadius: 16,
    // elevation: 12,
    // borderWidth: 1,
    // borderColor: '#FEE2E2',
    maxWidth: scale(290),
  },
  iconWrap: {
    width: scale(28),
    height: scale(28),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(10),
  },
  pulse: {
    position: 'absolute',
  },
  textCol: {
    flexShrink: 1,
  },
  title: {
    fontSize: scale(12),
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: scale(10.5),
    color: '#475569',
    marginTop: scale(1),
  },
});

export default AnimatedWishlistToast;
