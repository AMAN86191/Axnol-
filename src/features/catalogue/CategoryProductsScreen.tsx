import React, {useCallback, useEffect, useState} from 'react';
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
import {getProducts, ProductApi} from '../../api/ProductProvider';
import CommonHeader from '../../components/ui/CommonHeader';
import EmptyState from '../../components/ui/EmptyState';
import {colors, scale, spacing} from '../../theme';
import ProductCard from '../../components/ui/ProductCard';
import {useRefresh} from '../../hooks/useRefresh';
import {getLoadErrorMessage} from '../../utils/apiError';
import {toProductCardData} from '../../utils/productCardData';

type Route = RouteProp<CatalogueStackParamList, 'CategoryProducts'>;

const chunk = <T,>(list: T[], size: number): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < list.length; i += size) {
    rows.push(list.slice(i, i + size));
  }
  return rows;
};

export const CategoryProductsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const {params} = useRoute<Route>();
  const {categoryId, subCategoryId, industryId} = params ?? {};
  const [products, setProducts] = useState<ProductApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProducts({
        ...(categoryId ? {categoryId} : {}),
        ...(subCategoryId ? {subCategoryId} : {}),
        ...(industryId ? {industryId} : {}),
      });
      const data: any = res?.data ?? res;
      const list = Array.isArray(data)
        ? data
        : data?.products ?? data?.items ?? [];
      setProducts(list);
    } catch (err) {
      setError(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId, subCategoryId, industryId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const {refreshing, onRefresh} = useRefresh(loadProducts);

  const isEmpty = !loading && !error && products.length === 0;

  const handlePress = (product: ProductApi) =>
    navigation.navigate('ProductDetails', {productId: product.id});

  return (
    <View style={styles.container}>
      <CommonHeader
        title={params?.title ?? 'Products'}
        onBack={() => navigation.goBack()}
      />
      {loading && products.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : error && products.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="Could not load products"
          subtitle={getLoadErrorMessage(error, 'products')}
          actionLabel="Try Again"
          onAction={loadProducts}
        />
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
                  product={toProductCardData(product)}
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
