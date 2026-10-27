import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import ProductCard from '../../../components/ui/ProductCard';
import { scale } from '../../../theme';
import { HomeProduct } from '../homeData';
import HomeSectionHeader from './HomeSectionHeader';
import SectionEmptyState from './SectionEmptyState';
import {ProductCardSkeleton} from '../../../components/ui/ProductCardSkeleton';

interface FeaturedProductsSectionProps {
  products: HomeProduct[];
  loading?: boolean;
  onSeeAll?: () => void;
  onPress: (product: HomeProduct) => void;
}

export const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({
  products,
  loading = false,
  onSeeAll,
  onPress,
}) => {
  const isEmpty = !loading && products.length === 0;

  return (
    <>
      <HomeSectionHeader
        title="Featured Products"
        subtitle={isEmpty ? 'Please check back later' : 'Hand-picked by our experts'}
        onAction={isEmpty ? undefined : onSeeAll}
      />

      {loading && products.length === 0 ? (
        <ScrollView
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollPad}>
          {[0, 1, 2].map(i => (
            <ProductCardSkeleton key={i} style={styles.card} />
          ))}
        </ScrollView>
      ) : isEmpty ? (
        <SectionEmptyState
          icon={Star}
          message="No featured products found at the moment"
        />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollPad}>
          {products.map(prod => (
            <ProductCard
              key={prod.id}
              product={prod}
              style={styles.card}
              gradientImage
              onPress={() => onPress(prod)}
            />
          ))}
        </ScrollView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  scrollPad: {
    gap: scale(11),
    paddingRight: scale(6),
    paddingTop: scale(2),
    paddingBottom: scale(6),
  },
  card: {
    width: scale(160),
  },
});

export default FeaturedProductsSection;
