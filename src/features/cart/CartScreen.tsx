import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  CSSTransitionProperties,
  Easing,
  Keyframe,
  LinearTransition,
} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import {ShoppingBag, Trash2} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Image} from 'react-native';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import {colors, radius, scale, spacing} from '../../theme';
import {useAppSelector} from '../../store';
import {selectCartItems, selectCartTotals} from './cartSelectors';
import {getCartItemMutationKey, useCart} from './useCart';
import CommonHeader from '../../components/ui/CommonHeader';
import EditableQuantity from './components/EditableQuantity';
import PageHero, {PRODUCT_HERO_IMAGES} from '../../components/ui/PageHero';
import BrandFooter from '../../components/ui/BrandFooter';

const formatCartPrice = (value: number): string =>
  `₹${value.toLocaleString('en-IN', {maximumFractionDigits: 2})}`;

// A removed item eases out to the left while fading, then the rest glide up.
const REMOVE_EXIT = new Keyframe({
  0: {opacity: 1, transform: [{translateX: 0}]},
  100: {
    opacity: 0,
    transform: [{translateX: -Dimensions.get('window').width}],
    easing: Easing.in(Easing.cubic),
  },
}).duration(380);
const EMPTY_DELAY_MS = 420;
// Cards and the footer share this, so they glide up together.
const CARD_LAYOUT = LinearTransition.duration(280).delay(140);
// Smooth fade to red when a card starts being removed.
const CARD_COLOR_TRANSITION: CSSTransitionProperties = {
  transitionProperty: ['backgroundColor', 'borderColor'],
  transitionDuration: 250,
};

export const CartScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const items = useAppSelector(selectCartItems);
  const totals = useAppSelector(selectCartTotals);
  const {setQuantity, remove, fetchCart, isMutating, getDisplayQuantity} =
    useCart();
  const [refreshing, setRefreshing] = React.useState(false);
  const [removingItems, setRemovingItems] = React.useState<Set<string>>(
    () => new Set(),
  );

  // Show the "empty" screen only after the last item's exit animation is done.
  const [showEmpty, setShowEmpty] = React.useState(items.length === 0);
  React.useEffect(() => {
    if (items.length > 0) {
      setShowEmpty(false);
      return undefined;
    }
    const timer = setTimeout(() => setShowEmpty(true), EMPTY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [items.length]);

  React.useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCart(true, true);
    } finally {
      setRefreshing(false);
    }
  }, [fetchCart]);
  const handleCheckout = () => {
    navigation.navigate('RequestPrice');
  };

  const openProduct = (id: string | number) => {
    navigation.navigate('ProductDetails', {productId: String(id)});
  };

  const handleRemove = async (id: string | number) => {
    const key = String(id);
    // Marks the card as "being removed" (red) until the server has answered.
    setRemovingItems(current => new Set(current).add(key));
    try {
      await remove(id);
    } finally {
      setRemovingItems(current => {
        const next = new Set(current);
        next.delete(key);
        return next;
      });
    }
  };

  if (items.length === 0 && showEmpty) {
    return (
      <View style={[styles.container]}>
        <CommonHeader title='Cart' />
        <ScrollView
          style={styles.scrollFlex}
          contentContainerStyle={[
            styles.fillHeight,
            {paddingBottom: insets.bottom + scale(24)},
          ]}
          showsVerticalScrollIndicator={false}>
          <PageHero
            title="Your Cart"
            subtitle="Ready to Order"
            images={PRODUCT_HERO_IMAGES}
          />
          <EmptyState
            variant="minimal"
            icon={ShoppingBag}
            title="Your cart is empty"
            subtitle="Add products to your cart and they'll show up here."
            actionLabel="Browse Products"
            onAction={() => navigation.goBack()}
          />
          <View style={styles.footerPinned}>
            <BrandFooter title={'Quality delivered,\nto your door'} />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container]}>
      <CommonHeader title='Cart' />

      <ScrollView
        style={styles.scrollFlex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }>
        <View style={styles.heroWrap}>
          <PageHero
            title="Your Cart"
            subtitle="Ready to Order"
            images={PRODUCT_HERO_IMAGES}
          />
        </View>

        {/* <View style={styles.itemsHeader}>
          <Text style={styles.itemsCount}>
            {items.length} {items.length === 1 ? 'Product' : 'Products'}
          </Text>
          <Text style={styles.itemsCountHint}>
            {totals.itemCount} {totals.itemCount === 1 ? 'unit' : 'units'} total
          </Text>
        </View> */}

        {/* {totals.savings > 0 ? (
          <View style={styles.savingsBanner}>
            <Text style={styles.savingsBannerText}>
              You're saving {formatPrice(totals.savings)} on this order
            </Text>
          </View>
        ) : null} */}

        {items.map(item => {
          const lineTotal = item.lineTotal ?? item.price * item.quantity;
          const packLabel = item.packSize || item.size || item.unit;
          const itemId = item.cartItemId ?? item.id;
          const isDeleteLoading = removingItems.has(String(itemId));
          const isItemMutating =
            item.cartItemId != null &&
            isMutating(getCartItemMutationKey(item.cartItemId));

          return (
            // Slides out to the left when removed; the cards below glide up.
            <Animated.View
              key={String(item.cartItemId ?? item.id)}
              style={[
                styles.card,
                isDeleteLoading && styles.cardRemoving,
                CARD_COLOR_TRANSITION,
              ]}
              exiting={REMOVE_EXIT}
              layout={CARD_LAYOUT}>
              <TouchableOpacity
                style={styles.imageWrap}
                activeOpacity={0.8}
                onPress={() => openProduct(item.productId ?? item.id)}>
                <Image
                  source={{uri: item.image}}
                  style={styles.image}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <View style={styles.info}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => openProduct(item.productId ?? item.id)}>
                  <Text style={styles.name} numberOfLines={2}>
                    {item.name}
                  </Text>
                  {packLabel || item.code ? (
                    <Text style={styles.pack} numberOfLines={1}>
                      {packLabel || item.code}
                    </Text>
                  ) : null}
                </TouchableOpacity>

                <EditableQuantity
                  style={styles.qty}
                  value={getDisplayQuantity(item)}
                  min={0}
                  onChange={next => {
                    if (next <= 0) {
                      handleRemove(itemId);
                    } else {
                      setQuantity(itemId, next);
                    }
                  }}
                />
              </View>

              <View style={styles.side}>
                <View style={styles.priceWrap}>
                  <Text style={styles.lineTotal}>
                    {formatCartPrice(lineTotal)}
                  </Text>
                  {item.mrp && item.mrp > item.price ? (
                    <Text style={styles.mrp}>
                      {formatCartPrice(item.mrp * item.quantity)}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={styles.removeBtn}
                  activeOpacity={0.7}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                  disabled={isDeleteLoading || isItemMutating}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${item.name} from cart`}
                  accessibilityState={{
                    disabled: isDeleteLoading || isItemMutating,
                    busy: isDeleteLoading,
                  }}
                  onPress={() => handleRemove(itemId)}>
                  {isDeleteLoading ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <Trash2 size={scale(19)} color="#B0BAC9" strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          );
        })}

        {/* Moves with the cards (same timing) so it never overlaps a leaving one */}
        <Animated.View style={styles.footerWrap} layout={CARD_LAYOUT}>
          <BrandFooter title={'Quality delivered,\nto your door'} />
        </Animated.View>
      </ScrollView>

      {items.length > 0 ? (
        <View
          style={[
            styles.summary,
            {paddingBottom: Math.max(insets.bottom, spacing.md)},
          ]}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Subtotal ({totals.uniqueCount}{' '}
              {totals.uniqueCount === 1 ? 'product' : 'products'}, {totals.itemCount}{' '}
              {totals.itemCount === 1 ? 'unit' : 'units'})
            </Text>
            <Text style={styles.summaryValue}>{formatCartPrice(totals.subtotal)}</Text>
          </View>
          {totals.savings > 0 ? (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>MRP Total</Text>
                <Text style={styles.summaryMrp}>
                  {formatCartPrice(totals.mrpTotal)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={styles.summarySave}>
                  - {formatCartPrice(totals.savings)} ({totals.discountPercent}%)
                </Text>
              </View>
            </>
          ) : null}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              GST ({totals.gstRate ?? 18}%)
            </Text>
            <Text style={styles.summaryValue}>
              {formatCartPrice(totals.gstAmount ?? 0)}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>
              {formatCartPrice(totals.total ?? totals.subtotal + (totals.gstAmount ?? 0))}
            </Text>
          </View>

          <Button
            title="Proceed to Checkout"
            onPress={handleCheckout}
            style={styles.checkoutBtn}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8FAFC'},
  scrollFlex: {flex: 1},
  // Hero and footer pad themselves, so cancel this list's padding and gap.
  heroWrap: {
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.md,
    marginBottom: -spacing.md,
  },
  // The footer sits at the bottom of the screen when the content is short, so
  // it does not jump up while items are leaving or the cart is empty.
  fillHeight: {
    flexGrow: 1,
  },
  footerPinned: {
    marginTop: 'auto',
  },
  footerWrap: {
    marginHorizontal: -spacing.lg,
    marginTop: 'auto',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  itemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(2),
  },
  itemsCount: {
    fontSize: scale(12.5),
    fontWeight: '700',
    color: '#334155',
  },
  itemsCountHint: {
    fontSize: scale(10.5),
    fontWeight: '600',
    color: '#94A3B8',
  },
  savingsBanner: {
    backgroundColor: '#ECFDF5',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: scale(10),
    paddingHorizontal: spacing.md,
  },
  savingsBannerText: {
    fontSize: scale(12.5),
    fontWeight: '700',
    color: '#047857',
  },
  // Horizontal item card: photo | name, pack, quantity | price, remove.
  card: {
    flexDirection: 'row',
    gap: scale(12),
    backgroundColor: '#FFFFFF',
    borderRadius: scale(18),
    padding: scale(12),
    // Android draws elevation as a dark edge around a white card, so use a thin
    // light border there and keep the soft shadow for iOS only.
    borderWidth: 1,
    borderColor: '#EDF2F7',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: {width: 0, height: 3},
      },
      default: {},
    }),
  },
  // While a removal is waiting on the server: fade to red so it is clear.
  cardRemoving: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  imageWrap: {
    width: scale(82),
    height: scale(82),
    borderRadius: scale(16),
    backgroundColor: '#F3F5F8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {width: scale(70), height: scale(70)},
  info: {flex: 1, justifyContent: 'space-between'},
  name: {
    fontSize: scale(14),
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: scale(18),
    letterSpacing: -0.2,
  },
  pack: {
    fontSize: scale(12),
    fontWeight: '500',
    color: '#A7B0BD',
    marginTop: scale(3),
  },
  // Soft pill like the reference: no border, light fill, hugs its content.
  qty: {
    alignSelf: 'flex-start',
    height: scale(32),
    borderWidth: 0,
    borderRadius: scale(10),
    backgroundColor: '#F3F5F8',
    marginTop: scale(8),
  },
  side: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  priceWrap: {alignItems: 'flex-end'},
  lineTotal: {
    fontSize: scale(15),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  mrp: {
    fontSize: scale(11),
    fontWeight: '500',
    color: '#B0BEC5',
    textDecorationLine: 'line-through',
    marginTop: scale(2),
  },
  removeBtn: {
    width: scale(30),
    height: scale(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: scale(8),
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {fontSize: scale(12.5), fontWeight: '600', color: '#64748B'},
  summaryValue: {fontSize: scale(12.5), fontWeight: '700', color: '#0F172A'},
  summaryMrp: {
    fontSize: scale(12.5),
    fontWeight: '600',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  summarySave: {fontSize: scale(12.5), fontWeight: '800', color: '#047857'},
  summaryDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: scale(2),
  },
  totalLabel: {fontSize: scale(15), fontWeight: '800', color: '#0F172A'},
  totalValue: {
    fontSize: scale(17),
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  checkoutBtn: {marginTop: scale(4)},
});

export default CartScreen;
