import React, {useCallback, useEffect, useMemo} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {CatalogueStackParamList} from '../../navigation/types';
import AppImage from '../../components/ui/AppImage';
import CommonHeader from '../../components/ui/CommonHeader';
import {
  colors,
  radius,
  scale,
  shadows,
  spacing,
  typography,
} from '../../theme';
import {useRefresh} from '../../hooks/useRefresh';
import {useAppDispatch} from '../../redux/hooks';
import {useAppSelector} from '../../store';
import {fetchCategoriesSlice} from '../../redux/CategorySlice';
import {fetchIndustriesSlice} from '../../redux/IndustrySlice';

type Route = RouteProp<CatalogueStackParamList, 'Categories'>;

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const CARD_GAP = spacing.md;
const CARD_WIDTH = Math.floor(
  (SCREEN_WIDTH - spacing.lg * 2 - CARD_GAP * 2) / 3,
);

const loggedCategories = new Set<string>();
let hasLoggedCategoriesIndustries = false;

export const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {params} = useRoute<Route>();
  const dispatch = useAppDispatch();
  const industryId = params?.industryId;
  const apiCategories = useAppSelector(s => s.category.categories);
  const categoriesLoading = useAppSelector(s => s.category.loading);

  const loadCategories = useCallback(() => {
    const key = industryId ? String(industryId) : 'all';
    const request = dispatch(
      fetchCategoriesSlice(industryId ? {industryId} : undefined),
    );
    request
      .unwrap()
      .then(res => {
        if (!loggedCategories.has(key)) {
          loggedCategories.add(key);
          console.log('Categories API Response:', res);
        }
      })
      .catch(err => console.log('Categories API Error:', err));

    if (!hasLoggedCategoriesIndustries) {
      hasLoggedCategoriesIndustries = true;
      dispatch(fetchIndustriesSlice())
        .unwrap()
        .then(res => console.log('Industries API Response:', res))
        .catch(err => console.log('Industries API Error:', err));
    }

    return request;
  }, [dispatch, industryId]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const {refreshing, onRefresh} = useRefresh(loadCategories);

  const categories = useMemo(
    () =>
      (apiCategories ?? [])
        .map(item => ({
          id: String(item.id),
          name: item.title ?? item.name ?? '',
          image: item.icon_url ?? item.image ?? '',
          industryId: String(
            item.industry_id ?? item.industryId ?? industryId ?? '',
          ),
        }))
        .filter(item => Boolean(item.image && item.image.trim())),
    [apiCategories, industryId],
  );

  const handlePress = (item: {
    id: string;
    name: string;
    industryId: string;
  }) => {
    navigation.navigate('SubCategories', {
      categoryId: item.id,
      categoryName: item.name,
      industryId: item.industryId || industryId,
    });
  };

  const loading = categoriesLoading && !categories.length;

  return (
    <View style={styles.container}>
      <CommonHeader
        title={params?.industryName ?? 'Categories'}
        onBack={() => navigation.goBack()}
      />
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          data={categories}
          keyExtractor={i => i.id}
          numColumns={3}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => handlePress(item)}>
              <View style={styles.imageWrap}>
                <AppImage
                  uri={item.image}
                  style={styles.img}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.body}>
                <Text style={styles.name} numberOfLines={2}>
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  loader: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  columnWrapper: {
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    ...shadows.small,
  },
  imageWrap: {
    width: '100%',
    height: scale(95),
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  body: {
    width: '100%',
    height: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  name: {
    ...typography.semibold,
    fontSize: scale(11.5),
    color: colors.text,
    textAlign: 'center',
    lineHeight: scale(15),
  },
});
export default CategoriesScreen;
