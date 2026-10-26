import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {PackageSearch} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CatalogueStackParamList} from '../../navigation/types';
import CommonHeader from '../../components/ui/CommonHeader';
import EmptyState from '../../components/ui/EmptyState';
import ProductCard from '../../components/ui/ProductCard';
import {ProductApi} from '../../api/ProductProvider';
import {
  colors,
  radius,
  scale,
  spacing,
  typography,
} from '../../theme';
import {useRefresh} from '../../hooks/useRefresh';
import {useAppDispatch} from '../../redux/hooks';
import {useAppSelector} from '../../store';
import {fetchCategoryDetailsSlice} from '../../redux/CategorySlice';
import {getLoadErrorMessage} from '../../utils/apiError';
import {toProductCardData} from '../../utils/productCardData';

type Route = RouteProp<CatalogueStackParamList, 'SubCategories'>;

interface SubCategoryItem {
  id: string;
  name: string;
  image: string;
}

const ALL_SUB_CATEGORY_ID = 'all';

const chunk = <T,>(list: T[], size: number): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < list.length; i += size) {
    rows.push(list.slice(i, i + size));
  }
  return rows;
};

export const SubCategoriesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const {params} = useRoute<Route>();
  const dispatch = useAppDispatch();
  const categoryId = params.categoryId;
  const categoryDetail = useAppSelector(s => s.category.categoryDetail);
  const detailLoading = useAppSelector(s => s.category.detailLoading);
  const detailError = useAppSelector(s => s.category.detailError);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(
    ALL_SUB_CATEGORY_ID,
  );

  const loadSubCategories = useCallback(() => {
    const request = dispatch(fetchCategoryDetailsSlice(categoryId));
    request.catch(() => {});
    return request;
  }, [dispatch, categoryId]);

  useEffect(() => {
    setSelectedSubCategoryId(ALL_SUB_CATEGORY_ID);
    loadSubCategories();
  }, [loadSubCategories]);

  const {refreshing, onRefresh} = useRefresh(loadSubCategories);

  const subCategories = useMemo<SubCategoryItem[]>(() => {
    const detail: any = categoryDetail;
    if (!detail || Array.isArray(detail)) {
      return [];
    }
    const list =
      detail.sub_categories ??
      detail.subcategories ??
      detail.subCategories ??
      [];
    if (!Array.isArray(list)) {
      return [];
    }
    return list.map((item: any, index: number) => ({
      id: String(item?.id ?? item?.slug ?? `${categoryId}-${index}`),
      name: item?.title ?? item?.name ?? '',
      image: item?.icon_url ?? item?.image ?? '',
    }));
  }, [categoryDetail, categoryId]);

  const products = useMemo<ProductApi[]>(() => {
    const detail: any = categoryDetail;
    if (!detail) {
      return [];
    }
    const list = Array.isArray(detail)
      ? detail
      : detail.products ?? detail.data?.products ?? [];
    return Array.isArray(list) ? list : [];
  }, [categoryDetail]);

  const filteredProducts = useMemo(() => {
    if (selectedSubCategoryId === ALL_SUB_CATEGORY_ID) {
      return products;
    }
    return products.filter((product: any) => {
      const id =
        product?.sub_category_id ??
        product?.subCategoryId ??
        product?.sub_category?.id ??
        product?.subCategory?.id;
      return String(id ?? '') === selectedSubCategoryId;
    });
  }, [products, selectedSubCategoryId]);

  useEffect(() => {
    if (
      selectedSubCategoryId !== ALL_SUB_CATEGORY_ID &&
      !subCategories.some(item => item.id === selectedSubCategoryId)
    ) {
      setSelectedSubCategoryId(ALL_SUB_CATEGORY_ID);
    }
  }, [selectedSubCategoryId, subCategories]);

  const loading = detailLoading && !categoryDetail;
  const showError = !detailLoading && !categoryDetail && !!detailError;
  const selectedSubCategory = subCategories.find(
    item => item.id === selectedSubCategoryId,
  );

  const renderFilterChip = (id: string, name: string, active: boolean) => (
    <TouchableOpacity
      key={id}
      style={[styles.chip, active && styles.chipActive]}
      activeOpacity={0.8}
      onPress={() => setSelectedSubCategoryId(id)}>
      <Text
        style={[styles.chipText, active && styles.chipTextActive]}
        numberOfLines={1}>
        {name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <CommonHeader
        title={params?.categoryName ?? 'Sub Categories'}
        onBack={() => navigation.goBack()}
      />
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : showError ? (
        <EmptyState
          icon={PackageSearch}
          title="Could not load category"
          subtitle={getLoadErrorMessage(detailError, 'category')}
          actionLabel="Try Again"
          onAction={loadSubCategories}
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
          contentContainerStyle={[
            styles.content,
            {paddingBottom: insets.bottom + scale(36)},
          ]}
          showsVerticalScrollIndicator={false}>
          {subCategories.length > 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Sub Categories</Text>
                <Text style={styles.sectionHint}>
                  {selectedSubCategoryId === ALL_SUB_CATEGORY_ID
                    ? 'All products'
                    : selectedSubCategory?.name ?? ''}
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}>
                {renderFilterChip(
                  ALL_SUB_CATEGORY_ID,
                  'All',
                  selectedSubCategoryId === ALL_SUB_CATEGORY_ID,
                )}
                {subCategories.map(item =>
                  renderFilterChip(
                    item.id,
                    item.name,
                    selectedSubCategoryId === item.id,
                  ),
                )}
              </ScrollView>
            </>
          ) : null}

          <View style={styles.productsHeader}>
            <Text style={styles.productsTitle}>Products</Text>
            <Text style={styles.productsCount}>{filteredProducts.length}</Text>
          </View>

          {filteredProducts.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title={
                selectedSubCategoryId === ALL_SUB_CATEGORY_ID
                  ? 'No products yet'
                  : 'No products in this sub category'
              }
              subtitle={
                selectedSubCategoryId === ALL_SUB_CATEGORY_ID
                  ? 'Products for this category will appear here.'
                  : 'Try another sub category to see available products.'
              }
              actionLabel={
                selectedSubCategoryId === ALL_SUB_CATEGORY_ID
                  ? undefined
                  : 'Show All'
              }
              onAction={
                selectedSubCategoryId === ALL_SUB_CATEGORY_ID
                  ? undefined
                  : () => setSelectedSubCategoryId(ALL_SUB_CATEGORY_ID)
              }
            />
          ) : (
            <View style={styles.gridContainer}>
              {chunk(filteredProducts, 2).map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.gridRow}>
                  {row.map(product => (
                    <ProductCard
                      style={styles.gridCard}
                      key={product.id}
                      product={toProductCardData(product)}
                      onPress={() =>
                        navigation.navigate('ProductDetails', {
                          productId: String(product.id),
                        })
                      }
                    />
                  ))}
                  {row.length === 1 ? (
                    <View style={styles.gridCardPlaceholder} />
                  ) : null}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  loader: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.bold,
    fontSize: scale(14),
    color: colors.text,
  },
  sectionHint: {
    ...typography.medium,
    fontSize: scale(10.5),
    color: colors.textMuted,
  },
  filterRow: {
    gap: scale(7),
    paddingBottom: spacing.md,
    paddingRight: spacing.lg,
  },
  chip: {
    paddingHorizontal: scale(13),
    paddingVertical: scale(8),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: scale(11.5),
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  productsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  productsTitle: {
    ...typography.bold,
    fontSize: scale(14),
    color: colors.text,
  },
  productsCount: {
    ...typography.bold,
    fontSize: scale(10),
    color: colors.textSecondary,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: scale(7),
    paddingVertical: scale(2),
    borderRadius: radius.pill,
  },
  gridContainer: {
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

export default SubCategoriesScreen;
