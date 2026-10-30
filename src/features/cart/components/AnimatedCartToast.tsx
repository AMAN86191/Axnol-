import React, {useEffect} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import Svg, {Path, Circle, G} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {scale, radius, colors} from '../../../theme';
import {navigationRef} from '../../../navigation/navigationRef';

interface ProductInfo {
  id?: string | number;
  name?: string;
  image?: string;
}

interface AnimatedCartToastProps {
  visible: boolean;
  product?: ProductInfo;
  onHide: () => void;
  duration?: number;
}

const AnimatedCartToast: React.FC<AnimatedCartToastProps> = ({
  visible,
  product,
  onHide,
  duration = 2500,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);
  const scaleCart = useSharedValue(0.8);
  const checkScale = useSharedValue(0);
  const productScale = useSharedValue(0);
  const productX = useSharedValue(0);
  const productY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = 100;
      opacity.value = 0;
      scaleCart.value = 0.8;
      checkScale.value = 0;
      productScale.value = 0;
      productX.value = 0;
      productY.value = 0;

      opacity.value = withTiming(1, {duration: 200});
      translateY.value = withSpring(0, {damping: 18, stiffness: 180});
      scaleCart.value = withSequence(withSpring(1.12, {damping: 10, stiffness: 160}), withSpring(1, {damping: 12, stiffness: 200}));

      productScale.value = withDelay(150, withSequence(withSpring(0.9, {damping: 10}), withSpring(1, {damping: 12})));
      productX.value = withDelay(150, withSpring(28, {damping: 12, stiffness: 160}));
      productY.value = withDelay(150, withSequence(withSpring(-18, {damping: 10}), withSpring(0, {damping: 12})));

      checkScale.value = withDelay(450, withSequence(withSpring(1.2, {damping: 8}), withSpring(1, {damping: 10})));

      const timer = setTimeout(() => {
        opacity.value = withTiming(0, {duration: 200}, finished => {
          if (finished) {
            runOnJS(onHide)();
          }
        });
        translateY.value = withTiming(80, {duration: 200});
      }, duration);
      return () => clearTimeout(timer);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}, {scale: opacity.value}],
    opacity: opacity.value,
  }));

  const cartStyle = useAnimatedStyle(() => ({
    transform: [{scale: scaleCart.value}],
  }));

  const productStyle = useAnimatedStyle(() => ({
    transform: [{translateX: productX.value}, {translateY: productY.value}, {scale: productScale.value}],
    opacity: productScale.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{scale: checkScale.value}],
    opacity: checkScale.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {bottom: insets.bottom + scale(16)},
        containerStyle,
      ]}>
      <View style={styles.card}>
        <View style={styles.iconRow}>
          <Animated.View style={cartStyle}>
            <Svg width={scale(38)} height={scale(38)} viewBox="0 0 38 38">
              <G>
                <Circle cx="19" cy="19" r="19" fill={colors.primaryLight} />
                <Path
                  d="M12 14h2l2.4 9.6a1 1 0 00.97.8h7.26a1 1 0 00.97-.76L27 17H15"
                  stroke={colors.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Circle cx="17" cy="26" r="1" fill={colors.primary} />
                <Circle cx="23" cy="26" r="1" fill={colors.primary} />
              </G>
            </Svg>
          </Animated.View>
        
          <Animated.View style={[styles.checkWrap, checkStyle]}>
            <Svg width={scale(16)} height={scale(16)} viewBox="0 0 16 16">
              <Circle cx="8" cy="8" r="8" fill={colors.primary} />
              <Path d="M5 8l2 2 4-4" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Animated.View>
        </View>
        <View style={styles.textCol}>
          <Text style={styles.title}>Added to cart successfully</Text>
          {product?.name ? <Text style={styles.subtitle} numberOfLines={1}>{product.name}</Text> : null}
        </View>
        <TouchableOpacity
          style={styles.viewBtn}
          activeOpacity={0.8}
          onPress={() => {
            onHide();
            if (navigationRef.isReady()) {
              navigationRef.navigate('Main', {screen: 'Cart'});
            }
          }}>
          <Text style={styles.viewText}>View Cart</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: scale(12),
    right: scale(12),
    zIndex: 9999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    paddingVertical: scale(10),
    paddingHorizontal: scale(12),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: scale(10),
  },

  checkWrap: {
    position: 'absolute',
    right: -scale(4),
    bottom: -scale(4),
  },
  textCol: {
    flex: 1,
    marginLeft: scale(28),
  },
  title: {
    fontSize: scale(12.5),
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: scale(11),
    color: '#475569',
    marginTop: scale(1),
  },
  viewBtn: {
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  viewText: {
    fontSize: scale(11.5),
    fontWeight: '700',
    color: colors.primary,
  },
});

export default AnimatedCartToast;
