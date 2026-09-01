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
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Phone, Heart, ShieldCheck, ArrowRight, Shield, Award, Smartphone } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../theme/colors';
import { RootStackParamList } from '../../navigation/types';
import { AuthInput } from '../../components/AuthInput';
import { AuthButton } from '../../components/AuthButton';
import { LoginHeroSection } from '../../components/LoginHeroSection';
import useAuthStore from '../../zustand/useAuthStore';

// Google SVG Icon
const GoogleIcon = ({ size = 18 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </Svg>
);

// Trust Badges Data
const TRUST_BADGES = [
  { id: 1, title: 'Secure & Safe', subtitle: 'Your data is protected', Icon: Shield, color: '#E85D04' },
  { id: 2, title: 'Trusted Platform', subtitle: 'Used by thousands', Icon: Award, color: '#E85D04' },
  { id: 3, title: 'For a Better Cause', subtitle: 'Support Gaushala', Icon: Heart, color: '#E85D04' },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LoginScreen'>;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuthStore();

  const handleSendOTP = async () => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneNumber) {
      setError('Mobile number is required');
      return;
    }
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid 10-digit mobile number');
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
      setError(err?.response?.data?.message || err?.message || 'Failed to send OTP');
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
                <Text style={styles.cardTitle}>Sign In to Your Account</Text>
                <Text style={styles.cardSubtitle}>Enter your mobile number to continue</Text>
              </View>
            </View>

            <AuthInput
              label="Mobile Number"
              icon={<Phone size={RFValue(14)} color="#E85D04" />}
              placeholder="Enter 10-digit mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              error={error}
            />

            <AuthButton
              title="Send OTP"
              leftIcon={<ShieldCheck size={RFValue(14)} color={Colors.white} />}
              rightIcon={<ArrowRight size={RFValue(14)} color={Colors.white} />}
              onPress={handleSendOTP}
              loading={loading}
              loadingText="Sending..."
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8} onPress={() => Alert.alert('Coming Soon', 'Login with Google is coming soon!')}>
              <GoogleIcon />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

          </View>

          {/* Trust Badges Row */}
          <View style={styles.trustBadgesContainer}>
            {TRUST_BADGES.map((badge) => {
              const IconComp = badge.Icon;
              return (
                <View key={badge.id} style={styles.trustBadgeItem}>
                  <IconComp size={RFValue(16)} color={badge.color} style={{ marginBottom: hp('0.5%') }} />
                  <Text style={styles.trustBadgeTitle}>{badge.title}</Text>
                  <Text style={styles.trustBadgeSubtitle}>{badge.subtitle}</Text>
                </View>
              );
            })}
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpRow}>
            <Text style={styles.dontHaveText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')} activeOpacity={0.7}>
              <Text style={styles.signUpBtnText}>Sign Up →</Text>
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
    padding: wp('3%'),
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
    marginTop: hp('1%'),
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