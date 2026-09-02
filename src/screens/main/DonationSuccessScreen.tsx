import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Check,
  IndianRupee,
  Calendar,
  Hash,
  CreditCard,
  FileText,
  Heart,
  PlusCircle,
  Home,
  ShieldCheck,
  Download,
  Home as HomeIcon,
  HandHeart,
  Wheat,
} from 'lucide-react-native';

import { Colors } from '../../theme/colors';
import { RootStackParamList } from '../../navigation/types';
import { useTranslation } from 'react-i18next';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DonationSuccessScreen'>;
type SuccessScreenRouteProp = RouteProp<RootStackParamList, 'DonationSuccessScreen'>;

export default function DonationSuccessScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SuccessScreenRouteProp>();

  const { amount, transactionId, date } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header Icons & Success Text */}
        <View style={styles.headerContainer}>
          <View style={styles.checkOuterCircle}>
            <View style={styles.checkInnerCircle}>
              <Check color="#FFFFFF" size={RFValue(40)} strokeWidth={3} />
            </View>
          </View>
          <Text style={styles.titleText}>{t('donationSuccess.title')}</Text>
          <Text style={styles.subtitleText}>
            {t('donationSuccess.subtitle', { newline: '\n' })}
          </Text>
        </View>

        {/* Amount Card */}
        <View style={styles.amountCard}>
          <View style={styles.amountLeft}>
            <View style={styles.rupeeIconContainer}>
              <IndianRupee color="#2E6B34" size={RFValue(20)} strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.amountText}>₹ {amount.toLocaleString('en-IN')}</Text>
              <View style={styles.badgeContainer}>
                <Heart color="#2E6B34" size={RFValue(10)} fill="#2E6B34" />
                <Text style={styles.badgeText}>{t('donationSuccess.oneTimeContribution')}</Text>
              </View>
            </View>
          </View>
          <Image
            source={require('../../../assets/images/cow_transplant.png')}
            style={styles.calfImage}
            resizeMode="contain"
          />
        </View>

        {/* Transaction Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <View style={styles.iconBoxDark}>
              <FileText color="#FFFFFF" size={RFValue(14)} />
            </View>
            <Text style={styles.detailsTitle}>{t('donationSuccess.transactionDetails')}</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBoxLight}>
                <IndianRupee color="#2E6B34" size={RFValue(12)} />
              </View>
              <Text style={styles.rowLabel}>{t('donationSuccess.amount')}</Text>
            </View>
            <Text style={styles.rowValueDark}>₹ {amount.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBoxLight}>
                <Calendar color="#2E6B34" size={RFValue(12)} />
              </View>
              <Text style={styles.rowLabel}>{t('donationSuccess.dateTime')}</Text>
            </View>
            <Text style={styles.rowValueLight}>{date}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBoxLight}>
                <Hash color="#2E6B34" size={RFValue(12)} />
              </View>
              <Text style={styles.rowLabel}>{t('donationSuccess.transactionId')}</Text>
            </View>
            <Text style={styles.rowValueLight}>{transactionId}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBoxLight}>
                <CreditCard color="#2E6B34" size={RFValue(12)} />
              </View>
              <Text style={styles.rowLabel}>{t('donationSuccess.paymentMode')}</Text>
            </View>
            <Text style={styles.rowValueLight}>{t('donationSuccess.upi')}</Text>
          </View>
        </View>

        {/* Impact Section */}
        <View style={styles.impactCardHorizontal}>
          <View style={styles.impactCardLeft}>
            <View style={styles.impactLargeIconCircle}>
              <Image
                source={require('../../../assets/images/hand.png')}
                style={styles.impactImageLogo}
                resizeMode="contain"
              />
            </View>
          </View>
          <View style={styles.impactCardRight}>
            <Text style={styles.impactTitleHorizontal}>{t('donationSuccess.yourContributionHelps')}</Text>
            <View style={styles.impactRowHorizontal}>
              <View style={styles.impactColHorizontal}>
                <Wheat color="#2E6B34" size={RFValue(18)} />
                <Text style={styles.impactTextHorizontal}>{t('donationSuccess.cowFeeding')}</Text>
              </View>
              <View style={styles.impactDividerHorizontal} />
              <View style={styles.impactColHorizontal}>
                <PlusCircle color="#2E6B34" size={RFValue(18)} />
                <Text style={styles.impactTextHorizontal}>{t('donationSuccess.medicalSupport')}</Text>
              </View>
              <View style={styles.impactDividerHorizontal} />
              <View style={styles.impactColHorizontal}>
                <Home color="#2E6B34" size={RFValue(18)} />
                <Text style={styles.impactTextHorizontal}>{t('donationSuccess.shelterMaintenance')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Security Message */}
        <View style={styles.securityRow}>
          <ShieldCheck color="#2E6B34" size={RFValue(14)} />
          <Text style={styles.securityText}>{t('donationSuccess.safeMessage')}</Text>
        </View>

        {/* Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
            <Download color="#FFFFFF" size={RFValue(16)} />
            <Text style={styles.primaryButtonText}>{t('donationSuccess.downloadReceipt')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MainDrawer')}
          >
            <HomeIcon color="#E85D04" size={RFValue(16)} />
            <Text style={styles.secondaryButtonText}>{t('donationSuccess.backToHome')}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('5%'),
    alignItems: 'center',
    paddingTop: hp('4%'),
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: hp('3%'),
    width: '100%',
  },
  checkOuterCircle: {
    width: wp('28%'),
    height: wp('28%'),
    borderRadius: wp('14%'),
    backgroundColor: '#F3F9F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('2%'),
  },
  checkInnerCircle: {
    width: wp('20%'),
    height: wp('20%'),
    borderRadius: wp('10%'),
    backgroundColor: '#357A38',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#357A38',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  titleText: {
    fontSize: RFValue(20),
    fontWeight: '800',
    color: '#2E6B34',
    marginBottom: hp('1%'),
  },
  subtitleText: {
    fontSize: RFValue(11),
    color: '#2E6B34',
    textAlign: 'center',
    lineHeight: RFValue(16),
  },
  amountCard: {
    width: '100%',
    backgroundColor: '#F4F9F2',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('2.5%'),
    overflow: 'hidden',
  },
  amountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rupeeIconContainer: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    backgroundColor: '#E4EFE2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%'),
  },
  amountText: {
    fontSize: RFValue(24),
    fontWeight: 'bold',
    color: '#2E6B34',
    marginBottom: hp('0.5%'),
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4EFE2',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.3%'),
    borderRadius: wp('4%'),
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: RFValue(8),
    color: '#2E6B34',
    fontWeight: '600',
    marginLeft: wp('1%'),
  },
  calfImage: {
    width: wp('35%'),
    height: wp('30%'),
    position: 'absolute',
    right: wp('1%'),
    // bottom: hp('1%'),
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginBottom: hp('2.5%'),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  iconBoxDark: {
    width: wp('7%'),
    height: wp('7%'),
    borderRadius: wp('1.5%'),
    backgroundColor: '#2E6B34',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%'),
  },
  detailsTitle: {
    fontSize: RFValue(12),
    fontWeight: '700',
    color: '#1E1E1E',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp('1%'),
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBoxLight: {
    width: wp('6%'),
    height: wp('6%'),
    borderRadius: wp('1.5%'),
    backgroundColor: '#F3F9F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%'),
  },
  rowLabel: {
    fontSize: RFValue(10),
    color: '#1E1E1E',
    fontWeight: '500',
  },
  rowValueDark: {
    fontSize: RFValue(13),
    fontWeight: 'bold',
    color: '#2E6B34',
  },
  rowValueLight: {
    fontSize: RFValue(10),
    color: '#666666',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    width: '100%',
    marginVertical: hp('0.5%'),
  },
  impactCardHorizontal: {
    width: '100%',
    backgroundColor: '#F9FAF4',
    borderRadius: wp('4%'),
    padding: wp('3%'),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2%'),
    borderWidth: 1,
    borderColor: '#E8EFE5',
  },
  impactCardLeft: {
    marginRight: wp('3%'),
  },
  impactLargeIconCircle: {
    width: wp('18%'),
    height: wp('18%'),
    borderRadius: wp('9%'),
    backgroundColor: '#E6EFE4',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  impactImageLogo: {
    width: wp('35%'),
    height: wp('35%'),
  },
  impactCardRight: {
    flex: 1,
    justifyContent: 'center',
  },
  impactTitleHorizontal: {
    fontSize: RFValue(12),
    fontWeight: 'bold',
    color: '#2E6B34',
    marginBottom: hp('1%'),
    textAlign: 'center',
  },
  impactRowHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  impactColHorizontal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  impactTextHorizontal: {
    fontSize: RFValue(8),
    color: '#1E1E1E',
    textAlign: 'center',
    marginTop: hp('0.5%'),
    fontWeight: '500',
  },
  impactDividerHorizontal: {
    width: 1,
    height: hp('3%'),
    backgroundColor: '#D0E3CD',
    // marginHorizontal: wp('1%'),
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('3%'),
  },
  securityText: {
    fontSize: RFValue(9),
    color: '#666666',
    marginLeft: wp('1.5%'),
  },
  actionsContainer: {
    width: '100%',
    gap: hp('1.5%'),
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('1.2%'),
    borderRadius: wp('3%'),
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(12),
    fontWeight: 'bold',
    marginLeft: wp('2%'),
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('1.2%'),
    borderRadius: wp('3%'),
    borderWidth: 1,
    borderColor: '#E85D04',
  },
  secondaryButtonText: {
    color: '#E85D04',
    fontSize: RFValue(12),
    fontWeight: 'bold',
    marginLeft: wp('2%'),
  },
});
