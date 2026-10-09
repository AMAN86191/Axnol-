import React, {useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {CatalogueStackParamList} from '../../navigation/types';
import {useGetProductsQuery} from '../../api/services/catalogueApi';
import AppImage from '../../components/ui/AppImage';
import EmptyState from '../../components/ui/EmptyState';
import ScreenHeader from '../../components/ui/ScreenHeader';
import SearchBar from '../../components/ui/SearchBar';
import {
  colors,
  fontSize,
  radius,
  shadows,
  spacing,
  typography,
  verticalScale,
} from '../../theme';

type Route = RouteProp<CatalogueStackParamList, 'Products'>;

export const ProductsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {params} = useRoute<Route>();
  const [search, setSearch] = useState(params.search ?? '');
  const {data, isLoading} = useGetProductsQuery({...params, search});
  const results = data ?? [];
  return (
    <View style={styles.container}>
      <ScreenHeader
        title={params.title ?? 'Products'}
        onBack={() => navigation.goBack()}
      />
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={i => i.id}
          numColumns={2}
          columnWrapperStyle={{gap: spacing.md}}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.head}>
              <SearchBar
                value={search}
                onChangeText={setSearch}
                placeholder="Search products"
              />
              <Text style={styles.count}>
                {results.length} {results.length === 1 ? 'product' : 'products'}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              title="No products found"
              subtitle="Try a different search or browse categories"
            />
          }
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('ProductDetails', {productId: item.id})
              }>
              <View style={styles.imgWrap}>
                <AppImage uri={item.images[0]} style={styles.img} />
              </View>
              <Text style={styles.brand}>{item.brand.toUpperCase()}</Text>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>
                  ₹{(item.dealerPrice ?? item.price).toLocaleString('en-IN')}
                </Text>
                <Text style={styles.caption}>dealer price</Text>
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
  head: {paddingBottom: spacing.lg, gap: spacing.sm},
  count: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  card: {
    flex: 1,
    maxWidth: '50%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    ...shadows.small,
  },
  imgWrap: {
    width: '100%',
    height: verticalScale(120),
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  img: {width: '100%', height: '100%'},
  brand: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    color: colors.accentDark,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  name: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: fontSize.sm * 1.4,
    minHeight: fontSize.sm * 2.8,
    marginTop: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  price: {
    ...typography.bold,
    fontSize: fontSize.md,
    color: colors.primary,
  },
  caption: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
export default ProductsScreen;
