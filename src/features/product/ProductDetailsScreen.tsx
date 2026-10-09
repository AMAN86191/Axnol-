import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {Download, FileText, Minus, Plus, X} from 'lucide-react-native';
import {CatalogueStackParamList} from '../../navigation/types';
import {useGetProductByIdQuery} from '../../api/services/catalogueApi';
import {useCreatePricingRequestMutation} from '../../api/services/pricingApi';
import {useCreateEnquiryMutation} from '../../api/services/enquiriesApi';
import {RootState, useAppSelector} from '../../store';
import AppImage from '../../components/ui/AppImage';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import ScreenHeader from '../../components/ui/ScreenHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import {
  colors,
  fontSize,
  radius,
  scale,
  spacing,
  typography,
  verticalScale,
} from '../../theme';

type Route = RouteProp<CatalogueStackParamList, 'ProductDetails'>;

const getErrorMessage = (err: any) =>
  err?.data?.message ?? 'Something went wrong. Please try again.';

export const ProductDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {params} = useRoute<Route>();
  const {data, isLoading} = useGetProductByIdQuery(params.productId);
  const [createReq, {isLoading: submitting}] = useCreatePricingRequestMutation();
  const [createEnquiry, {isLoading: submittingEnquiry}] =
    useCreateEnquiryMutation();
  const user = useAppSelector((s: RootState) => s.auth.user);
  const [qty, setQty] = useState('20');
  const [modalVisible, setModalVisible] = useState(false);
  const [ename, setEname] = useState(user?.name ?? '');
  const [eemail, setEemail] = useState(user?.email ?? '');
  const [ephone, setEphone] = useState(user?.phone ?? '');
  const [emessage, setEmessage] = useState('');

  if (isLoading || !data) {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title="Product Details"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </View>
    );
  }

  const hasDealer =
    data.dealerPrice != null && data.dealerPrice < data.price;
  const discount = hasDealer
    ? Math.round(
        ((data.price - (data.dealerPrice as number)) / data.price) * 100,
      )
    : 0;

  const changeQty = (delta: number) => {
    const current = Number(qty) || 1;
    setQty(String(Math.max(1, current + delta)));
  };

  const requestPricing = async () => {
    try {
      await createReq({
        productId: data.id,
        quantity: Number(qty) || 1,
      }).unwrap();
      Alert.alert(
        'Request Sent',
        'Your pricing request has been submitted. We will get back to you with the best price.',
        [
          {
            text: 'Track Requests',
            onPress: () =>
              navigation.navigate('Profile', {screen: 'PricingRequests'}),
          },
          {text: 'OK'},
        ],
      );
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    }
  };

  const submitEnquiry = async () => {
    if (
      !ename.trim() ||
      !eemail.trim() ||
      !ephone.trim() ||
      !emessage.trim()
    ) {
      Alert.alert(
        'Missing details',
        'Please fill in name, email, phone and message.',
      );
      return;
    }
    try {
      await createEnquiry({
        type: 'product',
        productId: data.id,
        productName: data.name,
        name: ename.trim(),
        email: eemail.trim(),
        phone: ephone.trim(),
        subject: 'Product enquiry: ' + data.name,
        message: emessage.trim(),
      }).unwrap();
      setModalVisible(false);
      Alert.alert(
        'Enquiry Sent',
        'Your enquiry has been submitted. Our team will contact you soon.',
      );
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    }
  };

  const openTds = async () => {
    if (!data.tdsUrl) {
      return;
    }
    try {
      await Linking.openURL(data.tdsUrl);
    } catch {
      Alert.alert('Error', 'Unable to open the document.');
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Product Details"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <AppImage uri={data.images[0]} style={styles.hero} />
        <View style={styles.sheet}>
          <View style={styles.brandChip}>
            <Text style={styles.brandText}>{data.brand.toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{data.name}</Text>

          {hasDealer ? (
            <View style={styles.priceBlock}>
              <Text style={styles.priceLabel}>Dealer Price</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceValue}>
                  ₹{(data.dealerPrice as number).toLocaleString('en-IN')}
                </Text>
                <Text style={styles.mrp}>
                  ₹{data.price.toLocaleString('en-IN')}
                </Text>
                <View style={styles.offChip}>
                  <Text style={styles.offText}>{discount}% OFF</Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={[styles.priceValue, styles.priceSolo]}>
              ₹{data.price.toLocaleString('en-IN')}
            </Text>
          )}

          <Text style={styles.desc}>{data.description}</Text>

          <View style={styles.section}>
            <SectionHeader title="Specifications" />
            <Card>
              {data.specs.map((s, i) => (
                <View
                  key={i}
                  style={[
                    styles.specRow,
                    i < data.specs.length - 1 && styles.specBorder,
                  ]}>
                  <Text style={styles.specLabel}>{s.label}</Text>
                  <Text style={styles.specValue}>{s.value}</Text>
                </View>
              ))}
            </Card>
          </View>

          <View style={styles.section}>
            <SectionHeader title="Pack Sizes" />
            <View style={styles.chips}>
              {data.packSizes.map((p, i) => (
                <View key={i} style={styles.packChip}>
                  <Text style={styles.packChipText}>{p}</Text>
                </View>
              ))}
            </View>
          </View>

          {data.tdsUrl ? (
            <View style={styles.section}>
              <SectionHeader title="Technical Documents" />
              <Card>
                <TouchableOpacity
                  style={styles.tdsRow}
                  activeOpacity={0.7}
                  onPress={openTds}>
                  <View style={styles.tdsIcon}>
                    <FileText size={scale(20)} color={colors.primary} />
                  </View>
                  <View style={styles.tdsInfo}>
                    <Text style={styles.tdsTitle}>Technical Data Sheet</Text>
                    <Text style={styles.tdsSub}>PDF • Download</Text>
                  </View>
                  <Download size={scale(20)} color={colors.primary} />
                </TouchableOpacity>
              </Card>
            </View>
          ) : null}

          <View style={styles.section}>
            <SectionHeader title="Quantity" />
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                activeOpacity={0.7}
                onPress={() => changeQty(-1)}>
                <Minus size={scale(18)} color={colors.text} />
              </TouchableOpacity>
              <TextInput
                value={qty}
                onChangeText={setQty}
                keyboardType="numeric"
                style={styles.qtyInput}
              />
              <TouchableOpacity
                style={styles.qtyBtn}
                activeOpacity={0.7}
                onPress={() => changeQty(1)}>
                <Plus size={scale(18)} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              title="Request Pricing"
              onPress={requestPricing}
              loading={submitting}
            />
            <View style={{height: spacing.md}} />
            <Button
              title="Send Enquiry"
              variant="outline"
              onPress={() => setModalVisible(true)}
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <ScrollView
            contentContainerStyle={styles.overlayContent}
            keyboardShouldPersistTaps="handled">
            <Card style={styles.modalCard}>
              <View style={styles.modalHead}>
                <Text style={styles.modalTitle}>Product Enquiry</Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  hitSlop={10}
                  onPress={() => setModalVisible(false)}>
                  <X size={scale(18)} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Input
                label="Name"
                placeholder="Your name"
                value={ename}
                onChangeText={setEname}
              />
              <Input
                label="Email"
                placeholder="you@company.com"
                value={eemail}
                onChangeText={setEemail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Phone"
                placeholder="Phone number"
                value={ephone}
                onChangeText={setEphone}
                keyboardType="phone-pad"
              />
              <Input
                label="Message"
                placeholder="How can we help?"
                value={emessage}
                onChangeText={setEmessage}
                multiline
                style={styles.messageInput}
              />
              <Button
                title="Submit Enquiry"
                onPress={submitEnquiry}
                loading={submittingEnquiry}
              />
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setModalVisible(false)}
                style={styles.cancelBtn}
              />
            </Card>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  loader: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  content: {paddingBottom: spacing.xxxl},
  hero: {width: '100%', height: verticalScale(250)},
  sheet: {
    backgroundColor: colors.surface,
    marginTop: -20,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
  },
  brandChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  brandText: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    color: colors.accentDark,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  name: {
    ...typography.bold,
    fontSize: fontSize.xl,
    color: colors.text,
    marginTop: spacing.md,
    lineHeight: fontSize.xl * 1.3,
  },
  priceBlock: {marginTop: spacing.lg},
  priceSolo: {marginTop: spacing.lg},
  priceLabel: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  priceValue: {
    ...typography.bold,
    fontSize: fontSize.xxl,
    color: colors.primary,
  },
  mrp: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  offChip: {
    backgroundColor: colors.successLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  offText: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    color: colors.success,
  },
  desc: {
    ...typography.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: fontSize.md * 1.55,
    marginTop: spacing.lg,
  },
  section: {marginTop: spacing.xxl},
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  specBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  specLabel: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  specValue: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  packChip: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  packChipText: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  tdsRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  tdsIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tdsInfo: {flex: 1},
  tdsTitle: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  tdsSub: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  qtyRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  qtyBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyInput: {
    width: 70,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    ...typography.semibold,
    fontSize: fontSize.lg,
    color: colors.text,
    textAlign: 'center',
  },
  actions: {marginTop: spacing.xxl},
  overlay: {flex: 1, backgroundColor: colors.overlay},
  overlayContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalCard: {width: '100%', alignSelf: 'center', borderRadius: radius.lg},
  modalHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.bold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  closeBtn: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageInput: {
    height: verticalScale(90),
    textAlignVertical: 'top',
  },
  cancelBtn: {marginTop: spacing.xs},
});
export default ProductDetailsScreen;
