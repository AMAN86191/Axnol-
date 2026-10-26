import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {WifiOff} from 'lucide-react-native';
import ProductCard from '../../../components/ui/ProductCard';
import {colors, scale} from '../../../theme';
import {HomeProduct} from '../homeData';
import HomeSectionHeader from './HomeSectionHeader';
import SectionEmptyState from './SectionEmptyState';

interface AllProductsGridProps {
  products: HomeProduct[];
  loading?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
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
  loading = false,
  errorMessage,
  onRetry,
  onSeeAll,
  onPress,
}) => {
  const rows = chunk(products, 2);
  const showError = !loading && products.length === 0 && Boolean(errorMessage);
  const isEmpty = !loading && !showError && products.length === 0;

  return (
    <View>
      <HomeSectionHeader
        title="All Products"
        subtitle={
          showError
            ? 'Unable to load right now'
            : isEmpty
            ? 'Please check back later'
            : `${products.length}+ items in catalogue`
        }
        onAction={isEmpty || showError ? undefined : onSeeAll}
      />

      {loading && products.length === 0 ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : showError ? (
        <SectionEmptyState
          icon={WifiOff}
          message={errorMessage as string}
          actionLabel="Retry"
          onAction={onRetry}
        />
      ) : isEmpty ? (
        <SectionEmptyState message="No products found at the moment" />
      ) : (
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
      )}
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
  loadingWrap: {
    paddingVertical: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AllProductsGrid;
