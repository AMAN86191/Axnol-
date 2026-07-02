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

import { Colors } from '../../theme/colors';
import { AuthButton } from '../../components/AuthButton';
import { LoginHeroSection } from '../../components/LoginHeroSection';
import { RootStackParamList } from '../../navigation/types';
import { ArrowRight, UserPlus, ShieldCheck } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OtpVerificationScreen'>;
type OtpScreenRouteProp = RouteProp<RootStackParamList, 'OtpVerificationScreen'>;

const OtpVerificationScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OtpScreenRouteProp>();
  const phoneNumber = route.params?.phoneNumber || '9876543210';
  
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  
  const inputRefs = useRef<Array<TextInput | null>>([]);

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

  const handleOtpChange = (value: string, index: number) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    
    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);

    if (error) {
      setError('');
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

  const handleVerify = () => {
    const otpString = otp.join('');
    if (otpString.length < 4) {
      setError('Please enter all 4 digits');
      return;
    }
    
    setLoading(true);
    setError('');

    // Simulate backend verification (correct code is 123456)
    setTimeout(() => {
      setLoading(false);
      if (otpString === '1234') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainDrawer' }],
        });
      } else {
        setError('Invalid OTP. Use 1234 for testing.');
      }
    }, 1200);
  };

  const handleResend = () => {
    if (timer > 0) return;
    setTimer(30);
    setOtp(['', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
    Alert.alert('OTP Sent', `A new 4-digit OTP has been sent to +91 ${phoneNumber}.`);
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
                <Text style={styles.cardTitle}>Verify Your Number</Text>
                <Text style={styles.cardSubtitle}>
                  Please enter the 4-digit code sent to{'\n'}
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
                    digit !== '' && styles.otpInputActive
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                />
              ))}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Verify Button */}
            <AuthButton
              title="Verify & Continue"
              loading={loading}
              onPress={handleVerify}
                leftIcon={<UserPlus size={RFValue(14)} color={Colors.white} />}
              rightIcon={<ArrowRight size={RFValue(14)} color={Colors.white} />}
            />
            
            {/* Resend Footer */}
            <View style={styles.footer}>
              {timer > 0 ? (
                <Text style={styles.footerText}>
                  Resend code in <Text style={styles.timerText}>{timer}s</Text>
                </Text>
              ) : (
                <>
                  <Text style={styles.footerText}>Didn't receive the code? </Text>
                  <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                    <Text style={styles.resendText}>Resend</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: wp('12%'),
    marginBottom: hp('3%'),
  },
  otpInput: {
    width: wp('11%'),
    height: wp('11%'),
    borderRadius: wp('2%'),
    borderWidth: 1.5,
    backgroundColor: '#FAFAFA',
    fontSize: RFValue(18),
    fontWeight: '600',
    color: Colors.dark,
    borderColor: '#EAEAEA',
  },
  otpInputActive: {
    borderColor: Colors.primary,
  },
  errorText: {
    fontSize: RFValue(11),
    color: '#DC2626',
    textAlign: 'center',
    // marginBottom: hp('2%'),
    fontWeight: '500',
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
