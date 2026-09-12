import React, { useState, useRef, useEffect } from 'react';
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
  TextInput,
  Alert,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { Colors } from '../../theme/colors';
import { AuthButton } from '../../components/AuthButton';
import { LoginHeroSection } from '../../components/LoginHeroSection';
import { RootStackParamList } from '../../navigation/types';
import { ArrowRight, UserPlus, ShieldCheck, AlertCircle } from 'lucide-react-native';
import useAuthStore from '../../zustand/useAuthStore';
import { getFCMToken } from '../../utils/notificationService';
import { confirmFirebaseOtp, resendFirebaseOtp, hasPendingConfirmation } from '../../services/firebaseAuthService';
import { getIdToken } from '@react-native-firebase/auth';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OtpVerificationScreen'>;
type OtpScreenRouteProp = RouteProp<RootStackParamList, 'OtpVerificationScreen'>;

type OtpError = { message: string; isApi: boolean }; 

const OtpVerificationScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OtpScreenRouteProp>();
  const phoneNumber = route.params?.phoneNumber || '9876543210';
  const mode = route.params?.mode || 'login';
  const signupData = route.params?.signupData;
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState<OtpError | null>(null);
  
  const { otpVerify, register } = useAuthStore();
  
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Minimum OTP box size so digits never get clipped on small screens / high font scales.
  const otpBoxSize = Math.max(wp('10%'), 44);

  const getFriendlyError = (err: any, isApiFallback: boolean): OtpError => {
    if (err?.response?.data?.message) {
      return { message: String(err.response.data.message), isApi: true };
    }
    if (err?.response?.data?.data?.message) {
      return { message: String(err.response.data.data.message), isApi: true };
    }
    if (err?.response) {
      return { message: t('otp.errors.apiFailed'), isApi: true };
    }
    switch (err?.code) {
      case 'auth/invalid-verification-code':
        return { message: t('otp.errors.invalidCode', { phone: phoneNumber }), isApi: false };
      case 'auth/code-expired':
        return { message: t('otp.errors.codeExpired'), isApi: false };
      case 'auth/too-many-requests':
        return { message: t('otp.errors.tooManyRequests'), isApi: false };
      case 'auth/quota-exceeded':
        return { message: t('otp.errors.quotaExceeded'), isApi: false };
      case 'auth/operation-not-allowed':
        return { message: t('otp.errors.notAllowed'), isApi: false };
      case 'auth/network-request-failed':
        return { message: t('otp.errors.network'), isApi: false };
      default:
        return { message: err?.message || t('otp.invalidOtp'), isApi: isApiFallback };
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timer]);

  // If we arrived directly (e.g. from Sign Up) without a pending Firebase confirmation,
  // trigger the OTP send automatically.
  useEffect(() => {
    if (!hasPendingConfirmation()) {
      (async () => {
        try {
          await resendFirebaseOtp(phoneNumber);
        } catch (e: any) {
          setError(getFriendlyError(e, false));
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    
    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);

    if (error) {
      setError(null);
    }

    // Move to next input if value is entered
    if (numericValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) {
      setError({ message: t('otp.enterAllDigits'), isApi: false });
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const fcmToken = await getFCMToken();
      const firebaseUser = await confirmFirebaseOtp(otpString);
      console.log('Firebase user after OTP confirmation:', firebaseUser);
      const firebaseIdToken = await getIdToken(firebaseUser);
      let res: any;
      if (mode === 'signup' && signupData) {
        // Signup: OTP verify hone ke baad hi user create hota hai
        res = await register({
          ...signupData,
          phone: phoneNumber,
          otp: otpString,
          fcm_token: fcmToken,
          firebase_id_token: firebaseIdToken,
        });
      } else {
        res = await otpVerify({
          phone: phoneNumber,
          otp: otpString,
          fcm_token: fcmToken,
          firebase_id_token: firebaseIdToken,
        });
      }
      console.log('OTP verification response:', res);
      setLoading(false);
      
      if (res?.token) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainDrawer' }],
        });
      }
    } catch (err: any) {
      setLoading(false);
      const isApi = !!err?.response || err?.isAxiosError;
      setError(getFriendlyError(err, isApi));
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      await resendFirebaseOtp(phoneNumber);
      setTimer(30);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      Alert.alert(t('otp.otpSent'), t('otp.otpSentMessage', { phone: phoneNumber }));
    } catch (err: any) {
      setTimer(0);
      setError(getFriendlyError(err, false));
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      
      {/* Hero Section */}
      <LoginHeroSection title="" subtitle="" showHeart={false} />

      {/* Bottom Background Image */}
      <Image
        source={require('../../../assets/images/login_bottom_cows.png')}
        style={styles.bottomImage}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Spacer to push card below the header content */}
          <View style={styles.spacer} />

          {/* Form Card Container */}
          <View style={styles.loginCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <ShieldCheck size={RFValue(15)} color={Colors.primary} />
              </View>
              <View style={styles.cardHeaderTextContent}>
                <Text style={styles.cardTitle}>{t('otp.verifyNumber')}</Text>
                <Text style={styles.cardSubtitle}>
                  {t('otp.enterCode')}{'\n'}
                  <Text style={styles.phoneText}>+91 {phoneNumber}</Text>
                </Text>
              </View>
            </View>

            {/* OTP Input Container */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={[
                    styles.otpInput,
                    { width: otpBoxSize, height: otpBoxSize },
                    digit !== '' && styles.otpInputActive
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  textAlignVertical="center"
                  selectTextOnFocus
                />
              ))}
            </View>

            {error ? (
              <View style={[styles.errorBox, error.isApi && styles.errorBoxApi]}>
                <AlertCircle size={RFValue(13)} color="#DC2626" />
                <Text style={styles.errorText}>{error.message}</Text>
              </View>
            ) : null}

            {/* Verify Button */}
            <AuthButton
              title={t('otp.verifyContinue')}
              loading={loading}
              onPress={handleVerify}
                leftIcon={<UserPlus size={RFValue(14)} color={Colors.white} />}
              rightIcon={<ArrowRight size={RFValue(14)} color={Colors.white} />}
            />
            
            {/* Resend Footer */}
            <View style={styles.footer}>
              {timer > 0 ? (
                <Text style={styles.footerText}>
                  {t('otp.resendIn', { time: timer })}
                </Text>
              ) : (
                <>
                  <Text style={styles.footerText}>{t('otp.didntReceive')}</Text>
                  <TouchableOpacity onPress={handleResend} activeOpacity={0.7} disabled={resending}>
                    <Text style={styles.resendText}>{resending ? t('otp.resending') : t('otp.resend')}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default OtpVerificationScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  bottomImage: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    resizeMode: 'cover',
    marginBottom: hp('4%'),
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('5%'),
  },
  spacer: {
    height: hp('30%'),
  },
  loginCard: {
    backgroundColor: Colors.white,
    borderRadius: wp('6%'),
    padding: wp('5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: hp('3%'),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
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
    justifyContent: 'center',
    alignItems: 'flex-start',
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
    textAlign: 'left',
  },
  phoneText: {
    fontWeight: '700',
    color: Colors.primary,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: wp('4%'),
    marginBottom: hp('3%'),
  },
  otpInput: {
    borderRadius: wp('2%'),
    borderWidth: 1.5,
    backgroundColor: '#FAFAFA',
    fontSize: RFValue(18),
    fontWeight: '600',
    color: Colors.dark,
    borderColor: '#EAEAEA',
    padding: 0,
    fontVariant: ['tabular-nums'],
  },
  otpInputActive: {
    borderColor: Colors.primary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: wp('2.5%'),
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1.2%'),
    marginBottom: hp('1.8%'),
  },
  errorBoxApi: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  errorText: {
    flex: 1,
    fontSize: RFValue(10.5),
    color: '#B91C1C',
    textAlign: 'left',
    fontWeight: '500',
    lineHeight: RFValue(15),
    marginLeft: wp('2%'),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('1%'),
  },
  footerText: {
    fontSize: RFValue(12),
    color: Colors.gray,
  },
  resendText: {
    fontSize: RFValue(12),
    fontWeight: '600',
    color: Colors.primary,
  },
  timerText: {
    fontWeight: '700',
    color: Colors.primary,
  },
});
