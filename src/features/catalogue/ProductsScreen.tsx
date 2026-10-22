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
import HomeBanner from '../home/components/HomeBanner';
import {colors, fontSize, radius, scale, spacing} from '../../theme';
import { formatPrice } from '../../utils/formatPrice';
import { ALL_PRODUCTS } from '../home/homeData';
import { ImageKey } from '../../assets/images';
import { useSimulatedLoading } from '../../hooks/useSimulatedLoading';
import ProductsSkeleton from './components/ProductsSkeleton';
import ProductGridCard from './components/ProductGridCard';

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

interface IndustryBanner {
  title: string;
  description: string;
  image: ImageKey;
  tags: string[];
}

const INDUSTRY_BANNERS: Record<string, IndustryBanner> = {
  ind1: {
    title: 'Industrial',
    description:
      'Heavy-duty lubricants built for machinery.',
    image: 'ind_industrial',
    tags: ['Machinery', 'Manufacturing', 'MRO'],
  },
  ind2: {
    title: 'Automotive',
    description:
      'Engine oils, gear oils and greases engineered for vehicles.',
    image: 'ind_automotive',
    tags: ['Engine Oil', 'Gear Oil', 'Fleets'],
  },
  ind3: {
    title: 'Agriculture',
    description:
      'Reliable lubrication for tractors, harvesters and farm equipment working in demanding conditios.',
    image: 'ind_agricultural',
    tags: ['Tractors', 'Harvesters', 'Farm Gear'],
  },
  ind4: {
    title: 'Marine',
    description:
      'Corrosion-resistant marine lubricants for engines and equipment.',
    image: 'ind_marine',
    tags: ['Marine Engines', 'Offshore', 'Corrosion'],
  },
  ind6: {
    title: 'Construction',
    description:
      'High-performance fluids for excavators, cranes and heavy construction.',
    image: 'ind_construction',
    tags: ['Excavators', 'Cranes', 'Heavy Duty'],
  },
  ind8: {
    title: 'Energy',
    description:
      'Specialty lubricants for power generation, turbines and energy infrastructure operating non-stop.',
    image: 'ind_energy',
    tags: ['Power', 'Turbines', 'Generation'],
  },
};

const chunk = <T,>(list: T[], size: number): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < list.length; i += size) {
    rows.push(list.slice(i, i + size));
  }
  return rows;
};

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
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const loading = useSimulatedLoading();

  const industryBanner = route.params?.industryId
    ? INDUSTRY_BANNERS[route.params.industryId]
    : undefined;

  const pageTitle = route.params?.title ?? 'Products';
  const showIndustryBanner =
    !!industryBanner && pageTitle.toLowerCase() === industryBanner.title.toLowerCase();

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
        title={pageTitle}
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

      {loading ? (
        <ProductsSkeleton />
      ) : (
        <>
      {showIndustryBanner && industryBanner && (
        <View style={styles.industryBannerWrap}>
          <HomeBanner
            banners={[
              {
                id: `industry-${industryBanner.title}`,
                tagline: 'Industry',
                title: `*${industryBanner.title}*`,
                description: industryBanner.description,
                image: industryBanner.image,
              },
            ]}
            height={scale(168)}
            autoPlay={false}
            showPrimaryButton={false}
            showDownloadButton
            downloadLabel="Download Brochure"
          />
        </View>
      )}

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

              <View style={styles.priceCol}>
                <Text style={styles.price}>{formatPrice(item.price)}</Text>
                {item.unit ? (
                  <Text style={styles.priceUnit}>/ {item.unit}</Text>
                ) : null}
                {item.mrp && item.mrp > item.price ? (
                  <Text style={styles.priceMrp}>{formatPrice(item.mrp)}</Text>
                ) : null}
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
                <ProductGridCard
                  key={prod.id}
                  product={prod}
                  onPress={() => handlePress(prod)}
                />
              ))}
              {row.length === 1 && <View style={styles.gridCardPlaceholder} />}
            </View>
          ))}
        </ScrollView> 
      )}
        </>
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
  industryBannerWrap: {
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
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
    fontSize: scale(13.5),
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  productSubtitle: {
    fontSize: scale(11),
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
  priceCol: {
    alignItems: 'flex-end',
    paddingLeft: scale(10),
  },
  price: {
    fontSize: scale(15),
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  priceUnit: {
    fontSize: scale(9.5),
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 1,
  },
  priceMrp: {
    fontSize: scale(10),
    fontWeight: '600',
    color: '#B0BEC5',
    textDecorationLine: 'line-through',
    marginTop: 1,
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
  gridCardPlaceholder: {
    flex: 1,
  },
  scrollFlex: {
    flex: 1,
  },
});


export default ProductsScreen;