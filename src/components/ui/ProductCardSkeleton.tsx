import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import Skeleton from './Skeleton';
import {colors, radius, scale} from '../../theme';

interface ProductCardSkeletonProps {
  style?: StyleProp<ViewStyle>;
}

/** Placeholder with the same layout as ProductCard. */
export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({
  style,
}) => (
  <View style={[styles.card, style]}>
    <Skeleton height={scale(122)} borderRadius={scale(14)} />
    <Skeleton width="75%" height={scale(12)} style={styles.name} />
    <Skeleton width="40%" height={scale(14)} style={styles.price} />
    <View style={styles.divider} />
    <Skeleton height={scale(30)} borderRadius={radius.md} />
  </View>
);

interface ProductGridSkeletonProps {
  /** Number of placeholder cards; rendered two per row. */
  count?: number;
}

export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = ({
  count = 4,
}) => {
  const rows = Array.from({length: Math.ceil(count / 2)});
  return (
    <View style={styles.grid}>
      {rows.map((_, row) => (
        <View key={`row-${row}`} style={styles.row}>
          <ProductCardSkeleton style={styles.cell} />
          <ProductCardSkeleton style={styles.cell} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: scale(18),
    borderWidth: 2,
    borderColor: colors.border,
    padding: scale(6),
  },
  name: {
    marginTop: scale(10),
  },
  price: {
    marginTop: scale(9),
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginTop: scale(9),
    marginBottom: scale(10),
  },
  grid: {
    gap: scale(10),
  },
  row: {
    flexDirection: 'row',
    gap: scale(10),
  },
  cell: {
    flex: 1,
  },
});

export default ProductCardSkeleton;
