import React, { useRef, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ViewToken,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { ArrowRight, Heart, Minus, Plus, ShieldCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CatalogueStackParamList } from '../../navigation/types';
import AppImage from '../../components/ui/AppImage';
import CommonHeader from '../../components/ui/CommonHeader';
import { colors, radius, scale, spacing, verticalScale } from '../../theme';
import { formatPrice } from '../../utils/formatPrice';
import Button from '../../components/ui/Button';
import { useSimulatedLoading } from '../../hooks/useSimulatedLoading';
import ProductDetailsSkeleton from './components/ProductDetailsSkeleton';

type Route = RouteProp<CatalogueStackParamList, 'ProductDetails'>;

const { width: SCREEN_W } = Dimensions.get('window');

const MIN_QUANTITY = 1;

export const ProductDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const route = useRoute<Route>();
  const [activeTab, setActiveTab] = useState<'overview' | 'specifications' | 'documents'>('overview');
  const [selectedPack, setSelectedPack] = useState('20L');
  const [quantity, setQuantity] = useState(MIN_QUANTITY);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const loading = useSimulatedLoading();

  const adjustQuantity = (delta: number) =>
    setQuantity(q => Math.max(MIN_QUANTITY, q + delta));

  const canDecrement = quantity > MIN_QUANTITY;

  const onViewableItemsChanged = useRef((info: { viewableItems: ViewToken[] }) => {
    const item = info.viewableItems[0];
    if (item?.index != null) {
      setActiveImage(item.index);
    }
  }).current;
  const viewConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const product = {
    id: route.params?.productId ?? 'p2',
    name: 'Gear Oil AX-200',
    subtitle: 'Extreme Pressure Gear Oil',
    images: [ 'product_oil', 'product_generic', 'product_grease'],
    tags: ['Automotive', 'Industrial', 'High Performance'],
    description:
      'High-performance gear oil designed for industrial gear systems with excellent wear protection and thermal stability. Delivers prolonged machinery life and reduces friction.',
    packSizes: ['1L', '5L', '20L', '210L'],
    price: 3200,
    mrp: 3600,
    unit: '20L',
    specs: [
      { label: 'Viscosity Grade', value: 'ISO VG 220' },
      { label: 'Flash Point', value: '230°C' },
      { label: 'Pour Point', value: '-18°C' },
      { label: 'Density @ 15°C', value: '0.892 g/cm³' },
      { label: 'Copper Corrosion', value: '1a (ASTM D130)' },
    ],
  };

  const discount =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <CommonHeader
        title="Product Details"
        right={
          <TouchableOpacity
            style={styles.headerBtn}
            activeOpacity={0.7}
            onPress={() => setIsFavorite(!isFavorite)}>
            <Heart
              size={scale(20)}
              color={isFavorite ? '#EF4444' : '#0F172A'}
              fill={isFavorite ? '#EF4444' : 'none'}
            />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <ProductDetailsSkeleton />
      ) : (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + scale(105) }]}>

        {/* Image Gallery */}
        <View style={styles.heroWrap}>
          <FlatList
            data={product.images}
            keyExtractor={(item, index) => `${item}-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewConfig}
            renderItem={({ item }) => (
              <View style={styles.heroSlide}>
                {/* <View style={styles.heroAura} /> */}
                <AppImage
                  uri={item}
                  style={styles.heroImage}
                  resizeMode="contain"
                />
              </View>
            )}
          />
          {product.images.length > 1 && (
            <View style={styles.dotsRow}>
              {product.images.map((_, index) => (
                <View
                  key={`dot-${index}`}
                  style={[styles.dot, index === activeImage && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Product Basic Info */}
        <View style={styles.bodyContent}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productSubtitle}>{product.subtitle}</Text>


          {/* Tags */}
          <View style={styles.tagsRow}>
            {product.tags.map(tag => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Horizontal Underlined Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'overview' && styles.tabItemActive]}
              activeOpacity={0.7}
              onPress={() => setActiveTab('overview')}>
              <Text
                style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
                Overview
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'specifications' && styles.tabItemActive]}
              activeOpacity={0.7}
              onPress={() => setActiveTab('specifications')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'specifications' && styles.tabTextActive,
                ]}>
                Specifications
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <View style={styles.tabContentBlock}>
              <Text style={styles.descriptionText}>{product.description}</Text>
              <View style={styles.featureRow}>
                <ShieldCheck size={scale(18)} color="#10B981" />
                <Text style={styles.featureText}>ISO 9001:2015 Certified High Protection</Text>
              </View>
            </View>
          )}

          {activeTab === 'specifications' && (
            <View style={styles.specBox}>
              {product.specs.map(s => (
                <View key={s.label} style={styles.specRow}>
                  <Text style={styles.specLabel}>{s.label}</Text>
                  <Text style={styles.specValue}>{s.value}</Text>
                </View>
              ))}
            </View>
          )}


          {/* Available Pack Sizes */}
          <View style={styles.packSection}>
            <Text style={styles.packHeading}>Available Pack Sizes</Text>
            <View style={styles.packRow}>
              {product.packSizes.map(size => {
                const selected = size === selectedPack;
                return (
                  <TouchableOpacity
                    key={size}
                    style={[styles.packPill, selected && styles.packPillSelected]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedPack(size)}>
                    <Text
                      style={[
                        styles.packPillText,
                        selected && styles.packPillTextSelected,
                      ]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Quantity */}
          <View style={styles.qtySection}>
            <View style={styles.qtyInfo}>
              <Text style={styles.qtyTitle}>Quantity</Text>
              <Text style={styles.qtyHint}>Select number of packs</Text>
            </View>

            <View style={styles.stepper}>
              <TouchableOpacity
                style={[styles.stepBtn, !canDecrement && styles.stepBtnDisabled]}
                activeOpacity={0.7}
                disabled={!canDecrement}
                onPress={() => adjustQuantity(-1)}>
                <Minus
                  size={scale(17)}
                  color={canDecrement ? '#0F172A' : '#CBD5E1'}
                  strokeWidth={2.5}
                />
              </TouchableOpacity>

              <View style={styles.stepValueWrap}>
                <Text style={styles.stepValue}>{quantity}</Text>
              </View>

              <TouchableOpacity
                style={styles.stepBtn}
                activeOpacity={0.7}
                onPress={() => adjustQuantity(1)}>
                <Plus size={scale(17)} color="#0F172A" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      )}

      {/* Sticky Bottom Checkout Bar */}
      <View
        style={[styles.bottomBar, { paddingBottom: scale(10) + insets.bottom }]}>
        <View style={styles.bottomPriceCol}>
          <View style={styles.bottomPriceRow}>
            <Text style={styles.bottomPrice}>{formatPrice(product.price)}</Text>
            {product.unit ? (
              <Text style={styles.bottomUnit}>/ {product.unit}</Text>
            ) : null}
          </View>

          <View style={styles.bottomMetaRow}>
            {discount > 0 && (
              <Text style={styles.bottomMrp}>{formatPrice(product.mrp)}</Text>
            )}
            {discount > 0 && (
              <View style={styles.bottomDiscountBadge}>
                <Text style={styles.bottomDiscountText}>{discount}% OFF</Text>
              </View>
            )}
          </View>
        </View>
        <Button
          title='Check Out'
          variant='outline'
          size='medium'
          style={styles.checkoutBtn}
          onPress={() =>
            navigation.navigate('RequestPrice', {
              productId: product.id,
              productName: product.name,
              category: product.subtitle,
              price: product.price,
              mrp: product.mrp,
              unit: selectedPack,
              quantity,
              packSizes: product.packSizes,
            })}
            textStyle={styles.checkoutText}
            iconRight={<ArrowRight size={scale(14)} color={colors.primary} strokeWidth={3.5} />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBtn: {
    padding: scale(4),
  },
  scrollContent: {
    paddingTop: spacing.xs,
  },
  heroWrap: {
    height: verticalScale(250),
    backgroundColor: '#FFFFFF',
    paddingTop: spacing.sm,
  },
  heroSlide: {
    width: SCREEN_W,
    height: verticalScale(212),
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAura: {
    position: 'absolute',
    width: scale(180),
    height: scale(180),
    borderRadius: scale(90),
    backgroundColor: 'rgba(2, 132, 199, 0.06)',
  },
  heroImage: {
    width: scale(175),
    height: scale(205),
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    paddingVertical: scale(8),
  },
  dot: {
    width: scale(7),
    height: scale(7),
    borderRadius: scale(4),
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    width: scale(16),
    backgroundColor: colors.primary,
  },
  bodyContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  productName: {
    fontSize: scale(18),
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  productSubtitle: {
    fontSize: scale(12),
    color: '#64748B',
    marginTop: 2,
    marginBottom: spacing.md,
  },
 
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tagPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: radius.pill,
    paddingHorizontal: scale(12),
    paddingVertical: scale(5),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagText: {
    fontSize: scale(11),
    fontWeight: '600',
    color: '#475569',
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#F1F5F9',
    marginBottom: spacing.lg,
    gap: spacing.xl,
  },
  tabItem: {
    paddingBottom: scale(10),
  },
  tabItemActive: {
    borderBottomWidth: 2.5,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: scale(13),
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  tabContentBlock: {
    marginBottom: spacing.xl,
  },
  descriptionText: {
    fontSize: scale(13),
    color: '#334155',
    lineHeight: scale(21),
    marginBottom: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    backgroundColor: '#F0FDF4',
    paddingHorizontal: spacing.md,
    paddingVertical: scale(8),
    borderRadius: radius.md,
  },
  featureText: {
    fontSize: scale(11.5),
    fontWeight: '600',
    color: '#15803D',
  },
  specBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    gap: scale(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  specLabel: {
    fontSize: scale(12),
    color: '#64748B',
  },
  specValue: {
    fontSize: scale(12),
    fontWeight: '700',
    color: '#0F172A',
  },
  packSection: {
    marginBottom: spacing.xl,
  },
  packHeading: {
    fontSize: scale(13),
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: scale(9),
  },
  packRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  packPill: {
    minWidth: scale(72),
    height: scale(40),
    paddingHorizontal: scale(16),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
  },
  packPillSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  packPillText: {
    fontSize: scale(13),
    fontWeight: '600',
    color: '#475569',
  },
  packPillTextSelected: {
    color: colors.primary,
    fontWeight: '800',
  },
  qtySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  qtyInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  qtyTitle: {
    fontSize: scale(13),
    fontWeight: '800',
    color: '#0F172A',
  },
  qtyHint: {
    fontSize: scale(11),
    color: '#94A3B8',
    marginTop: scale(2),
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: scale(44),
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  stepBtn: {
    width: scale(42),
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.55,
  },
  stepValueWrap: {
    minWidth: scale(44),
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#EEF2F6',
    paddingHorizontal: scale(4),
  },
  stepValue: {
    fontSize: scale(15),
    fontWeight: '700',
    color: '#0F172A',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingTop: scale(10),
    paddingBottom: scale(10),
    borderTopWidth: 1,
    borderTopColor: '#EAEFF5',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomPriceCol: {
    flex: 1,
    marginRight: spacing.md,
  },
  bottomPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bottomPrice: {
    fontSize: scale(18),
    fontWeight: '700',
    color: '#102A43',
    letterSpacing: -0.5,
  },
  bottomUnit: {
    fontSize: scale(11),
    fontWeight: '600',
    color: '#94A3B8',
    marginLeft: scale(4),
  },
  bottomMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(2),
    gap: scale(6),
  },
  bottomMrp: {
    fontSize: scale(11.5),
    fontWeight: '600',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  bottomDiscountBadge: {
    backgroundColor: '#E7F6EE',
    borderRadius: radius.xs,
    paddingHorizontal: scale(6),
    paddingVertical: scale(1),
  },
  bottomDiscountText: {
    fontSize: scale(9.5),
    fontWeight: '800',
    color: '#0B7A3B',
    letterSpacing: 0.2,
  },
  checkoutBtn: {
    width: '50%'
  },
  checkoutText: {
    fontSize: scale(14),
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

export default ProductDetailsScreen;
