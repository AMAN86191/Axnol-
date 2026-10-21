import React, { useEffect } from 'react';
import {
  DimensionValue,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius } from '../../theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  circle?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 14,
  borderRadius,
  circle = false,
  style,
}) => {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 850, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const resolvedHeight = circle && typeof width === 'number' ? width : height;

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width,
          height: resolvedHeight,
          borderRadius: circle
            ? typeof width === 'number'
              ? width / 2
              : radius.pill
            : borderRadius ?? radius.sm,
        },
        style,
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surfaceAlt,
  },
});

export default Skeleton;
