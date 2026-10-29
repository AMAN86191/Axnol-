import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Building2,
  Check,
  ClipboardList,
  Home as HomeIcon,
  Map,
  MapPin,
  MessageSquare,
  Minus,
  Plus,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {Image} from 'react-native';
import Input from '../../components/ui/Input';
import { colors, fontSize, radius, scale, spacing } from '../../theme';
import { formatPrice } from '../../utils/formatPrice';
import CommonHeader from '../../components/ui/CommonHeader';
import { toast } from '../../components/ui/ToastProvider';
import { useAppDispatch, useAppSelector } from '../../store';
import { confirmOrderSlice } from '../../redux/OrderSlice';
import { ConfirmOrderItem } from '../../api/OrderProvider';
import { useCart } from '../cart/useCart';

const MIN_QUANTITY = 1;

interface SubmitSuccessModalProps {
  visible: boolean;
  onOrderHistory: () => void;
  onHome: () => void;
}

const CONFETTI_COLORS = [
  '#F59E0B',
  '#EF4444',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
];
const CONFETTI_COUNT = 16;

interface ConfettiParticleProps {
  active: boolean;
  index: number;
  color: string;
}

const ConfettiParticle: React.FC<ConfettiParticleProps> = ({
  active,
  index,
  color,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (active) {
      progress.value = withDelay(
        160 + index * 22,
        withRepeat(
          withTiming(1, { duration: 1100, easing: Easing.out(Easing.quad) }),
          -1,
          false,
        ),
      );
    }
    return () => {
      cancelAnimation(progress);
    };
  }, [active, index, progress]);

  const angle = (index / CONFETTI_COUNT) * Math.PI * 2;
  const distance = scale(52 + (index % 3) * 12);

  const particleStyle = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      opacity: p === 0 ? 0 : 1 - p,
      transform: [
        { translateX: Math.cos(angle) * distance * p },
        { translateY: Math.sin(angle) * distance * p },
        { scale: 1 - p * 0.5 },
        { rotate: `${p * 320}deg` },
      ],
    };
  });

  const shape =
    index % 3 === 0
      ? styles.confettiCircle
      : index % 3 === 1
        ? styles.confettiSquare
        : styles.confettiSliver;

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        shape,
        { backgroundColor: color },
        particleStyle,
      ]}
    />
  );
};

const SubmitSuccessModal: React.FC<SubmitSuccessModalProps> = ({
  visible,
  onOrderHistory,
  onHome,
}) => {
  const cardScale = useSharedValue(0.8);
  const iconScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      cardScale.value = withSpring(1, {
        damping: 15,
        stiffness: 180,
        mass: 0.8,
      });
      iconScale.value = withDelay(
        140,
        withSpring(1, { damping: 9, stiffness: 220 }),
      );
    } else {
      cardScale.value = 0.8;
      iconScale.value = 0;
    }
  }, [visible, cardScale, iconScale]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onHome}>
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalCard, cardStyle]}>
          <View style={styles.modalIconArea}>
            <Animated.View style={[styles.modalIconWrap, iconStyle]}>
              <Check size={scale(34)} color="#FFFFFF" strokeWidth={3} />
            </Animated.View>
            {visible
              ? Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
                <ConfettiParticle
                  key={i}
                  index={i}
                  active={visible}
                  color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
                />
              ))
              : null}
          </View>

          <Text style={styles.modalTitle}>Order Confirmed</Text>
          <Text style={styles.modalMessage}>
            Your order has been confirmed successfully.
          </Text>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnPrimary]}
              activeOpacity={0.85}
              onPress={onOrderHistory}>
              <ClipboardList size={scale(17)} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.modalBtnText}>Order History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnSecondary]}
              activeOpacity={0.85}
              onPress={onHome}>
              <HomeIcon size={scale(17)} color={colors.primary} strokeWidth={2.4} />
              <Text style={[styles.modalBtnText, styles.modalBtnTextSecondary]}>
                Home
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export const PricingRequestsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const submitting = useAppSelector(s => s.order.loading);
  const cartLoading = useAppSelector(s => s.cart.loading);
  const { items: cartItems, totals: cartTotals, fetchCart, clear } = useCart();

  const hasDirectProduct = Boolean(
    route.params?.productId || route.params?.productName,
  );
  const isCartCheckout = !hasDirectProduct;
  const directProductId = route.params?.productId as
    | string
    | number
    | undefined;
  const directProductName = route.params?.productName ?? 'Product';
  const directCategory = route.params?.category ?? '';
  const directPrice = route.params?.price as number | undefined;
  const directImage = route.params?.productImage as string | undefined;
  const directRateChartId = route.params?.rateChartId as
    | string
    | number
    | undefined;
  const productName = directProductName;
  const category = directCategory;
  const price = directPrice;

  const companyFromUser =
    (typeof user?.company === 'string'
      ? user.company
      : user?.company?.company_name) || '';

  const [quantity, setQuantity] = useState(
    route.params?.quantity != null ? String(route.params.quantity) : '1',
  );
  const [remark, setRemark] = useState('');
  const [companyName, setCompanyName] = useState(companyFromUser);
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [addressState, setAddressState] = useState(user?.state ?? '');
  const [pincode, setPincode] = useState(user?.pincode ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isCartCheckout) {
      fetchCart();
    }
  }, [fetchCart, isCartCheckout]);

  useEffect(() => {
    if (!companyName && companyFromUser) {
      setCompanyName(companyFromUser);
    }
    if (!phone && user?.phone) {
      setPhone(user.phone);
    }
    if (!address && user?.address) {
      setAddress(user.address);
    }
    if (!city && user?.city) {
      setCity(user.city);
    }
    if (!addressState && user?.state) {
      setAddressState(user.state);
    }
    if (!pincode && user?.pincode) {
      setPincode(user.pincode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyFromUser, user?.phone, user?.address, user?.city, user?.state, user?.pincode]);

  const clearError = (key: string) =>
    setErrors(prev => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const adjustQuantity = (delta: number) => {
    const current = Number(quantity);
    const base = isNaN(current) ? 0 : Math.floor(current);
    const next = Math.max(MIN_QUANTITY, base + delta);
    setQuantity(String(next));
    clearError('quantity');
    clearError('calculatedPrice');
  };

  const handleDecrement = () => adjustQuantity(-1);
  const handleIncrement = () => adjustQuantity(1);

  const canDecrement = !isNaN(Number(quantity)) && Number(quantity) > MIN_QUANTITY;

  const qtyNum = Number(quantity);
  const validQty = !quantity.trim() || isNaN(qtyNum) || qtyNum <= 0 ? 0 : qtyNum;
  const calculatedPrice = isCartCheckout
    ? cartItems.length > 0 && cartTotals.subtotal > 0
      ? cartTotals.subtotal
      : null
    : price != null && validQty > 0
    ? price * validQty
    : null;

  const orderItems: ConfirmOrderItem[] = isCartCheckout
    ? cartItems
        .map(item => ({
          product_id: Number(item.productId ?? item.id),
          rate_chart_id: Number(item.rateChartId),
          qty: Number(item.quantity),
        }))
        .filter(
          item =>
            Number.isFinite(item.product_id) &&
            item.product_id > 0 &&
            Number.isFinite(item.rate_chart_id) &&
            item.rate_chart_id > 0 &&
            Number.isFinite(item.qty) &&
            item.qty > 0,
        )
    : directProductId != null &&
      directRateChartId != null &&
      Number.isFinite(Number(directProductId)) &&
      Number.isFinite(Number(directRateChartId)) &&
      validQty > 0
    ? [
        {
          product_id: Number(directProductId),
          rate_chart_id: Number(directRateChartId),
          qty: validQty,
        },
      ]
    : [];

  const handleSubmit = async () => {
    const e: Record<string, string> = {};
    if (!isCartCheckout) {
      if (!quantity.trim()) {
        e.quantity = 'Quantity is required';
      } else if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
        e.quantity = 'Enter a valid quantity';
      }
    }
    if (calculatedPrice == null) {
      e.calculatedPrice = isCartCheckout
        ? 'Your cart is empty'
        : 'Calculated price is not available';
    }
    if (orderItems.length === 0) {
      e.items = isCartCheckout
        ? 'Cart items are missing product or rate chart details'
        : 'A valid pack size is required to place this order';
    } else if (isCartCheckout && orderItems.length !== cartItems.length) {
      e.items = 'Some cart items are missing rate chart details';
    }
    if (!companyName.trim()) {
      e.companyName = 'Company name is required';
    }
    if (!phone.trim()) {
      e.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone.trim())) {
      e.phone = 'Enter a valid 10-digit phone number';
    }
    if (!address.trim()) {
      e.address = 'Full address is required';
    }
    if (!city.trim()) {
      e.city = 'City is required';
    }
    if (!addressState.trim()) {
      e.addressState = 'State is required';
    }
    if (!pincode.trim()) {
      e.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(pincode.trim())) {
      e.pincode = 'Enter a 6-digit pincode';
    }
    setErrors(e);
    if (Object.keys(e).length > 0) {
      return;
    }

    try {
      const response = await dispatch(
        confirmOrderSlice({
          items: orderItems,
          address: address.trim(),
          city: city.trim(),
          state: addressState.trim(),
          pincode: pincode.trim(),
          company_name: companyName.trim(),
          phone: phone.trim(),
          remark: remark.trim(),
        }),
      ).unwrap();
      if (response?.status !== true) {
        throw new Error(
          response?.message || 'Unable to confirm your order. Please try again.',
        );
      }
      Keyboard.dismiss();
      setSubmitted(true);
      setShowSuccess(true);
      if (isCartCheckout) {
        await clear();
      }
    } catch (err: any) {
      toast.error(
        'Order Failed',
        err?.message || 'Unable to confirm your order. Please try again.',
      );
    }
  };

  const handleOrderHistory = () => {
    setShowSuccess(false);
    navigation.popToTop();
    navigation.navigate('Drawer', {
      screen: 'HomeTabs',
      params: {
        screen: 'Orders',
        params: { screen: 'OrdersList' },
      },
    });
  };

  const handleHome = () => {
    setShowSuccess(false);
    navigation.popToTop();
    navigation.navigate('Drawer', {
      screen: 'HomeTabs',
      params: { screen: 'Home' },
    });
  };



  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />


      <CommonHeader title={isCartCheckout ? 'Checkout' : 'Request a Quote'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + scale(50) },
        ]}>

        {isCartCheckout ? (
          <View style={styles.productCard}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            {cartLoading && cartItems.length === 0 ? (
              <ActivityIndicator
                style={styles.cartLoader}
                color={colors.primary}
              />
            ) : cartItems.length > 0 ? (
              <>
                {cartItems.map((item, index) => (
                  <View
                    key={String(item.cartItemId ?? item.id)}
                    style={[
                      styles.cartProduct,
                      index > 0 && styles.cartProductDivider,
                    ]}>
                    <View style={styles.productImgWrap}>
                      {item.image ? (
                        <Image
                          source={{uri: item.image}}
                          style={styles.productImg}
                          resizeMode="contain"
                        />
                      ) : null}
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {item.name || 'Product'}
                      </Text>
                      {item.code ? (
                        <Text style={styles.productSubtitle} numberOfLines={1}>
                          {item.code}
                        </Text>
                      ) : null}
                      <View style={styles.cartPriceRow}>
                        <Text style={styles.cartUnitPrice}>
                          {formatPrice(item.price)} each
                        </Text>
                        <Text style={styles.productPriceUnit}>
                          Qty: {item.quantity}
                        </Text>
                        <Text style={styles.productPrice}>
                          {formatPrice(
                            item.lineTotal ?? item.price * item.quantity,
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
                <View style={styles.cartTotalRow}>
                  <Text style={styles.cartTotalLabel}>Order Total</Text>
                  <Text style={styles.cartTotalValue}>
                    {formatPrice(cartTotals.subtotal)}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.emptyCartText}>
                Your cart is empty. Add products before checkout.
              </Text>
            )}
            {errors.calculatedPrice ? (
              <Text style={styles.errorText}>{errors.calculatedPrice}</Text>
            ) : null}
            {errors.items ? (
              <Text style={styles.errorText}>{errors.items}</Text>
            ) : null}
          </View>
        ) : (
          <View style={styles.productCard}>
            <View style={styles.productTop}>
              <View style={styles.productImgWrap}>
                {directImage ? (
                  <Image
                    source={{uri: directImage}}
                    style={styles.productImg}
                    resizeMode="contain"
                  />
                ) : null}
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{productName}</Text>
                {category ? (
                  <Text style={styles.productSubtitle}>{category}</Text>
                ) : null}
                {price != null ? (
                  <View style={styles.productPriceRow}>
                    <View style={styles.productPriceLeft}>
                      <Text style={styles.productPrice}>
                        {formatPrice(calculatedPrice ?? price)}
                      </Text>
                      <Text style={styles.productPriceUnit}>Qty: {quantity}</Text>
                    </View>
                    <View
                      style={[
                        styles.stepper,
                        errors.quantity ? styles.stepperError : null,
                      ]}>
                      <TouchableOpacity
                        style={[
                          styles.stepBtn,
                          !canDecrement && styles.stepBtnDisabled,
                        ]}
                        activeOpacity={0.7}
                        disabled={!canDecrement}
                        onPress={handleDecrement}>
                        <Minus
                          size={scale(16)}
                          color={canDecrement ? '#0F172A' : '#CBD5E1'}
                          strokeWidth={2.5}
                        />
                      </TouchableOpacity>

                      <TextInput
                        style={styles.stepValue}
                        value={quantity}
                        onChangeText={v => {
                          setQuantity(v.replace(/[^0-9]/g, ''));
                          clearError('quantity');
                          clearError('calculatedPrice');
                        }}
                        keyboardType="numeric"
                        maxLength={7}
                        selectTextOnFocus
                        placeholder="0"
                        placeholderTextColor="#94A3B8"
                      />

                      <TouchableOpacity
                        style={styles.stepBtn}
                        activeOpacity={0.7}
                        onPress={handleIncrement}>
                        <Plus
                          size={scale(16)}
                          color="#0F172A"
                          strokeWidth={2.5}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.productPriceMissing}>
                    Price not available
                  </Text>
                )}
              </View>
            </View>
            {errors.quantity ? (
              <Text style={styles.errorText}>{errors.quantity}</Text>
            ) : null}
            {errors.calculatedPrice ? (
              <Text style={styles.errorText}>{errors.calculatedPrice}</Text>
            ) : null}
            {errors.items ? (
              <Text style={styles.errorText}>{errors.items}</Text>
            ) : null}
          </View>
        )}

        {/* Form Fields */}
        <View style={styles.formContainer}>


          {/* Company / Contact */}
          {/* <View style={styles.addressSection}>
            <Text style={styles.sectionTitle}>Company Details</Text>

            <Input
              label="Company Name"
              placeholder="Enter company name"
              variant="clean"
              leftIcon={Building2}
              required
              error={errors.companyName}
              value={companyName}
              onChangeText={v => {
                setCompanyName(v);
                clearError('companyName');
              }}
              containerStyle={styles.field}
            />

            <Input
              label="Phone"
              placeholder="Enter 10-digit phone number"
              variant="clean"
              leftIcon={Phone}
              required
              error={errors.phone}
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={v => {
                setPhone(v.replace(/[^0-9]/g, ''));
                clearError('phone');
              }}
              containerStyle={styles.field}
            />
          </View> */}

          {/* Delivery Address */}
          <View style={styles.addressSection}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>

            <Input
              label="Full Address"
              placeholder="House no, Street, Area, Landmark"
              variant="clean"
              leftIcon={MapPin}
              required
              error={errors.address}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={address}
              onChangeText={v => {
                setAddress(v);
                clearError('address');
              }}
              containerStyle={styles.field}
            />

            <View style={styles.row}>
              <Input
                label="City"
                placeholder="City"
                variant="clean"
                leftIcon={Building2}
                required
                error={errors.city}
                value={city}
                onChangeText={v => {
                  setCity(v);
                  clearError('city');
                }}
                containerStyle={styles.fieldRow}
              />
              <Input
                label="State"
                placeholder="State"
                variant="clean"
                leftIcon={Map}
                required
                error={errors.addressState}
                value={addressState}
                onChangeText={v => {
                  setAddressState(v);
                  clearError('addressState');
                }}
                containerStyle={styles.fieldRow}
              />
            </View>

            <Input
              label="Pincode"
              placeholder="Pincode"
              variant="clean"
              required
              error={errors.pincode}
              keyboardType="numeric"
              maxLength={6}
              value={pincode}
              onChangeText={v => {
                setPincode(v);
                clearError('pincode');
              }}
              containerStyle={styles.field}
            />
            {/* Remark (Optional) */}
            <Input
              label="Remark (Optional)"
              placeholder="Urgent delivery"
              variant="clean"
              leftIcon={MessageSquare}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={remark}
              onChangeText={setRemark}
              containerStyle={styles.field}
            />

          </View>

          {/* Submit Request Button */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              submitted && styles.submitBtnDone,
              submitting && styles.submitBtnDisabled,
            ]}
            activeOpacity={0.85}
            disabled={submitted || submitting}
            onPress={handleSubmit}>
            {submitting ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Confirming...</Text>
              </>
            ) : submitted ? (
              <>
                <Check size={scale(18)} color="#FFFFFF" strokeWidth={3} />
                <Text style={styles.submitBtnText}>Order Confirmed</Text>
              </>
            ) : (
              <Text style={styles.submitBtnText}>Confirm Order</Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>

      {showSuccess ? (
        <SubmitSuccessModal
          visible
          onOrderHistory={handleOrderHistory}
          onHome={handleHome}
        />
      ) : null}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: spacing.lg,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  productTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImgWrap: {
    width: scale(56),
    height: scale(56),
    borderRadius: radius.sm,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(4),
    marginRight: spacing.md,
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: scale(13.5),
    fontWeight: '700',
    color: '#0F172A',
  },
  productSubtitle: {
    fontSize: fontSize.xs,
    color: '#64748B',
    marginTop: 2,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginTop: scale(8),
    gap: spacing.sm,
  },
  productPriceLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexShrink: 1,
  },
  productPrice: {
    fontSize: scale(16),
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  productPriceUnit: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#94A3B8',
  },
  productPriceMissing: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: scale(5),
  },
  cartLoader: {
    marginVertical: spacing.lg,
  },
  cartProduct: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartProductDivider: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cartPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: scale(6),
  },
  cartUnitPrice: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#64748B',
  },
  cartTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cartTotalLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#0F172A',
  },
  cartTotalValue: {
    fontSize: scale(18),
    fontWeight: '800',
    color: colors.primary,
  },
  emptyCartText: {
    paddingVertical: spacing.md,
    textAlign: 'center',
    fontSize: fontSize.sm,
    color: '#64748B',
  },
  formContainer: {
    gap: spacing.lg,
  },
  addressSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  field: {
    marginBottom: 0,
  },
  fieldRow: {
    flex: 1,
    marginBottom: 0,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  qtyRowLabel: {
    fontSize: scale(13),
    fontWeight: '600',
    color: '#1E293B',
  },
  qtyLabel: {
    fontSize: scale(13),
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: scale(6),
  },
  requiredStar: {
    color: '#EF4444',
    fontWeight: '700',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: scale(33),
    width: scale(132),
    backgroundColor: '#FFFFFF',
    borderRadius: radius.sm,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  stepperError: {
    borderColor: colors.danger,
  },
  stepBtn: {
    width: scale(36),
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.55,
  },
  stepValue: {
    flex: 1,
    height: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: scale(15),
    fontWeight: '700',
    color: '#0F172A',
    paddingVertical: 0,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#EEF2F6',
  },
  unitSelector: {
    width: scale(110),
    height: scale(46),
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  unitText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#334155',
  },
  errorText: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: colors.danger,
  },
  packBlock: {
    gap: 0,
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
  submitBtn: {
    height: scale(48),
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    marginTop: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnDone: {
    backgroundColor: '#16A34A',
    shadowColor: '#16A34A',
  },
  submitBtnDisabled: {
    opacity: 0.75,
  },
  submitBtnText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 8,
  },
  modalIconArea: {
    width: scale(150),
    height: scale(130),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  modalIconWrap: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  confettiPiece: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -scale(5),
    marginTop: -scale(5),
  },
  confettiCircle: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
  },
  confettiSquare: {
    width: scale(9),
    height: scale(9),
    borderRadius: scale(2),
  },
  confettiSliver: {
    width: scale(5),
    height: scale(13),
    borderRadius: scale(2),
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: scale(8),
  },
  modalMessage: {
    fontSize: fontSize.sm,
    color: '#475569',
    textAlign: 'center',
    lineHeight: scale(20),
    paddingHorizontal: scale(6),
  },
  modalActions: {
    flexDirection: 'row',
    gap: scale(10),
    marginTop: spacing.xl,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    height: scale(48),
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
  },
  modalBtnPrimary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  modalBtnSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.4,
    borderColor: colors.primary,
  },
  modalBtnText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalBtnTextSecondary: {
    color: colors.primary,
  },
});

export default PricingRequestsScreen;
