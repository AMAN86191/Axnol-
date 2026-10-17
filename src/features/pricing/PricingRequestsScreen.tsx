import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Building2,
  Hash,
  Map,
  MapPin,
  MessageSquare,
  Minus,
  Plus,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppImage from '../../components/ui/AppImage';
import Input from '../../components/ui/Input';
import { colors, fontSize, radius, scale, spacing } from '../../theme';
import { formatPrice } from '../../utils/formatPrice';
import CommonHeader from '../../components/ui/CommonHeader';

const MIN_QUANTITY = 1;

export const PricingRequestsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();

  const productName = route.params?.productName ?? 'Gear Oil AX-200';
  const category = route.params?.category ?? 'Extreme Pressure Gear Oil';
  const price = route.params?.price as number | undefined;
  const mrp = route.params?.mrp as number | undefined;

  const availablePacks: string[] =
    (route.params?.packSizes as string[] | undefined)?.length
      ? (route.params.packSizes as string[])
      : ['1L', '5L', '20L', '210L'];

  const [quantity, setQuantity] = useState(
    route.params?.quantity != null ? String(route.params.quantity) : '100',
  );
  const [packSize, setPackSize] = useState(
    (route.params?.unit as string | undefined) ?? availablePacks[0],
  );
  const [remark, setRemark] = useState('Need dealer price for our project');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [pincode, setPincode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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
  };

  const handleDecrement = () => adjustQuantity(-1);
  const handleIncrement = () => adjustQuantity(1);

  const canDecrement = !isNaN(Number(quantity)) && Number(quantity) > MIN_QUANTITY;

  const handleSubmit = () => {
    const e: Record<string, string> = {};
    if (!quantity.trim()) {
      e.quantity = 'Quantity is required';
    } else if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
      e.quantity = 'Enter a valid quantity';
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

    const addressLine = [address, city, addressState, pincode]
      .filter(Boolean)
      .join(', ');
    Alert.alert(
      'Request Submitted',
      `Your price request for ${productName} (${quantity} ${packSize}) has been submitted successfully!${addressLine ? `\nDelivery to: ${addressLine}` : ''
      }`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  };



  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />


      <CommonHeader title="Request Price" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + scale(40) },
        ]}>

        {/* Selected Product Card */}
        <View style={styles.productCard}>
          <View style={styles.productImgWrap}>
            <AppImage
              uri="product_drum"
              style={styles.productImg}
              resizeMode="contain"
            />
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{productName}</Text>
            <Text style={styles.productSubtitle}>{category}</Text>
            {price != null ? (
              <View style={styles.productPriceRow}>
                <Text style={styles.productPrice}>{formatPrice(price)}</Text>
                {packSize ? (
                  <Text style={styles.productPriceUnit}> / {packSize}</Text>
                ) : null}
                {mrp != null && mrp > price ? (
                  <Text style={styles.productPriceMrp}>{formatPrice(mrp)}</Text>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>

          {/* Required Quantity */}
          <View style={styles.quantityBlock}>
            <Text style={styles.qtyLabel}>
              Required Quantity
              <Text style={styles.requiredStar}> *</Text>
            </Text>

            <View style={styles.quantityRow}>
              <View
                style={[
                  styles.stepper,
                  errors.quantity ? styles.stepperError : null,
                ]}>
                <TouchableOpacity
                  style={[styles.stepBtn, !canDecrement && styles.stepBtnDisabled]}
                  activeOpacity={0.7}
                  disabled={!canDecrement}
                  onPress={handleDecrement}>
                  <Minus
                    size={scale(18)}
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
                  <Plus size={scale(18)} color="#0F172A" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              
            </View>

            {errors.quantity ? (
              <Text style={styles.errorText}>{errors.quantity}</Text>
            ) : null}
          </View>

          {/* Available Pack Sizes */}
          <View style={styles.packBlock}>
            <Text style={styles.qtyLabel}>Pack Size</Text>
            <View style={styles.packRow}>
              {availablePacks.map(size => {
                const selected = size === packSize;
                return (
                  <TouchableOpacity
                    key={size}
                    style={[styles.packPill, selected && styles.packPillSelected]}
                    activeOpacity={0.8}
                    onPress={() => setPackSize(size)}>
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

        

          {/* Remark (Optional) */}
          <Input
            label="Remark (Optional)"
            placeholder="Need dealer price for our project"
            variant="clean"
            leftIcon={MessageSquare}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={remark}
            onChangeText={setRemark}
            containerStyle={styles.field}
          />



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
              leftIcon={Hash}
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
          </View>

          {/* Submit Request Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.85}
            onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Check Out</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: scale(15),
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
    alignItems: 'baseline',
    marginTop: scale(5),
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
  productPriceMrp: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#B0BEC5',
    textDecorationLine: 'line-through',
    marginLeft: scale(7),
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
  quantityBlock: {
    gap: 0,
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
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: scale(46),
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  stepperError: {
    borderColor: colors.danger,
  },
  stepBtn: {
    width: scale(46),
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
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default PricingRequestsScreen;
