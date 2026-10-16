import React, {useState} from 'react';
import {
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {ChevronRight, Grid, List, Search, SlidersHorizontal} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CatalogueStackParamList} from '../../navigation/types';
import AppImage from '../../components/ui/AppImage';
import CommonHeader from '../../components/ui/CommonHeader';
import {colors, fontSize, radius, scale, spacing} from '../../theme';
import { ALL_PRODUCTS } from '../home/homeData';
import Button from '../../components/ui/Button';

type Route = RouteProp<CatalogueStackParamList, 'Products'>;

type ViewMode = 'list' | 'grid';

const FILTER_CATEGORIES = [
  'All',
  'Engine Oil',
  'Gear Oil',
  'Hydraulic Oil',
  'Compressor Oil',
  'Turbine Oil',
];

const chunk = <T,>(list: T[], size: number): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < list.length; i += size) {
    rows.push(list.slice(i, i + size));
  }
  return rows;
};

const ProductGridCard: React.FC<{
  product: typeof ALL_PRODUCTS[0];
  onPress: (product: typeof ALL_PRODUCTS[0]) => void;
}> = ({product, onPress}) => (
  <TouchableOpacity
    style={styles.gridCard}
    activeOpacity={0.85}
    onPress={() => onPress(product)}>
    <View style={styles.gridImgArea}>
      <AppImage uri={product.image} style={styles.gridImg} resizeMode="contain" />
    </View>
    <Text style={styles.gridName} numberOfLines={1}>{product.name}</Text>
    <Text style={styles.gridCode}>{product.code}</Text>
    <View style={styles.gridDivider} />
    <Button
      title="View Details"
      variant="outline"
      size="small"
      fullWidth
      onPress={() => onPress(product)}
      iconRight={
        <ChevronRight size={scale(13)} color={colors.primary} strokeWidth={2.6} />
      }
      textStyle={styles.gridDetailsText}
    />
  </TouchableOpacity>
);

export const ProductsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const route = useRoute<Route>();
  const [selectedCategory, setSelectedCategory] = useState(
    route.params?.title && route.params.title !== 'Products'
      ? route.params.title
      : 'All',
  );
  const [search, setSearch] = useState(route.params?.search ?? '');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const filtered = ALL_PRODUCTS.filter(p => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handlePress = (product: typeof ALL_PRODUCTS[0]) =>
    navigation.navigate('ProductDetails', { productId: product.id });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <CommonHeader
        title="Products"
        right={
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewBtn, viewMode === 'list' && styles.viewBtnActive]}
              activeOpacity={0.7}
              onPress={() => setViewMode('list')}>
              <List size={scale(19)} color={viewMode === 'list' ? '#000' : '#0F172A'} strokeWidth={2.2} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewBtn, viewMode === 'grid' && styles.viewBtnActive]}
              activeOpacity={0.7}
              onPress={() => setViewMode('grid')}>
              <Grid size={scale(19)} color={viewMode === 'grid' ? '#000' : '#0F172A'} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Search size={scale(16)} color="#94A3B8" strokeWidth={2.2} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity activeOpacity={0.7}>
          <SlidersHorizontal size={scale(16)} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Category Horizontal Filter Pills (static) */}
      <View style={styles.categoryFilterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_CATEGORIES}
          keyExtractor={item => item}
          contentContainerStyle={styles.filterList}
          renderItem={({item}) => {
            const active = item === selectedCategory;
            return (
              <TouchableOpacity
                style={[styles.catPill, active && styles.catPillActive]}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(item)}>
                <Text style={[styles.catPillText, active && styles.catPillTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Product List / Grid */}
      {viewMode === 'list' ? (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.productList, {paddingBottom: insets.bottom + scale(85)}]}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.productCard}
              activeOpacity={0.85}
              onPress={() => handlePress(item)}>
              <View style={styles.productImgWrap}>
                <AppImage
                  uri={item.image}
                  style={styles.productImg}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productSubtitle} numberOfLines={1}>
                  {item.code}
                </Text>

                <View style={styles.viewDetailsBtn}>
                  <Text style={styles.viewDetailsText}>View Details</Text>
                  <ChevronRight size={scale(13)} color={colors.primary} strokeWidth={2.5} />
                </View>
              </View>

              <View style={styles.chevronBox}>
                <ChevronRight size={scale(17)} color="#94A3B8" />
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <ScrollView
          style={styles.scrollFlex}
          contentContainerStyle={[styles.gridContainer, {paddingBottom: insets.bottom + scale(85)}]}
          showsVerticalScrollIndicator={false}>
          {chunk(filtered, 2).map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.gridRow}>
              {row.map(prod => (
                <ProductGridCard key={prod.id} product={prod} onPress={handlePress} />
              ))}
              {row.length === 1 && <View style={styles.gridCardPlaceholder} />}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  viewToggle: {
    flexDirection: 'row',
    // backgroundColor: '#F1F5F9',
    borderRadius: radius.pill,
    padding: scale(2),
  },
  viewBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBtnActive: {
    backgroundColor: '#F0F9FF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    height: scale(40),
    borderRadius: radius.pill,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: spacing.sm,
    fontSize: fontSize.sm,
    color: '#0F172A',
    paddingVertical: 0,
    fontWeight: '500',
  },
  categoryFilterContainer: {
    marginTop: scale(14),
    marginBottom: scale(4),
  },
  filterList: {
    paddingHorizontal: spacing.lg,
    gap: scale(8),
  },
  catPill: {
    paddingHorizontal: scale(14),
    paddingVertical: scale(7.5),
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  catPillText: {
    fontSize: scale(11.5),
    fontWeight: '600',
    color: '#475569',
  },
  catPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  productList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: scale(11),
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: scale(13),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1.5,
  },
  productImgWrap: {
    width: scale(64),
    height: scale(64),
    borderRadius: radius.md,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(4),
    marginRight: scale(13),
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: scale(14.5),
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  productSubtitle: {
    fontSize: scale(12),
    color: '#64748B',
    marginBottom: scale(8),
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: radius.pill,
    gap: 2,
  },
  viewDetailsText: {
    fontSize: scale(11),
    fontWeight: '700',
    color: colors.primary,
  },
  chevronBox: {
    paddingLeft: scale(6),
  },

  // Grid styles
  gridContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: scale(10),
  },
  gridRow: {
    flexDirection: 'row',
    gap: scale(10),
  },
  gridCard: {
    width: scale(160),
    borderRadius: scale(18),
    borderWidth: 2,
    borderColor: colors.border,
    padding: scale(6),
  },
  gridCardPlaceholder: {
    flex: 1,
  },
  gridImgArea: {
    height: scale(122),
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: '#E9F1FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(10),
    overflow: 'hidden',
  },
  gridImg: {
    width: scale(112),
    height: scale(104),
  },
  gridName: {
    fontSize: scale(13),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    lineHeight: scale(17),
    marginBottom: scale(3),
  },
  gridCode: {
    fontSize: scale(9.5),
    color: '#94A3B8',
    fontWeight: '600',
  },
  gridDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: scale(10),
  },
  gridDetailsText: {
    fontSize: scale(11),
    fontWeight: '700',
  },
  scrollFlex: {
    flex: 1,
  },
});


export default ProductsScreen;