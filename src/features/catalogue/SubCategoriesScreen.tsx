import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {ChevronRight, Layers} from 'lucide-react-native';
import {CatalogueStackParamList} from '../../navigation/types';
import {useGetSubCategoriesQuery} from '../../api/services/catalogueApi';
import EmptyState from '../../components/ui/EmptyState';
import ScreenHeader from '../../components/ui/ScreenHeader';
import {
  colors,
  fontSize,
  radius,
  scale,
  shadows,
  spacing,
  typography,
} from '../../theme';

type Route = RouteProp<CatalogueStackParamList, 'SubCategories'>;

export const SubCategoriesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {params} = useRoute<Route>();
  const {data, isLoading} = useGetSubCategoriesQuery({
    categoryId: params.categoryId,
  });
  const isEmpty = !isLoading && (data?.length ?? 0) === 0;
  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Sub Categories"
        onBack={() => navigation.goBack()}
      />
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : isEmpty ? (
        <EmptyState
          icon={Layers}
          title="No subcategories"
          subtitle="Browse all products in this category"
          actionLabel="Browse Products"
          onAction={() =>
            navigation.navigate('Products', {
              categoryId: params.categoryId,
              title: params.categoryName,
            })
          }
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.list}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('Products', {
                  subCategoryId: item.id,
                  categoryId: params.categoryId,
                  title: item.name,
                  industryId: params.industryId,
                })
              }>
              <View style={styles.iconWrap}>
                <Layers size={scale(18)} color={colors.primary} />
              </View>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              <ChevronRight size={scale(18)} color={colors.textMuted} />
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
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    ...shadows.small,
  },
  iconWrap: {
    width: scale(36),
    height: scale(36),
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...typography.semibold,
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
  },
});
export default SubCategoriesScreen;
