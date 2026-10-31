import React, {useEffect, useMemo, useState} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Search,
} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CachedImage from '../../../components/ui/CachedImage';
import {
  ApiCategory,
  getCategoryDetails,
} from '../../../api/CategoryProvider';
import {Industry} from '../../../api/IndustryProvider';
import {colors, radius, scale, spacing} from '../../../theme';
import {getLoadErrorMessage} from '../../../utils/apiError';

export type SortKey =
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  // | 'name-asc'
  // | 'name-desc';

type FilterSection = 'category' | 'subcategory' | 'industry' | 'sort' | 'unit';

interface SortOption {
  key: SortKey;
  label: string;
  description: string;
}

interface ProductFiltersModalProps {
  visible: boolean;
  categories: ApiCategory[];
  industries: Industry[];
  categoriesLoading: boolean;
  industriesLoading: boolean;
  categoriesError: string;
  industriesError: string;
  selectedCategoryId: string;
  selectedIndustryId: string;
  selectedUnit: string;
  sortBy: SortKey;
  units: string[];
  selectedSubCategoryId: string;
  onRetryCategories: () => void;
  onRetryIndustries: () => void;
  onClose: () => void;
  onApply: (filters: {
    categoryId: string;
    subCategoryId: string;
    industryId: string;
    unit: string;
    sort: SortKey;
  }) => void;
}

const SORT_OPTIONS: SortOption[] = [
  {key: 'newest', label: 'Newest First', description: 'Latest additions'},
  {
    key: 'price-asc',
    label: 'Price: Low to High',
    description: 'Budget friendly first',
  },
  {
    key: 'price-desc',
    label: 'Price: High to Low',
    description: 'Premium products first',
  },
  // {key: 'name-asc', label: 'Name: A to Z', description: 'Alphabetical order'},
  // {
  //   key: 'name-desc',
  //   label: 'Name: Z to A',
  //   description: 'Reverse alphabetical',
  // },
];

const SECTIONS: {key: FilterSection; label: string}[] = [
  {key: 'sort', label: 'Sort by'},
  {key: 'industry', label: 'Industry'},
  {key: 'category', label: 'Category'},
];

const getCategoryName = (category: ApiCategory): string =>
  String(category.title ?? category.name ?? '').trim();

const getCategoryImage = (category: ApiCategory): string | null => {
  const image =
    category.icon_url ?? category.image_url ?? category.image ?? null;
  return typeof image === 'string' && image.trim() ? image.trim() : null;
};

const getSubCategories = (category: any): any[] => {
  const subCategories =
    category?.sub_categories ??
    category?.subcategories ??
    category?.subCategories;
  return Array.isArray(subCategories) ? subCategories : [];
};

const getSubCategoryName = (subCategory: any, index: number): string =>
  String(
    subCategory?.title ??
      subCategory?.name ??
      `Subcategory ${index + 1}`,
  ).trim();

const chunk = <T,>(list: T[], size: number): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < list.length; i += size) {
    rows.push(list.slice(i, i + size));
  }
  return rows;
};

interface FilterTileProps {
  label: string;
  image?: string | null;
  selected: boolean;
  onPress: () => void;
}

const FilterTile: React.FC<FilterTileProps> = ({
  label,
  image,
  selected,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.filterTile, selected && styles.filterTileSelected]}
    activeOpacity={0.8}
    onPress={onPress}>
    <View style={styles.filterTileImage}>
      <CachedImage
        uri={image}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        fallback={
          <View style={styles.imageFallback}>
            <Text style={styles.imageFallbackText}>
              {label.charAt(0).toUpperCase()}
            </Text>
          </View>
        }
      />
      {selected ? (
        <View style={styles.tileCheck}>
          <Check size={scale(11)} color="#FFFFFF" strokeWidth={3} />
        </View>
      ) : null}
    </View>
    <Text
      style={[styles.filterTileLabel, selected && styles.selectedTileLabel]}
      numberOfLines={2}>
      {label}
    </Text>
  </TouchableOpacity>
);

export const ProductFiltersModal: React.FC<ProductFiltersModalProps> = ({
  visible,
  categories,
  industries,
  categoriesLoading,
  industriesLoading,
  categoriesError,
  industriesError,
  selectedCategoryId,
  selectedIndustryId,
  selectedUnit,
  sortBy,
  units,
  selectedSubCategoryId,
  onRetryCategories,
  onRetryIndustries,
  onClose,
  onApply,
}) => {
  const insets = useSafeAreaInsets();
  const [activeSection, setActiveSection] =
    useState<FilterSection>('category');
  const [categoryId, setCategoryId] = useState(selectedCategoryId);
  const [industryId, setIndustryId] = useState(selectedIndustryId);
  const [unit, setUnit] = useState(selectedUnit);
  const [sort, setSort] = useState(sortBy);
  const [subCategoryId, setSubCategoryId] = useState(selectedSubCategoryId);
  const [search, setSearch] = useState('');
  const [categoryDetails, setCategoryDetails] = useState<Record<string, any>>(
    {},
  );
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);
  const [subCategoriesError, setSubCategoriesError] = useState('');

  useEffect(() => {
    if (visible) {
      setCategoryId(selectedCategoryId);
      setIndustryId(selectedIndustryId);
      setUnit(selectedUnit);
      setSort(sortBy);
      setSubCategoryId(selectedSubCategoryId);
      setActiveSection('category');
      setSearch('');
    }
  }, [
    visible,
    selectedCategoryId,
    selectedIndustryId,
    selectedUnit,
    sortBy,
    selectedSubCategoryId,
  ]);

  const selectedCategory = useMemo(
    () => categories.find(item => String(item.id) === categoryId),
    [categories, categoryId],
  );
  const selectedSubCategories = useMemo(() => {
    const categoryData =
      categoryDetails[categoryId] ?? selectedCategory ?? null;
    return getSubCategories(categoryData)
      .map((item, index) => ({
        id: String(item?.id ?? item?.slug ?? ''),
        label: getSubCategoryName(item, index),
        image: item?.icon_url ?? item?.image_url ?? item?.image ?? null,
      }))
      .filter(item => item.id && item.label);
  }, [categoryDetails, categoryId, selectedCategory]);
  const sidebarSections = useMemo(() => {
    const sections = [...SECTIONS];
    if (
      categoryId &&
      (subCategoriesLoading ||
        !!subCategoriesError ||
        selectedSubCategories.length > 0)
    ) {
      const categoryIndex = sections.findIndex(
        section => section.key === 'category',
      );
      sections.splice(categoryIndex + 1, 0, {
        key: 'subcategory',
        label: 'Sub Category',
      });
    }
    return sections;
  }, [
    categoryId,
    selectedSubCategories.length,
    subCategoriesError,
    subCategoriesLoading,
  ]);

  useEffect(() => {
    if (!visible || !categoryId) {
      setSubCategoriesLoading(false);
      setSubCategoriesError('');
      return;
    }

    if (categoryDetails[categoryId]) {
      return;
    }

    let active = true;
    setSubCategoriesError('');
    if (getSubCategories(selectedCategory).length > 0) {
      setCategoryDetails(current => ({
        ...current,
        [categoryId]: selectedCategory,
      }));
      return;
    }

    setSubCategoriesLoading(true);
    getCategoryDetails(categoryId)
      .then(response => {
        if (!active) {
          return;
        }
        const detail = response?.data?.category ?? response?.data ?? response;
        setCategoryDetails(current => ({...current, [categoryId]: detail}));
      })
      .catch(error => {
        if (active) {
          setSubCategoriesError(getLoadErrorMessage(error, 'subcategories'));
        }
      })
      .finally(() => {
        if (active) {
          setSubCategoriesLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [visible, categoryId, categoryDetails, selectedCategory]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    return categories.filter(
      category =>
        getCategoryImage(category) &&
        getCategoryName(category).toLowerCase().includes(query),
    );
  }, [categories, search]);

  const filteredIndustries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return industries.filter(industry =>
      String(industry.title ?? '')
        .toLowerCase()
        .includes(query),
    );
  }, [industries, search]);

  const clearAll = () => {
    setCategoryId('');
    setIndustryId('');
    setUnit('All');
    setSort('newest');
    setSubCategoryId('');
    setSearch('');
  };

  const renderCatalogTiles = (
    items: {id: string; label: string; image?: string | null}[],
    selectedId: string,
    onSelect: (id: string) => void,
  ) => (
    <ScrollView
      style={styles.optionsScroll}
      contentContainerStyle={styles.optionsContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      {chunk(items, 2).map((row, rowIndex) => (
        <View key={`filter-row-${rowIndex}`} style={styles.tileRow}>
          {row.map(item => (
            <FilterTile
              key={item.id}
              label={item.label}
              image={item.image}
              selected={selectedId === item.id}
              onPress={() => onSelect(item.id)}
            />
          ))}
          {row.length === 1 ? <View style={styles.filterTilePlaceholder} /> : null}
        </View>
      ))}
    </ScrollView>
  );

  const renderSectionContent = () => {
    if (activeSection === 'category' || activeSection === 'industry') {
      const isCategory = activeSection === 'category';
      const isLoading = isCategory ? categoriesLoading : industriesLoading;
      const error = isCategory ? categoriesError : industriesError;
      const retry = isCategory ? onRetryCategories : onRetryIndustries;
      const items = isCategory
        ? filteredCategories.map(category => ({
            id: String(category.id),
            label: getCategoryName(category),
            image: getCategoryImage(category),
          }))
        : filteredIndustries.map(industry => ({
            id: String(industry.id),
            label: String(industry.title ?? ''),
            image: industry.image_url,
          }));

      return (
        <>
          <View style={styles.filterSearch}>
            <Search size={scale(16)} color="#64748B" strokeWidth={2} />
            <TextInput
              style={styles.filterSearchInput}
              placeholder={`Search ${isCategory ? 'categories' : 'industries'}`}
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
          </View>
          {isLoading && items.length === 0 ? (
            <Text style={styles.messageText}>Loading {activeSection}...</Text>
          ) : error && items.length === 0 ? (
            <View style={styles.messageWrap}>
              <Text style={styles.messageText}>{error}</Text>
              <TouchableOpacity onPress={retry} activeOpacity={0.8}>
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : items.length === 0 ? (
            <Text style={styles.messageText}>
              No {isCategory ? 'categories' : 'industries'} found
            </Text>
          ) : (
            renderCatalogTiles(
              items,
              isCategory ? categoryId : industryId,
              isCategory
                ? (id: string) => {
                    setCategoryId(id);
                    setSubCategoryId('');
                    setSubCategoriesError('');
                    setActiveSection('category');
                  }
                : setIndustryId,
            )
          )}
        </>
      );
    }

    if (activeSection === 'subcategory') {
      if (subCategoriesLoading) {
        return <Text style={styles.messageText}>Loading subcategories...</Text>;
      }
      if (subCategoriesError) {
        return (
          <View style={styles.messageWrap}>
            <Text style={styles.messageText}>{subCategoriesError}</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (!categoryId) {
                  return;
                }
                setCategoryDetails(current => {
                  const next = {...current};
                  delete next[categoryId];
                  return next;
                });
              }}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        );
      }
      if (selectedSubCategories.length === 0) {
        return (
          <Text style={styles.messageText}>
            No subcategories available for this category
          </Text>
        );
      }

      const query = search.trim().toLowerCase();
      const filteredSubCategories = selectedSubCategories.filter(item =>
        item.label.toLowerCase().includes(query),
      );
      return (
        <>
          <View style={styles.filterSearch}>
            <Search size={scale(16)} color="#64748B" strokeWidth={2} />
            <TextInput
              style={styles.filterSearchInput}
              placeholder="Search subcategories"
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
          </View>
          {filteredSubCategories.length === 0 ? (
            <Text style={styles.messageText}>No subcategories found</Text>
          ) : (
            renderCatalogTiles(
              filteredSubCategories,
              subCategoryId,
              setSubCategoryId,
            )
          )}
        </>
      );
    }

    if (activeSection === 'sort') {
      return (
        <ScrollView
          style={styles.optionsScroll}
          contentContainerStyle={styles.sortContent}
          showsVerticalScrollIndicator={false}>
          {SORT_OPTIONS.map(option => {
            const active = sort === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={[styles.sortOption, active && styles.sortOptionActive]}
                activeOpacity={0.8}
                onPress={() => setSort(option.key)}>
                <View style={styles.sortLabelWrap}>
                  <Text
                    style={[
                      styles.sortOptionLabel,
                      active && styles.sortOptionLabelActive,
                    ]}>
                    {option.label}
                  </Text>
                  <Text style={styles.sortDescription}>
                    {option.description}
                  </Text>
                </View>
                <View style={[styles.checkbox, active && styles.checkboxActive]}>
                  {active ? (
                    <Check size={scale(12)} color="#FFFFFF" strokeWidth={3} />
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      );
    }

    return (
      <ScrollView
        style={styles.optionsScroll}
        contentContainerStyle={styles.sortContent}
        showsVerticalScrollIndicator={false}>
        {units.map(option => {
          const active = unit === option;
          return (
            <TouchableOpacity
              key={option}
              style={[styles.sortOption, active && styles.sortOptionActive]}
              activeOpacity={0.8}
              onPress={() => setUnit(option)}>
              <Text
                style={[
                  styles.sortOptionLabel,
                  active && styles.sortOptionLabelActive,
                ]}>
                {option === 'All' ? 'All pack sizes' : option}
              </Text>
              <View style={[styles.checkbox, active && styles.checkboxActive]}>
                {active ? (
                  <Check size={scale(12)} color="#FFFFFF" strokeWidth={3} />
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <View style={[styles.header]}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={onClose}>
            <ArrowLeft size={scale(18)} color="#20252B" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filters</Text>
          <TouchableOpacity
            style={styles.clearButton}
            activeOpacity={0.7}
            onPress={clearAll}>
            <Text style={styles.clearText}>Clear All Filters</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterBody}>
          <ScrollView
            style={styles.sidebar}
            contentContainerStyle={styles.sidebarContent}
            showsVerticalScrollIndicator={false}>
            {sidebarSections.map(section => {
              const active = activeSection === section.key;
              return (
                <TouchableOpacity
                  key={section.key}
                  style={[styles.sidebarItem, active && styles.sidebarItemActive]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setActiveSection(section.key);
                    setSearch('');
                  }}>
                  {active ? <View style={styles.activeIndicator} /> : null}
                  <Text
                    style={[
                      styles.sidebarLabel,
                      active && styles.sidebarLabelActive,
                    ]}
                    numberOfLines={2}>
                    {section.label}
                  </Text>
                  {section.key === 'category' && categoryId ? (
                    <View style={styles.sidebarBadge} />
                  ) : null}
                  {section.key === 'subcategory' && subCategoryId ? (
                    <View style={styles.sidebarBadge} />
                  ) : null}
                  {section.key === 'industry' && industryId ? (
                    <View style={styles.sidebarBadge} />
                  ) : null}
                  {section.key === 'sort' && sort !== 'newest' ? (
                    <View style={styles.sidebarBadge} />
                  ) : null}
                  {section.key === 'unit' && unit !== 'All' ? (
                    <View style={styles.sidebarBadge} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.optionsPanel}>
            <Text style={styles.contentTitle}>
              {SECTIONS.find(section => section.key === activeSection)?.label}
            </Text>
            {renderSectionContent()}
          </View>
        </View>

        <View
          style={[
            styles.footer,
            {paddingBottom: Math.max(insets.bottom, spacing.md)},
          ]}>
          <Pressable
            style={styles.applyButton}
            android_ripple={{color: 'rgba(255,255,255,0.2)'}}
            onPress={() =>
              onApply({categoryId, subCategoryId, industryId, unit, sort})
            }>
            <Text style={styles.applyButtonText}>Show Products</Text>
            <ChevronRight size={scale(18)} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {flex: 1, backgroundColor: '#FFFFFF'},
  header: {
    minHeight: scale(50),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F2',
  },
  backButton: {
    width: scale(32),
    height: scale(36),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#20252B',
    fontSize: scale(15),
    fontWeight: '700',
    marginLeft: scale(4),
  },
  clearButton: {
    marginLeft: 'auto',
    paddingVertical: scale(7),
    paddingLeft: scale(8),
  },
  clearText: {
    color: '#20252B',
    fontSize: scale(13),
    fontWeight: '700',
  },
  filterBody: {flex: 1, flexDirection: 'row'},
  sidebar: {
    width: '30%',
    maxWidth: scale(120),
    backgroundColor: '#F3F4F5',
  },
  sidebarContent: {paddingBottom: scale(12)},
  sidebarItem: {
    minHeight: scale(50),
    paddingHorizontal: scale(14),
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEDEF',
  },
  sidebarItemActive: {backgroundColor: '#FFFFFF'},
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: scale(3),
    backgroundColor: colors.primary,
  },
  sidebarLabel: {
    flex: 1,
    color: '#3D4146',
    fontSize: scale(11.5),
    fontWeight: '500',
  },
  sidebarLabelActive: {color: colors.primary, fontWeight: '700'},
  sidebarBadge: {
    width: scale(6),
    height: scale(6),
    borderRadius: radius.pill,
    marginLeft: scale(4),
    backgroundColor: colors.primary,
  },
  optionsPanel: {flex: 1, backgroundColor: '#FFFFFF'},
  contentTitle: {
    color: '#252A30',
    fontSize: scale(13),
    fontWeight: '700',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: scale(9),
  },
  filterSearch: {
    minHeight: scale(35),
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: scale(10),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D5D8DB',
    borderRadius: scale(10),
  },
  filterSearchInput: {
    flex: 1,
    paddingVertical: 0,
    marginLeft: scale(8),
    color: '#20252B',
    fontSize: scale(12),
  },
  optionsScroll: {flex: 1},
  optionsContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    gap: scale(10),
  },
  allOption: {
    minHeight: scale(38),
    borderRadius: scale(8),
    paddingHorizontal: scale(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E4E6E8',
  },
  allOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F2F7FC',
  },
  allOptionText: {
    color: '#444A50',
    fontSize: scale(12),
    fontWeight: '600',
  },
  allOptionTextSelected: {color: colors.primary},
  subcategoriesSection: {
    marginTop: scale(8),
    paddingTop: scale(12),
    borderTopWidth: 1,
    borderTopColor: '#ECEDEF',
    gap: scale(10),
  },
  subcategoriesTitle: {
    color: '#252A30',
    fontSize: scale(12),
    fontWeight: '700',
  },
  subcategoriesError: {alignItems: 'center'},
  tileRow: {flexDirection: 'row', gap: scale(8)},
  filterTile: {
    flex: 1,
    minHeight: scale(112),
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(7),
    borderWidth: 1,
    borderColor: '#ECEDEF',
    borderRadius: scale(10),
    backgroundColor: '#FFFFFF',
  },
  filterTileSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F6FAFE',
  },
  filterTileImage: {
    width: '100%',
    height: scale(66),
    borderRadius: scale(8),
    overflow: 'hidden',
    backgroundColor: '#F0F1F2',
  },
  imageFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F1F2',
  },
  imageFallbackText: {
    color: '#77808A',
    fontWeight: '700',
    fontSize: scale(22),
  },
  tileCheck: {
    position: 'absolute',
    top: scale(5),
    right: scale(5),
    width: scale(18),
    height: scale(18),
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  filterTileLabel: {
    marginTop: scale(5),
    color: '#373C42',
    fontSize: scale(10),
    lineHeight: scale(13),
    textAlign: 'center',
  },
  selectedTileLabel: {color: colors.primary, fontWeight: '700'},
  filterTilePlaceholder: {flex: 1},
  messageWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  messageText: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
    color: '#68717A',
    fontSize: scale(12),
    textAlign: 'center',
  },
  retryText: {
    color: colors.primary,
    fontSize: scale(12),
    fontWeight: '700',
    padding: spacing.sm,
  },
  sortContent: {paddingHorizontal: spacing.md, paddingBottom: spacing.lg, gap: scale(8)},
  sortOption: {
    minHeight: scale(54),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: scale(8),
    borderWidth: 1,
    borderColor: '#E8EAEC',
    borderRadius: scale(9),
  },
  sortOptionActive: {
    borderColor: colors.primary,
    backgroundColor: '#F3F8FD',
  },
  sortLabelWrap: {flex: 1},
  sortOptionLabel: {
    color: '#343A40',
    fontSize: scale(11),
    fontWeight: '600',
  },
  sortOptionLabelActive: {color: colors.primary},
  sortDescription: {
    marginTop: scale(2),
    color: '#8B9299',
    fontSize: scale(9),
  },
  checkbox: {
    width: scale(19),
    height: scale(19),
    borderWidth: 1.4,
    borderColor: '#A8ADB2',
    borderRadius: scale(4),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: scale(8),
  },
  checkboxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#ECEDEF',
  },
  applyButton: {
    minHeight: scale(40),
    borderRadius: scale(9),
    backgroundColor: '#1768D5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(5),
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: scale(15),
    fontWeight: '700',
  },
});

export default ProductFiltersModal;
