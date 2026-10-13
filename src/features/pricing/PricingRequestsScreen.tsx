import React, {useState} from 'react';
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
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {ChevronDown, ChevronLeft, UploadCloud} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AppImage from '../../components/ui/AppImage';
import {colors, fontSize, radius, scale, spacing, typography} from '../../theme';

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
  const [hasUploaded, setHasUploaded] = useState(false);

  const handleSubmit = () => {
    Alert.alert(
      'Request Submitted',
      `Your price request for ${productName} (${quantity} ${unit}) has been submitted successfully!`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  };

  const handleUpload = () => {
    setHasUploaded(true);
    Alert.alert('Document Selected', 'spec_sheet.pdf (1.2 MB) attached successfully.');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + spacing.sm}]}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <ChevronLeft size={scale(24)} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Price</Text>
        <View style={{width: scale(24)}} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + scale(40)},
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
          <View style={styles.formGroup}>
            <Text style={styles.label}>Required Quantity</Text>
            <View style={styles.quantityRow}>
              <TextInput
                style={styles.quantityInput}
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
                placeholder="100"
                placeholderTextColor="#94A3B8"
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
          </View>

          {/* Expected Price (Optional) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Expected Price (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter expected price"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={expectedPrice}
              onChangeText={setExpectedPrice}
            />
          </View>

          {/* Remark (Optional) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Remark (Optional)</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Need dealer price for our project"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              value={remark}
              onChangeText={setRemark}
              textAlignVertical="top"
            />
          </View>

          {/* Attach Documents (Optional) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Attach Documents (Optional)</Text>
            <TouchableOpacity
              style={[styles.uploadBox, hasUploaded && styles.uploadBoxDone]}
              activeOpacity={0.8}
              onPress={handleUpload}>
              <View style={styles.uploadIconWrap}>
                <UploadCloud size={scale(24)} color="#0284C7" />
              </View>
              <Text style={styles.uploadTitle}>
                {hasUploaded ? 'Document Attached (1)' : 'Upload Document'}
              </Text>
              <Text style={styles.uploadSubtitle}>PDF, Image (Max 5 MB)</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Request Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.85}
            onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Submit Request</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  backBtn: {
    padding: scale(4),
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#0F172A',
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
    shadowOffset: {width: 0, height: 1},
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
  formGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#334155',
  },
  quantityRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quantityInput: {
    flex: 1,
    height: scale(46),
    backgroundColor: '#FFFFFF',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#0F172A',
  },
  unitSelector: {
    width: scale(110),
    height: scale(46),
    backgroundColor: '#FFFFFF',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#CBD5E1',
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
  input: {
    height: scale(46),
    backgroundColor: '#FFFFFF',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: spacing.md,
    fontSize: fontSize.sm,
    color: '#0F172A',
  },
  textarea: {
    minHeight: scale(85),
    backgroundColor: '#FFFFFF',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.sm,
    color: '#0F172A',
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#94A3B8',
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBoxDone: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  uploadIconWrap: {
    width: scale(46),
    height: scale(46),
    borderRadius: scale(23),
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  uploadTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#0F172A',
  },
  uploadSubtitle: {
    fontSize: fontSize.xs,
    color: '#94A3B8',
    marginTop: 2,
  },
  submitBtn: {
    height: scale(48),
    backgroundColor: '#0284C7',
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    shadowColor: '#0284C7',
    shadowOffset: {width: 0, height: 4},
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
