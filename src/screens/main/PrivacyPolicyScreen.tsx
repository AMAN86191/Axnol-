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
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          </View>
          <Text style={styles.bodyText}>
            While supporting our Gaushalas, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. This includes:
          </Text>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletContent}><Text style={styles.bold}>Identity Data:</Text> Full Name, Date of Birth, and Profile Avatar.</Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletContent}><Text style={styles.bold}>Contact Data:</Text> Email Address and Phone Number.</Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletContent}><Text style={styles.bold}>Financial Data:</Text> Transaction reference IDs for donations (payment credentials are encrypted by our gateway partners and never stored on our servers).</Text>
          </View>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Eye size={RFValue(12)} color={Colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>2. How We Use Data</Text>
          </View>
          <Text style={styles.bodyText}>
            We use the collected information to facilitate transparent operations, including:
          </Text>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletContent}>Generating official tax-exemption receipts (under Section 80G).</Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletContent}>Issuing digital membership certificates and active gold cards.</Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletContent}>Sharing updates about your sponsored cow or general Gaushala activities.</Text>
          </View>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock size={RFValue(12)} color={Colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>3. Security of Data</Text>
          </View>
          <Text style={styles.bodyText}>
            The security of your data is of paramount importance to us. We use industry-standard encryption protocols (SSL/TLS) to secure transaction details. We never sell, rent, or lease your personal information to third-party marketing services. Access to your personal data is restricted strictly to authorized trust administrators.
          </Text>
        </View>

        {/* Highlight box */}
        {/* <View style={styles.highlightBox}>
          <Text style={styles.highlightTitle}>Banking Grade Security</Text>
          <Text style={styles.highlightText}>
            Our payment processors conform to the Payment Card Industry Data Security Standards (PCI-DSS) to ensure your transactions are safe and secure.
          </Text>
        </View> */}

        {/* Section 4 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Contact Us</Text>
          <Text style={styles.bodyText}>
            If you have any questions or complaints about this Privacy Policy, please contact our support cell at:
          </Text>
          <Text style={styles.contactEmail}>privacy@gaumatatrust.org</Text>
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
