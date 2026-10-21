import React, { useCallback, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale } from '../../theme';
import { useAppSelector } from '../../store';
import { useSimulatedLoading } from '../../hooks/useSimulatedLoading';
import HomeSkeleton from './components/HomeSkeleton';
import {
  ALL_PRODUCTS,
  CategoryItem,
  FEATURED_PRODUCTS,
  HOME_BANNERS,
  HomeProduct,
  INDUSTRIES,
} from './homeData';
import { ImageKey } from '../../assets/images';
import {
  useGetCategoriesQuery,
  useGetSubCategoriesQuery,
} from '../../api/services/catalogueApi';
import { useGetNotificationsQuery } from '../../api/services/documentsApi';
import HomeHeader from './components/HomeHeader';
import HomeBanner from './components/HomeBanner';
import IndustriesSection from './components/IndustriesSection';
import FeaturedProductsSection from './components/FeaturedProductsSection';
import CategoriesSection from './components/CategoriesSection';
import AllProductsGrid from './components/AllProductsGrid';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const user = useAppSelector(s => s.auth.user);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const loading = useSimulatedLoading();
  const { data: categoriesData } = useGetCategoriesQuery({});
  const { data: subCategoriesData } = useGetSubCategoriesQuery({});
  const {
    data: notificationsData,
    refetch: refetchNotifications,
  } = useGetNotificationsQuery();

  const hasUnreadNotifications = (notificationsData ?? []).some(
    notification => !notification.read,
  );

  useFocusEffect(
    useCallback(() => {
      refetchNotifications();
    }, [refetchNotifications]),
  );

  const homeCategories: CategoryItem[] = (categoriesData ?? []).map(
    category => ({
      id: category.id,
      name: category.name,
      image: category.image as ImageKey,
    }),
  );

  const toggleFavorite = (id: string) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
    const hasSubCategories = (subCategoriesData ?? []).some(
      sub => sub.categoryId === category.id,
    );
    if (hasSubCategories) {
      navigation.navigate('Products', {
        screen: 'SubCategories',
        params: { categoryId: category.id, categoryName: category.name },
        initial: false,
      });
    } else {
      navigation.navigate('Products', {
        screen: 'CategoryProducts',
        params: { categoryId: category.id, title: category.name },
        initial: false,
      });
    }
  };

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + scale(8),
            paddingBottom: insets.bottom + scale(85),
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
          hasUnreadNotifications={hasUnreadNotifications}
        />

        {/* 2. Hero banner carousel */}
        <HomeBanner
          banners={HOME_BANNERS}
          buttonLabel="Explore Products"
          onPressItem={() => openAllProducts()}
          onPressButton={() => openAllProducts()}
        />

        {/* 3. Industries */}
        <View style={styles.sectionWrap}>
          <IndustriesSection
            industries={INDUSTRIES}
            onSeeAll={() => navigation.navigate('Industry')}
            onSelect={ind =>
              openAllProducts({ title: ind.name, industryId: ind.id })
            }
          />
        </View>

        {/* 4. Featured products */}
        <View style={styles.sectionWrap}>
          <FeaturedProductsSection
            products={FEATURED_PRODUCTS}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
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

        {/* 6. All products grid */}
        <View style={styles.sectionWrap}>
          <AllProductsGrid
            products={ALL_PRODUCTS}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
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
