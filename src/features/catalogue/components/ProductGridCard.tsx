import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ChevronRight} from 'lucide-react-native';
import {colors, scale} from '../../../theme';
import AppImage from '../../../components/ui/AppImage';
import Button from '../../../components/ui/Button';
import {formatPrice} from '../../../utils/formatPrice';

export interface ProductGridCardData {
  id: string;
  name: string;
  image?: string;
  code?: string;
  price: number;
  unit?: string;
  mrp?: number;
}

interface ProductGridCardProps {
  product: ProductGridCardData;
  onPress: () => void;
}

export const ProductGridCard: React.FC<ProductGridCardProps> = ({
  product,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.gridCard}
    activeOpacity={0.85}
    onPress={onPress}>
    <View style={styles.gridImgArea}>
      <AppImage uri={product.image} style={styles.gridImg} resizeMode="contain" />
    </View>
    <Text style={styles.gridName} numberOfLines={1}>
      {product.name}
    </Text>
    <Text style={styles.gridCode}>{product.code}</Text>
    <View style={styles.gridPriceRow}>
      <View style={styles.gridPriceMain}>
        <Text style={styles.gridPrice}>{formatPrice(product.price)}</Text>
        {product.unit ? (
          <Text style={styles.gridUnit}> / {product.unit}</Text>
        ) : null}
      </View>
      {product.mrp && product.mrp > product.price ? (
        <Text style={styles.gridMrp}>{formatPrice(product.mrp)}</Text>
      ) : null}
    </View>
    <View style={styles.gridDivider} />
    <Button
      title="View Details"
      variant="outline"
      size="small"
      fullWidth
      onPress={onPress}
      iconRight={
        <ChevronRight size={scale(13)} color={colors.primary} strokeWidth={2.6} />
      }
      textStyle={styles.gridDetailsText}
    />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  gridCard: {
    width: '48.5%',
    borderRadius: scale(18),
    borderWidth: 2,
    borderColor: colors.border,
    padding: scale(6),
  },
  gridImgArea: {
    height: scale(122),
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: '#E9F1FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(10),
    overflow: 'hidden',
  },
  gridImg: {
    width: scale(112),
    height: scale(104),
  },
  gridName: {
    fontSize: scale(13),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    lineHeight: scale(17),
    marginBottom: scale(3),
  },
  gridCode: {
    fontSize: scale(9.5),
    color: '#94A3B8',
    fontWeight: '600',
  },
  gridPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginVertical: scale(5),
  },
  gridPriceMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  gridPrice: {
    fontSize: scale(14),
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  gridUnit: {
    fontSize: scale(9.5),
    fontWeight: '600',
    color: '#94A3B8',
  },
  gridMrp: {
    fontSize: scale(10),
    fontWeight: '600',
    color: '#B0BEC5',
    textDecorationLine: 'line-through',
  },
  gridDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: scale(10),
  },
  gridDetailsText: {
    fontSize: scale(11),
    fontWeight: '700',
  },
});
export default ProductGridCard;
