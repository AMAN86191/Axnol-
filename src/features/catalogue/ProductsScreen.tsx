import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  Heart,
  PackageOpen,
  Search,
  ShoppingCart,
  SlidersHorizontal,
} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CatalogueStackParamList} from '../../navigation/types';
import CommonHeader from '../../components/ui/CommonHeader';
import {colors, fontSize, radius, scale, spacing} from '../../theme';
import ProductsSkeleton from './components/ProductsSkeleton';
import ProductCard from '../../components/ui/ProductCard';
import {useRefresh} from '../../hooks/useRefresh';
import {useAppDispatch} from '../../redux/hooks';
import {useAppSelector} from '../../store';
import {selectCartItemCount} from '../cart/cartSelectors';
import {selectWishlistCount} from '../wishlist/wishlistSelectors';
import {
  clearProducts,
  fetchProductsSlice,
  getProductListKey,
} from '../../redux/ProductSlice';
import {invalidateRequests} from '../../api/requestCache';
import {toProductCardData} from '../../utils/productCardData';
import {fetchCategoriesSlice} from '../../redux/CategorySlice';
import {fetchIndustriesSlice} from '../../redux/IndustrySlice';
import {getLoadErrorMessage} from '../../utils/apiError';
import ProductFiltersModal, {
  SortKey,
} from './components/ProductFiltersModal';

type Route = RouteProp<CatalogueStackParamList, 'Products'>;

const chunk = <T,>(list: T[], size: number): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < list.length; i += size) {
    rows.push(list.slice(i, i + size));
  }
  return rows;
};

export const ProductsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartItemCount);
  const wishlistCount = useAppSelector(selectWishlistCount);
  const apiProducts = useAppSelector(s => s.product.products);
  const productsLoading = useAppSelector(s => s.product.loading);
  const pagination = useAppSelector(s => s.product.pagination);
  const listKey = useAppSelector(s => s.product.listKey);
  const categories = useAppSelector(s => s.category.allCategories);
  const categoriesLoading = useAppSelector(s => s.category.loading);
  const categoriesError = useAppSelector(s =>
    getLoadErrorMessage(s.category.error, 'categories'),
  );
  const industries = useAppSelector(s => s.industry.industries);
  const industriesLoading = useAppSelector(s => s.industry.loading);
  const industriesError = useAppSelector(s =>
    getLoadErrorMessage(s.industry.error, 'industries'),
  );
  const loading = productsLoading && apiProducts.length === 0;

  const route = useRoute<Route>();
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    route.params?.categoryId ?? '',
  );
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(
    route.params?.subCategoryId ?? '',
  );
  const [selectedIndustryId, setSelectedIndustryId] = useState(
    route.params?.industryId ?? '',
  );
  const [selectedUnit, setSelectedUnit] = useState('All');
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [search, setSearch] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const filterRequested = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setSelectedCategoryId(route.params?.categoryId ?? '');
      setSelectedSubCategoryId(route.params?.subCategoryId ?? '');
      setSelectedIndustryId(route.params?.industryId ?? '');
      setSelectedUnit('All');
      setSortBy('newest');
      setSearch('');
      setFilterVisible(false);
    }, [
      route.params?.categoryId,
      route.params?.industryId,
      route.params?.subCategoryId,
    ]),
  );

  const allProducts = useMemo(
    () =>
      (apiProducts ?? []).map((product: any, index: number) =>
        toProductCardData(product, index),
      ),
    [apiProducts],
  );

  const units = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p: any) => {
      if (p.unit) set.add(p.unit);
    });
    return ['All', ...Array.from(set)];
  }, [allProducts]);

  const loadProducts = useCallback(
    (
      pageNum = 1,
      filters?: {
        categoryId?: string;
        subCategoryId?: string;
        industryId?: string;
        sort?: SortKey;
      },
    ) => {
      const params: Record<string, any> = {
        page: pageNum,
        sort: filters?.sort ?? sortBy,
      };
      const categoryId = filters ? filters.categoryId : route.params?.categoryId;
      const industryId = filters ? filters.industryId : route.params?.industryId;
      if (industryId) params.industryId = industryId;
      if (categoryId) params.categoryId = categoryId;
      const subCategoryId = filters
        ? filters.subCategoryId
        : route.params?.subCategoryId;
      if (subCategoryId) params.subCategoryId = subCategoryId;
      if (pageNum === 1) {
        setPage(1);
        dispatch(fetchProductsSlice(params))
          .unwrap()
          .catch(() => undefined);
        return;
      }
      setIsLoadingMore(true);
      dispatch(fetchProductsSlice(params))
        .unwrap()
        .catch(() => undefined)
        .finally(() => setIsLoadingMore(false));
    },
    [
      dispatch,
      route.params?.categoryId,
      route.params?.industryId,
      route.params?.subCategoryId,
      sortBy,
    ],
  );

  const handleRefresh = useCallback(() => {
    invalidateRequests('/products');
    dispatch(clearProducts());
    loadProducts(1, {
      categoryId: selectedCategoryId,
      subCategoryId: selectedSubCategoryId,
      industryId: selectedIndustryId,
      sort: sortBy,
    });
  }, [
    dispatch,
    loadProducts,
    selectedCategoryId,
    selectedIndustryId,
    selectedSubCategoryId,
    sortBy,
  ]);

  const {refreshing, onRefresh} = useRefresh(handleRefresh);

  useEffect(() => {
    // Reuse the list already in the store when it was loaded for these same
    // filters (e.g. just visited, or loaded by Home); only fetch otherwise.
    const sameFilters =
      listKey === getProductListKey(route.params) && apiProducts.length > 0;
    if (!sameFilters) {
      loadProducts(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadProducts]);

  // const pageTitle = route.params?.title ?? 'Products';
  const pageTitle = 'Products';
  // const showIndustryBanner =
  //   !!industryBanner && pageTitle.toLowerCase() === industryBanner.title.toLowerCase();

  const openFilter = () => {
    if (!filterRequested.current) {
      dispatch(fetchCategoriesSlice(undefined));
      dispatch(fetchIndustriesSlice());
      filterRequested.current = true;
    }
    setFilterVisible(true);
  };

  const retryCategories = () => dispatch(fetchCategoriesSlice(undefined));
  const retryIndustries = () => dispatch(fetchIndustriesSlice());
  const closeFilter = () => setFilterVisible(false);

  useEffect(() => {
    if (pagination?.current_page) {
      setPage(pagination.current_page);
    }
  }, [pagination?.current_page]);

  const resetAllFilters = () => {
    setSelectedCategoryId('');
    setSelectedSubCategoryId('');
    setSelectedIndustryId('');
    setSelectedUnit('All');
    setSortBy('newest');
    setSearch('');
    loadProducts(1, {
      categoryId: '',
      subCategoryId: '',
      industryId: '',
      sort: 'newest',
    });
  };

  const activeFilterCount =
    (selectedCategoryId ? 1 : 0) +
    (selectedSubCategoryId ? 1 : 0) +
    (selectedIndustryId ? 1 : 0) +
    (selectedUnit !== 'All' ? 1 : 0) +
    (sortBy !== 'newest' ? 1 : 0);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = allProducts.filter((product: any) => {
      const matchesSearch =
        !query ||
          String(product.name ?? '').toLowerCase().includes(query) ||
          String(product.code ?? '').toLowerCase().includes(query);
        const matchesUnit = selectedUnit === 'All' || product.unit === selectedUnit;
        return matchesSearch && matchesUnit;
    });

    switch (sortBy) {
      case 'price-asc':
        return [...list].sort((a: any, b: any) => a.price - b.price);
      case 'price-desc':
        return [...list].sort((a: any, b: any) => b.price - a.price);
      case 'name-asc':
        return [...list].sort((a: any, b: any) => a.name.localeCompare(b.name));
      case 'name-desc':
        return [...list].sort((a: any, b: any) => b.name.localeCompare(a.name));
      default:
        return list;
    }
  }, [search, selectedUnit, sortBy, allProducts]);

  const applyFilters = (filters: {
    categoryId: string;
    subCategoryId: string;
    industryId: string;
    unit: string;
    sort: SortKey;
  }) => {
    setSelectedCategoryId(filters.categoryId);
    setSelectedSubCategoryId(filters.subCategoryId);
    setSelectedIndustryId(filters.industryId);
    setSelectedUnit(filters.unit);
    setSortBy(filters.sort);
    loadProducts(1, {
      categoryId: filters.categoryId,
      subCategoryId: filters.subCategoryId,
      industryId: filters.industryId,
      sort: filters.sort,
    });
    setFilterVisible(false);
  };

  const handlePress = (product: any) =>
    navigation.navigate('ProductDetails', { productId: product.id });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <CommonHeader
        title={pageTitle}
        right={
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerAction}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`Wishlist${wishlistCount ? `, ${wishlistCount} items` : ''}`}
              onPress={() => navigation.navigate('Wishlist')}>
              <Heart
                size={scale(19)}
                color="#1E293B"
                strokeWidth={2.2}
              />
              {wishlistCount > 0 ? (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerAction}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`Cart${cartCount ? `, ${cartCount} items` : ''}`}
              onPress={() => navigation.navigate('Cart')}>
              <ShoppingCart
                size={scale(19)}
                color="#1E293B"
                strokeWidth={2.2}
              />
              {cartCount > 0 ? (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          </View>
        }
      />

      {loading ? (
        <ProductsSkeleton />
      ) : (
        <>
      {/* Search Input Bar + View Toggle */}
      <View style={styles.searchBarRow}>
        <View style={styles.searchBar}>
          <Search size={scale(16)} color="#94A3B8" strokeWidth={2.2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity
            style={styles.filterBtn}
            activeOpacity={0.7}
            onPress={openFilter}>
            <SlidersHorizontal
              size={scale(16)}
              color={colors.primary}
              strokeWidth={2.2}
            />
            {activeFilterCount > 0 ? (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>

      {/* Product List / Grid */}
      {(() => {
        const visibleFiltered = filtered.filter((p: any) => Number(p?.price) > 0);
        if (productsLoading && allProducts.length === 0) {
          return <ProductsSkeleton />;
        }
        if (visibleFiltered.length === 0) {
          return (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconWrap}>
                <PackageOpen
                  size={scale(30)}
                  color={colors.primary}
                  strokeWidth={1.8}
                />
              </View>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySubtitle}>
                Try a different search or clear your filters.
              </Text>
              <TouchableOpacity
                style={styles.emptyResetBtn}
                activeOpacity={0.8}
                onPress={resetAllFilters}>
                <Text style={styles.emptyResetText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          );
        }
        return (
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
              {paddingBottom: insets.bottom + scale(85)},
            ]}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
            scrollEventThrottle={16}
            onScroll={({nativeEvent}) => {
              const paddingToBottom = scale(300);
              const {contentOffset, contentSize, layoutMeasurement} = nativeEvent;
              if (
                !isLoadingMore &&
                !productsLoading &&
                pagination?.last_page &&
                page < pagination.last_page &&
                contentOffset.y +
                  layoutMeasurement.height +
                  paddingToBottom >=
                  contentSize.height
              ) {
                loadProducts(page + 1, {
                  categoryId: selectedCategoryId,
                  subCategoryId: selectedSubCategoryId,
                  industryId: selectedIndustryId,
                  sort: sortBy,
                });
              }
            }}>
            {chunk(visibleFiltered, 2).map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.gridRow}>
                {row.map(prod => (
                  <ProductCard
                    style={styles.gridCard}
                    key={prod.id}
                    product={prod}
                    onPress={() => handlePress(prod)}
                  />
                ))}
              </View>
            ))}
            {isLoadingMore ? (
              <View style={styles.loadMore}>
                <Text style={styles.loadMoreText}>Loading more products...</Text>
              </View>
            ) : null}
          </ScrollView>
        );
      })()}
        </>
      )}

      <ProductFiltersModal
        visible={filterVisible}
        categories={categories}
        industries={industries}
        categoriesLoading={categoriesLoading}
        industriesLoading={industriesLoading}
        categoriesError={categoriesError}
        industriesError={industriesError}
        selectedCategoryId={selectedCategoryId}
        selectedSubCategoryId={selectedSubCategoryId}
        selectedIndustryId={selectedIndustryId}
        selectedUnit={selectedUnit}
        sortBy={sortBy}
        units={units}
        onRetryCategories={retryCategories}
        onRetryIndustries={retryIndustries}
        onClose={closeFilter}
        onApply={applyFilters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(2),
  },
  headerAction: {
    width: scale(34),
    height: scale(34),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadge: {
    position: 'absolute',
    top: scale(1),
    right: scale(0),
    minWidth: scale(15),
    height: scale(15),
    borderRadius: scale(8),
    paddingHorizontal: scale(3),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: scale(8),
    fontWeight: '800',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  filterBtn: {
    width: scale(26),
    height: scale(26),
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -scale(4),
    right: -scale(4),
    minWidth: scale(14),
    height: scale(14),
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(3),
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  filterBadgeText: {
    fontSize: scale(8),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: scale(60),
  },
  emptyIconWrap: {
    width: scale(64),
    height: scale(64),
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: scale(16),
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: scale(4),
  },
  emptySubtitle: {
    fontSize: scale(12),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: scale(17),
  },
  emptyResetBtn: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: scale(9),
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  emptyResetText: {
    fontSize: scale(12),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: scale(8),
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    height: scale(38),
    borderRadius: radius.pill,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: spacing.sm,
    fontSize: fontSize.sm,
    color: '#0F172A',
    paddingVertical: 0,
    fontWeight: '500',
  },
  // Grid styles
  gridContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: scale(10),
  },
  gridRow: {
    flexDirection: 'row',
    gap: scale(10),
  },
  footerLoader: {
    paddingVertical: scale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCardPlaceholder: {
    flex: 1,
  },
  gridCard: {
    width: '48.5%',
  },
  loadMore: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  loadMoreText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  scrollFlex: {
    flex: 1,
  },
});


export default ProductsScreen;