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
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Mail, User, Phone, Code2, ArrowRight, UserPlus, Calendar, FileText } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../theme/colors';
import { AuthInput } from '../../components/AuthInput';
import { AuthButton } from '../../components/AuthButton';
import { LoginHeroSection } from '../../components/LoginHeroSection';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUpScreen'>;

const SignUpScreen = () => {
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

  const handleSignUp = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('OtpVerificationScreen', { email: email || 'user@example.com' });
    }, 1000);
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
                <Text style={styles.cardTitle}>Join Our Community</Text>
                <Text style={styles.cardSubtitle}>Fill in the details to create an account</Text>
              </View>
            </View>

            {/* Name Field */}
            <AuthInput
              label="Full Name"
              icon={<User size={RFValue(14)} color="#E85D04" />}
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            {/* Email Field */}
            <AuthInput
              label="Email Address"
              icon={<Mail size={RFValue(14)} color="#E85D04" />}
              placeholder="name@gaushala.org"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Phone Number Field */}
            <AuthInput
              label="Phone Number"
              icon={<Phone size={RFValue(14)} color="#E85D04" />}
              placeholder="+91 98765 43210"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            {/* DOB Field */}
            <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={1}>
              <View pointerEvents="none">
                <AuthInput
                  label="Date of Birth"
                  icon={<Calendar size={RFValue(14)} color="#E85D04" />}
                  placeholder="DD/MM/YYYY"
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
              label="Description / Bio"
              icon={<FileText size={RFValue(14)} color="#E85D04" />}
              placeholder="Tell us about yourself"
              value={bio}
              onChangeText={setBio}
            />

            {/* Reference Code Field */}
            <AuthInput
              label="Referral Code"
              icon={<Code2 size={RFValue(14)} color="#E85D04" />}
              placeholder="1234567890"
              value={reff}
              onChangeText={setReff}
              keyboardType="numeric"
            />

            {/* Sign Up Button */}
            <AuthButton
              title="Sign Up"
              leftIcon={<UserPlus size={RFValue(14)} color={Colors.white} />}
              rightIcon={<ArrowRight size={RFValue(14)} color={Colors.white} />}
              onPress={handleSignUp}
              loading={loading}
              loadingText="Creating..."
            />

            {/* Footer Text */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')} activeOpacity={0.7}>
                <Text style={styles.signUpText}>Login</Text>
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
