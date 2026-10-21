import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {Layers} from 'lucide-react-native';
import {CatalogueStackParamList} from '../../navigation/types';
import {useGetSubCategoriesQuery} from '../../api/services/catalogueApi';
import CommonHeader from '../../components/ui/CommonHeader';
import {
  colors,
  radius,
  scale,
  shadows,
  spacing,
  typography,
} from '../../theme';

type Route = RouteProp<CatalogueStackParamList, 'SubCategories'>;

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const CARD_GAP = spacing.md;
const CARD_WIDTH = Math.floor(
  (SCREEN_WIDTH - spacing.lg * 2 - CARD_GAP * 2) / 3,
);

export const SubCategoriesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {params} = useRoute<Route>();
  const {data, isLoading} = useGetSubCategoriesQuery({
    categoryId: params.categoryId,
  });

  return (
    <View style={styles.container}>
      <CommonHeader
        title={params?.categoryName ?? 'Sub Categories'}
        onBack={() => navigation.goBack()}
      />
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={data}
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
                <Layers
                  size={scale(30)}
                  color={colors.primary}
                  strokeWidth={1.8}
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
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
