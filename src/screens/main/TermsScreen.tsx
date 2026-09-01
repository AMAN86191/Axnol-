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
            By accessing or using the services of the Gaumata Sewa Trust, you agree to be bound by these terms.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={RFValue(12)} color={Colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>2. Use of Information</Text>
          </View>
          <Text style={styles.bodyText}>
            Content is for general informational purposes only. The NGO reserves the right to modify or update information at any time without prior notice.
          </Text>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <HeartHandshake size={RFValue(12)} color={Colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>3. Donations & Refunds</Text>
          </View>
          <Text style={styles.bodyText}>
            All financial contributions made to the trust are voluntary. The trust reserves the right to allocate funds at its discretion to areas of greatest need.
          </Text>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletContent}><Text style={styles.bold}>Refund Policy:</Text> Contributions are considered final and are non-refundable. If an incorrect transaction occurs, donors are advised to contact the trust immediately for resolution.</Text>
          </View>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={RFValue(12)} color={Colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>4. Intellectual Property</Text>
          </View>
          <Text style={styles.bodyText}>
            All content, including text, images, logos, and graphics, is the property of the NGO and is protected by copyright laws.
          </Text>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ShieldCheck size={RFValue(12)} color={Colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>5. User Conduct & Policies</Text>
          </View>
          <Text style={styles.bodyText}>
            Users are expected to interact respectfully and refrain from activities that could harm the NGO or its reputation. The NGO is not responsible for the content or privacy practices of any external websites linked on their platform. The trust reserves the right to update or modify these terms at any time.
          </Text>
        </View>

        {/* Section 6 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <HelpCircle size={RFValue(12)} color={Colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>6. Contact Us</Text>
          </View>
          <Text style={styles.bodyText}>
            For questions regarding these Terms, please reach out to us at:
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
