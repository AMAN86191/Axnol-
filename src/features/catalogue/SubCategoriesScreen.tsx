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
import {Layers} from 'lucide-react-native';
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
import {fetchCategoryDetailsSlice} from '../../redux/CategorySlice';

type Route = RouteProp<CatalogueStackParamList, 'SubCategories'>;

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const CARD_GAP = spacing.md;
const CARD_WIDTH = Math.floor(
  (SCREEN_WIDTH - spacing.lg * 2 - CARD_GAP * 2) / 3,
);

const loggedSubCategories = new Set<string>();

export const SubCategoriesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {params} = useRoute<Route>();
  const dispatch = useAppDispatch();
  const categoryId = params.categoryId;
  const categoryDetail = useAppSelector(s => s.category.categoryDetail);
  const detailLoading = useAppSelector(s => s.category.detailLoading);

  const loadSubCategories = useCallback(() => {
    const request = dispatch(fetchCategoryDetailsSlice(categoryId));
    request
      .unwrap()
      .then(res => {
        if (!loggedSubCategories.has(String(categoryId))) {
          loggedSubCategories.add(String(categoryId));
          console.log('Sub Categories API Response:', res);
        }
      })
      .catch(err => console.log('Sub Categories API Error:', err));
    return request;
  }, [dispatch, categoryId]);

  useEffect(() => {
    loadSubCategories();
  }, [loadSubCategories]);

  const {refreshing, onRefresh} = useRefresh(loadSubCategories);

  const subCategories = useMemo(() => {
    const detail: any = categoryDetail;
    const list = Array.isArray(detail)
      ? detail
      : detail?.subcategories ??
        detail?.sub_categories ??
        detail?.subCategories ??
        detail?.categories ??
        [];
    return (Array.isArray(list) ? list : []).map((item: any, index: number) => ({
      id: String(item?.id ?? item?.slug ?? `${categoryId}-${index}`),
      name: item?.title ?? item?.name ?? '',
      image: item?.icon_url ?? item?.image ?? '',
    }));
  }, [categoryDetail, categoryId]);

  const loading = detailLoading && !categoryDetail;

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
          data={subCategories}
          keyExtractor={i => i.id}
          numColumns={3}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('CategoryProducts', {
                  categoryId: params.categoryId,
                  subCategoryId: item.id,
                  title: item.name,
                  industryId: params.industryId,
                })
              }>
              <View style={styles.imageWrap}>
                {item.image ? (
                  <AppImage
                    uri={item.image}
                    style={styles.img}
                    resizeMode="cover"
                  />
                ) : (
                  <Layers
                    size={scale(30)}
                    color={colors.primary}
                    strokeWidth={1.8}
                  />
                )}
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
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
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
export default SubCategoriesScreen;
