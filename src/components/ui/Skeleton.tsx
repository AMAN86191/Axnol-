import React, { useCallback, useEffect, useRef } from 'react';
import {
  Dimensions,
  DimensionValue,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  Easing,
  cancelAnimation,
  makeMutable,
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

/**
 * Wave effect: one light band sweeps diagonally across the whole screen and
 * every skeleton block shows the part of the band that passes over it, so the
 * highlight rolls through all blocks in order instead of each pulsing alone.
 */
const BAND_WIDTH = 170;
const DIAGONAL_SLOPE = 0.6; // how much the wave leans toward the bottom
const WAVE_DURATION = 1500;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const TRAVEL = SCREEN_W + SCREEN_H * DIAGONAL_SLOPE + BAND_WIDTH;

// One shared clock for every skeleton on screen, so they stay in phase.
const progress = makeMutable(0);
let mounted = 0;

const startClock = () => {
  mounted += 1;
  if (mounted === 1) {
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration: WAVE_DURATION, easing: Easing.linear }),
      -1,
      false,
    );
  }
};

const stopClock = () => {
  mounted = Math.max(0, mounted - 1);
  if (mounted === 0) {
    cancelAnimation(progress);
  }
};

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 14,
  borderRadius,
  circle = false,
  style,
}) => {
  const ref = useRef<View>(null);
  // Where this block sits along the wave's diagonal; far off until measured.
  const origin = useSharedValue(-10000);

  useEffect(() => {
    startClock();
    return stopClock;
  }, []);

  const measure = useCallback(() => {
    ref.current?.measureInWindow((x, y) => {
      origin.value = x + y * DIAGONAL_SLOPE;
    });
  }, [origin]);

  const bandStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: progress.value * TRAVEL - BAND_WIDTH - origin.value,
      },
    ],
  }));

  const resolvedHeight = circle && typeof width === 'number' ? width : height;

  return (
    <View
      ref={ref}
      onLayout={measure}
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
      ]}>
      <Animated.View style={[styles.band, bandStyle]}>
        <LinearGradient
          colors={[
            'rgba(255,255,255,0)',
            'rgba(255,255,255,0.7)',
            'rgba(255,255,255,0)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  band: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: BAND_WIDTH,
  },
});

export default Skeleton;
