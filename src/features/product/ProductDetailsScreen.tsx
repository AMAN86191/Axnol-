import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
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
  useWindowDimensions,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowRight,
  Download,
  FileText,
  ShoppingCart,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CatalogueStackParamList } from '../../navigation/types';
import {Image} from 'react-native';
import CommonHeader from '../../components/ui/CommonHeader';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/ToastProvider';
import { colors, radius, scale, spacing, verticalScale } from '../../theme';
import { formatPrice } from '../../utils/formatPrice';
import { getRateChartId } from '../../utils/productCardData';
import ProductDetailsSkeleton from './components/ProductDetailsSkeleton';
import { useCart } from '../cart/useCart';
import EditableQuantity from '../cart/components/EditableQuantity';
import WishlistButton from '../wishlist/components/WishlistButton';
import { getProductById, ProductApi } from '../../api/ProductProvider';
import { store } from '../../store';
import Skeleton from '../../components/ui/Skeleton';
import { getLoadErrorMessage } from '../../utils/apiError';

type Route = RouteProp<CatalogueStackParamList, 'ProductDetails'>;

const { width: SCREEN_W } = Dimensions.get('window');

const MIN_QUANTITY = 1;

export const ProductDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const route = useRoute<Route>();
  const { width } = useWindowDimensions();
  const [productDetail, setProductDetail] = useState<ProductApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'specifications' | 'documents'>('overview');
  const [selectedPack, setSelectedPack] = useState('');
  const [quantity, setQuantity] = useState(MIN_QUANTITY);
  const [activeImage, setActiveImage] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const requestIdRef = useRef(0);
  const { add, items } = useCart();
  const cartCount = useSyncExternalStore(
    store.subscribe,
    () =>
      store
        .getState()
        .cart.items.reduce((count, item) => count + item.quantity, 0),
    () =>
      store
        .getState()
        .cart.items.reduce((count, item) => count + item.quantity, 0),
  );
  const productId = route.params?.productId;

  const fetchData = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    if (!productId) {
      setProductDetail(null);
      setLoadError(new Error('Product was not found.'));
      setLoading(false);
      return;
    }
    setProductDetail(null);
    setLoading(true);
    setLoadError(null);
    setSelectedPack('');
    setActiveImage(0);
    try {
      const response = await getProductById(productId);
      if (requestId === requestIdRef.current) {
        setProductDetail(response?.data ?? null);
      }
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setLoadError(error);
        console.error('Failed to load product details:', error);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [productId]);

  useEffect(() => {
    fetchData();
    return () => {
      requestIdRef.current += 1;
    };
  }, [fetchData]);

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
  const apiDescription = productDetail?.description ?? '';
  const apiExtraInfo = productDetail?.extra_information ?? '';

  const getProductPriceInfo = (product: any) => {
    const rateCharts = product?.rate_charts;
    if (Array.isArray(rateCharts) && rateCharts.length > 0) {
      const first = rateCharts[0];
      const price =
        first?.price ??
        first?.rate ??
        first?.amount ??
        first?.selling_price ??
        first?.dealer_price ??
        first?.mrp_price ??
        first?.mrp ??
        0;
      const unit =
        first?.unit ??
        first?.pack_size_unit ??
        first?.uom ??
        first?.unit_name ??
        product?.unit;
      const qty = first?.qty ?? first?.quantity ?? first?.pack_size ?? first?.pack_qty;
      const explicitSize = first?.size ?? first?.packSize;
      const pack =
        explicitSize !== undefined &&
        explicitSize !== null &&
        String(explicitSize).trim()
          ? String(explicitSize).trim()
          : qty !== undefined && qty !== null && qty !== ''
          ? `${qty} ${unit ? String(unit).trim() : ''}`.trim()
          : undefined;
      return {
        price: Number(price) || 0,
        unit: unit ? String(unit).trim() : 'Unit',
        pack,
        qty,
      };
    }
    return {
      price: Number(product?.price ?? 0) || 0,
      unit: product?.unit ? String(product.unit).trim() : 'Unit',
    };
  };

  const priceInfo = getProductPriceInfo(productDetail);
  const packOptions = Array.isArray(productDetail?.rate_charts)
    ? productDetail.rate_charts
        .map((rc: any) => {
          const explicitSize = rc?.size ?? rc?.packSize;
          const unit = rc?.unit ?? priceInfo.unit;
          const qty = rc?.qty ?? rc?.quantity ?? rc?.pack_size;
          const rawPrice =
            rc?.price ??
            rc?.rate ??
            rc?.amount ??
            rc?.selling_price ??
            rc?.dealer_price ??
            rc?.mrp_price ??
            rc?.mrp ??
            priceInfo.price;
          const optionPrice = Number(rawPrice);
          const hasExplicitSize =
            explicitSize !== undefined &&
            explicitSize !== null &&
            Boolean(String(explicitSize).trim());
          const label = hasExplicitSize
            ? String(explicitSize).trim()
            : qty !== undefined && qty !== null && qty !== ''
            ? `${qty} ${unit ? String(unit).trim() : ''}`.trim()
            : unit
            ? String(unit).trim()
            : '';
          const size = hasExplicitSize
            ? String(explicitSize).trim()
            : unit
            ? String(unit).trim()
            : label;
          const rateChartId = getRateChartId(rc);
          return label && size
            ? {
                label,
                size,
                price: Number.isFinite(optionPrice)
                  ? optionPrice
                  : priceInfo.price,
                rateChartId,
              }
            : null;
        })
        .filter(
          (option): option is {
            label: string;
            size: string;
            price: number;
            rateChartId: string | number | undefined;
          } => option !== null,
        )
    : [];
  const packSizesFromApi = packOptions.map(option => option.label);
  const selectedPackOption =
    packOptions.find(option => option.label === selectedPack) ?? packOptions[0];
  const selectedSize = selectedPackOption?.size;
  const selectedRateChartId = selectedPackOption?.rateChartId;
  const price = selectedPackOption?.price ?? priceInfo.price;
  const mrp = price > 0 ? Math.round(price * 1.1) : 0;
  const defaultPack =
    priceInfo.pack ||
    (priceInfo.unit ? `1 ${priceInfo.unit}`.trim() : '1 L');

  const product = {
    id: String(productDetail?.id ?? productId ?? ''),
    name: productDetail?.name ?? 'Product',
    subtitle: categoryName || productDetail?.sub_category?.title || 'Product Details',
    images: hasApiImages ? apiImages : ['product_generic'],
    tags: apiTags.length ? apiTags : [],
    description: apiDescription || '',
    packSizes: packSizesFromApi.length ? packSizesFromApi : [defaultPack],
    price,
    mrp,
    unit: priceInfo.unit,
    extraInfo: apiExtraInfo,
  };

  useEffect(() => {
    if (product.packSizes.length > 0) {
      if (!product.packSizes.includes(selectedPack)) {
        setSelectedPack(product.packSizes[0] ?? '');
      }
    }
  }, [product.packSizes, selectedPack]);

  const discount =
    product.mrp > product.price && product.price > 0
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const totalPrice = product.price * quantity;

  const inCart = items.some(item => {
    if (String(item.productId ?? item.id) !== product.id) {
      return false;
    }
    if (
      selectedRateChartId === undefined ||
      selectedRateChartId === null ||
      String(selectedRateChartId).trim() === ''
    ) {
      return true;
    }
    return (
      item.rateChartId !== undefined &&
      item.rateChartId !== null &&
      String(item.rateChartId) === String(selectedRateChartId)
    );
  });

  const handleAddToCart = async () => {
    await add(
      {
        id: product.id,
        productId: productDetail?.id ?? product.id,
        name: product.name,
        code: product.name,
        image: product.images[0],
        price: product.price,
        mrp: product.mrp,
        unit: selectedPack || product.unit,
        size: selectedSize,
        rateChartId: selectedRateChartId,
      } as any,
      quantity,
    );
  };

  const documents = [
    productDetail?.technical_datasheet_url
      ? {
          key: 'technical',
          title: productDetail?.technical_datasheet_name || 'Technical Datasheet',
          url: productDetail.technical_datasheet_url,
          color: '#2563EB',
          bg: '#DBEAFE',
        }
      : null,
    productDetail?.msds_url
      ? {
          key: 'msds',
          title: productDetail?.msds_name || 'Material Safety Data Sheet',
          url: productDetail.msds_url,
          color: '#EF4444',
          bg: '#FEE2E2',
        }
      : null,
    productDetail?.brochure_url
      ? {
          key: 'brochure',
          title: 'Product Brochure',
          url: productDetail.brochure_url,
          color: '#22C55E',
          bg: '#DCFCE7',
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    title: string;
    url: string;
    color: string;
    bg: string;
  }>;

  const openDocument = (url: string) => {
    Linking.openURL(url).catch(() => toast.error('Error', 'Unable to open document.'));
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
                unit: selectedSize ?? product.unit,
                rateChartId: selectedRateChartId,
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
      ) : productDetail ? (
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
                    <Image
                      source={{uri: item}}
                      style={styles.image}
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
                  <Image
                    source={{uri: productDetail?.thumbnail_url as string}}
                    style={styles.image}
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
            {product.tags.length > 0 ? (
              <View style={styles.tagsRow}>
                {product.tags.map(tag => (
                  <View key={tag} style={styles.tagPill}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            ) : null}

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
                {product.description ? (
                  <RenderHtml
                    contentWidth={width - scale(48)}
                    source={{ html: product.description }}
                    tagsStyles={{
                      body: { color: '#334155', fontSize: scale(13), lineHeight: scale(21) },
                      p: { color: '#334155', fontSize: scale(13), lineHeight: scale(21) },
                      h1: { color: '#0F172A', fontSize: scale(16), fontWeight: '700' },
                      h2: { color: '#0F172A', fontSize: scale(15), fontWeight: '700' },
                      h3: { color: '#0F172A', fontSize: scale(14), fontWeight: '700' },
                      li: { color: '#334155', fontSize: scale(13), lineHeight: scale(21) },
                      ul: { marginLeft: scale(4) },
                      strong: { fontWeight: '700', color: '#0F172A' },
                    }}
                  />
                ) : null}
              </View>
            )}

            {activeTab === 'specifications' && (
              <View style={styles.tabContentBlock}>
                {product.extraInfo ? (
                  <RenderHtml
                    contentWidth={width - scale(48)}
                    source={{ html: product.extraInfo }}
                    tagsStyles={{
                      body: { color: '#334155', fontSize: scale(13), lineHeight: scale(21) },
                      p: { color: '#334155', fontSize: scale(13), lineHeight: scale(21) },
                      h1: { color: '#0F172A', fontSize: scale(16), fontWeight: '700' },
                      h2: { color: '#0F172A', fontSize: scale(15), fontWeight: '700' },
                      h3: { color: '#0F172A', fontSize: scale(14), fontWeight: '700' },
                      li: { color: '#334155', fontSize: scale(13), lineHeight: scale(21) },
                      ul: { marginLeft: scale(4) },
                      ol: { marginLeft: scale(4) },
                      strong: { fontWeight: '700', color: '#0F172A' },
                    }}
                  />
                ) : (
                  <Text style={styles.specLabel}>No specifications available.</Text>
                )}
              </View>
            )}

            {activeTab === 'documents' && (
              <View style={styles.documentsWrap}>
                {documents.length > 0 ? (
                  documents.map(doc => (
                    <View key={doc.key} style={styles.msdsCard}>
                      <View style={[styles.msdsIconWrap, { backgroundColor: doc.bg }]}>
                        <FileText size={scale(22)} color={doc.color} strokeWidth={2} />
                      </View>
                      <View style={styles.msdsInfo}>
                        <Text style={styles.msdsTitle} numberOfLines={2}>
                          {doc.title}
                        </Text>
                        <Text style={styles.msdsSubtitle}>PDF</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.pdfBtn, { backgroundColor: doc.color }]}
                        activeOpacity={0.8}
                        onPress={() => openDocument(doc.url)}>
                        <Download size={scale(14)} color="#FFFFFF" strokeWidth={2.5} />
                        <Text style={styles.pdfBtnText}>View</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={styles.specLabel}>No documents available.</Text>
                )}
              </View>
            )}


            {/* Available Pack Sizes */}
            {product.packSizes.length > 0 ? (
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
            ) : null}

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
      ) : (
        <View style={styles.loadError}>
          <Text style={styles.loadErrorText}>
            {getLoadErrorMessage(loadError, 'product details') ||
              'Unable to load product details. Please try again.'}
          </Text>
          <TouchableOpacity onPress={fetchData} activeOpacity={0.8}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View
          style={[
            styles.bottomBar,
            styles.bottomBarSkeleton,
            { paddingBottom: insets.bottom + scale(10) },
          ]}>
          <View style={styles.footerPriceSkeleton}>
            <Skeleton width={scale(74)} height={scale(11)} />
            <Skeleton width={scale(100)} height={scale(20)} style={styles.footerSkeletonGap} />
          </View>
          <Skeleton width={scale(150)} height={scale(44)} borderRadius={radius.md} />
        </View>
      ) : productDetail ? (
        <View
          style={[styles.bottomBar, { paddingBottom: insets.bottom + scale(10) }]}>
          <View style={styles.bottomPriceCol}>
            <Text style={styles.bottomPriceLabel}>Total Price</Text>
            <View style={styles.bottomPriceRow}>
              <Text style={styles.bottomPrice}>{formatPrice(totalPrice)}</Text>
              {(selectedPack || product.unit) ? (
                <Text style={styles.bottomUnit}>/ {selectedPack || product.unit}</Text>
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
              title="Go to Cart"
              onPress={() => navigation.navigate('Cart')}
              variant="outline"
              size="medium"
              style={styles.goToCartBtn}
              textStyle={styles.goToCartText}
              iconLeft={
                <ShoppingCart
                  size={scale(16)}
                  color={colors.primary}
                  strokeWidth={2.3}
                />
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
                    productImage: product.images[0],
                    rateChartId: selectedRateChartId,
                    category: product.subtitle,
                    price: product.price,
                    mrp: product.mrp,
                    unit: selectedPack || product.unit,
                    quantity,
                    packSizes: product.packSizes,
                  })
                }>
                <Text style={styles.checkoutText}>Check Out</Text>
                <ArrowRight
                  size={scale(15)}
                  color={colors.textInverse}
                  strokeWidth={3}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : null}
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
  documentsWrap: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  msdsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
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
  bottomBarSkeleton: {
    minHeight: scale(66),
  },
  footerPriceSkeleton: {
    flex: 1,
  },
  footerSkeletonGap: {
    marginTop: scale(7),
  },
  loadError: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadErrorText: {
    color: '#64748B',
    fontSize: scale(13),
    textAlign: 'center',
  },
  retryText: {
    color: colors.primary,
    fontSize: scale(13),
    fontWeight: '700',
    marginTop: spacing.md,
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
  image: {
    width: '100%',
    height: '100%',
  },
});

export default ProductDetailsScreen;
