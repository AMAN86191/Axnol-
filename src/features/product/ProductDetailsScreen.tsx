import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Linking,
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
import {
  ArrowRight,
  Download,
  FileText,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CatalogueStackParamList } from '../../navigation/types';
import AppImage from '../../components/ui/AppImage';
import CommonHeader from '../../components/ui/CommonHeader';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/ToastProvider';
import { colors, radius, scale, spacing, verticalScale } from '../../theme';
import { formatPrice } from '../../utils/formatPrice';
import { useSimulatedLoading } from '../../hooks/useSimulatedLoading';
import ProductDetailsSkeleton from './components/ProductDetailsSkeleton';
import { useCart } from '../cart/useCart';
import EditableQuantity from '../cart/components/EditableQuantity';
import { selectCartItemCount } from '../cart/cartSelectors';
import WishlistButton from '../wishlist/components/WishlistButton';
import { useAppDispatch } from '../../redux/hooks';
import { fetchProductDetailsSlice } from '../../redux/ProductSlice';
import { useAppSelector } from '../../store';

type Route = RouteProp<CatalogueStackParamList, 'ProductDetails'>;

const loggedProductDetails = new Set<string>();

const { width: SCREEN_W } = Dimensions.get('window');

const MIN_QUANTITY = 1;

const FALLBACK_IMAGES = ['product_oil', 'product_generic', 'product_grease'];
const FALLBACK_PACK_SIZES = ['1L', '5L', '20L', '210L'];
const FALLBACK_SPECS = [
  { label: 'Viscosity Grade', value: 'ISO VG 220' },
  { label: 'Flash Point', value: '230°C' },
  { label: 'Pour Point', value: '-18°C' },
  { label: 'Density @ 15°C', value: '0.892 g/cm³' },
  { label: 'Copper Corrosion', value: '1a (ASTM D130)' },
];

const stripHtml = (html?: string | null) =>
  (html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

export const ProductDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const route = useRoute<Route>();
  const dispatch = useAppDispatch();
  const productDetail = useAppSelector(s => s.product.productDetail);
  const detailLoading = useAppSelector(s => s.product.detailLoading);
  const [activeTab, setActiveTab] = useState<'overview' | 'specifications' | 'documents'>('overview');
  const [selectedPack, setSelectedPack] = useState('20L');
  const [quantity, setQuantity] = useState(MIN_QUANTITY);
  const [activeImage, setActiveImage] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { add, items } = useCart();
  const cartCount = useAppSelector(selectCartItemCount);
  const productId = route.params?.productId;
  const loading = useSimulatedLoading() || (detailLoading && !productDetail);

  useEffect(() => {
    if (!productId) {
      return;
    }
    dispatch(fetchProductDetailsSlice(productId))
      .unwrap()
      .then(res => {
        if (!loggedProductDetails.has(String(productId))) {
          loggedProductDetails.add(String(productId));
          console.log('Product Details API Response:', res);
        }
      })
      .catch(err => console.log('Product Details API Error:', err));
  }, [dispatch, productId]);

  const onViewableItemsChanged = useRef((info: { viewableItems: ViewToken[] }) => {
    const item = info.viewableItems[0];
    if (item?.index != null) {
      setActiveImage(item.index);
    }
  }).current;
  const viewConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const scrollToImage = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setActiveImage(index);
  };

  const categoryName =
    productDetail?.category?.title ?? productDetail?.category?.name ?? '';
  const hasApiImages = !!(productDetail?.image_urls?.length || productDetail?.thumbnail_url);
  const apiImages =
    productDetail?.image_urls?.length
      ? productDetail.image_urls
      : productDetail?.thumbnail_url
      ? [productDetail.thumbnail_url]
      : [];
  const apiTags = [
    categoryName,
    productDetail?.industry?.title,
    productDetail?.sub_category?.title,
  ].filter(Boolean) as string[];
  const apiDescription = stripHtml(productDetail?.description);

  const product = {
    id: String(productDetail?.id ?? productId ?? ''),
    name: productDetail?.name ?? 'Product',
    subtitle: categoryName || 'Product Details',
    images: hasApiImages ? apiImages : FALLBACK_IMAGES,
    tags: apiTags.length ? apiTags : ['Automotive', 'Industrial', 'High Performance'],
    description:
      apiDescription ||
      'High-performance lubricant designed for industrial applications with excellent wear protection and thermal stability.',
    packSizes: FALLBACK_PACK_SIZES,
    price: 3200,
    mrp: 3600,
    unit: '20L',
    specs: FALLBACK_SPECS,
  };

  const discount =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const totalPrice = product.price * quantity;

  const inCart = items.some(item => item.id === product.id);

  const handleAddToCart = () => {
    add(
      {
        id: product.id,
        name: product.name,
        code: product.name,
        image: product.images[0],
        price: product.price,
        mrp: product.mrp,
        unit: selectedPack,
      },
      quantity,
    );
  };

  const openMsdsPdf = () => {
    const url =
      productDetail?.msds_url ||
      productDetail?.technical_datasheet_url ||
      'https://axnol.in/pdf/sds.pdf';
    toast.show({
      type: 'info',
      title: 'Material Safety Data Sheet',
      message: 'PDF • 1.1 MB • Tap download to view this document.',
      action: {
        label: 'Download & View',
        onPress: () =>
          Linking.openURL(url).catch(() =>
            toast.error('Error', 'Unable to open PDF.'),
          ),
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <CommonHeader
        title="Product Details"
        right={
          <>
            <TouchableOpacity
              style={styles.headerBtn}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Cart')}>
              <ShoppingCart size={scale(20)} color="#0F172A" strokeWidth={2.1} />
              {cartCount > 0 ? (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
            <WishlistButton
              product={{
                id: product.id,
                name: product.name,
                code: product.name,
                image: product.images[0],
                price: product.price,
                mrp: product.mrp,
                unit: selectedPack,
              }}
              size={20}
              containerSize={30}
              showBackground={false}
              style={styles.headerBtn}
            />
          </>
        }
      />

      {loading ? (
        <ProductDetailsSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + scale(105) }]}>

          {/* Image Gallery */}
          <View style={styles.heroWrap}>
            <FlatList
              ref={flatListRef}
              data={product.images}
              keyExtractor={(item, index) => `${item}-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewConfig}
              getItemLayout={(_, index) => ({
                length: SCREEN_W,
                offset: SCREEN_W * index,
                index,
              })}
              onScrollToIndexFailed={() => { }}
              renderItem={({ item }) => (
                <View style={styles.heroSlide}>
                  <AppImage
                    uri={item}
                    style={styles.heroImage}
                    resizeMode="contain"
                  />
                </View>
              )}
            />

          </View>
          {product.images.length > 1 && (
            <View style={styles.thumbRow}>
              {product.images.map((img, index) => (
                <TouchableOpacity
                  key={`thumb-${img}-${index}`}
                  activeOpacity={0.8}
                  onPress={() => scrollToImage(index)}
                  style={[
                    styles.thumbBox,
                    index === activeImage && styles.thumbBoxActive,
                  ]}>
                  <AppImage
                    uri={img}
                    style={styles.thumbImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
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

              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'documents' && styles.tabItemActive]}
                activeOpacity={0.7}
                onPress={() => setActiveTab('documents')}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'documents' && styles.tabTextActive,
                  ]}>
                  Documents
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

            {activeTab === 'documents' && (
              <View style={styles.msdsCard}>
                <View style={styles.msdsIconWrap}>
                  <FileText size={scale(22)} color="#EF4444" strokeWidth={2} />
                </View>
                <View style={styles.msdsInfo}>
                  <Text style={styles.msdsTitle}>Material Safety Data Sheet</Text>
                  <Text style={styles.msdsSubtitle}>MSDS • PDF • 1.1 MB</Text>
                </View>
                <TouchableOpacity
                  style={styles.pdfBtn}
                  activeOpacity={0.8}
                  onPress={openMsdsPdf}>
                  <Download size={scale(14)} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.pdfBtnText}>PDF</Text>
                </TouchableOpacity>
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

              <EditableQuantity
                size="regular"
                value={quantity}
                onChange={setQuantity}
              />
            </View>
          </View>
        </ScrollView>
      )}

      {/* Sticky Bottom Checkout Bar */}
      <View
        style={[styles.bottomBar, { paddingBottom: insets.bottom + scale(10) }]}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>Total Price</Text>
          <View style={styles.bottomPriceRow}>
            <Text style={styles.bottomPrice}>{formatPrice(totalPrice)}</Text>
            {product.unit ? (
              <Text style={styles.bottomUnit}>/ {selectedPack}</Text>
            ) : null}
          </View>

          <View style={styles.bottomMetaRow}>
            {discount > 0 && (
              <View style={styles.bottomDiscountBadge}>
                <Text style={styles.bottomDiscountText}>{discount}% OFF</Text>
              </View>
            )}
            {quantity > 1 && (
              <Text style={styles.bottomQtyText}>
                {quantity} × {formatPrice(product.price)}
              </Text>
            )}
          </View>
        </View>

        {inCart ? (
          <Button
            title='Go to Cart'
            onPress={() => navigation.navigate('Cart')}
            variant='outline'
            size='medium'
            style={styles.goToCartBtn}
            textStyle={styles.goToCartText}
            iconLeft={
              <ShoppingCart size={scale(16)} color={colors.primary} strokeWidth={2.3} />
            }
          />
        ) : (
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.cartIconBtn}
              activeOpacity={0.8}
              onPress={handleAddToCart}>
              <ShoppingCart
                size={scale(19)}
                color={colors.primary}
                strokeWidth={2.3}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkoutBtn}
              activeOpacity={0.9}
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
                })}>
              <Text style={styles.checkoutText}>Check Out</Text>
              <ArrowRight size={scale(15)} color={colors.textInverse} strokeWidth={3} />
            </TouchableOpacity>
          </View>
        )}
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
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: -scale(2),
    minWidth: scale(15),
    height: scale(15),
    borderRadius: scale(7.5),
    paddingHorizontal: scale(3),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: scale(9),
    fontWeight: '800',
  },
  scrollContent: {
    paddingTop: spacing.xs,
  },
  heroWrap: {
    backgroundColor: '#F4F6F8',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  heroSlide: {
    width: SCREEN_W,
    height: verticalScale(212),
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(10),
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  thumbBox: {
    width: scale(35),
    height: scale(35),
    borderRadius: radius.sm,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  thumbBoxActive: {
    borderColor: colors.primary,
    borderWidth: 1.8,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  heroAura: {
    position: 'absolute',
    width: scale(180),
    height: scale(180),
    borderRadius: scale(90),
    backgroundColor: 'rgba(2, 132, 199, 0.06)',
  },
  heroImage: {
    width: scale(165),
    height: scale(195),
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
  msdsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  msdsIconWrap: {
    width: scale(44),
    height: scale(44),
    borderRadius: radius.sm,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  msdsInfo: {
    flex: 1,  
  },
  msdsTitle: {
    fontSize: scale(13),
    fontWeight: '700',
    color: '#0F172A',
  },
  msdsSubtitle: {
    fontSize: scale(11),
    color: '#64748B',
    marginTop: 2,
  },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    backgroundColor: '#EF4444',
    borderRadius: radius.md,
    paddingHorizontal: scale(14),
    paddingVertical: scale(8),
  },
  pdfBtnText: {
    fontSize: scale(11),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
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
    flexShrink: 1,
    marginRight: spacing.md,
  },
  bottomPriceLabel: {
    fontSize: scale(10),
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.2,
    marginBottom: scale(1),
  },
  bottomPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexShrink: 1,
  },
  bottomPrice: {
    fontSize: scale(19),
    fontWeight: '800',
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
    marginTop: scale(3),
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
  bottomQtyText: {
    fontSize: scale(10),
    fontWeight: '600',
    color: '#94A3B8',
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: scale(8),
  },
  cartIconBtn: {
    width: scale(48),
    height: scale(40),
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goToCartBtn: {
    width: '70%',
    height: scale(44),
    paddingHorizontal: scale(10),
    borderRadius: radius.md,
  },
  goToCartText: {
    fontSize: scale(13.5),
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    height: scale(44),
    paddingHorizontal: scale(24),
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  checkoutText: {
    fontSize: scale(14),
    fontWeight: '800',
    letterSpacing: 0.2,
    color: colors.textInverse,
  },
});

export default ProductDetailsScreen;
