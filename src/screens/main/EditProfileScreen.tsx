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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';
import { User, Mail, Phone, KeyRound, Briefcase, Calendar, Info, Camera, MapPin, Building, Home, Globe } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Colors } from '../../theme/colors';
import { InputField } from '../../components/InputField';
import { CustomButton } from '../../components/CustomButton';
import { CommonHeader } from '../../components/CommonHeader';
import useAuthStore from '../../zustand/useAuthStore';
import { useTranslation } from 'react-i18next';

const EditProfileScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user, updateProfile } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profession, setProfession] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [selectedProfession, setSelectedProfession] = useState('');
  const [customProfession, setCustomProfession] = useState('');
  const [pincodeFetching, setPincodeFetching] = useState(false);

  const professionOptions = ['Student', 'Housewife', 'Salaried', 'Businessman', 'Other'];
  const presetProfessions = ['Student', 'Housewife', 'Salaried', 'Businessman'];

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
      const savedProfession = user.profile?.profession || '';
      setProfession(savedProfession);
      setCustomProfession(savedProfession);
      setSelectedProfession(
        presetProfessions.includes(savedProfession) ? savedProfession : (savedProfession ? 'Other' : '')
      );
      setBio(user.profile?.bio || '');
      setCountry(user.profile?.country || '');
      setCity(user.profile?.city || '');
      setState(user.profile?.state || '');
      setPincode(user.profile?.pincode || '');
      setAddress(user.profile?.address || '');
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

  const handlePincodeChange = async (text: string) => {
    setPincode(text);
    const normalized = text.replace(/\D/g, '');
    if (normalized.length === 6) {
      setPincodeFetching(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${normalized}`);
        const data = await response.json();
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const postOffice = data[0].PostOffice[0];
          setCity(postOffice.District || '');
          setState(postOffice.State || '');
          setCountry(postOffice.Country || '');
        } else {
          setCity('');
          setState('');
          setCountry('');
        }
      } catch (error) {
        console.log('Error fetching pincode:', error);
        setCity('');
        setState('');
        setCountry('');
      } finally {
        setPincodeFetching(false);
      }
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
      formData.append('city', city);
      formData.append('state', state);
      formData.append('pincode', pincode);
      formData.append('address', address);

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
      Alert.alert(t('common.success'), t('editProfile.profileUpdated'), [
        { text: t('common.ok'), onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert(t('common.error'), t('editProfile.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(t('addPost.validationError'), t('editProfile.nameRequired'));
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      Alert.alert(t('addPost.validationError'), t('editProfile.invalidPhone'));
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
          t('editProfile.otpSent'),
          t('editProfile.otpSentMessage', { phone }),
          [{ text: t('common.ok') }]
        );
      }, 1000);
    } else {
      performUpdate();
    }
  };

  const handleVerifyOtp = () => {
    if (otpCode !== '123456') {
      Alert.alert(t('editProfile.otpFailed'), t('editProfile.otpFailedMessage'));
      return;
    }

    setShowOtpView(false);
    performUpdate();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <CommonHeader
        title={showOtpView ? t('editProfile.verifyOtp') : t('editProfile.title')}
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
                      <Text style={styles.photoText}>{t('editProfile.addPhoto')}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <InputField
                label={t('editProfile.displayName')}
                placeholder={t('editProfile.namePlaceholder')}
                value={name}
                onChangeText={setName}
                leftIcon={<User size={RFValue(12)} color={Colors.primary} />}
              />

              <InputField
                label={t('editProfile.email')}
                placeholder={t('editProfile.emailPlaceholder')}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                leftIcon={<Mail size={RFValue(12)} color={Colors.primary} />}
              />

              <InputField
                label={t('editProfile.phone')}
                placeholder={t('editProfile.phonePlaceholder')}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                leftIcon={<Phone size={RFValue(12)} color={Colors.primary} />}
              />



              <Text style={styles.fieldLabel}>{t('editProfile.profession')}</Text>
              <View style={styles.professionChips}>
                {professionOptions.map((option) => {
                  const isSelected = selectedProfession === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.professionChip, isSelected && styles.professionChipSelected]}
                      onPress={() => {
                        setSelectedProfession(option);
                        setProfession(option);
                        setCustomProfession('');
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.professionChipText, isSelected && styles.professionChipTextSelected]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {selectedProfession === 'Other' && (
                <InputField
                  label={t('editProfile.customProfession')}
                  placeholder={t('editProfile.customProfessionPlaceholder')}
                  value={customProfession}
                  onChangeText={(text) => {
                    setCustomProfession(text);
                    setProfession(text);
                  }}
                  leftIcon={<Briefcase size={RFValue(12)} color={Colors.primary} />}
                />
              )}

              <InputField
                label={t('editProfile.address')}
                placeholder={t('editProfile.addressPlaceholder')}
                value={address}
                onChangeText={setAddress}
                leftIcon={<Home size={RFValue(12)} color={Colors.primary} />}
              />



              {/* Date of Birth Picker */}
              <TouchableOpacity onPress={() => setShowDobPicker(true)} activeOpacity={1}>
                <View pointerEvents="none">
                  <InputField
                    label={t('editProfile.dob')}
                    placeholder={t('editProfile.dobPlaceholder')}
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
                      label={t('editProfile.dom')}
                      placeholder={t('editProfile.dobPlaceholder')}
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
                    <Text style={{ fontSize: RFValue(11), color: Colors.primary, fontWeight: '600' }}>{t('editProfile.clear')}</Text>
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
                label={t('editProfile.bio')}
                placeholder={t('editProfile.bioPlaceholder')}
                value={bio}
                onChangeText={setBio}
                leftIcon={<Info size={RFValue(12)} color={Colors.primary} />}
              />
              <View style={styles.rowContainer}>
                <View style={styles.halfWidth}>
                  <InputField
                    label={t('editProfile.city')}
                    placeholder={t('editProfile.cityPlaceholder')}
                    value={city}
                    onChangeText={setCity}
                    leftIcon={<Building size={RFValue(12)} color={Colors.primary} />}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <InputField
                    label={t('editProfile.pincode')}
                    placeholder={t('editProfile.pincodePlaceholder')}
                    value={pincode}
                    onChangeText={handlePincodeChange}
                    keyboardType="numeric"
                    maxLength={6}
                    leftIcon={<MapPin size={RFValue(12)} color={Colors.primary} />}
                    rightIcon={pincodeFetching ? <ActivityIndicator size="small" color={Colors.primary} /> : undefined}
                  />
                </View>
              </View>

              <View style={styles.rowContainer}>
                <View style={styles.halfWidth}>
                  <InputField
                    label={t('editProfile.state')}
                    placeholder={t('editProfile.statePlaceholder')}
                    value={state}
                    onChangeText={setState}
                    leftIcon={<MapPin size={RFValue(12)} color={Colors.primary} />}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <InputField
                    label={t('editProfile.country')}
                    placeholder={t('editProfile.countryPlaceholder')}
                    value={country}
                    onChangeText={setCountry}
                    leftIcon={<Globe size={RFValue(12)} color={Colors.primary} />}
                  />
                </View>
              </View>
              <Text style={styles.noteText}>
                {t('editProfile.phoneChangeNote')}
              </Text>

              <CustomButton
                title={t('editProfile.saveChanges')}
                loading={loading}
                onPress={handleSave}
                style={styles.saveBtn}
              />
            </View>
          ) : (
            <View style={styles.otpContainer}>
              <Text style={styles.otpDescription}>
                {t('editProfile.otpDescription')}<Text style={styles.boldText}>{phone}</Text>.
              </Text>

              <InputField
                label={t('editProfile.otpLabel')}
                placeholder={t('editProfile.otpPlaceholder')}
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
                  <Text style={styles.backBtnText}>{t('editProfile.editDetails')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(t('editProfile.resent'), t('editProfile.resentMessage'));
                  }}
                  style={styles.resendBtn}
                  disabled={loading}
                >
                  <Text style={styles.resendBtnText}>{t('editProfile.resendCode')}</Text>
                </TouchableOpacity>
              </View>

              <CustomButton
                title={t('editProfile.verifyUpdate')}
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
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  halfWidth: {
    flex: 1,
    marginHorizontal: wp('1%'),
  },
  fieldLabel: {
    fontSize: RFValue(11),
    fontWeight: '500',
    color: Colors.dark,
    marginBottom: hp('0.8%'),
  },
  professionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: hp('1.5%'),
  },
  professionChip: {
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('5%'),
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    marginRight: wp('2%'),
    marginBottom: hp('1%'),
  },
  professionChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  professionChipText: {
    fontSize: RFValue(10),
    fontWeight: '600',
    color: Colors.gray,
  },
  professionChipTextSelected: {
    color: Colors.white,
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
