import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import ProductCard from '../../../components/ui/ProductCard';
import { scale } from '../../../theme';
import { HomeProduct } from '../homeData';
import HomeSectionHeader from './HomeSectionHeader';

interface FeaturedProductsSectionProps {
  products: HomeProduct[];
  onSeeAll?: () => void;
  onPress: (product: HomeProduct) => void;
}

export const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({
  products,
  onSeeAll,
  onPress,
}) => (
  <>
    <HomeSectionHeader
      title="Featured Products"
      subtitle="Hand-picked by our experts"
      onAction={onSeeAll}
    />

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
  </>
);

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
