import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors, scale} from '../../theme';
import AppImage from './AppImage';
import {formatPrice} from '../../utils/formatPrice';
import AddToCartButton from '../../features/cart/components/AddToCartButton';
import WishlistButton from '../../features/wishlist/components/WishlistButton';

export interface ProductCardData {
  id: string;
  name: string;
  image?: string;
  code?: string;
  price: number;
  unit?: string;
  qty?: number | string;
  mrp?: number;
}

interface ProductCardProps {
  product: ProductCardData;
  onPress: () => void;
  /** Container style, e.g. a width for grids or carousels. */
  style?: StyleProp<ViewStyle>;
  /** Soft gradient behind the image instead of plain white. */
  gradientImage?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  style,
  gradientImage = false,
}) => {
  const cartProduct = {
    id: product.id,
    name: product.name,
    code: product.code,
    image: product.image,
    price: product.price,
    mrp: product.mrp,
    unit: product.unit,
  };

  const image = (
    <>
      <WishlistButton product={cartProduct} style={styles.favBtn} />
      <AppImage uri={product.image} style={styles.img} resizeMode="contain" />
    </>
  );

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      activeOpacity={0.85}
      onPress={onPress}>
      {gradientImage ? (
        <LinearGradient
          colors={['#F8FBFF', '#E8F2FB']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.imgArea}>
          {image}
        </LinearGradient>
      ) : (
        <View style={styles.imgArea}>{image}</View>
      )}

      <Text style={styles.name} numberOfLines={1}>
        {product.name}
      </Text>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
        {product.qty || product.unit ? (
          <Text style={styles.unit}>
            {' '}
            / {product.qty ? `${product.qty}${product.unit ? product.unit : ''}` : product.unit}
          </Text>
        ) : null}
      </View>

      <View style={styles.divider} />

      <AddToCartButton product={cartProduct} compact />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: scale(18),
    borderWidth: 2,
    borderColor: colors.border,
    padding: scale(6),
  },
  imgArea: {
    height: scale(122),
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: '#E9F1FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(10),
    overflow: 'hidden',
  },
  img: {
    width: scale(112),
    height: scale(104),
  },
  favBtn: {
    position: 'absolute',
    top: scale(6),
    right: scale(6),
    width: scale(25),
    height: scale(25),
    borderRadius: scale(14),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDF1F7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
    zIndex: 2,
  },
  name: {
    fontSize: scale(13),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    lineHeight: scale(17),
    marginBottom: scale(3),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: scale(4),
    marginBottom: scale(9),
  },
  price: {
    fontSize: scale(16),
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  unit: {
    fontSize: scale(9.5),
    fontWeight: '600',
    color: '#94A3B8',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: scale(10),
  },
});

export default ProductCard;
