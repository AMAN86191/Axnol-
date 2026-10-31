import React, {useEffect} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Check, Heart, Minus} from 'lucide-react-native';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {radius, scale, spacing} from '../../../theme';
import {navigationRef} from '../../../navigation/navigationRef';

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
  duration = 2200,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(24);
  const opacity = useSharedValue(0);
  const cardScale = useSharedValue(0.96);
  const heartScale = useSharedValue(0.65);
  const badgeScale = useSharedValue(0);
  const added = action === 'added';
  const accentColor = added ? '#E54865' : '#64748B';

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    cancelAnimation(translateY);
    cancelAnimation(opacity);
    cancelAnimation(cardScale);
    cancelAnimation(heartScale);
    cancelAnimation(badgeScale);
    translateY.value = 24;
    opacity.value = 0;
    cardScale.value = 0.96;
    heartScale.value = 0.65;
    badgeScale.value = 0;

    opacity.value = withTiming(1, {duration: 180});
    translateY.value = withSpring(0, {damping: 18, stiffness: 190});
    cardScale.value = withSpring(1, {damping: 18, stiffness: 190});
    heartScale.value = withSequence(
      withSpring(1.16, {damping: 9, stiffness: 220}),
      withSpring(1, {damping: 13, stiffness: 200}),
    );
    badgeScale.value = withDelay(
      120,
      withSpring(1, {damping: 12, stiffness: 220}),
    );

    const timer = setTimeout(() => {
      opacity.value = withTiming(0, {duration: 180}, finished => {
        if (finished) {
          runOnJS(onHide)();
        }
      });
      translateY.value = withTiming(18, {duration: 180});
      cardScale.value = withTiming(0.98, {duration: 180});
    }, duration);

    return () => {
      clearTimeout(timer);
      cancelAnimation(translateY);
      cancelAnimation(opacity);
      cancelAnimation(cardScale);
      cancelAnimation(heartScale);
      cancelAnimation(badgeScale);
    };
  }, [
    visible,
    action,
    duration,
    onHide,
    translateY,
    opacity,
    cardScale,
    heartScale,
    badgeScale,
  ]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {translateY: translateY.value},
      {scale: cardScale.value},
    ],
  }));
  const heartStyle = useAnimatedStyle(() => ({
    transform: [{scale: heartScale.value}],
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeScale.value,
    transform: [{scale: badgeScale.value}],
  }));

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {bottom: insets.bottom + scale(14)},
        containerStyle,
      ]}>
      <View style={styles.card}>
        <View
          style={[
            styles.iconWrap,
            added ? styles.iconWrapAdded : styles.iconWrapRemoved,
          ]}>
          <Animated.View style={heartStyle}>
            <Heart
              size={scale(21)}
              color={accentColor}
              fill={added ? accentColor : 'transparent'}
              strokeWidth={2.2}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.statusBadge,
              added ? styles.statusBadgeAdded : styles.statusBadgeRemoved,
              badgeStyle,
            ]}>
            {added ? (
              <Check size={scale(9)} color="#FFFFFF" strokeWidth={3} />
            ) : (
              <Minus size={scale(9)} color="#FFFFFF" strokeWidth={3} />
            )}
          </Animated.View>
        </View>
        <View style={styles.textCol}>
          <Text style={styles.title}>
            {added ? 'Added to wishlist' : 'Removed from wishlist'}
          </Text>
          {productName ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {productName}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.viewButton}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="View wishlist"
          onPress={() => {
            onHide();
            if (navigationRef.isReady()) {
              navigationRef.navigate('Main', {screen: 'Wishlist'});
            }
          }}>
          <Text style={styles.viewButtonText}>View Wishlist</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: scale(16),
    right: scale(16),
    zIndex: 9999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#F1E5E8',
    paddingVertical: scale(11),
    paddingHorizontal: scale(13),
  },
  iconWrap: {
    width: scale(38),
    height: scale(38),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(11),
  },
  iconWrapAdded: {backgroundColor: '#FFF1F3'},
  iconWrapRemoved: {backgroundColor: '#F1F5F9'},
  statusBadge: {
    position: 'absolute',
    right: -scale(3),
    bottom: -scale(3),
    width: scale(15),
    height: scale(15),
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  statusBadgeAdded: {backgroundColor: '#E54865'},
  statusBadgeRemoved: {backgroundColor: '#64748B'},
  textCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: scale(12.5),
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: scale(11),
    color: '#64748B',
    marginTop: scale(2),
  },
  viewButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: '#FFF1F3',
  },
  viewButtonText: {
    color: '#D93655',
    fontSize: scale(10.5),
    fontWeight: '700',
  },
});

export default AnimatedWishlistToast;
