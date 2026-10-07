import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {CatalogueStackParamList} from '../../navigation/types';
import {useGetCategoriesQuery} from '../../api/services/catalogueApi';
import {colors, radius, spacing, theme, verticalScale} from '../../theme';

type Route = RouteProp<CatalogueStackParamList, 'Categories'>;

export const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {params} = useRoute<Route>();
  const {data} = useGetCategoriesQuery({industryId: params.industryId});
  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        numColumns={2}
        contentContainerStyle={{padding: spacing.xl, gap: spacing.md}}
        columnWrapperStyle={{gap: spacing.md}}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('Products', {
                categoryId: item.id,
                title: item.name,
              })
            }>
            <Image source={{uri: item.image}} style={styles.img} />
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={i => i.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  img: {height: verticalScale(90), width: '100%'},
  name: {
    ...theme.typography.medium,
    fontSize: theme.fontSize.sm,
    color: colors.text,
    padding: spacing.sm,
    textAlign: 'center',
  },
});
export default CategoriesScreen;
