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
import { useNavigation, useRoute } from '@react-navigation/native';
import useAuthStore from '../../zustand/useAuthStore';
import { Share2, Download, Award, ShieldCheck, Calendar, User, Hash, Check } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { CommonHeader } from '../../components/CommonHeader';
import { MembershipCertificateCard } from '../../components/MembershipCertificateCard';

const MembershipCertificateScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { user } = useAuthStore();
  
  const profileData = route.params?.profileData;
  const activeUser = profileData?.user || user;
  const activeProfile = profileData?.profile || user?.profile;
  const activeMembership = activeUser?.membership || user?.membership;
console.log(profileData);
  // Dynamic Member Data
  const memberDetails = {
    name: activeUser?.name || 'Member Name',
    memberId: activeUser?.uid || 'N/A',
    tier: activeUser?.membership ? activeUser.membership.charAt(0).toUpperCase() + activeUser.membership.slice(1) : 'Community',
    joinedDate: activeUser?.start_date ? new Date(activeUser.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
    endDate: activeUser?.end_date ? new Date(activeUser.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
    status: activeUser?.status ? activeUser.status.charAt(0).toUpperCase() + activeUser.status.slice(1) : 'Active',
    verified: 'Verified Sevak',
    impact: `₹${profileData?.statistics?.total_donation || 0} Contributed`,
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
        <MembershipCertificateCard memberDetails={memberDetails} />

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
