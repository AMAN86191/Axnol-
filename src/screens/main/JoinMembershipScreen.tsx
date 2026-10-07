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
import LinearGradient from 'react-native-linear-gradient';

import { Colors } from '../../theme/colors';
import { RootStackParamList } from '../../navigation/types';
import { PrimaryHeader } from '../../components/PrimaryHeader';
import { InputField } from '../../components/InputField';
import { CustomButton } from '../../components/CustomButton';
import useAuthStore from '../../zustand/useAuthStore';
import useHomeStore from '../../zustand/useHomeStore';
import { startPhonePeTransaction } from '../../services/PhonePePaymentService';
import { MembershipCertificateCard } from '../../components/MembershipCertificateCard';
import { buildProfileFormData } from '../../utils/profileFormData';
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
  const hasMembership = !!user?.membership && user.membership !== "user";

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [agree, setAgree] = useState(false);
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [country, setCountry] = useState('');
  const [dob, setDob] = useState('');
  const [dom, setDom] = useState('');
  const [partnerName, setPartnerName] = useState('');
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
  const [showDomPicker, setShowDomPicker] = useState(false);
  const [dateObjDom, setDateObjDom] = useState(new Date());

  useEffect(() => {
    if (user) {
      const p = user.profile || {};
      setFullName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDob(p.dob || '');
      setDom(p.dom || '');
      setPartnerName(p.partner_name || '');
      setBio(p.bio || '');
      const savedProfession = p.profession || '';
      setProfession(savedProfession);
      setCustomProfession(savedProfession);
      setSelectedProfession(
        presetProfessions.includes(savedProfession) ? savedProfession : (savedProfession ? 'Other' : '')
      );
      setCountry(p.country || '');
      setCity(p.city || '');
      setState(p.state || '');
      setPincode(p.pincode || '');
      setAddress(p.address || '');
      setArea(p.area || '');
      setProfilePhoto(p.profile_pic ? `${p.profile_pic}` : null);
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

  // Pull the latest profile so the form always prefills with server values.
  useEffect(() => {
    getProfile().catch((e: any) =>
      console.log('Error refreshing profile before membership form:', e),
    );
  }, [getProfile]);

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
      const formData = buildProfileFormData(
        {
          name: fullName,
          email,
          phone,
          dob,
          dom,
          partner_name: partnerName,
          profession,
          bio,
          country,
          city,
          state,
          pincode,
          address,
          area,
        },
        profilePhoto,
      );

      console.log('complete-profile parts:', formData.getParts());

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
    tier: user?.profile?.membership ? user?.profile?.membership?.toUpperCase() : t('common.na'),
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
          <View style={styles.premiumRibbon}>
            <Star size={RFValue(7)} color="#FFF" fill="#FFF" strokeWidth={2.6} />
            <Text style={styles.premiumRibbonText}>{t('membership.recommended')}</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <View style={[styles.planIconBox, isPremium && styles.planIconBoxPremium]}>
            <Award
              size={RFValue(14)}
              color={isPremium ? Colors.white : Colors.primary}
              strokeWidth={2.3}
            />
          </View>
          <Text style={styles.planName} numberOfLines={1}>
            {plan.plan_name}
          </Text>
        </View>

        <View style={styles.planPriceContainer}>
          <Text style={styles.currencySymbol}>₹</Text>
          <Text style={styles.planPrice}>{parseInt(plan.price).toLocaleString('en-IN')}</Text>
          <View style={styles.durationChip}>
            <Text style={styles.durationChipText}>/{plan.duration}</Text>
          </View>
        </View>

        <View style={styles.planDivider} />

        <CustomButton
          title={t('membership.selectPay')}
          onPress={() => handlePurchase(plan)}
          loading={purchasingId === plan.id}
          disabled={purchasingId !== null}
          style={styles.planCta}
          textStyle={styles.planCtaText}
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
                      const normalizePlanName = (value?: string | null) =>
                        (value || '')
                          .toLowerCase()
                          .replace(/\bplans?\b/g, '')
                          .replace(/\s+/g, ' ')
                          .trim();
                      const currentMembership = normalizePlanName(user?.profile?.membership);
                      const upgradePlans = plans.filter(
                        plan =>
                          !currentMembership ||
                          normalizePlanName(plan.plan_name) !== currentMembership,
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

                {/* Date of Marriage */}
                <TouchableOpacity onPress={() => setShowDomPicker(true)} activeOpacity={1}>
                  <View pointerEvents="none">
                    <InputField
                      label={t('membership.dom')}
                      placeholder={t('editProfile.dobPlaceholder')}
                      value={dom}
                      editable={false}
                      leftIcon={<Calendar size={18} color={Colors.gray} strokeWidth={1.5} />}
                    />
                  </View>
                </TouchableOpacity>

                {showDomPicker && (
                  <DateTimePicker
                    value={dateObjDom}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDomChange}
                    maximumDate={new Date()}
                  />
                )}

                {/* Partner Name (shown only after DOM is set) */}
                {!!dom && (
                  <InputField
                    label={t('membership.partnerName')}
                    placeholder={t('membership.partnerNamePlaceholder')}
                    value={partnerName}
                    onChangeText={setPartnerName}
                    leftIcon={<User size={18} color={Colors.gray} strokeWidth={1.5} />}
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

                {/* Area */}
                <InputField
                  label={t('membership.area')}
                  placeholder={t('membership.areaPlaceholder')}
                  value={area}
                  onChangeText={setArea}
                  leftIcon={<MapPin size={18} color={Colors.gray} strokeWidth={1.5} />}
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

                {/* Checkbox Agreement — links ko TouchableOpacity ke bahar rakha hai
                      taaki unka onPress reliably chale (nested touchable
                      me parent tap steal kar leta hai) */}
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={styles.checkboxHitArea}
                    onPress={() => setAgree(!agree)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.checkbox, agree && styles.checkboxActive]}>
                      {agree && <View style={styles.checkboxTick} />}
                    </View>
                  </TouchableOpacity>

                  <Text style={styles.checkboxText}>
                    {t('membership.agreeTo')}{' '}
                    <Text
                      style={styles.highlightText}
                      onPress={() => navigation.navigate('TermsScreen')}
                    >
                      {t('membership.termsLink')}
                    </Text>
                    {' and '}
                    <Text
                      style={styles.highlightText}
                      onPress={() => navigation.navigate('PrivacyPolicyScreen')}
                    >
                      {t('membership.privacyLink')}
                    </Text>
                  </Text>
                </View>

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
            <View style={styles.modalGrabber} />

            <View style={styles.modalHeaderRow}>
              <View style={styles.modalTitleWrap}>
                <Text style={styles.modalTitle}>{t('membership.choosePlan')}</Text>
                <Text style={styles.modalSubtitle}>{t('membership.upgradeSubtitle')}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
              >
                <X size={RFValue(13)} color={Colors.dark} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            {fetchingPlans ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: hp('5%') }} />
            ) : (
              <ScrollView style={styles.plansScroll} showsVerticalScrollIndicator={false}>
                {plans.map((plan) => renderPlanCard(plan, plan.duration.toLowerCase() === 'lifetime'))}

                {plans.length === 0 && (
                  <View style={styles.noPlansBox}>
                    <Text style={styles.noPlansText}>{t('membership.noPlans')}</Text>
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
  checkboxHitArea: {
    paddingRight: wp('2%'),
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
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    width: wp('100%'),
    maxHeight: hp('85%'),
    backgroundColor: Colors.white,
    borderTopLeftRadius: wp('6%'),
    borderTopRightRadius: wp('6%'),
    paddingHorizontal: wp('4%'),
    paddingTop: hp('0.9%'),
    paddingBottom: hp('4%'),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  modalGrabber: {
    width: wp('9%'),
    height: 4,
    borderRadius: 100,
    backgroundColor: '#E5E7EB',
    marginBottom: hp('1.4%'),
  },
  modalHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: hp('1.4%'),
    paddingBottom: hp('1%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  modalTitleWrap: {
    flex: 1,
    paddingRight: wp('3%'),
  },
  modalTitle: {
    fontSize: RFValue(11.5),
    fontWeight: '800',
    color: Colors.dark,
    letterSpacing: 0.2,
  },
  modalSubtitle: {
    fontSize: RFValue(8.2),
    color: Colors.gray,
    marginTop: hp('0.3%'),
    lineHeight: RFValue(11.5),
  },
  closeButton: {
    width: wp('6.8%'),
    height: wp('6.8%'),
    borderRadius: wp('3.4%'),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noPlansBox: {
    alignItems: 'center',
    paddingVertical: hp('4%'),
    paddingHorizontal: wp('4%'),
    backgroundColor: Colors.background,
    borderRadius: wp('4%'),
    borderWidth: 1,
    borderColor: '#EFF1F5',
    borderStyle: 'dashed',
  },
  noPlansText: {
    color: Colors.gray,
    fontSize: RFValue(9),
    fontWeight: '600',
    textAlign: 'center',
  },
  plansScroll: {
    width: '100%',
  },
  planCard: {
    backgroundColor: '#FFF',
    borderRadius: wp('4%'),
    padding: wp('2%'),
    borderWidth: 1,
    borderColor: '#ECEEF2',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: hp('1.4%'),
    position: 'relative',
    overflow: 'hidden',
  },
  premiumCard: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
    backgroundColor: '#FFF9F6',
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  premiumRibbon: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('0.8%'),
    backgroundColor: Colors.primary,
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.35%'),
    borderBottomLeftRadius: wp('3%'),
    borderBottomRightRadius: 0,
    borderTopRightRadius: wp('4%'),
  },
  premiumRibbonText: {
    color: '#FFF',
    fontSize: RFValue(5.8),
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
    paddingRight: wp('26%'),
  },
  planIconBox: {
    width: wp('7.5%'),
    height: wp('7.5%'),
    borderRadius: wp('3.75%'),
    backgroundColor: '#FFF1EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('2.5%'),
    borderWidth: 1,
    borderColor: '#FFE1D3',
  },
  planIconBoxPremium: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  planName: {
    flex: 1,
    fontSize: RFValue(10.5),
    fontWeight: '800',
    color: '#111827',
    textTransform: 'capitalize',
  },
  planPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: wp('2.5%'),
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.7%'),
    marginBottom: hp('1%'),
    borderWidth: 1,
    borderColor: '#EFF1F5',
  },
  currencySymbol: {
    fontSize: RFValue(10),
    fontWeight: '800',
    color: '#111827',
    marginRight: wp('0.6%'),
    alignSelf: 'flex-start',
    marginTop: hp('0.3%'),
  },
  planPrice: {
    fontSize: RFValue(16),
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.4,
    flexShrink: 1,
  },
  durationChip: {
    marginLeft: 'auto',
    backgroundColor: '#FFF1EA',
    borderRadius: wp('5%'),
    paddingHorizontal: wp('2.2%'),
    paddingVertical: hp('0.35%'),
    borderWidth: 1,
    borderColor: '#FFE1D3',
  },
  durationChipText: {
    fontSize: RFValue(7.2),
    color: '#C2410C',
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  planDivider: {
    height: 1,
    backgroundColor: '#EFF1F5',
    marginBottom: hp('0.4%'),
  },
  planCta: {
    marginTop: hp('0.5%'),
    width: '100%',
    height: hp('4.4%'),
    borderRadius: wp('3%'),
  },
  planCtaText: {
    fontSize: RFValue(10),
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

export default JoinMembershipScreen;
