import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {
  Check,
  PackageOpen,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CatalogueStackParamList} from '../../navigation/types';
import CommonHeader from '../../components/ui/CommonHeader';
import IndustryBanner from './components/IndustryBanner';
import {colors, fontSize, radius, scale, spacing} from '../../theme';
import { ALL_PRODUCTS } from '../home/homeData';
import { ImageKey } from '../../assets/images';
import { useSimulatedLoading } from '../../hooks/useSimulatedLoading';
import ProductsSkeleton from './components/ProductsSkeleton';
import ProductCard from '../../components/ui/ProductCard';
import {useRefresh} from '../../hooks/useRefresh';

type Route = RouteProp<CatalogueStackParamList, 'Products'>;

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

interface SortOption {
  key: SortKey;
  label: string;
  description: string;
}

const SORT_OPTIONS: SortOption[] = [
  {key: 'newest', label: 'Newest First', description: 'Latest additions'},
  {key: 'price-asc', label: 'Price: Low to High', description: 'Budget friendly first'},
  {key: 'price-desc', label: 'Price: High to Low', description: 'Premium products first'},
  {key: 'name-asc', label: 'Name: A to Z', description: 'Alphabetical order'},
  {key: 'name-desc', label: 'Name: Z to A', description: 'Reverse alphabetical'},
];

const CATEGORY_BY_CODE: Record<string, string> = {
  EN: 'Engine Oil',
  GR: 'Gear Oil',
  HY: 'Hydraulic Oil',
  CT: 'Cutting Fluid',
  SL: 'Solvent',
  MR: 'MRO Kit',
  WX: 'Protective Wax',
};

const getProductCategory = (code: string): string =>
  CATEGORY_BY_CODE[code.split('-')[1]] ?? 'Other';

const CATEGORY_FILTERS = ['All', ...Object.values(CATEGORY_BY_CODE)];

const UNIT_FILTERS = [
  'All',
  ...Array.from(
    new Set(ALL_PRODUCTS.map(product => product.unit).filter(Boolean)),
  ),
] as string[];

const FILTER_PANEL_WIDTH = Math.min(Dimensions.get('window').width * 0.84, 340);


interface IndustryBanner {
  title: string;
  description: string;
  image: ImageKey;
  tags: string[];
}

// const INDUSTRY_BANNERS: Record<string, IndustryBanner> = {
//   ind1: {
//     title: 'Industrial',
//     description:
//       'Heavy-duty lubricants built for machinery.',
//     image: 'ind_industrial',
//     tags: ['Machinery', 'Manufacturing', 'MRO'],
//   },
//   ind2: {
//     title: 'Automotive',
//     description:
//       'Engine oils, gear oils and greases engineered for vehicles.',
//     image: 'ind_automotive',
//     tags: ['Engine Oil', 'Gear Oil', 'Fleets'],
//   },
//   ind3: {
//     title: 'Agriculture',
//     description:
//       'Reliable lubrication for tractors, harvesters and farm equipment working in demanding conditios.',
//     image: 'ind_agricultural',
//     tags: ['Tractors', 'Harvesters', 'Farm Gear'],
//   },
//   ind4: {
//     title: 'Marine',
//     description:
//       'Corrosion-resistant marine lubricants for engines and equipment.',
//     image: 'ind_marine',
//     tags: ['Marine Engines', 'Offshore', 'Corrosion'],
//   },
//   ind6: {
//     title: 'Construction',
//     description:
//       'High-performance fluids for excavators, cranes and heavy construction.',
//     image: 'ind_construction',
//     tags: ['Excavators', 'Cranes', 'Heavy Duty'],
//   },
//   ind8: {
//     title: 'Energy',
//     description:
//       'Specialty lubricants for power generation, turbines and energy infrastructure operating non-stop.',
//     image: 'ind_energy',
//     tags: ['Power', 'Turbines', 'Generation'],
//   },
// };

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
  const {refreshing, onRefresh} = useRefresh();

  const route = useRoute<Route>();
  const initialCategory =
    route.params?.title && CATEGORY_FILTERS.includes(route.params.title)
      ? route.params.title
      : 'All';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedUnit, setSelectedUnit] = useState('All');
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [search, setSearch] = useState(route.params?.search ?? '');
  const [filterVisible, setFilterVisible] = useState(false);
  const [pendingCategory, setPendingCategory] = useState(selectedCategory);
  const [pendingUnit, setPendingUnit] = useState(selectedUnit);
  const [pendingSort, setPendingSort] = useState<SortKey>(sortBy);
  const slideAnim = useRef(new Animated.Value(-FILTER_PANEL_WIDTH)).current;
  const loading = useSimulatedLoading();

  // const industryBanner = route.params?.industryId
  //   ? INDUSTRY_BANNERS[route.params.industryId]
  //   : undefined;

  // const pageTitle = route.params?.title ?? 'Products';
  const pageTitle = 'Products';
  // const showIndustryBanner =
  //   !!industryBanner && pageTitle.toLowerCase() === industryBanner.title.toLowerCase();

  const openFilter = () => {
    setPendingCategory(selectedCategory);
    setPendingUnit(selectedUnit);
    setPendingSort(sortBy);
    setFilterVisible(true);
  };

  const closeFilter = () => {
    Animated.timing(slideAnim, {
      toValue: -FILTER_PANEL_WIDTH,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setFilterVisible(false));
  };

  useEffect(() => {
    if (filterVisible) {
      slideAnim.setValue(-FILTER_PANEL_WIDTH);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }).start();
    }
  }, [filterVisible, slideAnim]);

  const applyFilters = () => {
    setSelectedCategory(pendingCategory);
    setSelectedUnit(pendingUnit);
    setSortBy(pendingSort);
    closeFilter();
  };

  const resetFilters = () => {
    setPendingCategory('All');
    setPendingUnit('All');
    setPendingSort('newest');
  };

  const resetAllFilters = () => {
    setSelectedCategory('All');
    setSelectedUnit('All');
    setSortBy('newest');
    setSearch('');
  };

  const activeFilterCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedUnit !== 'All' ? 1 : 0) +
    (sortBy !== 'newest' ? 1 : 0);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = ALL_PRODUCTS.filter(product => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.code.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategory === 'All' ||
        getProductCategory(product.code) === selectedCategory;
      const matchesUnit =
        selectedUnit === 'All' || product.unit === selectedUnit;
      return matchesSearch && matchesCategory && matchesUnit;
    });

    switch (sortBy) {
      case 'price-asc':
        return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...list].sort((a, b) => b.price - a.price);
      case 'name-asc':
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return [...list].sort((a, b) => b.name.localeCompare(a.name));
      default:
        return list;
    }
  }, [search, selectedCategory, selectedUnit, sortBy]);

  const handlePress = (product: typeof ALL_PRODUCTS[0]) =>
    navigation.navigate('ProductDetails', { productId: product.id });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <CommonHeader title={pageTitle} />

      {loading ? (
        <ProductsSkeleton />
      ) : (
        <>
      {/* Search Input Bar + View Toggle */}
      <View style={styles.searchBarRow}>
        <View style={styles.searchBar}>
          <Search size={scale(16)} color="#94A3B8" strokeWidth={2.2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity
            style={styles.filterBtn}
            activeOpacity={0.7}
            onPress={openFilter}>
            <SlidersHorizontal
              size={scale(16)}
              color={colors.primary}
              strokeWidth={2.2}
            />
            {activeFilterCount > 0 ? (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Horizontal Filter Pills */}
      <View style={styles.categoryFilterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORY_FILTERS}
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
      {filtered.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconWrap}>
            <PackageOpen size={scale(30)} color={colors.primary} strokeWidth={1.8} />
          </View>
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptySubtitle}>
            Try a different search or clear your filters.
          </Text>
          <TouchableOpacity
            style={styles.emptyResetBtn}
            activeOpacity={0.8}
            onPress={resetAllFilters}>
            <Text style={styles.emptyResetText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          style={styles.scrollFlex}
          contentContainerStyle={[styles.gridContainer, {paddingBottom: insets.bottom + scale(85)}]}
          showsVerticalScrollIndicator={false}>
          {chunk(filtered, 2).map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.gridRow}>
              {row.map(prod => (
                <ProductCard
                  style={styles.gridCard}
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

      <Modal
        visible={filterVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeFilter}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={closeFilter} />

          <Animated.View
            style={[
              styles.filterPanel,
              {
                width: FILTER_PANEL_WIDTH,
                paddingTop: insets.top + scale(14),
                paddingBottom: Math.max(insets.bottom, spacing.md),
                transform: [{translateX: slideAnim}],
              },
            ]}>
            <View style={styles.panelHeader}>
              <View style={styles.panelTitleWrap}>
                <Text style={styles.panelTitle}>Filters</Text>
                <Text style={styles.panelSubtitle}>Refine your results</Text>
              </View>
              <TouchableOpacity
                style={styles.panelClose}
                activeOpacity={0.7}
                onPress={closeFilter}>
                <X size={scale(18)} color="#0F172A" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.panelScroll}
              contentContainerStyle={styles.panelScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <Text style={styles.sectionLabel}>SORT BY</Text>
              <View style={styles.sortGroup}>
                {SORT_OPTIONS.map(option => {
                  const active = pendingSort === option.key;
                  return (
                    <TouchableOpacity
                      key={option.key}
                      style={[styles.sortRow, active && styles.sortRowActive]}
                      activeOpacity={0.8}
                      onPress={() => setPendingSort(option.key)}>
                      <View style={[styles.radio, active && styles.radioActive]}>
                        {active ? (
                          <Check
                            size={scale(11)}
                            color="#FFFFFF"
                            strokeWidth={3}
                          />
                        ) : null}
                      </View>
                      <View style={styles.sortTextWrap}>
                        <Text
                          style={[
                            styles.sortLabel,
                            active && styles.sortLabelActive,
                          ]}>
                          {option.label}
                        </Text>
                        <Text style={styles.sortDescription}>
                          {option.description}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* <Text style={styles.sectionLabel}>CATEGORY</Text>
              <View style={styles.chipWrap}>
                {CATEGORY_FILTERS.map(item => {
                  const active = pendingCategory === item;
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[styles.chip, active && styles.chipActive]}
                      activeOpacity={0.8}
                      onPress={() => setPendingCategory(item)}>
                      <Text
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View> */}

              <Text style={styles.sectionLabel}>PACK SIZE / WEIGHT</Text>
              <View style={styles.chipWrap}>
                {UNIT_FILTERS.map(item => {
                  const active = pendingUnit === item;
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[styles.chip, active && styles.chipActive]}
                      activeOpacity={0.8}
                      onPress={() => setPendingUnit(item)}>
                      <Text
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.panelFooter}>
              <TouchableOpacity
                style={styles.resetBtn}
                activeOpacity={0.8}
                onPress={resetFilters}>
                <Text style={styles.resetBtnText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyBtn}
                activeOpacity={0.85}
                onPress={applyFilters}>
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  filterBtn: {
    width: scale(26),
    height: scale(26),
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -scale(4),
    right: -scale(4),
    minWidth: scale(14),
    height: scale(14),
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(3),
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  filterBadgeText: {
    fontSize: scale(8),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: scale(60),
  },
  emptyIconWrap: {
    width: scale(64),
    height: scale(64),
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: scale(16),
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: scale(4),
  },
  emptySubtitle: {
    fontSize: scale(12),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: scale(17),
  },
  emptyResetBtn: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: scale(9),
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  emptyResetText: {
    fontSize: scale(12),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalRoot: {flex: 1},
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  filterPanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    shadowColor: '#0F172A',
    shadowOffset: {width: 6, height: 0},
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 16,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  panelTitleWrap: {flex: 1},
  panelTitle: {
    fontSize: scale(18),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  panelSubtitle: {
    fontSize: scale(11),
    color: '#94A3B8',
    marginTop: scale(1),
  },
  panelClose: {
    width: scale(32),
    height: scale(32),
    borderRadius: radius.pill,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelScroll: {flex: 1},
  panelScrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: scale(4),
    paddingBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: scale(10),
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: scale(8),
    marginTop: scale(14),
  },
  sortGroup: {gap: scale(6)},
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(9),
    paddingHorizontal: scale(10),
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    backgroundColor: '#FBFDFF',
  },
  sortRowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  radio: {
    width: scale(18),
    height: scale(18),
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(10),
  },
  radioActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortTextWrap: {flex: 1},
  sortLabel: {
    fontSize: scale(12.5),
    fontWeight: '700',
    color: '#334155',
  },
  sortLabelActive: {color: colors.primary},
  sortDescription: {
    fontSize: scale(9.5),
    color: '#94A3B8',
    marginTop: scale(1),
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(6),
  },
  chip: {
    paddingHorizontal: scale(11),
    paddingVertical: scale(6.5),
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: scale(11),
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  panelFooter: {
    flexDirection: 'row',
    gap: scale(8),
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  resetBtn: {
    flex: 0.4,
    height: scale(44),
    borderRadius: radius.md,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  resetBtnText: {
    fontSize: scale(12.5),
    fontWeight: '700',
    color: '#475569',
  },
  applyBtn: {
    flex: 1,
    height: scale(44),
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  applyBtnText: {
    fontSize: scale(13),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  industryBannerWrap: {
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: scale(8),
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    height: scale(38),
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
    flex: 1,
  },
  gridCardPlaceholder: {
    flex: 1,
  },
  scrollFlex: {
    flex: 1,
  },
});


export default ProductsScreen;