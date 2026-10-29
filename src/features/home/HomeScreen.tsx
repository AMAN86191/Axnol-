import React, { useCallback, useRef, useState, useSyncExternalStore } from 'react';
import { ScrollView, StatusBar, StyleSheet, View, RefreshControl, Linking } from 'react-native';
import { stripHtml } from '../../utils/stripHtml';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, scale } from '../../theme';
import { store } from '../../store';
import { useAppDispatch } from '../../redux/hooks';
import { fetchSlidersSlice } from '../../redux/HomeSlice';
import { fetchIndustriesSlice } from '../../redux/IndustrySlice';
import { fetchCategoriesSlice } from '../../redux/CategorySlice';
import { clearProducts, fetchProductsSlice } from '../../redux/ProductSlice';
import { selectCartItemCount } from '../cart/cartSelectors';
import { selectWishlistCount } from '../wishlist/wishlistSelectors';
import { CategoryItem, HomeBannerItem, HomeProduct } from './homeData';
import type { Slider } from '../../api/HomeProvider';
import type { Industry } from '../../api/IndustryProvider';
import type { ApiCategory } from '../../api/CategoryProvider';
import type { ProductApi } from '../../api/ProductProvider';
import HomeHeader from './components/HomeHeader';
import HomeBanner from './components/HomeBanner';
import IndustriesSection from './components/IndustriesSection';
import FeaturedProductsSection from './components/FeaturedProductsSection';
import CategoriesSection from './components/CategoriesSection';
import AllProductsGrid from './components/AllProductsGrid';
import { useRefresh } from '../../hooks/useRefresh';
import { invalidateRequests } from '../../api/requestCache';
import { getLoadErrorMessage } from '../../utils/apiError';
import { toProductCardData } from '../../utils/productCardData';
import AdSlider from './components/AdSlider';
import { ProductGridSkeleton } from '../../components/ui/ProductCardSkeleton';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [slidersLoading, setSlidersLoading] = useState(false);
  const [apiIndustries, setApiIndustries] = useState<Industry[]>([]);
  const [industriesLoading, setIndustriesLoading] = useState(false);
  const [industriesError, setIndustriesError] = useState<unknown>(null);
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<unknown>(null);
  const [apiProducts, setApiProducts] = useState<ProductApi[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<unknown>(null);
  const [productsPagination, setProductsPagination] = useState<any>(null);
  const [brochure, setbrochure] = useState<any>(null);
  const apiProductsRef = useRef(apiProducts);
  apiProductsRef.current = apiProducts;
  const apiCategoriesRef = useRef(apiCategories);
  apiCategoriesRef.current = apiCategories;
  const apiIndustriesRef = useRef(apiIndustries);
  apiIndustriesRef.current = apiIndustries;
  const slidersRef = useRef(sliders);
  slidersRef.current = sliders;
  const cartCount = useSyncExternalStore(
    store.subscribe,
    () => selectCartItemCount(store.getState()),
    () => selectCartItemCount(store.getState()),
  );
  const wishlistCount = useSyncExternalStore(
    store.subscribe,
    () => selectWishlistCount(store.getState()),
    () => selectWishlistCount(store.getState()),
  );
  const [isLoadingMoreProducts, setIsLoadingMoreProducts] = useState(false);
  const [homeProductsPage, setHomeProductsPage] = useState(1);

  const fetchData = useCallback(
    async (options: {
      sliders?: boolean;
      industries?: boolean;
      categories?: boolean;
      products?: boolean;
      page?: number;
    } = {}) => {
      const {
        sliders: shouldFetchSliders = true,
        industries: shouldFetchIndustries = true,
        categories: shouldFetchCategories = true,
        products: shouldFetchProducts = true,
        page = 1,
      } = options;
      const requests: Promise<void>[] = [];

      if (shouldFetchSliders) {
        setSlidersLoading(true);
        requests.push(
          dispatch(fetchSlidersSlice())
            .unwrap()
            .then(payload => {
              const data: any = payload?.data ?? payload;
              console.log('data :', data);
              setbrochure(data?.sliders?.[0]?.second_button_pdf_url || '');
              // const BROCHURE_PDF = data.slider[0].second_button_pdf_url;
              setSliders(
                Array.isArray(data) ? data : data?.sliders ?? [],
              );
            })
            .catch(error => {
              console.error('Failed to load home sliders:', error);
            })
            .finally(() => setSlidersLoading(false)),
        );
      }

      if (shouldFetchIndustries) {
        setIndustriesLoading(true);
        setIndustriesError(null);
        requests.push(
          dispatch(fetchIndustriesSlice())
            .unwrap()
            .then(payload => {
              const data: any = payload?.data ?? payload;
              setApiIndustries(
                Array.isArray(data) ? data : data?.industries ?? [],
              );
            })
            .catch(error => setIndustriesError(error))
            .finally(() => setIndustriesLoading(false)),
        );
      }

      if (shouldFetchCategories) {
        setCategoriesLoading(true);
        setCategoriesError(null);
        requests.push(
          dispatch(fetchCategoriesSlice())
            .unwrap()
            .then(payload => {
              const data: any = payload?.data ?? payload;
              setApiCategories(
                Array.isArray(data)
                  ? data
                  : data?.categories ?? data?.data ?? [],
              );
            })
            .catch(error => setCategoriesError(error))
            .finally(() => setCategoriesLoading(false)),
        );
      }

      if (shouldFetchProducts) {
        setProductsLoading(true);
        setProductsError(null);
        requests.push(
          dispatch(fetchProductsSlice({ page }))
            .unwrap()
            .then(payload => {
              const data: any = payload?.data ?? payload;
              const products = Array.isArray(data)
                ? data
                : data?.products ?? data?.items ?? data?.data ?? [];
              const pagination = Array.isArray(data)
                ? null
                : data?.pagination ??
                data?.meta?.pagination ??
                data?.meta ??
                null;
              setApiProducts(current =>
                page > 1 ? [...current, ...products] : products,
              );
              setProductsPagination(pagination);
            })
            .catch(error => setProductsError(error))
            .finally(() => setProductsLoading(false)),
        );
      }

      await Promise.all(requests);
    },
    [dispatch],
  );

  const handleHomeRefresh = useCallback(async () => {
    setHomeProductsPage(1);
    invalidateRequests();
    dispatch(clearProducts());
    setApiProducts([]);
    await fetchData();
  }, [dispatch, fetchData]);

  const { refreshing, onRefresh } = useRefresh(handleHomeRefresh);

  const retryIndustries = useCallback(() => {
    fetchData({
      sliders: false,
      industries: true,
      categories: false,
      products: false,
    });
  }, [fetchData]);

  const retryCategories = useCallback(() => {
    fetchData({
      sliders: false,
      industries: false,
      categories: true,
      products: false,
    });
  }, [fetchData]);

  const retryProducts = useCallback(() => {
    setHomeProductsPage(1);
    dispatch(clearProducts());
    setApiProducts([]);
    fetchData({
      sliders: false,
      industries: false,
      categories: false,
      products: true,
    });
  }, [dispatch, fetchData]);

  const industriesErrorMessage = getLoadErrorMessage(
    industriesError,
    'industries',
  );
  const categoriesErrorMessage = getLoadErrorMessage(
    categoriesError,
    'categories',
  );
  const productsErrorMessage = getLoadErrorMessage(productsError, 'products');

  useFocusEffect(
    useCallback(() => {
      const currentSliders = slidersRef.current;
      const currentIndustries = apiIndustriesRef.current;
      const currentCategories = apiCategoriesRef.current;
      const currentProducts = apiProductsRef.current;
      fetchData({
        sliders: !(currentSliders && currentSliders.length),
        industries: !(currentIndustries && currentIndustries.length),
        categories: !(currentCategories && currentCategories.length),
        products: !(currentProducts && currentProducts.length),
        page: 1,
      });
      if (!(currentProducts && currentProducts.length)) {
        dispatch(clearProducts());
        setHomeProductsPage(1);
      }
    }, [dispatch, fetchData]),
  );


  const homeIndustries = (apiIndustries ?? [])
    .map(industry => ({
      id: String(industry.id),
      name: industry.title ?? '',
      image: industry.image_url ?? '',
    }))
    .filter(industry => Boolean(industry.image && industry.image.trim()));

  const homeCategories: CategoryItem[] = (apiCategories ?? [])
    .map(category => ({
      id: String(category.id),
      name: category.title ?? category.name ?? '',
      image: category.icon_url ?? category.image_url ?? category.image ?? '',
      industryId:
        category.industry_id != null
          ? String(category.industry_id)
          : category.industryId != null
            ? String(category.industryId)
            : undefined,
    }))
    .filter(category => Boolean(category.image && category.image.trim()));

  const openProduct = (product: HomeProduct) => {
    navigation.navigate('ProductDetails', { productId: product.id });
  };

  const openAllProducts = () => {
    navigation.getParent()?.navigate('Products', {
      screen: 'Products',
      params: {title: 'Products'},
    });
  };

  const openCategory = (category: CategoryItem) => {
    navigation.navigate('SubCategories', {
      categoryId: category.id,
      categoryName: category.name,
      industryId: category.industryId,
    });
  };



  const sliderBanners: HomeBannerItem[] = (sliders ?? []).map(
    (slider: any, index: number) => ({
      id: String(slider?.id ?? `slider-${index}`),
      tagline: slider?.tag_line ?? '',
      title: slider?.title ?? '',
      description: stripHtml(slider?.description ?? ''),
      image: slider?.image_url ?? '',
      primaryLabel: slider?.button || undefined,
      secondaryLabel: 'Download Brochure',
      pdfUrl: brochure,
      navigationLink: brochure,
    }),
  );

  const banners = sliderBanners.length > 0 ? sliderBanners : [];
  console.log('banners :', banners);
  const homeProducts = (apiProducts ?? []).map((product: any, index: number) =>
    toProductCardData(product, index),
  );


  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressViewOffset={insets.top}
          />
        }
        onScroll={({ nativeEvent }) => {
          const paddingToBottom = scale(400);
          if (
            !isLoadingMoreProducts &&
            !productsLoading &&
            productsPagination?.last_page &&
            homeProductsPage < productsPagination.last_page
          ) {
            const offsetY = nativeEvent.contentOffset.y;
            const layoutHeight = nativeEvent.layoutMeasurement.height;
            const contentHeight = nativeEvent.contentSize.height;
            if (offsetY + layoutHeight + paddingToBottom >= contentHeight) {
              const nextPage = homeProductsPage + 1;
              setIsLoadingMoreProducts(true);
              setHomeProductsPage(nextPage);
              fetchData({
                sliders: false,
                industries: false,
                categories: false,
                products: true,
                page: nextPage,
              })
                .finally(() => setIsLoadingMoreProducts(false));
            }
          }
        }}
        scrollEventThrottle={400}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + scale(8),
            paddingBottom: insets.bottom + scale(40),
          },
        ]}>
        {/* 1. Header (logo + notifications + profile + search + scan) */}
        <HomeHeader
          onBellPress={() => navigation.navigate('Notifications')}
          onCartPress={() => navigation.navigate('Cart')}
          cartCount={cartCount}
          onWishlistPress={() => navigation.navigate('Wishlist')}
          wishlistCount={wishlistCount}
        />

        {/* 2. Hero banner carousel */}
        <HomeBanner
          banners={banners}
          loading={slidersLoading && banners.length === 0}
          downloadLabel="Download Brochure"
          showDownloadButton={true}
          onPressItem={item => {
            const url =
              item?.pdfUrl ||
              item?.navigationLink || ''
            Linking.openURL(url).catch(() => { });
          }}
          onPressDownload={item => {
            const url = item?.pdfUrl || item?.navigationLink || '';

            if (url.trim()) {
              Linking.openURL(url).catch(() => { });
            } else {
              openAllProducts();
            }
          }}
        />

        {/* 3. Industries */}
        <View style={styles.sectionWrap}>
          <IndustriesSection
            industries={homeIndustries}
            loading={industriesLoading && !homeIndustries.length}
            errorMessage={industriesErrorMessage}
            onRetry={retryIndustries}
            onSeeAll={() =>
              navigation.getParent()?.navigate('Industry', {
                screen: 'Industries',
              })
            }
            onSelect={ind =>
              navigation.navigate('IndustryDetails', {
                industryId: ind.id,
                industryTitle: ind.name,
              })
            }
          />
        </View>

        {/* 4. Featured products */}
        <View style={styles.sectionWrap}>
          <FeaturedProductsSection
            products={homeProducts.slice(0, 6)}
            loading={productsLoading && homeProducts.length === 0}
            onSeeAll={() =>
              openAllProducts()
            }
            onPress={openProduct}
          />
        </View>

        {/* 5. Categories */}
        <View style={styles.sectionWrap}>
          <CategoriesSection
            categories={homeCategories}
            loading={categoriesLoading && !homeCategories.length}
            errorMessage={categoriesErrorMessage}
            onRetry={retryCategories}
            onSeeAll={() => navigation.navigate('Categories')}
            onSelect={openCategory}
          />
        </View>
        <View style={styles.sectionWrap}>
          <AdSlider />
        </View>
        {/* 6. All products grid */}
        <View style={styles.sectionWrap}>
          <AllProductsGrid
            products={homeProducts}
            loading={productsLoading && homeProducts.length === 0}
            errorMessage={productsErrorMessage}
            onRetry={retryProducts}
            onSeeAll={() => openAllProducts()}
            onPress={openProduct}
          />
          {isLoadingMoreProducts || (productsLoading && homeProductsPage > 1) ? (
            <View style={styles.loadMoreWrap}>
              <ProductGridSkeleton count={2} />
            </View>
          ) : null}
        </View>


      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: scale(14),
  },
  sectionWrap: {
    marginBottom: scale(20),
  },
  loadMoreWrap: {
    marginTop: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;
