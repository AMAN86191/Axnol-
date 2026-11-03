import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Heart, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'react-native';
import CommonHeader from '../../components/ui/CommonHeader';
import EmptyState from '../../components/ui/EmptyState';
import { toast } from '../../components/ui/ToastProvider';
import { colors, radius, scale, spacing } from '../../theme';
import { formatPrice } from '../../utils/formatPrice';
import { useAppSelector } from '../../store';
import { selectWishlistItems } from './wishlistSelectors';
import { useWishlist } from './useWishlist';
import { useCart } from '../cart/useCart';
import AddToCartButton from '../cart/components/AddToCartButton';
import PageHero, { DEFAULT_HERO_IMAGES } from '../../components/ui/PageHero';
import BrandFooter from '../../components/ui/BrandFooter';

export const WishlistScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const items = useAppSelector(selectWishlistItems);
  const { remove, clear } = useWishlist();
  const { add, items: cartItems } = useCart();
  console.log('items :', items);
  const totalValue = items.reduce(
    (sum, item) => sum + (item.price > 0 ? item.price : item.mrp ?? 0),
    0,
  );

  const handleClear = () => {
    toast.confirm(
      'Clear wishlist?',
      'This will remove all saved items.',
      () => {
        clear();
        toast.success('Wishlist Cleared', 'All saved items have been removed.');
      },
      'Clear',
    );
  };

  const handleAddAllToCart = async () => {
    const getCartKey = (
      productId: string | number,
      rateChartId?: string | number,
      size?: string,
    ) =>
      `${String(productId)}:${rateChartId !== undefined && rateChartId !== null
        ? String(rateChartId)
        : String(size ?? '')
      }`;
    const alreadyInCart = new Set(
      cartItems.map(item =>
        getCartKey(
          item.productId ?? item.id,
          item.rateChartId,
          item.size ?? item.unit,
        ),
      ),
    );
    const toAdd = items.filter(
      item =>
        !alreadyInCart.has(
          getCartKey(item.id, item.rateChartId, item.unit),
        ),
    );

    if (toAdd.length === 0) {
      toast.info(
        'Already in Cart',
        'All wishlist items are already in your cart.',
      );
      return;
    }

    let addedCount = 0;
    for (const item of toAdd) {
      const added = await add({
        id: item.id,
        name: item.name,
        code: item.code,
        image: item.image,
        price: item.price,
        mrp: item.mrp,
        unit: item.unit,
        rateChartId: item.rateChartId,
      });
      if (added) {
        addedCount += 1;
      }
    }

    if (addedCount > 0) {
      toast.success(
        'Added to Cart',
        `${addedCount} item(s) added to your cart.`,
      );
    }
  };

  const openProduct = (id: string) => {
    navigation.navigate('ProductDetails', { productId: id });
  };

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <CommonHeader title='Wishlist' />
        <ScrollView
          style={styles.scrollFlex}
          contentContainerStyle={{ paddingBottom: insets.bottom + scale(24) }}
          showsVerticalScrollIndicator={false}>
          <PageHero
            title="Wishlist"
            subtitle="Saved Products"
            images={DEFAULT_HERO_IMAGES}
          />
          <EmptyState
            variant="minimal"
            icon={Heart}
            title="Your wishlist is empty"
            subtitle="Tap the heart icon on any product to save it here for later."
            actionLabel="Browse Products"
            onAction={() => navigation.goBack()}
          />
          <BrandFooter title={'Your favourites,\nsaved with care'} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CommonHeader title='Wishlist' />

      <ScrollView
        style={styles.scrollFlex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <PageHero
            title="Wishlist"
            subtitle="Saved Products"
            images={DEFAULT_HERO_IMAGES}
          />
        </View>

        <View style={styles.summaryStrip}>
          <View style={styles.summaryTop}>
            <View style={styles.heartBadge}>
              <Heart
                size={scale(16)}
                color="#FFFFFF"
                fill="#FFFFFF"
                strokeWidth={2}
              />
            </View>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryCount}>
                {items.length} {items.length === 1 ? 'item' : 'items'} saved
              </Text>
              <Text style={styles.summaryHint}>
                Total value {formatPrice(totalValue)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.clearLink}
              activeOpacity={0.6}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Clear all saved items"
              onPress={handleClear}>
              <Trash2
                size={scale(13)}
                color={colors.textMuted}
                strokeWidth={2.2}
              />
              <Text style={styles.clearText}>Clear all</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.grid}>
          {items.map(item => (
            <View key={item.id} style={styles.card}>
              <TouchableOpacity
                style={styles.imgArea}
                activeOpacity={0.85}
                onPress={() => openProduct(item.id)}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.img}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.removeBtn}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                onPress={() => remove(item.id)}>
                <Heart
                  size={scale(14)}
                  color="#EF4444"
                  fill="#EF4444"
                  strokeWidth={2}
                />
              </TouchableOpacity>

              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              {item.code ? (
                <Text style={styles.code} numberOfLines={1}>
                  {item.code}
                </Text>
              ) : null}

              <View style={styles.priceRow}>
                <View style={styles.priceMain}>
                  <Text style={styles.price}>{formatPrice(item.price)}</Text>
                  {item.unit ? (
                    <Text style={styles.unit}> / {item.unit}</Text>
                  ) : null}
                </View>
                {item.mrp && item.mrp > item.price ? (
                  <Text style={styles.mrp}>{formatPrice(item.mrp)}</Text>
                ) : null}
              </View>

              <View style={styles.divider} />

              <View style={styles.ctaRow}>
                <AddToCartButton
                  product={{
                    id: item.id,
                    name: item.name,
                    code: item.code,
                    image: item.image,
                    price: item.price,
                    mrp: item.mrp,
                    unit: item.unit,
                    rateChartId: item.rateChartId,
                  }}
                  compact
                  disabled={Number(item.price) === 0}
                  style={styles.addBtn}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footerWrap}>
          <BrandFooter title={'Your favourites,\nsaved with care'} />
        </View>
      </ScrollView>


    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollFlex: { flex: 1 },
  // Hero and footer pad themselves, so cancel this list's padding and gap.
  heroWrap: {
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.md,
    marginBottom: -spacing.md,
  },
  footerWrap: {
    marginHorizontal: -spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  // Quiet text action: clearing everything shouldn't look like a main button.
  clearLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
  },
  clearText: {
    fontSize: scale(12),
    fontWeight: '600',
    color: colors.textSecondary,
  },
  summaryStrip: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    paddingVertical: scale(10),
    paddingHorizontal: spacing.md,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
  },
  heartBadge: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLeft: { flex: 1 },
  summaryCount: {
    fontSize: scale(13.5),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  summaryHint: {
    fontSize: scale(11.5),
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: scale(2),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: scale(10),
  },
  card: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: scale(18),
    borderWidth: 2,
    borderColor: colors.border,
    padding: scale(6),
  },
  imgArea: {
    height: scale(122),
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: '#E9F1FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(10),
    overflow: 'hidden',
  },
  img: {
    width: scale(112),
    height: scale(104),
  },
  removeBtn: {
    position: 'absolute',
    top: scale(12),
    right: scale(12),
    width: scale(25),
    height: scale(25),
    borderRadius: scale(14),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDF1F7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
    zIndex: 2,
  },
  name: {
    fontSize: scale(13),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    lineHeight: scale(17),
    marginBottom: scale(3),
  },
  code: {
    fontSize: scale(9.5),
    fontWeight: '600',
    color: '#94A3B8',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: scale(7),
    marginBottom: scale(9),
  },
  priceMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: scale(16),
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  unit: {
    fontSize: scale(9.5),
    fontWeight: '600',
    color: '#94A3B8',
  },
  mrp: {
    fontSize: scale(10),
    fontWeight: '600',
    color: '#B0BEC5',
    textDecorationLine: 'line-through',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: scale(10),
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: scale(6),
  },
  detailsBtn: {
    flex: 1,
    paddingHorizontal: scale(4),
    gap: scale(2),
  },
  addBtn: {
    flex: 1,
  },
  detailsText: {
    fontSize: scale(10),
    fontWeight: '700',
    flexShrink: 1,
  },

});

export default WishlistScreen;
