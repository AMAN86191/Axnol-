import React, { useCallback, useEffect } from 'react';
import { ScrollView, StatusBar, StyleSheet, View, RefreshControl, Linking} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, scale } from '../../theme';
import { useAppSelector } from '../../store';
import { useAppDispatch } from '../../redux/hooks';
import { fetchSlidersSlice } from '../../redux/HomeSlice';
import { fetchIndustriesSlice } from '../../redux/IndustrySlice';
import { fetchCategoriesSlice } from '../../redux/CategorySlice';
import { fetchProductsSlice } from '../../redux/ProductSlice';
import { selectCartItemCount } from '../cart/cartSelectors';
import { selectWishlistCount } from '../wishlist/wishlistSelectors';
import { useSimulatedLoading } from '../../hooks/useSimulatedLoading';
import HomeSkeleton from './components/HomeSkeleton';
import {
  ALL_PRODUCTS,
  CategoryItem,
  Catgory_BANNERS,
  FEATURED_PRODUCTS,
  HOME_BANNERS,
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

let hasLoggedSliders = false;

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const sliders = useAppSelector(s => s.home.sliders);
  const slidersLoading = useAppSelector(s => s.home.loading);
  const apiIndustries = useAppSelector(s => s.industry.industries);
  const industriesLoading = useAppSelector(s => s.industry.loading);
  const apiCategories = useAppSelector(s =>
    s.category.allCategories.length
      ? s.category.allCategories
      : s.category.categories,
  );
  const categoriesLoading = useAppSelector(s => s.category.loading);
  const apiProducts = useAppSelector(s => s.product.products);
  const productsLoading = useAppSelector(s => s.product.loading);
  const cartCount = useAppSelector(selectCartItemCount);
  const wishlistCount = useAppSelector(selectWishlistCount);
  const loading = useSimulatedLoading();
  const {
    data: notificationsData,
    refetch: refetchNotifications,
  } = useGetNotificationsQuery();

  const { refreshing, onRefresh } = useRefresh(
    () => dispatch(fetchIndustriesSlice()),
    () => dispatch(fetchCategoriesSlice()),
    () => dispatch(fetchProductsSlice()),
    refetchNotifications,
    () => dispatch(fetchSlidersSlice()),
  );

  const hasUnreadNotifications = (notificationsData ?? []).some(
    notification => !notification.read,
  );

  useFocusEffect(
    useCallback(() => {
      refetchNotifications();
      dispatch(fetchIndustriesSlice());
      dispatch(fetchCategoriesSlice());
      dispatch(fetchProductsSlice())
        .unwrap()
        .then(res => console.log('Products API Response:', res))
        .catch(err => console.log('Products API Error:', err));
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


  const homeIndustries = (apiIndustries ?? []).map(industry => ({
    id: String(industry.id),
    name: industry.title ?? '',
    image: industry.image_url ?? '',
  }));

  const homeCategories: CategoryItem[] = (apiCategories ?? []).map(
    category => ({
      id: String(category.id),
      name: category.title ?? category.name ?? '',
      image: category.icon_url ?? category.image_url ?? category.image ?? '',
      industryId:
        category.industry_id != null
          ? String(category.industry_id)
          : category.industryId != null
          ? String(category.industryId)
          : undefined,
    }),
  );

  const openProduct = (product: HomeProduct) => {
    navigation.navigate('Products', {
      screen: 'ProductDetails',
      params: { productId: product.id },
      initial: false,
    });
  };

  const openAllProducts = (params?: Record<string, any>) => {
    navigation.navigate('Products', {
      screen: 'Products',
      params: { title: 'Products', ...params },
      initial: false,
    });
  };

  const openCategory = (category: CategoryItem) => {
    navigation.navigate('Products', {
      screen: 'SubCategories',
      params: {
        categoryId: category.id,
        categoryName: category.name,
        industryId: category.industryId,
      },
      initial: false,
    });
  };

  const sliderBanners: HomeBannerItem[] = (sliders ?? []).map(
    (slider, index) => ({
      id: String(slider.id ?? index),
      tagline: slider.tag_line ?? '',
      title: slider.title ?? '',
      description: stripHtml(slider.description ?? ''),
      image: slider.image_url ?? '',
      primaryLabel: slider.button || undefined,
      secondaryLabel: slider.second_button || undefined,
      pdfUrl: slider.second_button_pdf_url,
      navigationLink: slider.navigation_link,
    }),
  );

  const banners = sliderBanners.length
    ? sliderBanners
    : slidersLoading
    ? []
    : HOME_BANNERS;

  const homeProducts = (apiProducts ?? []).map((product, index) => ({
    id: String(product.id ?? index),
    name: product.name ?? '',
    code: product.category?.title ?? product.category?.name ?? '',
    image: product.thumbnail_url ?? product.image_urls?.[0] ?? 'product_generic',
    price: 0,
    mrp: 0,
    unit: '',
  }));

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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + scale(8),
            paddingBottom: insets.bottom,
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
          loading={slidersLoading}
          buttonLabel="Explore Products"
          onPressItem={() => openAllProducts()}
          onPressButton={() => openAllProducts()}
          onPressDownload={item => {
            if (item.pdfUrl) {
              Linking.openURL(item.pdfUrl).catch(() => {});
              return;
            }
            openAllProducts();
          }}
        />

        {/* 3. Industries */} 
        <View style={styles.sectionWrap}>
          <IndustriesSection
            industries={homeIndustries}
            loading={industriesLoading && !homeIndustries.length}
            onSeeAll={() => navigation.navigate('Industry')}
            onSelect={ind =>
              navigation.navigate('Industry', {
                screen: 'IndustryDetails',
                params: { industryId: ind.id, industryTitle: ind.name },
                initial: false,
              })
            }
          />
        </View>

        {/* 4. Featured products */}
        <View style={styles.sectionWrap}>
          <FeaturedProductsSection
            products={FEATURED_PRODUCTS}
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
            onSeeAll={() =>
              navigation.navigate('Products', {
                screen: 'Categories',
                params: {},
                initial: false,
              })
            }
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
            products={homeProducts.length ? homeProducts : ALL_PRODUCTS}
            onSeeAll={() => openAllProducts()}
            onPress={openProduct}
          />
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
});

export default HomeScreen;
