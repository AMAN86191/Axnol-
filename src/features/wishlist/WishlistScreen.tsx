import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ChevronRight, Heart, Trash2} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AppImage from '../../components/ui/AppImage';
import Button from '../../components/ui/Button';
import CommonHeader from '../../components/ui/CommonHeader';
import EmptyState from '../../components/ui/EmptyState';
import {toast} from '../../components/ui/ToastProvider';
import {colors, radius, scale, spacing} from '../../theme';
import {formatPrice} from '../../utils/formatPrice';
import {useAppSelector} from '../../store';
import {selectWishlistItems} from './wishlistSelectors';
import {useWishlist} from './useWishlist';
import {useCart} from '../cart/useCart';
import AddToCartButton from '../cart/components/AddToCartButton';

export const WishlistScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const items = useAppSelector(selectWishlistItems);
  const {remove, clear} = useWishlist();
  const {add, items: cartItems} = useCart();

  const totalValue = items.reduce(
    (sum, item) => sum + (item.mrp ?? item.price),
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

  const handleAddAllToCart = () => {
    const alreadyInCart = new Set(cartItems.map(item => item.id));
    const toAdd = items.filter(item => !alreadyInCart.has(item.id));

    toAdd.forEach(item => {
      add({
        id: item.id,
        name: item.name,
        code: item.code,
        image: item.image,
        price: item.price,
        mrp: item.mrp,
        unit: item.unit,
      });
    });

    if (toAdd.length > 0) {
      toast.success(
        'Added to Cart',
        `${toAdd.length} item(s) added to your cart.`,
      );
    } else {
      toast.info(
        'Already in Cart',
        'All wishlist items are already in your cart.',
      );
    }
  };

  const openProduct = (id: string) => {
    navigation.navigate('HomeTabs', {
      screen: 'Products',
      params: {
        screen: 'ProductDetails',
        params: {productId: id},
        initial: false,
      },
    });
  };

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <CommonHeader title='Wishlist' />
        <View style={styles.emptyWrap}>
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            subtitle="Tap the heart icon on any product to save it here for later."
            actionLabel="Browse Products"
            onAction={() => navigation.navigate('HomeTabs', {screen: 'Home'})}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CommonHeader
        title='Wishlist'
        right={
          <TouchableOpacity
            style={styles.clearBtn}
            activeOpacity={0.75}
            onPress={handleClear}>
            <Trash2 size={scale(15)} color={colors.danger} strokeWidth={2.1} />
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollFlex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.summaryStrip}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryCount}>
              {items.length} {items.length === 1 ? 'item' : 'items'} saved
            </Text>
            <Text style={styles.summaryHint}>
              Total value {formatPrice(totalValue)}
            </Text>
          </View>
          <View style={styles.savedPill}>
            <Heart
              size={scale(12)}
              color="#EF4444"
              fill="#EF4444"
              strokeWidth={2}
            />
            <Text style={styles.savedPillText}>Saved</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {items.map(item => (
            <View key={item.id} style={styles.card}>
              <TouchableOpacity
                style={styles.imgArea}
                activeOpacity={0.85}
                onPress={() => openProduct(item.id)}>
                <AppImage
                  uri={item.image}
                  style={styles.img}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.removeBtn}
                activeOpacity={0.7}
                hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
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
                <Button
                  title="Details"
                  variant="outline"
                  size="small"
                  fullWidth={false}
                  style={styles.detailsBtn}
                  onPress={() => openProduct(item.id)}
                  iconRight={
                    <ChevronRight
                      size={scale(13)}
                      color={colors.primary}
                      strokeWidth={2.6}
                    />
                  }
                  textStyle={styles.detailsText}
                />
                <AddToCartButton
                  product={{
                    id: item.id,
                    name: item.name,
                    code: item.code,
                    image: item.image,
                    price: item.price,
                    mrp: item.mrp,
                    unit: item.unit,
                  }}
                  compact
                  style={styles.addBtn}
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {paddingBottom: Math.max(insets.bottom, spacing.md)},
        ]}>
        <Button
          title={`Add all to Cart (${items.length})`}
          onPress={handleAddAllToCart}
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
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    paddingHorizontal: scale(8),
    paddingVertical: scale(5),
    borderRadius: radius.md,
    backgroundColor: colors.dangerLight,
  },
  clearText: {
    fontSize: scale(12),
    fontWeight: '700',
    color: colors.danger,
  },
  summaryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    paddingVertical: scale(10),
    paddingHorizontal: spacing.md,
  },
  summaryLeft: {flex: 1},
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
  savedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: '#FEF2F2',
    borderRadius: radius.pill,
    paddingHorizontal: scale(9),
    paddingVertical: scale(4),
  },
  savedPillText: {
    fontSize: scale(11),
    fontWeight: '800',
    color: '#EF4444',
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
    shadowOffset: {width: 0, height: 1},
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
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});

export default WishlistScreen;
