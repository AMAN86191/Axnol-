import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  User, Mail, Phone, ShieldCheck, CheckCircle, Leaf,
  MapPin, Building, Home, Camera, X, Calendar, FileText,
  CreditCard, Award, Star,
  Globe,
  Briefcase
} from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Colors } from '../../theme/colors';
import { RootStackParamList } from '../../navigation/types';
import { PrimaryHeader } from '../../components/PrimaryHeader';
import { InputField } from '../../components/InputField';
import { CustomButton } from '../../components/CustomButton';
import useAuthStore from '../../zustand/useAuthStore';
import useHomeStore from '../../zustand/useHomeStore';
import { startPhonePeTransaction } from '../../services/PhonePePaymentService';
import { MembershipCertificateCard } from '../../components/MembershipCertificateCard';
import { useTranslation } from 'react-i18next';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'JoinMembershipScreen'>;

interface Plan {
  id: number;
  plan_name: string;
  price: string;
  duration: string;
  status: number;
}

const JoinMembershipScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { user, updateProfile } = useAuthStore();
  const { getPlansStore, purchasePlanStore } = useHomeStore();
  const { getProfile } = useAuthStore();
  console.log('user', user)
  const hasMembership = !!user?.membership;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [agree, setAgree] = useState(false);
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [dob, setDob] = useState('');
  const [bio, setBio] = useState('');
  const [profession, setProfession] = useState('');
  const [selectedProfession, setSelectedProfession] = useState('');
  const [customProfession, setCustomProfession] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const professionOptions = ['Student', 'Housewife', 'Salaried', 'Businessman', 'Other'];
  const presetProfessions = ['Student', 'Housewife', 'Salaried', 'Businessman'];

  const [pincodeFetching, setPincodeFetching] = useState(false);

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Plans state
  const [plans, setPlans] = useState<Plan[]>([]);
  const [fetchingPlans, setFetchingPlans] = useState(false);
  const [purchasingId, setPurchasingId] = useState<number | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObj, setDateObj] = useState(new Date());

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDob(user.profile?.dob || '');
      setBio(user.profile?.bio || '');
      const savedProfession = user.profile?.profession || '';
      setProfession(savedProfession);
      setCustomProfession(savedProfession);
      setSelectedProfession(
        presetProfessions.includes(savedProfession) ? savedProfession : (savedProfession ? 'Other' : '')
      );
      setCountry(user.profile?.country || '');
      setProfilePhoto(user.profile?.profile_pic ? `${user.profile.profile_pic}` : null);
    }
  }, [user]);

  const handlePincodeChange = async (text: string) => {
    setPincode(text);
    const normalized = text.replace(/\D/g, '');
    if (normalized.length === 6) {
      setPincodeFetching(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${normalized}`);
        const data = await response.json();
        console.log('response :', data);
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
      } finally {
        setPincodeFetching(false);
      }
    }
  };

  const fetchPlans = async () => {
    setFetchingPlans(true);
    try {
      const response = await getPlansStore();
      console.log('Plans response:', response);
      if (response && response.status && response.plans) {
        setPlans(response.plans);
      }
    } catch (error) {
      console.log('Error fetching plans:', error);
    } finally {
      setFetchingPlans(false);
    }
  };

  useEffect(() => {
    if (hasMembership && plans.length === 0) {
      fetchPlans();
    }
  }, [hasMembership]);

  const handlePurchase = async (plan: Plan) => {
    setPurchasingId(plan.id);
    try {
      const payment = await startPhonePeTransaction(
        {
          amount: parseFloat(plan.price),
          plan_id: plan.id,
        },
        `membership_${plan.id}`,
      );

      if (payment.status !== 'SUCCESS') {
        Alert.alert(t('common.error'), payment.error || t('payment.failed'));
        return;
      }

      const payload = {
        plan_id: plan.id,
        amount: parseFloat(plan.price),
        payment_status: "paid",
        transaction_id: payment.transactionId
      };

      const response = await purchasePlanStore(payload);

      if (response && response.status) {
        setModalVisible(false);
        await getProfile();
        navigation.navigate('DonationSuccessScreen', {
          amount: parseFloat(plan.price),
          transactionId: payment.transactionId,
          date: new Date().toLocaleDateString()
        });
      } else {
        Alert.alert(t('common.error'), response?.message || t('membership.purchaseFailed'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('membership.purchaseError'));
    } finally {
      setPurchasingId(null);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateObj(selectedDate);
      if (event.type === 'set' || Platform.OS === 'ios') {
        const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        setDob(formattedDate);
        setShowDatePicker(false);
      }
    } else {
      setShowDatePicker(false);
    }
  };

  const handleChoosePhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.5,
    });
    if (!result.didCancel && result.assets && result.assets.length > 0) {
      setProfilePhoto(result.assets[0].uri || null);
    }
  };

  const handleJoinMembership = async () => {
    if (!agree) {
      Alert.alert(t('membership.agreementRequired'), t('membership.agreeTerms'));
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', fullName);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('dob', dob);
      formData.append('bio', bio);
      formData.append('country', country);
      formData.append('profession', profession);
      formData.append('city', city);
      formData.append('state', state);
      formData.append('pincode', pincode);
      formData.append('address', address);

      if (profilePhoto && !profilePhoto.startsWith('http')) {
        formData.append('profile_pic', {
          uri: profilePhoto,
          name: profilePhoto.split('/').pop() || 'profile.jpg',
          type: profilePhoto.endsWith('.png') ? 'image/png' : 'image/jpeg',
        } as any);
      }

      await updateProfile(formData);

      setModalVisible(true);
      fetchPlans();
    } catch (error) {
      Alert.alert(t('common.error'), t('membership.profileUpdateFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Member Data for Certificate
  const memberDetails = {
    name: user?.name || t('profile.memberName'),
    memberId: user?.uid || t('common.na'),
    tier: user?.profile?.designation ? user?.profile?.designation?.toUpperCase() : t('common.na'),
    joinedDate: user?.start_date ? new Date(user.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : t('common.na'),
    endDate: user?.end_date ? new Date(user.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : t('common.na'),
    status: user?.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : t('common.active'),
    verified: t('membership.verifiedSevak'),
    impact: t('membership.contributed', { amount: 0 }),
  };

  const renderPlanCard = (plan: Plan, isPremium: boolean) => {
    return (
      <View key={plan.id} style={[styles.planCard, isPremium && styles.premiumCard]}>
        {isPremium && (
          <View style={styles.premiumBadge}>
            <Star size={RFValue(8)} color="#FFF" fill="#FFF" />
            <Text style={styles.premiumBadgeText}>{t('membership.recommended')}</Text>
          </View>
        )}
        <View style={styles.planHeader}>
          <View style={styles.planIconBox}>
            <Award size={RFValue(16)} color={isPremium ? Colors.primary : Colors.dark} />
          </View>
          <Text style={styles.planName}>{plan.plan_name}</Text>
        </View>

        <View style={styles.planPriceContainer}>
          <Text style={styles.currencySymbol}>₹</Text>
          <Text style={styles.planPrice}>{parseInt(plan.price).toLocaleString('en-IN')}</Text>
          <Text style={styles.planDuration}>/{plan.duration}</Text>
        </View>

        <CustomButton
          title={t('membership.selectPay')}
          onPress={() => handlePurchase(plan)}
          loading={purchasingId === plan.id}
          disabled={purchasingId !== null}
          style={{ marginTop: hp('1%'), width: '100%', height: hp('5%') }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <PrimaryHeader />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {hasMembership ? (
            <View>
              <MembershipCertificateCard memberDetails={memberDetails} />

              <View style={{ marginTop: hp('3%'), paddingHorizontal: wp('2%'), marginBottom: hp('2%') }}>
                <Text style={{ fontSize: RFValue(14), fontWeight: '700', color: Colors.dark, marginBottom: hp('0.5%') }}>{t('membership.upgradeTitle')}</Text>
                <Text style={{ fontSize: RFValue(10), color: Colors.gray, marginBottom: hp('2%') }}>{t('membership.upgradeSubtitle')}</Text>

                {fetchingPlans ? (
                  <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: hp('3%') }} />
                ) : (
                  <View>
                    {(() => {
                      const currentDesignation = (user?.profile?.designation || '').toLowerCase().trim();
                      const upgradePlans = plans.filter(plan =>
                        !(
                          plan.plan_name.toLowerCase().trim() === currentDesignation ||
                          (currentDesignation && plan.plan_name.toLowerCase().includes(currentDesignation)) ||
                          (currentDesignation && currentDesignation.includes(plan.plan_name.toLowerCase().trim()))
                        )
                      );
                      return (
                        <>
                          {upgradePlans.map((plan) => renderPlanCard(plan, plan.duration.toLowerCase() === 'lifetime'))}
                          {upgradePlans.length === 0 && (
                            <Text style={{ textAlign: 'center', color: Colors.gray, marginTop: hp('2%') }}>
                              {t('membership.noUpgradePlans')}
                            </Text>
                          )}
                        </>
                      );
                    })()}
                  </View>
                )}
              </View>
            </View>
          ) : (
            <>
              {/* Main Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{t('membership.joinMission')}</Text>
                <Text style={styles.cardSubtitle}>{t('membership.joinSubtitle')}</Text>

                {/* Profile Photo */}
                <View style={styles.photoContainer}>
                  <TouchableOpacity style={styles.photoPicker} onPress={handleChoosePhoto} activeOpacity={0.8}>
                    {profilePhoto ? (
                      <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <Camera size={24} color={Colors.gray} />
                        <Text style={styles.photoText}>{t('membership.addPhoto')}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Full Name */}
                <InputField
                  label={t('membership.fullName')}
                  placeholder={t('membership.fullName')}
                  value={fullName}
                  onChangeText={setFullName}
                  leftIcon={<User size={18} color={Colors.gray} strokeWidth={1.5} />}
                />

                {/* Email Address */}
                <InputField
                  label={t('membership.email')}
                  placeholder={t('membership.email')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={<Mail size={18} color={Colors.gray} strokeWidth={1.5} />}
                />

                {/* Mobile Number */}
                <InputField
                  label={t('membership.mobileNumber')}
                  placeholder={t('membership.mobileNumber')}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  leftIcon={<Phone size={18} color={Colors.gray} strokeWidth={1.5} />}
                />



                {/* Date of Birth */}
                <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={1}>
                  <View pointerEvents="none">
                    <InputField
                      label={t('membership.dob')}
                      placeholder={t('editProfile.dobPlaceholder')}
                      value={dob}
                      editable={false}
                      leftIcon={<Calendar size={18} color={Colors.gray} strokeWidth={1.5} />}
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

                {/* Description / Bio */}
                <InputField
                  label={t('membership.bio')}
                  placeholder={t('membership.bioPlaceholder')}
                  value={bio}
                  onChangeText={setBio}
                  leftIcon={<FileText size={18} color={Colors.gray} strokeWidth={1.5} />}
                />
                {/* profession */}
                <Text style={styles.fieldLabel}>{t('membership.profession')}</Text>
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
                    label={t('membership.customProfession')}
                    placeholder={t('membership.customProfessionPlaceholder')}
                    value={customProfession}
                    onChangeText={(text) => {
                      setCustomProfession(text);
                      setProfession(text);
                    }}
                    leftIcon={<Briefcase size={18} color={Colors.gray} strokeWidth={1.5} />}
                  />
                )}

                {/* Address */}
                <InputField
                  label={t('membership.address')}
                  placeholder={t('membership.addressPlaceholder')}
                  value={address}
                  onChangeText={setAddress}
                  leftIcon={<Home size={18} color={Colors.gray} strokeWidth={1.5} />}
                />
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>

                    <InputField
                      label={t('membership.pincode')}
                      placeholder="000000"
                      value={pincode}
                      onChangeText={handlePincodeChange}
                      keyboardType="numeric"
                      maxLength={6}
                      leftIcon={<MapPin size={18} color={Colors.gray} strokeWidth={1.5} />}
                      rightIcon={pincodeFetching ? <ActivityIndicator size="small" color={Colors.primary} /> : undefined}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <InputField
                      label={t('membership.city')}
                      placeholder={t('membership.city')}
                      value={city}
                      onChangeText={setCity}
                      leftIcon={<Building size={18} color={Colors.gray} strokeWidth={1.5} />}
                    />
                  </View>
                </View>



                {/* State & Pincode Row */}
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <InputField
                      label={t('membership.state')}
                      placeholder={t('membership.state')}
                      value={state}
                      onChangeText={setState}
                      leftIcon={<MapPin size={18} color={Colors.gray} strokeWidth={1.5} />}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <InputField
                      label={t('membership.country')}
                      placeholder={t('membership.country')}
                      value={country}
                      onChangeText={setCountry}
                      leftIcon={<Globe size={18} color={Colors.gray} strokeWidth={1.5} />}
                    />
                  </View>
                </View>

                {/* Checkbox Agreement */}
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setAgree(!agree)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, agree && styles.checkboxActive]}>
                    {agree && <View style={styles.checkboxTick} />}
                  </View>
                  <Text style={styles.checkboxText}>
                    {t('membership.agreeTo')} <Text style={styles.highlightText}>{t('membership.termsLink')}</Text>{' '}
                    and <Text style={styles.highlightText}>{t('membership.privacyLink')}</Text>
                  </Text>
                </TouchableOpacity>

                {/* Action Button */}
                <CustomButton
                  title={t('membership.submitViewPlans')}
                  onPress={handleJoinMembership}
                  loading={loading}
                />
              </View>

              {/* Bottom Trust Badges */}
              <View style={styles.trustRow}>
                <View style={styles.trustItem}>
                  <ShieldCheck size={22} color={Colors.gray} strokeWidth={1.5} />
                  <Text style={styles.trustLabel}>{t('membership.secured')}</Text>
                </View>
                <View style={styles.trustItem}>
                  <CheckCircle size={22} color={Colors.gray} strokeWidth={1.5} />
                  <Text style={styles.trustLabel}>{t('membership.certified')}</Text>
                </View>
                <View style={styles.trustItem}>
                  <Leaf size={22} color={Colors.gray} strokeWidth={1.5} />
                  <Text style={styles.trustLabel}>{t('membership.organic')}</Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Plans Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <X size={24} color={Colors.gray} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>{t('membership.choosePlan')}</Text>

            {fetchingPlans ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: hp('5%') }} />
            ) : (
              <ScrollView style={styles.plansScroll} showsVerticalScrollIndicator={false}>
                {plans.map((plan) => renderPlanCard(plan, plan.duration.toLowerCase() === 'lifetime'))}

                {plans.length === 0 && (
                  <View style={{ alignItems: 'center', padding: hp('3%') }}>
                    <Text style={{ color: Colors.gray }}>{t('membership.noPlans')}</Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: wp('2%'),
    paddingTop: hp('1%'),
    paddingBottom: hp('10%'),
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: wp('4%'),
    borderWidth: 1,
    borderColor: '#FFEBE0', // Light orange border
    padding: wp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
    marginBottom: hp('2%'),
  },
  cardTitle: {
    fontSize: RFValue(17),
    fontWeight: '800',
    color: '#A03000',
    textAlign: 'center',
    marginBottom: hp('0.5%'),
  },
  cardSubtitle: {
    fontSize: RFValue(12),
    color: Colors.gray,
    textAlign: 'center',
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: hp('0.5%'),
    marginBottom: hp('2%'),
  },
  checkbox: {
    width: wp('4.5%'),
    height: wp('4.5%'),
    borderWidth: 1.5,
    borderColor: '#CCC',
    borderRadius: wp('1%'),
    marginRight: wp('2%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('0.2%'),
  },
  checkboxActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  checkboxTick: {
    width: wp('2%'),
    height: wp('2%'),
    backgroundColor: '#FFF',
    borderRadius: wp('0.5%'),
  },
  checkboxText: {
    fontSize: RFValue(10.5),
    color: Colors.gray,
    lineHeight: hp('2.2%'),
  },
  highlightText: {
    color: '#A03000',
    fontWeight: '700',
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
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: hp('1.5%'),
  },
  trustItem: {
    alignItems: 'center',
  },
  trustLabel: {
    fontSize: RFValue(8),
    fontWeight: '700',
    color: Colors.gray,
    marginTop: hp('0.5%'),
  },
  photoContainer: {
    alignItems: 'center',
    marginVertical: hp('1%'),
  },
  photoPicker: {
    width: wp('22%'),
    height: wp('22%'),
    borderRadius: wp('11%'),
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    width: wp('100%'),
    maxHeight: hp('85%'),
    backgroundColor: Colors.white,
    borderTopLeftRadius: wp('6%'),
    borderTopRightRadius: wp('6%'),
    padding: wp('5%'),
    paddingBottom: hp('5%'),
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: hp('2%'),
    right: wp('5%'),
    zIndex: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: wp('4%'),
    padding: wp('1.5%'),
  },
  modalTitle: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: hp('2%'),
    alignSelf: 'flex-start',
  },
  plansScroll: {
    width: '100%',
  },
  planCard: {
    backgroundColor: '#FFF',
    borderRadius: wp('4%'),
    paddingHorizontal: wp('2%'),
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: hp('1.5%'),
    position: 'relative',
    overflow: 'hidden',
  },
  premiumCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    elevation: 4,
  },
  premiumBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.4%'),
    borderBottomLeftRadius: wp('2%'),
  },
  premiumBadgeText: {
    color: '#FFF',
    fontSize: RFValue(7),
    fontWeight: '800',
    marginLeft: wp('1%'),
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  planIconBox: {
    width: wp('7%'),
    height: wp('7%'),
    borderRadius: wp('2.5%'),
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  planName: {
    fontSize: RFValue(12),
    fontWeight: '700',
    color: '#333',
  },
  planPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: hp('1%'),
  },
  currencySymbol: {
    fontSize: RFValue(12),
    fontWeight: '700',
    color: '#333',
    marginRight: wp('1%'),
  },
  planPrice: {
    fontSize: RFValue(15),
    fontWeight: '900',
    color: '#111',
  },
  planDuration: {
    fontSize: RFValue(9.5),
    color: '#666',
    fontWeight: '600',
    marginLeft: wp('1%'),
    textTransform: 'capitalize',
  },
});

export default JoinMembershipScreen;
