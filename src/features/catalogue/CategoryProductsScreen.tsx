import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {PackageSearch} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CatalogueStackParamList} from '../../navigation/types';
import {useGetProductsQuery} from '../../api/services/catalogueApi';
import {Product} from '../../api/types';
import CommonHeader from '../../components/ui/CommonHeader';
import EmptyState from '../../components/ui/EmptyState';
import {colors, scale, spacing} from '../../theme';
import ProductCard, {ProductCardData} from '../../components/ui/ProductCard';
import {useRefresh} from '../../hooks/useRefresh';

type Route = RouteProp<CatalogueStackParamList, 'CategoryProducts'>;

const chunk = <T,>(list: T[], size: number): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < list.length; i += size) {
    rows.push(list.slice(i, i + size));
  }
  return rows;
};

const toCard = (product: Product): ProductCardData => ({
  id: product.id,
  name: product.name,
  image: product.images?.[0],
  code: product.brand,
  price: product.price,
  unit: product.packSizes?.[0],
});

export const CategoryProductsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const {params} = useRoute<Route>();
  const {data, isLoading, refetch} = useGetProductsQuery({
    categoryId: params?.categoryId,
    subCategoryId: params?.subCategoryId,
    industryId: params?.industryId,
  });
  const {refreshing, onRefresh} = useRefresh(refetch);

  const products = data ?? [];
  const isEmpty = !isLoading && products.length === 0;

  const handlePress = (product: Product) =>
    navigation.navigate('ProductDetails', {productId: product.id});

  return (
    <View style={styles.container}>
      <CommonHeader
        title={params?.title ?? 'Products'}
        onBack={() => navigation.goBack()}
      />
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : isEmpty ? (
        <EmptyState
          icon={PackageSearch}
          title="No products"
          subtitle="There are no products available here yet."
        />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          style={styles.scrollFlex}
          contentContainerStyle={[
            styles.gridContainer,
            {paddingBottom: insets.bottom + scale(40)},
          ]}
          showsVerticalScrollIndicator={false}>
          {chunk(products, 2).map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.gridRow}>
              {row.map(product => (
                <ProductCard
                  style={styles.gridCard}
                  key={product.id}
                  product={toCard(product)}
                  onPress={() => handlePress(product)}
                />
              ))}
              {row.length === 1 && <View style={styles.gridCardPlaceholder} />}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  loader: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  scrollFlex: {flex: 1},
  gridContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: scale(10),
  },
  gridRow: {
    flexDirection: 'row',
    gap: scale(10),
  },
  gridCard: {
    flex: 1,
  },
  gridCardPlaceholder: {
    flex: 1,
  },
});
export default CategoryProductsScreen;
