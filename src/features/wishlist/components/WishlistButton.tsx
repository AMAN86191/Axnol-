import React, {useEffect, useRef} from 'react';
import {
  Animated,
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {Heart} from 'lucide-react-native';
import {scale} from '../../../theme';
import {useAppSelector} from '../../../store';
import {selectIsWishlisted} from '../wishlistSelectors';
import {WishlistItem} from '../wishlistSlice';
import useWishlist from '../useWishlist';

interface WishlistButtonProps {
  product: WishlistItem;
  size?: number;
  style?: StyleProp<ViewStyle>;
  containerSize?: number;
  showBackground?: boolean;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  product,
  size = 14,
  containerSize = 25,
  style,
  showBackground = true,
}) => {
  const productId = product.productId ?? product.id;
  const isWishlisted = useAppSelector(selectIsWishlisted(productId));
  const {toggle} = useWishlist();
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    anim.setValue(1);
  }, [isWishlisted, anim]);

  const animate = () => {
    Animated.sequence([
      Animated.spring(anim, {
        toValue: 1.32,
        useNativeDriver: true,
        speed: 40,
        bounciness: 12,
      }),
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 40,
        bounciness: 8,
      }),
    ]).start();
  };

  const handlePress = (event: GestureResponderEvent) => {
    // Stop the parent product card from also handling this tap.
    event?.stopPropagation?.();

    toggle({
      id: String(productId),
      productId,
      name: product.name,
      code: product.code,
      image: product.image,
      price: product.price,
      mrp: product.mrp,
      unit: product.unit,
      rateChartId: product.rateChartId,
    });
    animate();
  };

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        {width: scale(containerSize), height: scale(containerSize)},
        showBackground && styles.btnSurface,
        style,
      ]}
      activeOpacity={0.7}
      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
      onPress={handlePress}>
      <View>
        <Heart
          size={scale(size)}
          color={isWishlisted ? '#EF4444' : '#64748B'}
          fill={isWishlisted ? '#EF4444' : 'none'}
          // strokeWidth={2}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    width: scale(25),
    height: scale(25),
    borderRadius: scale(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSurface: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDF1F7',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
});

export default WishlistButton;
