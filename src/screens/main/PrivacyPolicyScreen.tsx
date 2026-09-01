import React, { useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Shield, Lock, Eye, Database } from 'lucide-react-native';

import { CommonHeader } from '../../components/CommonHeader';
import { Colors } from '../../theme/colors';

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <CommonHeader title="Privacy Policy" onBackPress={handleBack} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Intro Banner */}
        <View style={styles.banner}>
          <Shield size={RFValue(28)} color={Colors.primary} strokeWidth={1.5} />
          <Text style={styles.bannerTitle}>Your Privacy Matters</Text>
          <Text style={styles.bannerSubtitle}>Last updated: June 2026</Text>
        </View>

        <Text style={styles.introText}>
          Gau Mata Sewa Trust ("we", "us", or "our") operates the Gaumata Trust mobile application. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you support our cow protection and welfare missions.
        </Text>

        {/* Section 1 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Database size={RFValue(12)} color={Colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>1. Collection of Information</Text>
          </View>
          <Text style={styles.bodyText}>
            The trust collects personal information, including names, contact details, and donation history, to maintain donor records and facilitate communication.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Eye size={RFValue(12)} color={Colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>2. Use of Information</Text>
          </View>
          <Text style={styles.bodyText}>
            Information is used solely for the purpose for which it was provided, such as processing donations, sending updates, and informing donors about NGO activities.
          </Text>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={RFValue(12)} color={Colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>3. Data Sharing</Text>
          </View>
          <Text style={styles.bodyText}>
            The trust states that it does not sell, trade, or rent personal information to third parties. Information may only be shared with trusted partners and service providers for specific tasks like processing donations.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock size={RFValue(12)} color={Colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>4. Security</Text>
          </View>
          <Text style={styles.bodyText}>
            Reasonable security measures are employed to protect personal information from unauthorized access, disclosure, alteration, or destruction.
          </Text>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Eye size={RFValue(12)} color={Colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>5. Opt-Out & Policy Updates</Text>
          </View>
          <Text style={styles.bodyText}>
            Users can opt out of receiving communications by following instructions in emails or by contacting the NGO directly. The trust reserves the right to modify its privacy policy, and continued use of their services implies acceptance of any updated terms.
          </Text>
        </View>

        {/* Section 6 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Contact Us</Text>
          <Text style={styles.bodyText}>
            If you have any questions or complaints about this Privacy Policy, please contact our support cell at:
          </Text>
          <Text style={styles.contactEmail}>gaumatatrust2023@gmail.com</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    paddingHorizontal: wp('4%'),
    paddingTop: hp('1.5%'),
    paddingBottom: hp('5%'),
  },
  banner: {
    backgroundColor: Colors.white,
    borderRadius: wp('4%'),
    paddingVertical: hp('3%'),
    paddingHorizontal: wp('5%'),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFEBE0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1.5,
    marginBottom: hp('2.5%'),
  },
  bannerTitle: {
    fontSize: RFValue(14),
    fontWeight: '800',
    color: '#806030',
    marginTop: hp('1%'),
  },
  bannerSubtitle: {
    fontSize: RFValue(9.5),
    color: Colors.gray,
    marginTop: hp('0.3%'),
  },
  introText: {
    fontSize: RFValue(10.5),
    color: Colors.dark,
    lineHeight: hp('2.1%'),
    marginBottom: hp('2%'),
    textAlign: 'justify',
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: wp('4%'),
    padding: wp('4.5%'),
    marginBottom: hp('2%'),
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  sectionIcon: {
    marginRight: wp('2%'),
  },
  sectionTitle: {
    fontSize: RFValue(12),
    fontWeight: '800',
    color: Colors.dark,
  },
  bodyText: {
    fontSize: RFValue(10.2),
    color: '#4B5563',
    lineHeight: hp('2%'),
    textAlign: 'justify',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: hp('0.8%'),
    paddingHorizontal: wp('1%'),
  },
  bullet: {
    fontSize: RFValue(12),
    color: Colors.primary,
    marginRight: wp('2%'),
    marginTop: -hp('0.2%'),
  },
  bulletContent: {
    flex: 1,
    fontSize: RFValue(10.2),
    color: '#4B5563',
    lineHeight: hp('2%'),
  },
  bold: {
    fontWeight: '700',
    color: Colors.dark,
  },
  highlightBox: {
    backgroundColor: '#FFF5F0',
    borderRadius: wp('3.5%'),
    padding: wp('4%'),
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    marginBottom: hp('2%'),
  },
  highlightTitle: {
    fontSize: RFValue(10.5),
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: hp('0.3%'),
  },
  highlightText: {
    fontSize: RFValue(9.5),
    color: '#555',
    lineHeight: hp('1.8%'),
  },
  contactEmail: {
    fontSize: RFValue(11),
    fontWeight: '700',
    color: Colors.primary,
    marginTop: hp('0.8%'),
  },
});
