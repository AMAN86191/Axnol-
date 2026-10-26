import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, View, RefreshControl, Linking, ActivityIndicator} from 'react-native';
import { stripHtml } from '../../utils/stripHtml';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, scale } from '../../theme';
import { useAppSelector } from '../../store';
import { useAppDispatch } from '../../redux/hooks';
import { fetchSlidersSlice } from '../../redux/HomeSlice';
import { fetchIndustriesSlice } from '../../redux/IndustrySlice';
import { fetchCategoriesSlice } from '../../redux/CategorySlice';
import { clearProducts, fetchProductsSlice } from '../../redux/ProductSlice';
import { selectCartItemCount } from '../cart/cartSelectors';
import { selectWishlistCount } from '../wishlist/wishlistSelectors';
import {
  CategoryItem,
  Catgory_BANNERS,
  HomeBannerItem,
  HomeProduct,
} from './homeData';
import { useGetNotificationsQuery } from '../../api/services/documentsApi';
import HomeHeader from './components/HomeHeader';
import HomeBanner from './components/HomeBanner';
import AdSlider from './components/AdSlider';
import IndustriesSection from './components/IndustriesSection';
import FeaturedProductsSection from './components/FeaturedProductsSection';
import CategoriesSection from './components/CategoriesSection';
import AllProductsGrid from './components/AllProductsGrid';
import { useRefresh } from '../../hooks/useRefresh';
import { getLoadErrorMessage } from '../../utils/apiError';
import { toProductCardData } from '../../utils/productCardData';

let hasLoggedSliders = false;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const sliders = useAppSelector(s => s.home.sliders);
  const slidersLoading = useAppSelector(s => s.home.loading);
  const apiIndustries = useAppSelector(s => s.industry.industries);
  const industriesLoading = useAppSelector(s => s.industry.loading);
  const industriesError = useAppSelector(s => s.industry.error);
  const apiCategories = useAppSelector(s =>
    s.category.allCategories.length
      ? s.category.allCategories
      : s.category.categories,
  );
  const categoriesLoading = useAppSelector(s => s.category.loading);
  const categoriesError = useAppSelector(s => s.category.error);
  const apiProducts = useAppSelector(s => s.product.products);
  const apiProductsRef = useRef(apiProducts);
  apiProductsRef.current = apiProducts;
  const productsLoading = useAppSelector(s => s.product.loading);
  const productsError = useAppSelector(s => s.product.error);
  const productsPagination = useAppSelector(s => s.product.pagination);
  const cartCount = useAppSelector(selectCartItemCount);
  const wishlistCount = useAppSelector(selectWishlistCount);
  const [isLoadingMoreProducts, setIsLoadingMoreProducts] = useState(false);
  const [homeProductsPage, setHomeProductsPage] = useState(1);

  const {
    data: notificationsData,
    refetch: refetchNotifications,
  } = useGetNotificationsQuery();

  const handleHomeRefresh = useCallback(async () => {
    setHomeProductsPage(1);
    dispatch(clearProducts());
    await Promise.all([
      dispatch(fetchIndustriesSlice()),
      dispatch(fetchCategoriesSlice()),
      dispatch(fetchProductsSlice({ page: 1 })),
      refetchNotifications(),
      dispatch(fetchSlidersSlice()),
    ]);
  }, [dispatch, refetchNotifications]);

  const { refreshing, onRefresh } = useRefresh(handleHomeRefresh);

  const retryIndustries = useCallback(() => {
    dispatch(fetchIndustriesSlice());
  }, [dispatch]);

  const retryCategories = useCallback(() => {
    dispatch(fetchCategoriesSlice());
  }, [dispatch]);

  const retryProducts = useCallback(() => {
    setHomeProductsPage(1);
    dispatch(clearProducts());
    dispatch(fetchProductsSlice({ page: 1 }));
  }, [dispatch]);

  const industriesErrorMessage = getLoadErrorMessage(
    industriesError,
    'industries',
  );
  const categoriesErrorMessage = getLoadErrorMessage(
    categoriesError,
    'categories',
  );
  const productsErrorMessage = getLoadErrorMessage(productsError, 'products');

  const hasUnreadNotifications = (notificationsData ?? []).some(
    notification => !notification.read,
  );

  useFocusEffect(
    useCallback(() => {
      refetchNotifications();
      dispatch(fetchIndustriesSlice());
      dispatch(fetchCategoriesSlice());
      const currentProducts = apiProductsRef.current;
      if (!(currentProducts && currentProducts.length)) {
        dispatch(clearProducts());
        setHomeProductsPage(1);
        dispatch(fetchProductsSlice({ page: 1 }))
          .unwrap()
          .then(res => console.log('Products API Response:', res))
          .catch(err => console.log('Products API Error:', err));
      }
      dispatch(fetchSlidersSlice())
        .unwrap()
        .then(res => {
          if (!hasLoggedSliders) {
            hasLoggedSliders = true;
            console.log('Sliders API Response:', res);
          }
        })
        .catch(err => console.log('Sliders API Error:', err));
    }, [dispatch, refetchNotifications]),
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

  const openAllProducts = (params?: Record<string, any>) => {
    navigation.navigate('Products', { title: 'Products', ...params });
  };

  const openCategory = (category: CategoryItem) => {
    navigation.navigate('SubCategories', {
      categoryId: category.id,
      categoryName: category.name,
      industryId: category.industryId,
    });
  };

  const BROCHURE_PDF =
    'https://axnol.tambimotors.com/storage/sliders/pdfs/g8NrjflaCVtDaBPOyJCm8nWegRkP02cLqhjQ2hSI.pdf';

  const sliderBanners: HomeBannerItem[] = (sliders ?? []).map(
    (slider: any, index: number) => ({
      id: String(slider?.id ?? `slider-${index}`),
      tagline: slider?.tag_line ?? '',
      title: slider?.title ?? '',
      description: stripHtml(slider?.description ?? ''),
      image: slider?.image_url ?? '',
      primaryLabel: slider?.button || undefined,
      secondaryLabel: 'Download Brochure',
      pdfUrl: BROCHURE_PDF,
      navigationLink: BROCHURE_PDF,
    }),
  );

  const banners = sliderBanners.length > 0 ? sliderBanners : [];

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
        onScroll={({nativeEvent}) => {
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
              dispatch(fetchProductsSlice({ page: nextPage }))
                .unwrap()
                .catch(err => console.log('Products API Error:', err))
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
          userName={user?.name ?? 'Rahul Sharma'}
          onBellPress={() => navigation.navigate('Notifications')}
          onProfilePress={() =>
            navigation.navigate('Profile', {
              screen: 'ProfileMain',
              initial: false,
            })
          }
          onCartPress={() => navigation.navigate('Cart')}
          cartCount={cartCount}
          onWishlistPress={() => navigation.navigate('Wishlist')}
          wishlistCount={wishlistCount}
          hasUnreadNotifications={hasUnreadNotifications}
        />

        {/* 2. Hero banner carousel */}
        <HomeBanner
          banners={banners}
          loading={slidersLoading && banners.length === 0}
          buttonLabel="Download Brochure"
          downloadLabel="Download Brochure"
          showPrimaryButton={false}
          showDownloadButton={true}
          onPressItem={item => {
            const url =
              item?.pdfUrl ||
              item?.navigationLink || ''
            Linking.openURL(url).catch(() => {});
          }}
          onPressButton={() => {}}
          onPressDownload={item => {
            const url =
              item?.pdfUrl ||
              item?.navigationLink ||
              'https://axnol.tambimotors.com/about';
            Linking.openURL(url).catch(() => {});
          }}
        />

        {/* 3. Industries */} 
        <View style={styles.sectionWrap}>
          <IndustriesSection
            industries={homeIndustries}
            loading={industriesLoading && !homeIndustries.length}
            errorMessage={industriesErrorMessage}
            onRetry={retryIndustries}
            onSeeAll={() => navigation.navigate('Industries')}
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
            onSeeAll={() =>
              openAllProducts({ featured: true, title: 'Featured Products' })
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
          <AdSlider
            banners={Catgory_BANNERS}
            onPressItem={() =>
              navigation.navigate('Products', {
                screen: 'Categories',
                params: {},
                initial: false,
              })
            }
          />
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
              <ActivityIndicator size="small" color={colors.primary} />
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
