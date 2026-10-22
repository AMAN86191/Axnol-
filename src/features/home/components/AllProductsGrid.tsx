import React from 'react';
import {StyleSheet, View} from 'react-native';
import ProductCard from '../../../components/ui/ProductCard';
import {scale} from '../../../theme';
import {HomeProduct} from '../homeData';
import HomeSectionHeader from './HomeSectionHeader';

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
              <ProductCard
                key={prod.id}
                product={prod}
                style={styles.card}
                onPress={() => onPress(prod)}
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
    justifyContent: 'space-between',
  },
  card: {
    width: '48.5%',
  },
  cardPlaceholder: {
    flex: 1,
  },
});

export default AllProductsGrid;
