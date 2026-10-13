import React, {useState} from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {ChevronLeft, ChevronRight, Search, SlidersHorizontal, Sparkles} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CatalogueStackParamList} from '../../navigation/types';
import AppImage from '../../components/ui/AppImage';
import {colors, fontSize, radius, scale, spacing, typography} from '../../theme';

type Route = RouteProp<CatalogueStackParamList, 'Products'>;

const FILTER_CATEGORIES = [
  'All',
  'Engine Oil',
  'Gear Oil',
  'Hydraulic Oil',
  'Compressor Oil',
  'Turbine Oil',
];

const MOCK_PRODUCTS = [
  {
    id: 'p1',
    name: 'Engine Oil AX-1000',
    subtitle: 'High performance engine oil',
    category: 'Engine Oil',
    image: 'product_drum',
    packSizes: ['1L', '5L', '20L', '210L'],
    price: 2400,
  },
  {
    id: 'p2',
    name: 'Gear Oil AX-200',
    subtitle: 'Extreme pressure gear oil',
    category: 'Gear Oil',
    image: 'product_drum',
    packSizes: ['1L', '5L', '20L', '210L'],
    price: 2250,
  },
  {
    id: 'p3',
    name: 'Hydraulic Oil AX-300',
    subtitle: 'Premium hydraulic oil',
    category: 'Hydraulic Oil',
    image: 'product_drum',
    packSizes: ['5L', '20L', '210L'],
    price: 3700,
  },
  {
    id: 'p4',
    name: 'Compressor Oil AX-400',
    subtitle: 'For industrial compressors',
    category: 'Compressor Oil',
    image: 'product_drum',
    packSizes: ['20L', '210L'],
    price: 6000,
  },
  {
    id: 'p5',
    name: 'Turbine Oil AX-500',
    subtitle: 'High stability turbine oil',
    category: 'Turbine Oil',
    image: 'product_drum',
    packSizes: ['20L', '210L'],
    price: 8500,
  },
];

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

  const filtered = MOCK_PRODUCTS.filter(p => {
    const matchesCat =
      selectedCategory === 'All' || p.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + scale(6)}]}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <ChevronLeft size={scale(24)} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Products</Text>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
          <SlidersHorizontal size={scale(19)} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Search size={scale(18)} color="#94A3B8" strokeWidth={2.2} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity activeOpacity={0.7}>
          <SlidersHorizontal size={scale(16)} color="#0284C7" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Category Horizontal Filter Pills */}
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

      {/* Vertical Product List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.productList, {paddingBottom: insets.bottom + scale(85)}]}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.productCard}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('ProductDetails', {productId: item.id})
            }>
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
                {item.subtitle}
              </Text>
              
              <View style={styles.viewDetailsBtn}>
                <Text style={styles.viewDetailsText}>View Details</Text>
                <ChevronRight size={scale(13)} color="#0284C7" strokeWidth={2.5} />
              </View>
            </View>

            <View style={styles.chevronBox}>
              <ChevronRight size={scale(17)} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: scale(10),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: scale(4),
  },
  headerTitle: {
    fontSize: scale(17),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  filterBtn: {
    padding: scale(4),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    height: scale(46),
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
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
    shadowColor: '#0284C7',
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
    color: '#0284C7',
  },
  chevronBox: {
    paddingLeft: scale(6),
  },
});

export default ProductsScreen;
