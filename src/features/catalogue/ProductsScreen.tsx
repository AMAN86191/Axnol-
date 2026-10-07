import React, {useState} from 'react';
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
import {useGetProductsQuery} from '../../api/services/catalogueApi';
import {colors, radius, spacing, theme, verticalScale} from '../../theme';
import Input from '../../components/ui/Input';
import {Search} from 'lucide-react-native';

type Route = RouteProp<CatalogueStackParamList, 'Products'>;

export const ProductsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {params} = useRoute<Route>();
  const [search, setSearch] = useState(params.search ?? '');
  const {data} = useGetProductsQuery({...params, search});
  return (
    <View style={styles.container}>
      <View style={{padding: spacing.xl, paddingBottom: 0}}>
        <Input
          placeholder="Search products"
          value={search}
          onChangeText={setSearch}
          leftIcon={Search}
        />
      </View>
      <FlatList
        data={data}
        numColumns={2}
        contentContainerStyle={{padding: spacing.xl, gap: spacing.md}}
        columnWrapperStyle={{gap: spacing.md}}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('ProductDetails', {productId: item.id})
            }>
            <Image source={{uri: item.images[0]}} style={styles.img} />
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.price}>₹ {item.dealerPrice ?? item.price}</Text>
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
    padding: spacing.md,
  },
  img: {
    height: verticalScale(90),
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  name: {
    ...theme.typography.medium,
    fontSize: theme.fontSize.sm,
    color: colors.text,
    lineHeight: theme.fontSize.sm * 1.4,
    height: theme.fontSize.sm * 2.8,
  },
  price: {
    ...theme.typography.bold,
    fontSize: theme.fontSize.sm,
    color: colors.primary,
    marginTop: spacing.sm,
  },
});
export default ProductsScreen;
