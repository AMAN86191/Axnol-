import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ShoppingBag} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Image} from 'react-native';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import {colors, radius, scale, spacing} from '../../theme';
import {formatPrice} from '../../utils/formatPrice';
import {useAppSelector} from '../../store';
import {selectCartItems, selectCartTotals} from './cartSelectors';
import {useCart} from './useCart';
import CommonHeader from '../../components/ui/CommonHeader';
import EditableQuantity from './components/EditableQuantity';

export const CartScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const items = useAppSelector(selectCartItems);
  const totals = useAppSelector(selectCartTotals);
  const {setQuantity, remove, fetchCart} = useCart();
  const [refreshing, setRefreshing] = React.useState(false);

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

  if (items.length === 0) {
    return (
      <View style={[styles.container]}>
        <CommonHeader title='Cart' />
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          subtitle="Add products to your cart and they'll show up here."
        />
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

          return (
            <View
              key={String(item.cartItemId ?? item.id)}
              style={styles.card}>
              <View style={styles.cardTop}>
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
                    {item.code ? (
                      <Text style={styles.code}>{item.code}</Text>
                    ) : null}

                    <View style={styles.priceRow}>
                      <Text style={styles.price}>{formatPrice(item.price)}</Text>
                      {packLabel ? (
                        <Text style={styles.unit}> / {packLabel}</Text>
                      ) : null}
                      {item.mrp && item.mrp > item.price ? (
                        <Text style={styles.mrp}>{formatPrice(item.mrp)}</Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.removeBtn}
                    activeOpacity={0.7}
                    hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}
                    onPress={() => remove(item.cartItemId ?? item.id)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardBottom}>
                <View style={styles.qtyControl}>
                  <Text style={styles.qtyLabel}>Qty</Text>
                  <EditableQuantity
                    value={item.quantity}
                    onChange={next =>
                      setQuantity(item.cartItemId ?? item.id, next)
                    }
                  />
                </View>

                <View style={styles.lineTotalWrap}>
                  <Text style={styles.lineTotalLabel}>Subtotal</Text>
                  <Text style={styles.lineTotal}>{formatPrice(lineTotal)}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View
        style={[
          styles.summary,
          {paddingBottom: Math.max(insets.bottom, spacing.md)},
        ]}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Subtotal ({totals.itemCount}{' '}
            {totals.itemCount === 1 ? 'item' : 'items'})
          </Text>
          <Text style={styles.summaryValue}>{formatPrice(totals.subtotal)}</Text>
        </View>
        {totals.savings > 0 ? (
          <>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>MRP Total</Text>
              <Text style={styles.summaryMrp}>
                {formatPrice(totals.mrpTotal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summarySave}>
                - {formatPrice(totals.savings)} ({totals.discountPercent}%)
              </Text>
            </View>
          </>
        ) : null}

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total Payable</Text>
          <Text style={styles.totalValue}>{formatPrice(totals.subtotal)}</Text>
        </View>

        <Button
          title="Proceed to Checkout"
          onPress={handleCheckout}
          style={styles.checkoutBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8FAFC'},
  scrollFlex: {flex: 1},
  scrollContent: {
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    padding: scale(11),
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  imageWrap: {
    width: scale(80),
    height: scale(80),
    borderRadius: radius.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E9F1FA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {width: scale(68), height: scale(68)},
  info: {flex: 1, justifyContent: 'center'},
  name: {
    fontSize: scale(13.5),
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: scale(18),
    letterSpacing: -0.2,
  },
  code: {
    fontSize: scale(9.5),
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: scale(2),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: scale(4),
  },
  price: {
    fontSize: scale(15),
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  unit: {fontSize: scale(10), fontWeight: '600', color: '#94A3B8'},
  mrp: {
    fontSize: scale(11),
    fontWeight: '600',
    color: '#B0BEC5',
    textDecorationLine: 'line-through',
    marginLeft: scale(6),
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: scale(3),
    marginTop: scale(6),
    // paddingVertical: scale(1),
    paddingHorizontal: scale(7),
    borderRadius: radius.pill,
    backgroundColor: '#fbfbfb',
  },
  removeText: {
    fontSize: scale(9.5),
    fontWeight: '700',
    color: "#000",
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: scale(9),
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(7),
  },
  qtyLabel: {
    fontSize: scale(10.5),
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  lineTotalWrap: {alignItems: 'flex-end'},
  lineTotalLabel: {
    fontSize: scale(9),
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: scale(1),
  },
  lineTotal: {
    fontSize: scale(15),
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.3,
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
