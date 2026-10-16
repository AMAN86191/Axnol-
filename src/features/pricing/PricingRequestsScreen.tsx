import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Building2,
  ChevronDown,
  Hash,
  Map,
  MapPin,
  MessageSquare,
  Package,
  Wallet,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppImage from '../../components/ui/AppImage';
import Input from '../../components/ui/Input';
import { colors, fontSize, radius, scale, spacing } from '../../theme';
import CommonHeader from '../../components/ui/CommonHeader';

export const PricingRequestsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();

  const productName = route.params?.productName ?? 'Gear Oil AX-200';
  const category = route.params?.category ?? 'Extreme Pressure Gear Oil';

  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState('Litre');
  const [expectedPrice, setExpectedPrice] = useState('');
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
      `Your price request for ${productName} (${quantity} ${unit}) has been submitted successfully!${addressLine ? `\nDelivery to: ${addressLine}` : ''
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
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>

          {/* Required Quantity */}
          <View style={styles.quantityRow}>
            <Input
              containerStyle={styles.quantityField}
              keyboardType="numeric"
              value={quantity}
              onChangeText={v => {
                setQuantity(v);
                clearError('quantity');
              }}
              placeholder="100"
              variant="clean"
              label="Required Quantity"
              leftIcon={Package}
              required
            />
            <TouchableOpacity
              style={styles.unitSelector}
              activeOpacity={0.8}
              onPress={() => {
                setUnit(unit === 'Litre' ? 'Barrel' : unit === 'Barrel' ? 'Kg' : 'Litre');
              }}>
              <Text style={styles.unitText}>{unit}</Text>
              <ChevronDown size={scale(16)} color="#64748B" />
            </TouchableOpacity>
          </View>
          {errors.quantity ? (
            <Text style={styles.errorText}>{errors.quantity}</Text>
          ) : null}

          {/* Expected Price (Optional) */}
          <Input
            label="Expected Price (Optional)"
            placeholder="Enter expected price"
            keyboardType="numeric"
            variant="clean"
            leftIcon={Wallet}
            value={expectedPrice}
            onChangeText={setExpectedPrice}
            containerStyle={styles.field}
          />

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
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  quantityField: {
    flex: 1,
    marginBottom: 0,
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
