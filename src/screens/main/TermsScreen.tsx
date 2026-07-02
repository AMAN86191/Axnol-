import React, { useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { FileText, ShieldCheck, HeartHandshake, HelpCircle } from 'lucide-react-native';

import { CommonHeader } from '../../components/CommonHeader';
import { Colors } from '../../theme/colors';

export default function TermsScreen() {
  const navigation = useNavigation();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <CommonHeader title="Terms & Conditions" onBackPress={handleBack} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Intro Banner */}
        <View style={styles.banner}>
          <FileText size={RFValue(28)} color={Colors.primary} strokeWidth={1.5} />
          <Text style={styles.bannerTitle}>Terms & Conditions</Text>
          <Text style={styles.bannerSubtitle}>Last updated: June 2026</Text>
        </View>

        <Text style={styles.introText}>
          Please read these Terms & Conditions ("Terms") carefully before using the Gaumata Trust mobile application. By accessing or using our services, you agree to comply with and be bound by these Terms.
        </Text>

        {/* Section 1 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ShieldCheck size={RFValue(12)} color={Colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          </View>
          <Text style={styles.bodyText}>
            By creating an account, donating, or participating in the community feed of Gaumata Trust, you acknowledge that you have read, understood, and agree to these Terms. If you do not agree, you must discontinue using our services.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <HeartHandshake size={RFValue(12)} color={Colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>2. Donations & Refunds</Text>
          </View>
          <Text style={styles.bodyText}>
            All financial contributions made to the trust are voluntary and will be utilized solely for feeding, sheltering, and medical treatment of cows.
          </Text>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletContent}><Text style={styles.bold}>Tax Exemption:</Text> Donations are eligible for tax exemption under Section 80G of the Income Tax Act. Receipts are generated automatically.</Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletContent}><Text style={styles.bold}>Refunds:</Text> As contributions are used directly for grass, medicine, and shelter construction, donations are strictly non-refundable.</Text>
          </View>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={RFValue(12)} color={Colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>3. User Content & Feed Guidelines</Text>
          </View>
          <Text style={styles.bodyText}>
            When sharing posts or images on our Community Feed, users must maintain a peaceful, respectful, and constructive behavior:
          </Text>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletContent}>Only share content related to animal welfare, Gau Seva, and Vedic cultural heritage.</Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletContent}>URLs, promotional links, advertisement, or commercial posts are strictly prohibited.</Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletContent}>We reserve the right to review, edit, or delete any content that violates these guidelines or block abusive users.</Text>
          </View>
        </View>

        {/* Highlight box */}
        {/* <View style={styles.highlightBox}>
          <Text style={styles.highlightTitle}>Section 80G Tax Exemption</Text>
          <Text style={styles.highlightText}>
            All contributions are certified 100% transparent. Your donation receipts are permanent records and can be downloaded from your Profile page at any time.
          </Text>
        </View> */}

        {/* Section 4 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <HelpCircle size={RFValue(12)} color={Colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>4. Contact Us</Text>
          </View>
          <Text style={styles.bodyText}>
            For questions regarding these Terms, please reach out to our legal compliance cell at:
          </Text>
          <Text style={styles.contactEmail}>legal@gaumatatrust.org</Text>
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
