import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Phone, Heart, ShieldCheck, ArrowRight, Shield, Award, Smartphone } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../theme/colors';
import { RootStackParamList } from '../../navigation/types';
import { AuthInput } from '../../components/AuthInput';
import { AuthButton } from '../../components/AuthButton';
import { LoginHeroSection } from '../../components/LoginHeroSection';
import useAuthStore from '../../zustand/useAuthStore';

// Trust Badges Data
const TRUST_BADGES = [
  { id: 1, titleKey: 'hero.secureSafe', subtitleKey: 'hero.dataProtected', Icon: Shield, color: '#E85D04' },
  { id: 2, titleKey: 'hero.trustedPlatform', subtitleKey: 'hero.usedByThousands', Icon: Award, color: '#E85D04' },
  { id: 3, titleKey: 'hero.betterCause', subtitleKey: 'hero.supportGaushala', Icon: Heart, color: '#E85D04' },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LoginScreen'>;

const LoginScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuthStore();

  const handleSendOTP = async () => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneNumber) {
      setError(t('login.mobileRequired'));
      return;
    }
    if (!phoneRegex.test(phoneNumber)) {
      setError(t('login.invalidMobile'));
      return;
    }

    setError('');
    
    try {
      setLoading(true);
      await login({ phone: phoneNumber });
      setLoading(false);
      navigation.navigate('OtpVerificationScreen', { phoneNumber });
    } catch (err: any) {
      setLoading(false);
      setError(err?.response?.data?.message || err?.message || t('login.otpFailed'));
    }
  };

  const handlePhoneChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setPhoneNumber(numericText);
    if (error) setError('');
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Hero Section */}
      <LoginHeroSection title="" subtitle="" showHeart={false} />

      {/* Bottom Background Image */}
      <Image
        source={require('../../../assets/images/login_bottom_cows.png')}
        style={[styles.bottomImage]}
      />

      {/* Main Form Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, hp('2%')) }]}
        >
          {/* Spacer to push card below the header content */}
          <View style={styles.spacer} />

          {/* Login Card */}
          <View style={styles.loginCard}>

            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Smartphone size={RFValue(15)} color={Colors.primary} />
              </View>
              <View style={styles.cardHeaderTextContent}>
                <Text style={styles.cardTitle}>{t('login.title')}</Text>
                <Text style={styles.cardSubtitle}>{t('login.subtitle')}</Text>
              </View>
            </View>

            <AuthInput
              label={t('login.mobileNumber')}
              icon={<Phone size={RFValue(14)} color="#E85D04" />}
              placeholder={t('login.mobilePlaceholder')}
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              error={error}
            />

            <AuthButton
              title={t('login.sendOtp')}
              leftIcon={<ShieldCheck size={RFValue(14)} color={Colors.white} />}
              rightIcon={<ArrowRight size={RFValue(14)} color={Colors.white} />}
              onPress={handleSendOTP}
              loading={loading}
              loadingText={t('login.sending')}
            />

            {/* <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('login.or')}</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8} onPress={() => Alert.alert(t('login.googleComingSoon'), t('login.googleMessage'))}>
              <GoogleIcon />
              <Text style={styles.googleBtnText}>{t('login.continueWithGoogle')}</Text>
            </TouchableOpacity> */}

          </View>

          {/* Trust Badges Row */}
          <View style={styles.trustBadgesContainer}>
            {TRUST_BADGES.map((badge) => {
              const IconComp = badge.Icon;
              return (
                <View key={badge.id} style={styles.trustBadgeItem}>
                  <IconComp size={RFValue(16)} color={badge.color} style={{ marginBottom: hp('0.5%') }} />
                  <Text style={styles.trustBadgeTitle}>{t(badge.titleKey)}</Text>
                  <Text style={styles.trustBadgeSubtitle}>{t(badge.subtitleKey)}</Text>
                </View>
              );
            })}
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpRow}>
            <Text style={styles.dontHaveText}>{t('login.noAccount')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')} activeOpacity={0.7}>
              <Text style={styles.signUpBtnText}>{t('login.signUp')}</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  logo: {
    height: hp('6%'),
    width: wp('25%'),
    resizeMode: 'contain',
    zIndex: 10
  },
  bottomImage: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: hp('45%'),
    resizeMode: 'cover',
    marginBottom: hp('4%'),
    opacity: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp('4%'),
  },
  spacer: {
    height: hp('35%'),
  },
  loginCard: {
    backgroundColor: Colors.white,
    borderRadius: wp('4%'),
    paddingHorizontal: wp('2%'),
    paddingVertical: wp('5%'),
    borderWidth: 1,
    borderColor: '#FFFFFF',
    marginBottom: hp('3%'),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  iconCircle: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5.5%'),
    backgroundColor: '#FFF2EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%'),
  },
  cardHeaderTextContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start"
  },
  cardTitle: {
    fontSize: RFValue(12.5),
    fontWeight: '800',
    color: Colors.dark,
    marginBottom: hp('0.3%'),
  },
  cardSubtitle: {
    fontSize: RFValue(9),
    color: Colors.gray,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('2%'),
    marginBottom: hp('2%'),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: wp('3%'),
    fontSize: RFValue(8),
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: hp('5.5%'),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: wp('2.5%'),
    backgroundColor: '#FFFFFF',
  },
  googleBtnText: {
    fontSize: RFValue(11.5),
    fontWeight: '700',
    color: '#334155',
    marginLeft: wp('3%'),
  },
  trustBadgesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp('2%'),
    marginBottom: hp('1%'),
    marginTop: hp('2%'),
  },
  trustBadgeItem: {
    alignItems: 'center',
    flex: 1,
  },
  trustBadgeTitle: {
    fontSize: RFValue(8),
    fontWeight: '800',
    color: '#334155',
    marginTop: hp('0.5%'),
    textAlign: 'center',
  },
  trustBadgeSubtitle: {
    fontSize: RFValue(7),
    color: '#64748B',
    textAlign: 'center',
    marginTop: hp('0.2%'),
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('2%'),
    marginBottom: hp('6%'),
  },
  dontHaveText: {
    fontSize: RFValue(11),
    color: '#475569',
    fontWeight: '500',
  },
  signUpBtnText: {
    fontSize: RFValue(11),
    fontWeight: '800',
    color: '#E85D04',
  },
});

export default LoginScreen;