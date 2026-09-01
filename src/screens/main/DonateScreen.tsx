import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ShieldCheck,
  Heart,
  RefreshCw,
  Gift,
  CheckCircle2,
  Lock,
  ChevronRight,
  Users,
  FileText,
  Leaf,
  Shield
} from 'lucide-react-native';

import { Colors } from '../../theme/colors';
import { RootStackParamList } from '../../navigation/types';
import { PrimaryHeader } from '../../components/PrimaryHeader';
import { InputField } from '../../components/InputField';
import useHomeStore from '../../zustand/useHomeStore';
import useAuthStore from '../../zustand/useAuthStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DonateScreen'>;

const PRESET_AMOUNTS: Array<{ amount: number | 'custom', desc: string }> = [
  { amount: 100, desc: 'Feed for 1 day' },
  { amount: 500, desc: 'Feed 1 cow for 1 week' },
  { amount: 1000, desc: 'Medical care' },
  { amount: 2000, desc: 'Feed 4 cows / week' },
  { amount: 5000, desc: 'Shelter support' },
  { amount: 'custom', desc: 'Enter custom amount' },
];

export default function DonateScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { purchasePlanStore } = useHomeStore();
  const { user } = useAuthStore();
  const [donationType, setDonationType] = useState<'one-time' | 'monthly' | 'occasion'>('one-time');
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(500);
  const [customAmount, setCustomAmount] = useState('');
  const [remark, setRemark] = useState('');

  const getDisplayAmount = () => {
    if (selectedAmount === 'custom') {
      return customAmount ? `₹${customAmount}` : '₹0';
    }
    return `₹${selectedAmount}`;
  };

  const getImpactText = () => {
    if (selectedAmount === 'custom' || selectedAmount === 500) {
      return `₹${selectedAmount === 'custom' ? (customAmount || 0) : 500} can provide nutritious fodder for 1 cow for a week. Together, we can create a better life for them.`;
    }
    const preset = PRESET_AMOUNTS.find(p => p.amount === selectedAmount);
    return `₹${selectedAmount} can help with: ${preset?.desc.toLowerCase()}. Together, we can create a better life for them.`;
  };

  const handleDonate = async () => {
    const finalAmount = selectedAmount === 'custom' ? parseInt(customAmount, 10) : selectedAmount;
    if (!finalAmount || finalAmount <= 0) {
      Alert.alert('Validation', 'Please select or enter a valid donation amount');
      return;
    }
    const dateStr = new Date().toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    try {
      const payload = {
        donation_type: donationType,
        user_id: user?.id,
        amount: finalAmount,
        payment_status: "paid",
        remark: remark,
      };
      console.log('Donation api payload', payload)
      const res = await purchasePlanStore(payload as any);
      console.log('Donation api response', res)

      navigation.navigate('DonationSuccessScreen', {
        amount: finalAmount,
        transactionId: `TXN${Math.floor(Math.random() * 10000000000)}`,
        date: dateStr,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to process donation. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <PrimaryHeader />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Hero Banner */}
          <View style={styles.heroBanner}>
            <Image
              source={require('../../../assets/images/donate_hero_banner.png')}
              style={styles.heroImageFull}
            />
          </View>

          {/* 1. Choose Donation Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Choose Donation Type</Text>
            <View style={styles.typeCardsRow}>
              <TouchableOpacity
                style={[styles.typeCard, donationType === 'monthly' && styles.typeCardActive]}
                onPress={() => setDonationType('monthly')}
                activeOpacity={0.8}
              >
                <View style={[styles.iconCircle, { backgroundColor: '#F0FDF4' }]}>
                  <RefreshCw size={RFValue(16)} color="#22C55E" />
                </View>
                <Text style={[styles.typeCardTitle, donationType === 'monthly' && styles.textOrange]}>Monthly Support</Text>
                <Text style={styles.typeCardDesc}>Give every month & make a lasting impact</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeCard, donationType === 'one-time' && styles.typeCardActive]}
                onPress={() => setDonationType('one-time')}
                activeOpacity={0.8}
              >
                <View style={[styles.iconCircle, { backgroundColor: '#FFF5F0' }]}>
                  <Heart size={RFValue(16)} color={Colors.primary} fill={Colors.primary} />
                </View>
                <Text style={[styles.typeCardTitle, donationType === 'one-time' && styles.textOrange]}>One-time</Text>
                <Text style={styles.typeCardDesc}>Make a one-time contribution</Text>
              </TouchableOpacity>



              <TouchableOpacity
                style={[styles.typeCard, donationType === 'occasion' && styles.typeCardActive]}
                onPress={() => setDonationType('occasion')}
                activeOpacity={0.8}
              >
                <View style={[styles.iconCircle, { backgroundColor: '#F5F3FF' }]}>
                  <Gift size={RFValue(16)} color="#8B5CF6" />
                </View>
                <Text style={[styles.typeCardTitle, donationType === 'occasion' && styles.textOrange]}>Occasion Donation</Text>
                <Text style={styles.typeCardDesc}>Donate on birthdays, anniversaries & more</Text>
              </TouchableOpacity>

            </View>
          </View>

          {/* 2. Choose Amount */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>2. Choose Amount</Text>
              <View style={styles.securePayment}>
                <ShieldCheck size={RFValue(10)} color={Colors.gray} />
                <Text style={styles.securePaymentText}>100% Secure Payment</Text>
              </View>
            </View>

            <View style={styles.amountGrid}>
              {PRESET_AMOUNTS.map((item, index) => {
                const isActive = selectedAmount === item.amount;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.amountCard, isActive && styles.amountCardActive]}
                    onPress={() => setSelectedAmount(item.amount)}
                    activeOpacity={0.8}
                  >
                    {isActive && (
                      <View style={styles.checkIconBadge}>
                        <CheckCircle2 size={RFValue(12)} color={Colors.white} fill={Colors.primary} />
                      </View>
                    )}
                    {item.amount === 'custom' ? (
                      <Text style={[styles.amountValue, isActive && styles.textOrange, { fontSize: RFValue(11) }]}>Other Amount</Text>
                    ) : (
                      <Text style={[styles.amountValue, isActive && styles.textOrange]}>₹{item.amount}</Text>
                    )}
                    <Text style={[styles.amountDesc, isActive && styles.textOrange]}>{item.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedAmount === 'custom' && (
              <View style={styles.customAmountInputWrapper}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.customAmountInput}
                  placeholder="Enter custom amount"
                  placeholderTextColor={Colors.gray}
                  keyboardType="numeric"
                  value={customAmount}
                  onChangeText={setCustomAmount}
                />
              </View>
            )}

            {/* Impact Banner */}
            <View style={styles.impactBanner}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=200' }}
                style={styles.impactImage}
              />
              <View style={styles.impactContent}>
                <Text style={styles.impactTitle}>Your Impact</Text>
                <Text style={styles.impactText}>{getImpactText()}</Text>
              </View>
              <Heart size={RFValue(16)} color="#A7F3D0" fill="#D1FAE5" style={styles.impactHeart} />
            </View>
          </View>

          {/* 3. Donation Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Donation Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Donation Type</Text>
                <Text style={styles.summaryValueOrange}>
                  {donationType === 'one-time' ? 'One-time' : donationType === 'monthly' ? 'Monthly' : 'Occasion'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount</Text>
                <Text style={styles.summaryValueOrange}>{getDisplayAmount()}</Text>
              </View>

              <View style={styles.dashedLineContainer}>
                <View style={styles.dashedLine} />
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>{getDisplayAmount()}</Text>
              </View>
              <InputField label="Message/Remark" placeholder="Enter your message or remark" value={remark} onChangeText={setRemark} />
            </View>
          </View>

          {/* Donate Button */}
          <TouchableOpacity style={styles.donateBtn} onPress={handleDonate} activeOpacity={0.9}>
            <Lock size={RFValue(12)} color={Colors.white} style={styles.btnIcon} />
            <Text style={styles.donateBtnText}>Donate {getDisplayAmount()} Now</Text>
            <ChevronRight size={RFValue(12)} color={Colors.white} style={styles.btnChevron} />
          </TouchableOpacity>

          <View style={styles.secureMsgRow}>
            <CheckCircle2 size={RFValue(10)} color="#10B981" />
            <Text style={styles.secureMsgText}>Your donation is secure and will directly help cows in need.</Text>
          </View>

          {/* Trust Badges */}
          <View style={styles.trustBadgesRow}>
            <View style={styles.trustBadgeItem}>
              <View style={[styles.trustIconWrapper, { backgroundColor: '#ECFDF5' }]}>
                <Shield size={RFValue(12)} color="#10B981" />
              </View>
              <Text style={styles.trustBadgeTitle}>Secure Payment</Text>
              <Text style={styles.trustBadgeDesc}>256-bit SSL</Text>
            </View>

            <View style={styles.trustBadgeItem}>
              <View style={[styles.trustIconWrapper, { backgroundColor: '#FFF7ED' }]}>
                <FileText size={RFValue(12)} color="#F97316" />
              </View>
              <Text style={styles.trustBadgeTitle}>80G Tax Benefit</Text>
              <Text style={styles.trustBadgeDesc}>Available</Text>
            </View>

            <View style={styles.trustBadgeItem}>
              <View style={[styles.trustIconWrapper, { backgroundColor: '#F5F3FF' }]}>
                <Users size={RFValue(12)} color="#8B5CF6" />
              </View>
              <Text style={styles.trustBadgeTitle}>10,000+</Text>
              <Text style={styles.trustBadgeDesc}>Happy Donors</Text>
            </View>

            <View style={styles.trustBadgeItem}>
              <View style={[styles.trustIconWrapper, { backgroundColor: '#FDF2F8' }]}>
                <Heart size={RFValue(12)} color="#EC4899" />
              </View>
              <Text style={styles.trustBadgeTitle}>100% Impact</Text>
              <Text style={styles.trustBadgeDesc}>Transparency</Text>
            </View>
          </View>

          {/* Footer Text */}
          <View style={styles.footerRow}>
            <Leaf size={RFValue(10)} color="#22C55E" />
            <Text style={styles.footerText}>We never share your information with anyone.</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('1%'),
  },
  secureText: {
    color: '#10B981',
    fontSize: RFValue(10),
    fontWeight: '700',
    marginLeft: wp('1%'),
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp('10%'),
  },
  heroBanner: {
    height: hp('22%'),
    width: '100%',
    backgroundColor: '#F3F2EE', // Approximate color of the left side of banner
    position: 'relative',
    overflow: 'hidden',
  },
  heroImageFull: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  section: {
    paddingHorizontal: wp('4%'),
    marginTop: hp('2.5%'),
  },
  sectionTitle: {
    fontSize: RFValue(11.5),
    fontWeight: '800',
    color: Colors.dark,
    marginBottom: hp('1.5%'),
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  securePayment: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securePaymentText: {
    fontSize: RFValue(9),
    color: Colors.gray,
    marginLeft: wp('1%'),
  },
  typeCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeCard: {
    width: wp('29%'),
    backgroundColor: Colors.white,
    borderRadius: wp('3%'),
    padding: wp('3%'),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  typeCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFAF8',
  },
  iconCircle: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('1%'),
  },
  typeCardTitle: {
    fontSize: RFValue(10),
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: hp('0.5%'),
    textAlign: 'center',
  },
  textOrange: {
    color: Colors.primary,
  },
  typeCardDesc: {
    fontSize: RFValue(8),
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: hp('1.2%'),
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amountCard: {
    width: wp('29%'),
    backgroundColor: Colors.white,
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('1%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('1.5%'),
    position: 'relative',
  },
  amountCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFAF8',
  },
  checkIconBadge: {
    position: 'absolute',
    top: -hp('0.8%'),
    right: -wp('1.5%'),
    backgroundColor: Colors.white,
    borderRadius: wp('2%'),
  },
  amountValue: {
    fontSize: RFValue(13),
    fontWeight: '800',
    color: Colors.dark,
    marginBottom: hp('0.5%'),
  },
  amountDesc: {
    fontSize: RFValue(7.5),
    color: Colors.gray,
    textAlign: 'center',
    paddingHorizontal: wp('1%'),
  },
  customAmountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: wp('2%'),
    paddingHorizontal: wp('4%'),
    marginTop: hp('0.5%'),
    marginBottom: hp('1.5%'),
  },
  currencySymbol: {
    fontSize: RFValue(14),
    fontWeight: '700',
    color: Colors.dark,
    marginRight: wp('2%'),
  },
  customAmountInput: {
    flex: 1,
    fontSize: RFValue(14),
    fontWeight: '700',
    color: Colors.dark,
    paddingVertical: hp('1.5%'),
  },
  impactBanner: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4', // Pale green
    borderRadius: wp('2%'),
    padding: wp('3%'),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginTop: hp('1%'),
  },
  impactImage: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
  },
  impactContent: {
    flex: 1,
    paddingHorizontal: wp('3%'),
  },
  impactTitle: {
    fontSize: RFValue(10),
    fontWeight: '700',
    color: '#166534',
    marginBottom: hp('0.3%'),
  },
  impactText: {
    fontSize: RFValue(8.5),
    color: '#14532D',
    lineHeight: hp('1.3%'),
  },
  impactHeart: {
    marginRight: wp('1%'),
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: wp('3%'),
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: wp('4%'),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  summaryLabel: {
    fontSize: RFValue(10.5),
    color: Colors.gray,
    fontWeight: '500',
  },
  summaryValueOrange: {
    fontSize: RFValue(10.5),
    fontWeight: '700',
    color: Colors.primary,
  },
  dashedLineContainer: {
    marginVertical: hp('1.5%'),
    overflow: 'hidden',
  },
  dashedLine: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderStyle: 'dashed',
    margin: -1,
    marginTop: 0,
  },
  summaryTotalLabel: {
    fontSize: RFValue(12),
    fontWeight: '800',
    color: Colors.dark,
  },
  summaryTotalValue: {
    fontSize: RFValue(14),
    fontWeight: '800',
    color: '#10B981',
  },
  donateBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: wp('4%'),
    marginTop: hp('3%'),
    paddingVertical: hp('1.3%'),
    borderRadius: wp('3%'),
  },
  btnIcon: {
    marginRight: wp('2%'),
  },
  donateBtnText: {
    fontSize: RFValue(11),
    fontWeight: '600',
    color: Colors.white,
  },
  btnChevron: {
    position: 'absolute',
    right: wp('4%'),
  },
  secureMsgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('1.5%'),
  },
  secureMsgText: {
    fontSize: RFValue(8.5),
    color: Colors.gray,
    marginLeft: wp('1.5%'),
  },
  trustBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    marginTop: hp('4%'),
    marginBottom: hp('2%'),
  },
  trustBadgeItem: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: Colors.white,
    marginHorizontal: wp('1%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  trustIconWrapper: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('0.8%'),
  },
  trustBadgeTitle: {
    fontSize: RFValue(7.5),
    fontWeight: '800',
    color: Colors.dark,
    textAlign: 'center',
    marginBottom: hp('0.2%'),
  },
  trustBadgeDesc: {
    fontSize: RFValue(7),
    color: Colors.gray,
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('2%'),
  },
  footerText: {
    fontSize: RFValue(8),
    color: Colors.gray,
    marginLeft: wp('1%'),
  },
});
