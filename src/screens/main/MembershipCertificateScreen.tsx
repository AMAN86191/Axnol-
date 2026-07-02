import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';
import { Share2, Download, Award, ShieldCheck, Calendar, User, Hash, Check } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { CommonHeader } from '../../components/CommonHeader';
import Svg, { Circle, Path } from 'react-native-svg';

const MembershipCertificateScreen = () => {
  const navigation = useNavigation();

  // Mock Member Data
  const memberDetails = {
    name: 'Ananda Das',
    memberId: 'GMT-8394-2026',
    tier: 'Community Member',
    joinedDate: '01 Jan 2026',
    status: 'Active',
    verified: 'Verified Sevak',
    impact: '₹1.2L Contributed',
    cowsSupported: '15 Cows Supported',
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I am proud to be a verified ${memberDetails.tier} of Gau Mata Sewa Trust! Join me in protecting and feeding our indigenous cows. My Member ID: ${memberDetails.memberId}. www.gaumatatrust.org`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleDownload = () => {
    Alert.alert(
      'Download Certificate 📥',
      'The high-resolution PDF certificate is being compiled and downloaded to your device downloads folder.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <CommonHeader 
        title="Membership Certificate" 
        onBackPress={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity onPress={handleShare} activeOpacity={0.7} style={styles.headerShareBtn}>
            <Share2 size={RFValue(14)} color={Colors.dark} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Certificate Card View */}
        <View style={styles.certificateOuterContainer}>
          <View style={styles.certificateBorder}>
            <View style={styles.certificateInnerBorder}>
              {/* Trust Badge Header */}
              <View style={styles.certHeader}>
                <Award size={RFValue(24)} color="#D97706" style={styles.certBadgeIcon} />
                <Text style={styles.certTrustName}>GAU MATA SEWA TRUST</Text>
                <Text style={styles.certSubHeader}>CERTIFICATE OF GOLD MEMBERSHIP</Text>
              </View>

              {/* Presented To */}
              <View style={styles.certBody}>
                <Text style={styles.certPresentedText}>This certificate is proudly presented to</Text>
                <Text style={styles.certMemberName}>{memberDetails.name}</Text>
                <Text style={styles.certDescription}>
                  in recognition of their noble support, generous contributions, and dedicated service as a verified Gau Sevak. Your commitment directly aids the feeding, shelter, and medical protection of indigenous cows.
                </Text>
              </View>

              {/* Certificate Metadata */}
              <View style={styles.certMetaContainer}>
                <View style={styles.certMetaColumn}>
                  <Text style={styles.certMetaLabel}>MEMBER ID</Text>
                  <Text style={styles.certMetaValue}>{memberDetails.memberId}</Text>
                </View>
                <View style={styles.certMetaColumn}>
                  <Text style={styles.certMetaLabel}>DATE OF ISSUANCE</Text>
                  <Text style={styles.certMetaValue}>{memberDetails.joinedDate}</Text>
                </View>
              </View>

              {/* Signatures & Seal */}
              <View style={styles.certFooter}>
                <View style={styles.signatureCol}>
                  <Text style={styles.handwrittenSig}>Swami Anand</Text>
                  <View style={styles.sigLine} />
                  <Text style={styles.sigTitle}>President, Trustee</Text>
                </View>

                {/* Gold Seal Svg */}
                <View style={styles.sealWrapper}>
                  <Svg width={wp('13%')} height={wp('13%')} viewBox="0 0 100 100">
                    <Circle cx="50" cy="50" r="45" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
                    <Circle cx="50" cy="50" r="38" fill="transparent" stroke="#FFF" strokeWidth="1.5" strokeDasharray="3,3" />
                    <Path d="M50 20 L58 40 L78 40 L62 52 L68 72 L50 60 L32 72 L38 52 L22 40 L42 40 Z" fill="#FFF" />
                  </Svg>
                </View>

                <View style={styles.signatureCol}>
                  <Text style={styles.handwrittenSig}>R. K. Sharma</Text>
                  <View style={styles.sigLine} />
                  <Text style={styles.sigTitle}>General Secretary</Text>
                </View>
              </View>

            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload} activeOpacity={0.85}>
            <Download size={RFValue(13)} color="#FFF" style={{ marginRight: wp('2%') }} />
            <Text style={styles.downloadBtnText}>Download PDF Certificate</Text>
          </TouchableOpacity>
        </View>

        {/* Membership Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Membership Details</Text>
          
          {/* Detail Item Row 1 */}
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconCircle}>
                <User size={RFValue(10.5)} color="#FF6F34" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Name</Text>
                <Text style={styles.detailValue}>{memberDetails.name}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <View style={styles.detailIconCircle}>
                <Hash size={RFValue(10.5)} color="#FF6F34" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Member ID</Text>
                <Text style={styles.detailValue}>{memberDetails.memberId}</Text>
              </View>
            </View>
          </View>

          {/* Detail Item Row 2 */}
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconCircle}>
                <Award size={RFValue(10.5)} color="#FF6F34" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Membership Tier</Text>
                <Text style={styles.detailValue}>{memberDetails.tier}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <View style={styles.detailIconCircle}>
                <Calendar size={RFValue(10.5)} color="#FF6F34" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Member Since</Text>
                <Text style={styles.detailValue}>{memberDetails.joinedDate}</Text>
              </View>
            </View>
          </View>

          {/* Status Row */}
          <View style={styles.statusDetailsContainer}>
            <View style={styles.statusTagItem}>
              <Check size={RFValue(9)} color="#065F46" strokeWidth={3} style={{ marginRight: wp('0.5%') }} />
              <Text style={styles.statusTagTextGreen}>Verified Account Status</Text>
            </View>
            <View style={styles.statusTagItem}>
              <ShieldCheck size={RFValue(9)} color="#065F46" />
              <Text style={styles.statusTagTextGreen}>Active Community Member</Text>
            </View>
          </View>
        </View>

        {/* Impact Summary Section */}
        {/* <View style={styles.impactCard}>
          <Text style={styles.impactTitle}>Your Seva Summary</Text>
          <View style={styles.impactGrid}>
            <View style={styles.impactCell}>
              <Text style={styles.impactNum}>₹1.2 Lakhs</Text>
              <Text style={styles.impactLabelText}>Total Contributions</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.impactCell}>
              <Text style={styles.impactNum}>15 cows</Text>
              <Text style={styles.impactLabelText}>Food & Shelter Provided</Text>
            </View>
          </View>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerShareBtn: {
    padding: wp('1%'),
  },
  scrollContainer: {
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('5%'),
  },
  certificateOuterContainer: {
    width: '100%',
    backgroundColor: '#FAF5EE',
    borderRadius: wp('4%'),
    padding: wp('3%'),
    borderWidth: 1,
    borderColor: '#E6D7C3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  certificateBorder: {
    borderWidth: 2,
    borderColor: '#CBB28C',
    borderRadius: wp('3%'),
    padding: wp('2.5%'),
  },
  certificateInnerBorder: {
    borderWidth: 1,
    borderColor: '#CBB28C',
    borderRadius: wp('2%'),
    paddingVertical: hp('2.5%'),
    paddingHorizontal: wp('3%'),
    alignItems: 'center',
    backgroundColor: '#FFFDF9',
  },
  certHeader: {
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  certBadgeIcon: {
    marginBottom: hp('0.5%'),
  },
  certTrustName: {
    fontSize: RFValue(13.5),
    fontWeight: '800',
    color: '#806030',
    letterSpacing: 1,
  },
  certSubHeader: {
    fontSize: RFValue(8.2),
    fontWeight: '700',
    color: '#D97706',
    letterSpacing: 0.5,
    marginTop: hp('0.5%'),
  },
  certBody: {
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  certPresentedText: {
    fontSize: RFValue(9),
    color: '#6B7280',
    fontStyle: 'italic',
  },
  certMemberName: {
    fontSize: RFValue(17),
    fontWeight: '800',
    color: '#111827',
    marginVertical: hp('1%'),
    textAlign: 'center',
    borderBottomWidth: 1.5,
    borderColor: '#E6D7C3',
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('0.3%'),
  },
  certDescription: {
    fontSize: RFValue(8.5),
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: hp('1.6%'),
    marginTop: hp('0.5%'),
    paddingHorizontal: wp('1.5%'),
  },
  certMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: wp('4%'),
    marginBottom: hp('2.5%'),
  },
  certMetaColumn: {
    alignItems: 'center',
  },
  certMetaLabel: {
    fontSize: RFValue(7.2),
    color: '#9CA3AF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  certMetaValue: {
    fontSize: RFValue(8.8),
    color: '#374151',
    fontWeight: '700',
    marginTop: hp('0.2%'),
  },
  certFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: wp('2%'),
  },
  signatureCol: {
    alignItems: 'center',
    width: wp('25%'),
  },
  handwrittenSig: {
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'cursive',
    fontSize: RFValue(13),
    color: '#5D4037',
    height: hp('2.5%'),
  },
  sigLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#CCCCCC',
    marginVertical: hp('0.5%'),
  },
  sigTitle: {
    fontSize: RFValue(7.2),
    color: '#6B7280',
    fontWeight: '600',
  },
  sealWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsContainer: {
    marginTop: hp('2%'),
    width: '100%',
  },
  downloadBtn: {
    backgroundColor: '#FF6F34',
    height: hp('5%'),
    borderRadius: wp('3%'),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#FF6F34',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  downloadBtnText: {
    color: '#FFF',
    fontSize: RFValue(11.5),
    fontWeight: '700',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginTop: hp('2%'),
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  detailsTitle: {
    fontSize: RFValue(12),
    fontWeight: '800',
    color: '#111827',
    marginBottom: hp('1.5%'),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('1.5%'),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  detailIconCircle: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('2.5%'),
  },
  detailLabel: {
    fontSize: RFValue(7.8),
    color: '#9CA3AF',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: RFValue(9.5),
    color: '#1F2937',
    fontWeight: '700',
    marginTop: hp('0.1%'),
  },
  statusDetailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: hp('1.2%'),
    marginTop: hp('0.5%'),
  },
  statusTagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
  },
  statusTagTextGreen: {
    fontSize: RFValue(8.2),
    color: '#065F46',
    fontWeight: '600',
    marginLeft: wp('1.5%'),
  },
  impactCard: {
    backgroundColor: '#FFFBF9',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginTop: hp('2%'),
    borderWidth: 1,
    borderColor: '#FFEBE0',
  },
  impactTitle: {
    fontSize: RFValue(11.5),
    fontWeight: '800',
    color: '#111827',
    marginBottom: hp('1.2%'),
  },
  impactGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: hp('0.5%'),
  },
  impactCell: {
    alignItems: 'center',
    flex: 1,
  },
  impactNum: {
    fontSize: RFValue(15),
    fontWeight: '800',
    color: '#FF6F34',
  },
  impactLabelText: {
    fontSize: RFValue(8),
    color: '#6B7280',
    fontWeight: '600',
    marginTop: hp('0.2%'),
  },
  verticalDivider: {
    width: 1,
    height: hp('4%'),
    backgroundColor: '#FFE5DA',
  },
});

export default MembershipCertificateScreen;
