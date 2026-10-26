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
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {ArrowRight, PackageSearch} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CatalogueStackParamList} from '../../navigation/types';
import Button from '../../components/ui/Button';
import CommonHeader from '../../components/ui/CommonHeader';
import EmptyState from '../../components/ui/EmptyState';
import ProductCard from '../../components/ui/ProductCard';
import Skeleton from '../../components/ui/Skeleton';
import {ProductApi, getProducts} from '../../api/ProductProvider';
import {colors, radius, scale, spacing} from '../../theme';
import {getLoadErrorMessage} from '../../utils/apiError';
import {toProductCardData} from '../../utils/productCardData';
import IndustryBanner from './components/IndustryBanner';
import {useRefresh} from '../../hooks/useRefresh';
import {useAppDispatch} from '../../redux/hooks';
import {useAppSelector} from '../../store';
import {fetchIndustryDetailsSlice} from '../../redux/IndustrySlice';

type Route = RouteProp<CatalogueStackParamList, 'IndustryDetails'>;

type IndustrySubCategory = {
  id?: string | number;
  title?: string;
  name?: string;
  icon_url?: string | null;
  products?: ProductApi[];
};

type IndustryCategory = {
  id?: string | number;
  title?: string;
  name?: string;
  icon_url?: string | null;
  products?: ProductApi[];
  sub_categories?: IndustrySubCategory[];
  subcategories?: IndustrySubCategory[];
};

const ALL_FILTER_ID = 'all';

const getCategorySubCategories = (category: IndustryCategory) =>
  Array.isArray(category.sub_categories)
    ? category.sub_categories
    : Array.isArray(category.subcategories)
    ? category.subcategories
    : [];

const getCategoryTitle = (category: IndustryCategory, index: number) =>
  category.title ?? category.name ?? `Category ${index + 1}`;

const getSubCategoryTitle = (subCategory: IndustrySubCategory, index: number) =>
  subCategory.title ?? subCategory.name ?? `Sub Category ${index + 1}`;

const stripHtml = (html?: string | null) =>
  (html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const chunk = <T,>(list: T[], size: number): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < list.length; i += size) {
    rows.push(list.slice(i, i + size));
  }
  return rows;
};

export const IndustryDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const {params} = useRoute<Route>();
  const dispatch = useAppDispatch();
  const industryDetail = useAppSelector(s => s.industry.industryDetail);
  console.log('industryDetail :', industryDetail);
  const detailLoading = useAppSelector(s => s.industry.detailLoading);
  const detailError = useAppSelector(s => s.industry.detailError);
  const {industryId, industryTitle} = params;
  const [expanded, setExpanded] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] =
    useState(ALL_FILTER_ID);
  const [selectedSubCategoryId, setSelectedSubCategoryId] =
    useState(ALL_FILTER_ID);
  const [products, setProducts] = useState<ProductApi[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<any>(null);

  const loadIndustryDetails = useCallback(() => {
    const request = dispatch(fetchIndustryDetailsSlice(industryId));
    request.catch(() => {});
    return request;
  }, [dispatch, industryId]);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const res = await getProducts({industryId});
      const data: any = res?.data ?? res;
      const list = Array.isArray(data)
        ? data
        : data?.products ?? data?.items ?? [];
      setProducts(Array.isArray(list) ? list : []);
    } catch (err) {
      setProductsError(err);
    } finally {
      setProductsLoading(false);
    }
  }, [industryId]);

  const loadScreen = useCallback(
    () =>
      Promise.allSettled([loadIndustryDetails(), loadProducts()]),
    [loadIndustryDetails, loadProducts],
  );

  useEffect(() => {
    setSelectedCategoryId(ALL_FILTER_ID);
    setSelectedSubCategoryId(ALL_FILTER_ID);
    loadScreen();
  }, [loadScreen]);

  const {refreshing, onRefresh} = useRefresh(loadScreen);

  const title = industryDetail?.title ?? industryTitle ?? 'Industry';
  const image = industryDetail?.image_url ?? '';
  const description = stripHtml(industryDetail?.description);

  const categories = useMemo<IndustryCategory[]>(() => {
    const list = industryDetail?.categories;
    return Array.isArray(list) ? (list as IndustryCategory[]) : [];
  }, [industryDetail]);

  const categoryOptions = useMemo(
    () =>
      categories.map((category, index) => ({
        id:
          category.id !== undefined && category.id !== null
            ? String(category.id)
            : `category-${index}`,
        name: getCategoryTitle(category, index),
        category,
      })),
    [categories],
  );

  const subCategoryOptions = useMemo(() => {
    if (selectedCategoryId === ALL_FILTER_ID) {
      return [];
    }
    const source = categoryOptions.filter(
      item => item.id === selectedCategoryId,
    );
    const seen = new Set<string>();
    const list: Array<{
      id: string;
      name: string;
      categoryId: string;
    }> = [];
    source.forEach(option => {
      getCategorySubCategories(option.category).forEach(
        (subCategory, index) => {
          if (subCategory.id === undefined || subCategory.id === null) {
            return;
          }
          const id = String(subCategory.id);
          if (seen.has(id)) {
            return;
          }
          seen.add(id);
          list.push({
            id,
            name: getSubCategoryTitle(subCategory, index),
            categoryId: option.id,
          });
        },
      );
    });
    return list;
  }, [categoryOptions, selectedCategoryId]);

  useEffect(() => {
    if (
      selectedSubCategoryId !== ALL_FILTER_ID &&
      !subCategoryOptions.some(item => item.id === selectedSubCategoryId)
    ) {
      setSelectedSubCategoryId(ALL_FILTER_ID);
    }
  }, [selectedSubCategoryId, subCategoryOptions]);

  const embeddedProducts = useMemo(() => {
    const result = new Map<string, ProductApi>();
    const add = (
      product: ProductApi,
      categoryId?: string | number,
      subCategoryId?: string | number,
    ) => {
      if (!product || product.id === undefined || product.id === null) {
        return;
      }
      const key = String(product.id);
      result.set(key, {
        ...product,
        ...(product.category_id === undefined || product.category_id === null
          ? {category_id: categoryId}
          : {}),
        ...(product.sub_category_id === undefined ||
        product.sub_category_id === null
          ? {sub_category_id: subCategoryId}
          : {}),
      } as ProductApi);
    };

    const detailProducts = (industryDetail as any)?.products;
    if (Array.isArray(detailProducts)) {
      detailProducts.forEach(product => add(product));
    }

    categories.forEach(category => {
      if (Array.isArray(category.products)) {
        category.products.forEach(product => add(product, category.id));
      }
      getCategorySubCategories(category).forEach(subCategory => {
        if (Array.isArray(subCategory.products)) {
          subCategory.products.forEach(product =>
            add(product, category.id, subCategory.id),
          );
        }
      });
    });

    return Array.from(result.values());
  }, [industryDetail, categories]);

  const allProducts = useMemo(() => {
    const result = new Map<string, ProductApi>();
    embeddedProducts.forEach(product => {
      if (product.id !== undefined && product.id !== null) {
        result.set(String(product.id), product);
      }
    });
    products.forEach(product => {
      if (product.id !== undefined && product.id !== null) {
        const key = String(product.id);
        const existing = result.get(key);
        result.set(key, existing ? {...existing, ...product} : product);
      }
    });
    return Array.from(result.values());
  }, [embeddedProducts, products]);

  const filteredProducts = useMemo(
    () =>
      allProducts.filter((product: any) => {
        const categoryId = String(
          product?.category_id ?? product?.category?.id ?? '',
        );
        if (
          selectedCategoryId !== ALL_FILTER_ID &&
          categoryId !== selectedCategoryId
        ) {
          return false;
        }
        const subCategoryId = String(
          product?.sub_category_id ??
            product?.subCategoryId ??
            product?.sub_category?.id ??
            product?.subCategory?.id ??
            '',
        );
        if (
          selectedSubCategoryId !== ALL_FILTER_ID &&
          subCategoryId !== selectedSubCategoryId
        ) {
          return false;
        }
        return true;
      }),
    [allProducts, selectedCategoryId, selectedSubCategoryId],
  );

  const hasActiveFilters =
    selectedCategoryId !== ALL_FILTER_ID ||
    selectedSubCategoryId !== ALL_FILTER_ID;

  const resetFilters = () => {
    setSelectedCategoryId(ALL_FILTER_ID);
    setSelectedSubCategoryId(ALL_FILTER_ID);
  };

  const viewAll = () =>
    navigation.navigate('Products', {
      // title,
      // industryId,
    });

  const renderChip = (
    id: string,
    label: string,
    active: boolean,
    onPress: () => void,
  ) => (
    <TouchableOpacity
      key={id}
      style={[styles.chip, active && styles.chipActive]}
      activeOpacity={0.8}
      onPress={onPress}>
      <Text
        style={[styles.chipText, active && styles.chipTextActive]}
        numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <CommonHeader
        title="Industry Details"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {paddingBottom: insets.bottom + scale(40)},
        ]}>
        {detailLoading && !industryDetail ? (
          <Skeleton
            height={scale(176)}
            borderRadius={radius.lg}
            style={styles.bannerSkeleton}
          />
        ) : (
          <IndustryBanner
            title={title}
            image={image}
            height={scale(176)}
            showAccentLine={false}
            buttonAlign="left"
          />
        )}

        {!!description && (
          <View style={styles.descWrap}>
            <Text
              style={styles.description}
              numberOfLines={expanded ? undefined : 4}>
              {description}
            </Text>
            {!expanded && description.split(/\s+/).length > 60 ? (
              <LinearGradient
                colors={['rgba(247,249,252,0)', '#F7F9FC']}
                style={styles.fade}
                pointerEvents="none"
              />
            ) : null}
            {description.split(/\s+/).length > 60 ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setExpanded(v => !v)}
                style={styles.readMoreBtn}>
                <MaskedView
                  maskElement={
                    <Text style={styles.readMoreMaskText}>
                      {expanded ? 'Read less' : 'Read more'}
                    </Text>
                  }>
                  <LinearGradient
                    colors={['#0F172A', '#CBD5E1']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}>
                    <Text style={[styles.readMoreMaskText, styles.hiddenText]}>
                      {expanded ? 'Read less' : 'Read more'}
                    </Text>
                  </LinearGradient>
                </MaskedView>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        <Text style={styles.sectionTitle}>Categories</Text>
        {detailLoading && !industryDetail ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : detailError && !industryDetail ? (
          <View style={styles.errorWrap}>
            <Text style={styles.emptyText}>
              {getLoadErrorMessage(detailError, 'categories')}
            </Text>
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.retryBtn}
              onPress={loadIndustryDetails}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : categoryOptions.length === 0 ? (
          <Text style={styles.emptyText}>
            No product categories listed for this industry yet.
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}>
            {renderChip(
              ALL_FILTER_ID,
              'All',
              selectedCategoryId === ALL_FILTER_ID,
              () => {
                setSelectedCategoryId(ALL_FILTER_ID);
                setSelectedSubCategoryId(ALL_FILTER_ID);
              },
            )}
            {categoryOptions.map(option =>
              renderChip(
                option.id,
                option.name,
                selectedCategoryId === option.id,
                () => {
                  setSelectedCategoryId(option.id);
                  setSelectedSubCategoryId(ALL_FILTER_ID);
                },
              ),
            )}
          </ScrollView>
        )}

        {subCategoryOptions.length > 0 ? (
          <>
            <Text style={styles.subSectionTitle}>Sub Categories</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}>
              {renderChip(
                ALL_FILTER_ID,
                'All',
                selectedSubCategoryId === ALL_FILTER_ID,
                () => setSelectedSubCategoryId(ALL_FILTER_ID),
              )}
              {subCategoryOptions.map(option =>
                renderChip(
                  option.id,
                  option.name,
                  selectedSubCategoryId === option.id,
                  () => {
                    setSelectedCategoryId(option.categoryId);
                    setSelectedSubCategoryId(option.id);
                  },
                ),
              )}
            </ScrollView>
          </>
        ) : null}

        <View style={styles.productsHeader}>
          <Text style={styles.productsTitle}>Products</Text>
          <Text style={styles.productsCount}>{filteredProducts.length}</Text>
        </View>

        {productsLoading && allProducts.length === 0 ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : productsError && allProducts.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="Could not load products"
            subtitle={getLoadErrorMessage(productsError, 'products')}
            actionLabel="Try Again"
            onAction={loadProducts}
          />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No products found"
            subtitle={
              hasActiveFilters
                ? 'No products match the selected filters.'
                : 'Products for this industry will appear here.'
            }
            actionLabel={hasActiveFilters ? 'Show All' : undefined}
            onAction={hasActiveFilters ? resetFilters : undefined}
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

        <Button
          title="View all products"
          onPress={viewAll}
          iconRight={
            <ArrowRight size={scale(16)} color={colors.textInverse} />
          }
          style={styles.cta}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  bannerSkeleton: {
    marginBottom: scale(2),
  },
  descWrap: {
    marginTop: spacing.md,
  },
  description: {
    fontSize: scale(13.5),
    lineHeight: scale(21),
    color: '#475569',
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: scale(24),
    height: scale(36),
  },
  readMoreBtn: {
    alignSelf: 'flex-end',
    marginTop: scale(6),
  },
  readMoreMaskText: {
    fontSize: scale(12),
    fontWeight: '700',
  },
  hiddenText: {
    opacity: 0,
  },
  sectionTitle: {
    fontSize: scale(15),
    fontWeight: '800',
    color: '#172033',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  subSectionTitle: {
    fontSize: scale(13),
    fontWeight: '800',
    color: '#172033',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  chipRow: {
    gap: scale(7),
    paddingRight: spacing.lg,
    paddingBottom: scale(2),
  },
  chip: {
    paddingHorizontal: scale(13),
    paddingVertical: scale(8),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
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
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  productsTitle: {
    fontSize: scale(15),
    fontWeight: '800',
    color: '#172033',
  },
  productsCount: {
    fontSize: scale(10),
    fontWeight: '800',
    color: '#475569',
    backgroundColor: '#EDF1F7',
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
  loader: {
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: scale(12.5),
    color: '#718096',
  },
  errorWrap: {
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  retryBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: scale(8),
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  retryText: {
    fontSize: scale(12),
    fontWeight: '700',
    color: colors.primary,
  },
  cta: {
    marginTop: spacing.xl,
  },
});

export default IndustryDetailsScreen;
