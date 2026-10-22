import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ChevronRight} from 'lucide-react-native';
import AppImage from '../../../components/ui/AppImage';
import {colors, scale} from '../../../theme';
import {formatPrice} from '../../../utils/formatPrice';
import {HomeProduct} from '../homeData';
import HomeSectionHeader from './HomeSectionHeader';
import Button from '../../../components/ui/Button';
import AddToCartButton from '../../cart/components/AddToCartButton';
import WishlistButton from '../../wishlist/components/WishlistButton';

interface AllProductsGridProps {
  products: HomeProduct[];
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
   onSeeAll?: () => void;
  onPress: (product: HomeProduct) => void;
}> = ({product, onPress}) => (
  <TouchableOpacity
    style={styles.card}
    activeOpacity={0.85}
    onPress={() => onPress(product)}>
    {/* Image area */}
    <View style={styles.imgArea}>
      <AppImage uri={product.image} style={styles.img} resizeMode="contain" />
      <WishlistButton
        product={{
          id: product.id,
          name: product.name,
          code: product.code,
          image: product.image,
          price: product.price,
          mrp: product.mrp,
          unit: product.unit,
        }}
        style={styles.favBtn}
      />
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
      <View style={styles.ctaRow}>
        <Button
          title="Details"
          variant="outline"
          size="small"
          fullWidth={false}
          style={styles.detailsBtn}
          onPress={() => onPress(product)}
          iconRight={
            <ChevronRight
              size={scale(13)}
              color={colors.primary}
              strokeWidth={2.6}
            />
          }
          textStyle={styles.detailsText}
        />
        <AddToCartButton
          product={{
            id: product.id,
            name: product.name,
            code: product.code,
            image: product.image,
            price: product.price,
            mrp: product.mrp,
            unit: product.unit,
          }}
          compact
          style={styles.addBtn}
        />
      </View>
  </TouchableOpacity>
);

export const AllProductsGrid: React.FC<AllProductsGridProps> = ({
  products,
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
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: scale(6),
  },
  detailsBtn: {
    flex: 1,
    paddingHorizontal: scale(4),
    gap: scale(2),
  },
  addBtn: {
    flex: 1,
  },
  detailsText: {
    fontSize: scale(10),
    fontWeight: '700',
    flexShrink: 1,
  },
});

export default AllProductsGrid;
