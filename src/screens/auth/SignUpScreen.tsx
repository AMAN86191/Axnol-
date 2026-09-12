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
  ToastAndroid,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Mail, User, Phone, Code2, ArrowRight, UserPlus, Calendar, FileText } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../theme/colors';
import { AuthInput } from '../../components/AuthInput';
import { AuthButton } from '../../components/AuthButton';
import { RootStackParamList } from '../../navigation/types';
import { sendFirebaseOtp } from '../../services/firebaseAuthService';
import useAuthStore from '../../zustand/useAuthStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUpScreen'>;

const SignUpScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reff, setReff] = useState('');
  const [dob, setDob] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObj, setDateObj] = useState(new Date());

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateObj(selectedDate);
      if (event.type === 'set' || Platform.OS === 'ios') {
        const formattedDate = `${String(selectedDate.getDate()).padStart(2, '0')}/${String(selectedDate.getMonth() + 1).padStart(2, '0')}/${selectedDate.getFullYear()}`;
        setDob(formattedDate);
        setShowDatePicker(false);
      }
    } else {
      setShowDatePicker(false);
    }
  };

  const { checkPhoneExists } = useAuthStore();

  const handleSignUp = async () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.replace(/\s+/g, '');
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      ToastAndroid.show(t('signup.nameRequired'), ToastAndroid.LONG);
      return;
    }
    if (!/^[0-9]{10}$/.test(trimmedPhone)) {
      ToastAndroid.show(t('signup.invalidPhone'), ToastAndroid.LONG);
      return;
    }
  

    setLoading(true);
    try {
      // 1. user/send-otp se pata chalta hai ke number pehle se registered hai ya nahi
      const { exists } = await checkPhoneExists(trimmedPhone);
      if (exists) {
        setLoading(false);
        const msg = t('signup.alreadyRegistered');
        if (Platform.OS === 'android') {
          ToastAndroid.show(msg, ToastAndroid.LONG);
        } else {
          Alert.alert(t('signup.registrationFailed'), msg);
        }
        return;
      }

      // 2. Number naya hai -> tabhi Firebase OTP bhejo
      const formattedDob = dob ? `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}` : '';

     const res =  await sendFirebaseOtp(trimmedPhone);
     console.log('Firebase OTP response:', res);

      setLoading(false);
      navigation.navigate('OtpVerificationScreen', {
        phoneNumber: trimmedPhone,
        mode: 'signup',
        signupData: {
          name: trimmedName,
          email: trimmedEmail,
          dob: formattedDob,
          bio: bio.trim(),
          refer_by: reff.trim(),
        },
      });
    } catch (err: any) {
      setLoading(false);
      console.log('errorMesssage :', err);
      const isFirebaseError = typeof err?.code === 'string' && err.code.startsWith('auth/');
      const errorMessage = isFirebaseError
        ? t('signup.otpFailed')
        : err?.response?.data?.message || err?.message || t('signup.registerFailed');
      if (Platform.OS === 'android') {
        ToastAndroid.show(errorMessage, ToastAndroid.LONG);
      } else {
        Alert.alert(t('signup.registrationFailed'), errorMessage);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Top Hero Image (Sticky Background) */}
      <View style={styles.heroImageContainer}>
        <Image
          source={require('../../../assets/images/login_hero.jpeg')}
          style={styles.heroImage}
        />
      </View>

      {/* Bottom Background Image (Sticky Background) */}
      <Image
        source={require('../../../assets/images/login_bottom_cows.png')}
        style={styles.bottomImageFixed}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Spacer to push card below the hero image */}
          <View style={styles.spacer} />

          {/* Sign Up Card */}
          <View style={styles.loginCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <UserPlus size={RFValue(15)} color={Colors.primary} />
              </View>
              <View style={styles.cardHeaderTextContent}>
                <Text style={styles.cardTitle}>{t('signup.title')}</Text>
                <Text style={styles.cardSubtitle}>{t('signup.subtitle')}</Text>
              </View>
            </View>

            {/* Name Field */}
            <AuthInput
              label={t('signup.fullName')}
              icon={<User size={RFValue(14)} color="#E85D04" />}
              placeholder={t('signup.namePlaceholder')}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            {/* Email Field */}
            <AuthInput
              label={t('signup.email')}
              icon={<Mail size={RFValue(14)} color="#E85D04" />}
              placeholder={t('signup.emailPlaceholder')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Phone Number Field */}
            <AuthInput
              label={t('signup.phone')}
              icon={<Phone size={RFValue(14)} color="#E85D04" />}
              placeholder={t('signup.phonePlaceholder')}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}

            />

            {/* DOB Field */}
            <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={1}>
              <View pointerEvents="none">
                <AuthInput
                  label={t('signup.dob')}
                  icon={<Calendar size={RFValue(14)} color="#E85D04" />}
                  placeholder={t('signup.dobPlaceholder')}
                  value={dob}
                  editable={false}
                />
              </View>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dateObj}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}

            {/* Description/Bio Field */}
            <AuthInput
              label={t('signup.bio')}
              icon={<FileText size={RFValue(14)} color="#E85D04" />}
              placeholder={t('signup.bioPlaceholder')}
              value={bio}
              onChangeText={setBio}
            />

            {/* Reference Code Field */}
            <AuthInput
              label={t('signup.referralCode')}
              icon={<Code2 size={RFValue(14)} color="#E85D04" />}
              placeholder={t('signup.referralPlaceholder')}
              value={reff}
              onChangeText={setReff}
              keyboardType="default"
            />

            {/* Sign Up Button */}
            <AuthButton
              title={t('signup.signUp')}
              leftIcon={<UserPlus size={RFValue(14)} color={Colors.white} />}
              rightIcon={<ArrowRight size={RFValue(14)} color={Colors.white} />}
              onPress={handleSignUp}
              loading={loading}
              loadingText={t('signup.creating')}
            />

            {/* Footer Text */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('signup.hasAccount')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')} activeOpacity={0.7}>
                <Text style={styles.signUpText}>{t('signup.login')}</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp('5%'),
  },
  spacer: {
    height: hp('30%'),
  },
  heroImageContainer: {
    width: '100%',
    height: hp('40%'),
    position: 'absolute',
    top: 0,
    // zIndex: -10,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bottomImageFixed: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: hp('45%'),
    resizeMode: 'cover',
    marginBottom: hp('4%'),
    opacity: 1,

  },
  loginCard: {
    backgroundColor: Colors.white,
    borderRadius: wp('6%'),
    padding: wp('5%'),
    marginHorizontal: wp('4%'),
    marginBottom: hp('3%'),
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
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
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('2%'),
  },
  footerText: {
    fontSize: RFValue(10),
    color: Colors.gray,
    fontWeight: '500',
  },
  signUpText: {
    fontSize: RFValue(10),
    fontWeight: '700',
    color: Colors.primary,
  },
});
