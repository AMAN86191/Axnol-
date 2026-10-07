import React from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {CatalogueStackParamList} from '../../navigation/types';
import {useGetSubCategoriesQuery} from '../../api/services/catalogueApi';
import {colors, radius, spacing, theme} from '../../theme';

type Route = RouteProp<CatalogueStackParamList, 'SubCategories'>;

export const SubCategoriesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {params} = useRoute<Route>();
  const {data} = useGetSubCategoriesQuery({categoryId: params.categoryId});
  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        contentContainerStyle={{padding: spacing.xl, gap: spacing.sm}}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              navigation.navigate('Products', {
                subCategoryId: item.id,
                title: item.name,
              })
            }>
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={i => i.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  name: {
    ...theme.typography.medium,
    fontSize: theme.fontSize.md,
    color: colors.text,
  },
});
export default SubCategoriesScreen;
