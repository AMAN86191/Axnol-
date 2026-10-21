import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ArrowRight, Heart} from 'lucide-react-native';
import AppImage from '../../../components/ui/AppImage';
import {colors, scale} from '../../../theme';
import {formatPrice} from '../../../utils/formatPrice';
import {HomeProduct} from '../homeData';
import HomeSectionHeader from './HomeSectionHeader';
import Button from '../../../components/ui/Button';

interface AllProductsGridProps {
  products: HomeProduct[];
  favorites: Record<string, boolean>;
  onToggleFavorite: (id: string) => void;
  onSeeAll?: () => void;
  onPress: (product: HomeProduct) => void;
}

const chunk = <T,>(list: T[], size: number): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < list.length; i += size) {
    rows.push(list.slice(i, i + size));
  }
  return rows;
};

const ProductGridCard: React.FC<{
  product: HomeProduct;
  isFav: boolean;
   onToggleFavorite: (id: string) => void;
  onSeeAll?: () => void;
  onPress: (product: HomeProduct) => void;
}> = ({product, isFav, onToggleFavorite, onPress}) => (
  <TouchableOpacity
    style={styles.card}
    activeOpacity={0.85}
    onPress={() => onPress(product)}>
    {/* Image area */}
    <View style={styles.imgArea}>
      <AppImage uri={product.image} style={styles.img} resizeMode="contain" />
      <TouchableOpacity
        style={styles.favBtn}
        activeOpacity={0.7}
        onPress={() => onToggleFavorite(product.id)}>
        <Heart
          size={scale(14)}
          color={isFav ? '#EF4444' : '#64748B'}
          fill={isFav ? '#EF4444' : 'none'}
          strokeWidth={2}
        />
      </TouchableOpacity>
    </View>

    {/* Info */}
    <Text style={styles.name} numberOfLines={1}>
      {product.name}
    </Text>
    <Text style={styles.code}>{product.code}</Text>

    <View style={styles.priceRow}>
      <View style={styles.priceMain}>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
        {product.unit ? (
          <Text style={styles.unit}> / {product.unit}</Text>
        ) : null}
      </View>
      {product.mrp && product.mrp > product.price ? (
        <Text style={styles.mrp}>{formatPrice(product.mrp)}</Text>
      ) : null}
    </View>

    <View style={styles.divider} />

      {/* CTA */}
                <Button
                  title="View Details"
                  variant="outline"
                  size="small"
                  fullWidth
                  onPress={() => onPress(product)}
                  iconRight={
                    <ArrowRight
                      size={scale(13)}
                      color={colors.primary}
                      strokeWidth={2.6}
                    />
                  }
                  textStyle={styles.detailsText}
                />
  </TouchableOpacity>
);

export const AllProductsGrid: React.FC<AllProductsGridProps> = ({
  products,
  favorites,
  onToggleFavorite,
  onSeeAll,
  onPress,
}) => {
  const rows = chunk(products, 2);

  return (
    <View>
      <HomeSectionHeader
        title="All Products"
        subtitle={`${products.length}+ items in catalogue`}
        onAction={onSeeAll}
      />

      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map(prod => (
              <ProductGridCard
                key={prod.id}
                product={prod}
                isFav={Boolean(favorites[prod.id])}
                onToggleFavorite={onToggleFavorite}
                onPress={onPress}
              />
            ))}
            {row.length === 1 && <View style={styles.cardPlaceholder} />}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: scale(10),
  },
  row: {
    flexDirection: 'row',
    justifyContent:"space-between",
  },
  card: {
     width: '48.5%',
     // backgroundColor: '#FFFFFF',
     borderRadius: scale(18),
     borderWidth: 2,
     borderColor: colors.border,
     padding: scale(6),
     // shadowColor: '#0F172A',
     // shadowOffset: {width: 0, height: 4},
     // shadowOpacity: 0.08,
     // shadowRadius: 9,
     // elevation: 2,
   },
  cardPlaceholder: {
    flex: 1,
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
     // minHeight: scale(34),
     marginBottom: scale(3),
  },
  code: {
    fontSize: scale(9.5),
      color: '#94A3B8',
      fontWeight: '600',
      // marginBottom: scale(10),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: scale(7),
    marginBottom: scale(9),
  },
  priceMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
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
  mrp: {
    fontSize: scale(10),
    fontWeight: '600',
    color: '#B0BEC5',
    textDecorationLine: 'line-through',
  },
  divider: {
     height: 1,
      backgroundColor: '#F1F5F9',
      marginBottom: scale(10),
  },
  detailsText: {
    fontSize: scale(11),
    fontWeight: '700',
  },
});

export default AllProductsGrid;
