import React, { useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft, Heart, Users, Target, Eye, BriefcaseMedical, MapPin, ShieldCheck, ArrowRight, Home, Soup } from 'lucide-react-native';
import Svg, { Path, Circle } from 'react-native-svg';

import { Colors } from '../../theme/colors';

const CowIcon = ({ size = 24, color = "#EA580C" }: { size?: number; color?: string }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Horns */}
    <Path d="M7 6C6 4.5 5 4 4 4" />
    <Path d="M17 6C18 4.5 19 4 20 4" />

    {/* Ears */}
    <Path d="M5.5 8L3.5 10.5L6.5 11" />
    <Path d="M18.5 8L20.5 10.5L17.5 11" />

    {/* Face */}
    <Path d="M12 4C7.5 4 5 7 5 11V14C5 18 8 21 12 21C16 21 19 18 19 14V11C19 7 16.5 4 12 4Z" />

    {/* Eyes */}
    <Circle cx="9" cy="11" r="0.8" fill={color} stroke="none" />
    <Circle cx="15" cy="11" r="0.8" fill={color} stroke="none" />

    {/* Nose */}
    <Path d="M9 15.5C9 14 10.5 13 12 13C13.5 13 15 14 15 15.5C15 17 13.5 18 12 18C10.5 18 9 17 9 15.5Z" />

    {/* Nostrils */}
    <Circle cx="10.8" cy="15.5" r="0.4" fill={color} stroke="none" />
    <Circle cx="13.2" cy="15.5" r="0.4" fill={color} stroke="none" />

    {/* Smile */}
    <Path d="M11 17C11.3 17.3 11.7 17.5 12 17.5C12.3 17.5 12.7 17.3 13 17" />
  </Svg>
);

export default function AboutTrustScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerLeftBtn}>
          <ArrowLeft size={RFValue(15)} color={Colors.dark} />
          <Text style={styles.headerTitle}>About Us</Text>
        </TouchableOpacity>
        <Image source={require('../../../assets/images/logo/logo.png')} style={styles.headerLogo} />
      </View>
      {/* <CommonHeader title="About Us" onBackPress={handleBack} /> */}
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + hp('5%') }]} showsVerticalScrollIndicator={false}>

        {/* HERO BANNER CARD */}
        <View style={styles.heroCard}>
          <ImageBackground
            source={require('../../../assets/images/calf.png')}
            style={styles.heroBg}
            imageStyle={{ borderRadius: wp('4%') }}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.1)']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.heroGradient}
            />
            <View style={styles.heroContent}>
              <View style={styles.heroTextGroup}>
                <Text style={styles.heroTitleWhite}>गौसेवा ही</Text>
                <Text style={styles.heroTitleOrange}>सच्ची सेवा</Text>
              </View>
              <Text style={styles.heroSubtitle}>
                हम समर्पित हैं गौमाता की सेवा,{'\n'}सुरक्षा और कल्याण के लिए।
              </Text>

              <View style={styles.heroButtonsRow}>
                <TouchableOpacity style={styles.donateBtn} onPress={() => navigation.navigate('DonateScreen' as never)}>
                  <Heart size={RFValue(10)} color="#FFF" fill="#FFF" />
                  <Text style={styles.donateBtnText}>Donate Now</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity style={styles.volunteerBtn}>
                  <Users size={RFValue(10)} color="#FFF" />
                  <Text style={styles.volunteerBtnText}>Become Volunteer</Text>
                </TouchableOpacity> */}
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* WHO WE ARE SECTION */}
        <View style={styles.whoWeAreSection}>
          <View style={styles.whoLeft}>
            <View style={styles.whoTagRow}>
              <View style={styles.whoTagIconCircle}>
                <CowIcon size={RFValue(12)} color="#EA580C" />
              </View>
              <View>
                <Text style={styles.whoTagText}>Who We Are</Text>
                <Text style={styles.whoTitle}>Gaumata Sewa Trust</Text>
              </View>
            </View>
            <Text style={styles.whoDescription}>
              Gaumata Sewa Trust is an inclusive platform that empowers individuals and groups to contribute their fair share of kindness towards the welfare of cows.
            </Text>
          </View>
          <Image source={require('../../../assets/images/gaushala.png')} style={styles.whoRightImage} />
        </View>

        {/* MISSION & VISION */}
        <View style={styles.missionVisionRow}>
          <View style={[styles.mvCard, { backgroundColor: '#F0FDF4' }]}>
            <View style={[styles.mvIconCircle, { backgroundColor: '#166534' }]}>
              <Target size={RFValue(14)} color="#FFF" />
            </View>
            <View style={styles.mvTextGroup}>
              <Text style={styles.mvTitle}>Our Mission</Text>
              <Text style={styles.mvDesc}>To provide food, shelter, medical care and lifelong protection to cows in need.</Text>
            </View>
          </View>
          <View style={[styles.mvCard, { backgroundColor: '#FFF7ED' }]}>
            <View style={[styles.mvIconCircle, { backgroundColor: '#EA580C' }]}>
              <Eye size={RFValue(14)} color="#FFF" />
            </View>
            <View style={styles.mvTextGroup}>
              <Text style={styles.mvTitle}>Our Vision</Text>
              <Text style={styles.mvDesc}>To build a compassionate society where every cow lives with dignity and care.</Text>
            </View>
          </View>
        </View>

        {/* OUR IMPACT BANNER */}
        <View style={styles.impactBanner}>
          <View style={styles.impactBgWatermark}>
            <CowIcon size={wp('45%')} color="rgba(255,255,255,0.06)" />
          </View>

          <Text style={styles.impactTitle}>Our Impact</Text>
          <View style={styles.impactGrid}>
            <View style={styles.impactCol}>
              <View style={styles.impactIconCircle}><CowIcon size={RFValue(12)} color="#FFF" /></View>
              <Text style={styles.impactStat}>450+</Text>
              <Text style={styles.impactLabel}>Cows Under Care</Text>
            </View>
            <View style={styles.impactDivider} />
            <View style={styles.impactCol}>
              <View style={styles.impactIconCircle}><Users size={RFValue(12)} color="#FFF" /></View>
              <Text style={styles.impactStat}>12,000+</Text>
              <Text style={styles.impactLabel}>Supporters</Text>
            </View>
            <View style={styles.impactDivider} />
            <View style={styles.impactCol}>
              <View style={styles.impactIconCircle}><BriefcaseMedical size={RFValue(12)} color="#FFF" /></View>
              <Text style={styles.impactStat}>Daily</Text>
              <Text style={styles.impactLabel}>Medical Assistance</Text>
            </View>
            <View style={styles.impactDivider} />
            <View style={styles.impactCol}>
              <View style={styles.impactIconCircle}><MapPin size={RFValue(12)} color="#FFF" /></View>
              <Text style={styles.impactStat}>Delhi</Text>
              <Text style={styles.impactLabel}>Community Driven</Text>
            </View>
          </View>
        </View>

        {/* WHY CHOOSE US */}
        <View style={styles.whySection}>
          <Text style={styles.whyTitle}>Why Choose Us</Text>
          <View style={styles.whyGrid}>
            <View style={styles.whyCard}>
              <View style={[styles.whyIconCircle, { backgroundColor: '#2C5A35' }]}><Home size={RFValue(12)} color="#FFF" /></View>
              <Text style={styles.whyCardTitle}>Shelter</Text>
              <Text style={styles.whyCardDesc}>Safe and comfortable{'\n'}homes for cows.</Text>
            </View>
            <View style={styles.whyCard}>
              <View style={[styles.whyIconCircle, { backgroundColor: '#F97316' }]}><Soup size={RFValue(12)} color="#FFF" /></View>
              <Text style={styles.whyCardTitle}>Healthy Food</Text>
              <Text style={styles.whyCardDesc}>Nutritious food for{'\n'}their well-being.</Text>
            </View>
            <View style={styles.whyCard}>
              <View style={[styles.whyIconCircle, { backgroundColor: '#2C5A35' }]}><BriefcaseMedical size={RFValue(12)} color="#FFF" /></View>
              <Text style={styles.whyCardTitle}>Medical Care</Text>
              <Text style={styles.whyCardDesc}>Vaccination &{'\n'}treatment for health.</Text>
            </View>
            <View style={styles.whyCard}>
              <View style={[styles.whyIconCircle, { backgroundColor: '#F97316' }]}><ShieldCheck size={RFValue(12)} color="#FFF" /></View>
              <Text style={styles.whyCardTitle}>Transparency</Text>
              <Text style={styles.whyCardDesc}>Regular updates{'\n'}and transparent use{'\n'}of donations.</Text>
            </View>
          </View>
        </View>

        {/* BE A PART OF THE CHANGE */}
        <View style={styles.joinBanner}>
          <Image source={require('../../../assets/images/event.png')} style={styles.joinImageAbsolute} />
          <LinearGradient
            colors={['transparent', 'rgba(249, 115, 22, 0.85)', '#F97316']}
            start={{ x: 0.3, y: 0.5 }}
            end={{ x: 0.65, y: 0.5 }}
            style={styles.joinGradientAbsolute}
          />
          <View style={styles.joinBgWatermark}>
            <Heart size={RFValue(160)} color="rgba(255,255,255,0.06)" fill="rgba(255,255,255,0.06)" strokeWidth={1} />
          </View>
          <View style={styles.joinContentWrapperFull}>
            <Text style={styles.joinTitle}>Be a Part of the Change</Text>
            <Text style={styles.joinDesc}>Your small contribution can bring a{'\n'}big change in their lives.</Text>
            <TouchableOpacity style={styles.joinBtn} onPress={()=>navigation.navigate('JoinMembershipScreen' as never)}>
              <Text style={styles.joinBtnText}>Join Us Now</Text>
              <ArrowRight size={RFValue(10)} color="#F97316" style={{ marginLeft: wp('1%') }} />
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    // paddingVertical: hp('1.5%'),
    backgroundColor: '#FAFAFA',
  },
  headerLeftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: RFValue(12),
    fontWeight: '800',
    color: Colors.dark,
    marginLeft: wp('3%'),
  },
  headerLogo: {
    width: wp('16%'),
    height: hp('5%'),
    resizeMode: 'contain',
  },
  scrollContent: {
    paddingHorizontal: wp('3%'),
    paddingTop: hp('1%'),
  },
  heroCard: {
    width: '100%',
    height: hp('20%'),
    borderRadius: wp('4%'),
    overflow: 'hidden',
    marginBottom: hp('2%'),
    backgroundColor: Colors.lightGray,
  },
  heroBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  heroGradient: {
    ...StyleSheet.absoluteFill,
    borderRadius: wp('4%'),
  },
  heroContent: {
    padding: wp('4%'),
  },
  heroTextGroup: {
    marginBottom: hp('1%'),
  },
  heroTitleWhite: {
    color: '#FFF',
    fontSize: RFValue(24),
    fontWeight: '900',
    lineHeight: hp('4%'),
  },
  heroTitleOrange: {
    color: '#EA580C',
    fontSize: RFValue(24),
    fontWeight: '900',
    lineHeight: hp('4%'),
  },
  heroSubtitle: {
    color: '#F1F5F9',
    fontSize: RFValue(10),
    fontWeight: '500',
    lineHeight: hp('1.8%'),
    marginBottom: hp('2%'),
  },
  heroButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('3.5%'),
    borderRadius: wp('2%'),
    marginRight: wp('3%'),
  },
  donateBtnText: {
    color: '#FFF',
    fontSize: RFValue(9),
    fontWeight: '700',
    marginLeft: wp('1.5%'),
  },
  volunteerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#166534',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('3.5%'),
    borderRadius: wp('2%'),
  },
  volunteerBtnText: {
    color: '#FFF',
    fontSize: RFValue(9),
    fontWeight: '700',
    marginLeft: wp('1.5%'),
  },
  whoWeAreSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF',
    padding: wp('3%'),
    borderRadius: wp('4%'),
    marginBottom: hp('2%'),
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  whoLeft: {
    flex: 1,
    paddingRight: wp('3%'),
  },
  whoTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
  },
  whoTagIconCircle: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('2%'),
  },
  tinyCowIcon: {
    width: '60%',
    height: '60%',
    resizeMode: 'contain',
  },
  whoTagText: {
    color: '#EA580C',
    fontSize: RFValue(9),
    fontWeight: '800',
  },
  whoTitle: {
    color: Colors.dark,
    fontSize: RFValue(14),
    fontWeight: '800',
    marginTop: hp('0.5%'),
  },
  whoDescription: {
    color: '#64748B',
    fontSize: RFValue(9.5),
    lineHeight: hp('1.8%'),
    marginTop: hp('1%'),
    textAlign: 'justify',
  },
  whoRightImage: {
    width: wp('30%'),
    height: hp('12%'),
    borderRadius: wp('3%'),
  },
  missionVisionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('3%'),
  },
  mvCard: {
    width: '48%',
    padding: wp('4%'),
    borderRadius: wp('4%'),
  },
  mvIconCircle: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  mvTextGroup: {},
  mvTitle: {
    fontSize: RFValue(11),
    fontWeight: '800',
    color: Colors.dark,
    marginBottom: hp('0.5%'),
  },
  mvDesc: {
    fontSize: RFValue(8.5),
    color: '#64748B',
    lineHeight: hp('1.6%'),
  },
  impactBanner: {
    backgroundColor: '#166534',
    borderRadius: wp('4%'),
    padding: wp('2%'),
    marginBottom: hp('1%'),
    overflow: 'hidden',
  },
  impactBgWatermark: {
    position: 'absolute',
    right: -wp('10%'),
    bottom: -hp('5%'),
    opacity: 1,
    zIndex: 0,
  },
  impactTitle: {
    color: '#FFF',
    fontSize: RFValue(12),
    fontWeight: '800',
    marginBottom: hp('1%'),
    zIndex: 1,
  },
  impactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  impactDivider: {
    width: 1,
    height: hp('5%'),
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  impactCol: {
    alignItems: 'center',
    width: '23%',
  },
  impactIconCircle: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  impactStat: {
    color: '#FFF',
    fontSize: RFValue(11),
    fontWeight: '800',
    marginBottom: hp('0.2%'),
  },
  impactLabel: {
    color: '#BBF7D0',
    fontSize: RFValue(7.5),
    textAlign: 'center',
    fontWeight: '500',
  },
  whySection: {
    marginBottom: hp('1%'),
  },
  whyTitle: {
    fontSize: RFValue(14),
    fontWeight: '800',
    color: Colors.dark,
    marginBottom: hp('2%'),
  },
  whyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  whyCard: {
    width: '23.5%',
    backgroundColor: '#FCF9F5',
    borderRadius: wp('3%'),
    padding: wp('2%'),
    alignItems: 'center',
    marginBottom: hp('1.5%'),
    borderWidth: 0.5,
    borderColor: Colors.primary,
borderStyle:"dotted"
  },
  whyIconCircle: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  whyCardTitle: {
    fontSize: RFValue(8),
    fontWeight: '800',
    color: Colors.dark,
    marginBottom: hp('0.5%'),
    textAlign: 'center',
  },
  whyCardDesc: {
    fontSize: RFValue(7.5),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: hp('1.2%'),
  },
  joinBanner: {
    backgroundColor: '#F97316',
    borderRadius: wp('4%'),
    overflow: 'hidden',
    height: hp('16%'),
  },
  joinImageAbsolute: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '60%',
    height: '100%',
    resizeMode: 'cover',
  },
  joinGradientAbsolute: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
  joinBgWatermark: {
    position: 'absolute',
    right: -wp('15%'),
    top: -hp('5%'),
  },
  joinContentWrapperFull: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: wp('45%'),
    paddingRight: wp('4%'),
  },
  joinTitle: {
    color: '#FFF',
    fontSize: RFValue(12.5),
    fontWeight: '800',
    marginBottom: hp('0.8%'),
  },
  joinDesc: {
    color: '#FFEDD5',
    fontSize: RFValue(8.5),
    lineHeight: hp('1.5%'),
    marginBottom: hp('1.5%'),
  },
  joinBtn: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: hp('0.8%'),
    paddingHorizontal: wp('3%'),
    borderRadius: wp('2%'),
  },
  joinBtnText: {
    color: '#F97316',
    fontSize: RFValue(9),
    fontWeight: '800',
  },
});
