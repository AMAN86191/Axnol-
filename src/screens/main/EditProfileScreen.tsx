import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';
import { User, Mail, Phone, KeyRound, Briefcase, Calendar, Info, Camera } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Colors } from '../../theme/colors';
import { InputField } from '../../components/InputField';
import { CustomButton } from '../../components/CustomButton';
import { CommonHeader } from '../../components/CommonHeader';
import useAuthStore from '../../zustand/useAuthStore';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, updateProfile } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profession, setProfession] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // Date States
  const [dob, setDob] = useState('');
  const [dom, setDom] = useState('');
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showDomPicker, setShowDomPicker] = useState(false);
  const [dateObjDob, setDateObjDob] = useState(new Date());
  const [dateObjDom, setDateObjDom] = useState(new Date());

  // Flow States
  const [showOtpView, setShowOtpView] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');

      setDob(user.profile?.dob || '');
      setDom(user.profile?.dom || '');
      setProfession(user.profile?.profession || '');
      setBio(user.profile?.bio || '');
      setCountry(user.profile?.country || '');
      setProfilePic(user.profile?.profile_pic ? `${user.profile.profile_pic}` : null);
    }
  }, [user]);

  const onDobChange = (event: any, selectedDate?: Date) => {
    setShowDobPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateObjDob(selectedDate);
      if (event.type === 'set' || Platform.OS === 'ios') {
        const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        setDob(formattedDate);
        setShowDobPicker(false);
      }
    } else {
      setShowDobPicker(false);
    }
  };

  const onDomChange = (event: any, selectedDate?: Date) => {
    setShowDomPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateObjDom(selectedDate);
      if (event.type === 'set' || Platform.OS === 'ios') {
        const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        setDom(formattedDate);
        setShowDomPicker(false);
      }
    } else {
      setShowDomPicker(false);
    }
  };

  const handleChoosePhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.5,
    });

    if (!result.didCancel && result.assets && result.assets.length > 0) {
      setProfilePic(result.assets[0].uri || null);
    }
  };

  const performUpdate = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);

      formData.append('dob', dob);
      formData.append('dom', dom);
      formData.append('profession', profession);
      formData.append('bio', bio);
      formData.append('country', country);

      if (profilePic && !profilePic.startsWith('http')) {
        formData.append('profile_pic', {
          uri: profilePic,
          name: profilePic.split('/').pop() || 'profile.jpg',
          type: profilePic.endsWith('.png') ? 'image/png' : 'image/jpeg',
        } as any);
      }
      console.log('formData', formData)
      const res = await updateProfile(formData);
      console.log('update profile res', res)
      Alert.alert('Success 🎉', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name');
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      Alert.alert('Validation Error', 'Please enter a valid phone number');
      return;
    }

    const currentPhone = user?.phone || '';
    const isPhoneChanged = phone.trim() !== currentPhone.trim();

    if (isPhoneChanged) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setShowOtpView(true);
        Alert.alert(
          'Verification Code Sent 📱',
          `An OTP code has been sent to ${phone}. Enter '123456' to verify.`,
          [{ text: 'OK' }]
        );
      }, 1000);
    } else {
      performUpdate();
    }
  };

  const handleVerifyOtp = () => {
    if (otpCode !== '123456') {
      Alert.alert('Verification Failed ❌', 'Invalid OTP code. Please enter the correct code: 123456');
      return;
    }

    setShowOtpView(false);
    performUpdate();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <CommonHeader
        title={showOtpView ? 'Verify OTP' : 'Edit Profile'}
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {!showOtpView ? (
            <View style={styles.formContainer}>

              {/* Profile Photo Picker */}
              <View style={styles.photoContainer}>
                <TouchableOpacity style={styles.photoPicker} onPress={handleChoosePhoto} activeOpacity={0.8}>
                  {profilePic ? (
                    <Image source={{ uri: profilePic }} style={styles.profileImage} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Camera size={24} color={Colors.gray} />
                      <Text style={styles.photoText}>Add Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <InputField
                label="Display Name"
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                leftIcon={<User size={RFValue(12)} color={Colors.primary} />}
              />

              <InputField
                label="Email Address"
                placeholder="Enter your email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                leftIcon={<Mail size={RFValue(12)} color={Colors.primary} />}
              />

              <InputField
                label="Phone Number"
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                leftIcon={<Phone size={RFValue(12)} color={Colors.primary} />}
              />

           

              <InputField
                label="Profession"
                placeholder="Enter your profession"
                value={profession}
                onChangeText={setProfession}
                leftIcon={<Briefcase size={RFValue(12)} color={Colors.primary} />}
              />

              <InputField
                label="Country"
                placeholder="Enter your country"
                value={country}
                onChangeText={setCountry}
                leftIcon={<Info size={RFValue(12)} color={Colors.primary} />}
              />

              {/* Date of Birth Picker */}
              <TouchableOpacity onPress={() => setShowDobPicker(true)} activeOpacity={1}>
                <View pointerEvents="none">
                  <InputField
                    label="Date of Birth"
                    placeholder="YYYY-MM-DD"
                    value={dob}
                    editable={false}
                    leftIcon={<Calendar size={RFValue(12)} color={Colors.primary} />}
                  />
                </View>
              </TouchableOpacity>
              {showDobPicker && (
                <DateTimePicker
                  value={dateObjDob}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDobChange}
                  maximumDate={new Date()}
                />
              )}

              {/* Date of Marriage Picker */}
              <View style={{ position: 'relative' }}>
                <TouchableOpacity onPress={() => setShowDomPicker(true)} activeOpacity={1}>
                  <View pointerEvents="none">
                    <InputField
                      label="Date of Marriage (Optional)"
                      placeholder="YYYY-MM-DD"
                      value={dom}
                      editable={false}
                      leftIcon={<Calendar size={RFValue(12)} color={Colors.primary} />}
                    />
                  </View>
                </TouchableOpacity>
                {!!dom && (
                  <TouchableOpacity 
                    onPress={() => setDom('')}
                    style={{ position: 'absolute', right: 0, top: -hp('0.2%'), paddingHorizontal: wp('2%'), paddingVertical: hp('0.5%'), zIndex: 10 }}
                  >
                    <Text style={{ fontSize: RFValue(11), color: Colors.primary, fontWeight: '600' }}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
              {showDomPicker && (
                <DateTimePicker
                  value={dateObjDom}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDomChange}
                  maximumDate={new Date()}
                />
              )}

              <InputField
                label="Bio"
                placeholder="Tell us about yourself"
                value={bio}
                onChangeText={setBio}
                leftIcon={<Info size={RFValue(12)} color={Colors.primary} />}
              />

              <Text style={styles.noteText}>
                * Note: Changing your phone number will require entering a one-time password (OTP) to verify it.
              </Text>

              <CustomButton
                title="Save Changes"
                loading={loading}
                onPress={handleSave}
                style={styles.saveBtn}
              />
            </View>
          ) : (
            <View style={styles.otpContainer}>
              <Text style={styles.otpDescription}>
                Please enter the 6-digit verification code sent to your new phone number <Text style={styles.boldText}>{phone}</Text>.
              </Text>

              <InputField
                label="Verification Code (OTP)"
                placeholder="Enter 6-digit OTP (123456)"
                keyboardType="number-pad"
                maxLength={6}
                value={otpCode}
                onChangeText={setOtpCode}
                leftIcon={<KeyRound size={RFValue(12)} color={Colors.primary} />}
              />

              <View style={styles.otpActionsRow}>
                <TouchableOpacity
                  onPress={() => setShowOtpView(false)}
                  style={styles.backBtn}
                  disabled={loading}
                >
                  <Text style={styles.backBtnText}>Edit Details</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    Alert.alert('Resent 📱', 'Verification code has been resent.');
                  }}
                  style={styles.resendBtn}
                  disabled={loading}
                >
                  <Text style={styles.resendBtnText}>Resend Code</Text>
                </TouchableOpacity>
              </View>

              <CustomButton
                title="Verify & Update"
                loading={loading}
                onPress={handleVerifyOtp}
                style={styles.saveBtn}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('10%'),
  },
  formContainer: {
    width: '100%',
  },
  photoContainer: {
    alignItems: 'center',
    marginVertical: hp('2%'),
  },
  photoPicker: {
    width: wp('26%'),
    height: wp('26%'),
    borderRadius: wp('13%'),
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    fontSize: RFValue(8.5),
    color: Colors.gray,
    marginTop: hp('0.5%'),
  },
  noteText: {
    fontSize: RFValue(8.2),
    color: Colors.gray,
    marginTop: hp('0.5%'),
    marginBottom: hp('1.5%'),
    lineHeight: hp('1.4%'),
  },
  saveBtn: {
    marginTop: hp('1%'),
    width: '100%',
  },
  otpContainer: {
    marginTop: hp('2%'),
  },
  otpDescription: {
    fontSize: RFValue(11),
    color: Colors.dark,
    lineHeight: hp('2%'),
    marginBottom: hp('3%'),
  },
  boldText: {
    fontWeight: '700',
    color: Colors.primary,
  },
  otpActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2%'),
    marginTop: hp('0.5%'),
    paddingHorizontal: wp('1%'),
  },
  backBtn: {
    paddingVertical: hp('0.5%'),
  },
  backBtnText: {
    fontSize: RFValue(9.5),
    color: Colors.gray,
    fontWeight: '600',
  },
  resendBtn: {
    paddingVertical: hp('0.5%'),
  },
  resendBtnText: {
    fontSize: RFValue(9.5),
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default EditProfileScreen;
