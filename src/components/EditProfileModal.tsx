import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { X, User, Mail, Phone, KeyRound, Briefcase, Calendar, Info, Image as ImageIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../theme/colors';
import { InputField } from './InputField';
import { CustomButton } from './CustomButton';
import { sendFirebaseOtp, confirmFirebaseOtp, resendFirebaseOtp } from '../services/firebaseAuthService';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  currentName: string;
  currentEmail: string;
  currentPhone: string;
  currentDesignation?: string;
  currentDob?: string;
  currentDom?: string;
  currentProfession?: string;
  currentBio?: string;
  currentProfilePic?: string;
  onUpdate: (data: any) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  currentName,
  currentEmail,
  currentPhone,
  currentDesignation = '',
  currentDob = '',
  currentDom = '',
  currentProfession = '',
  currentBio = '',
  currentProfilePic = '',
  onUpdate,
}) => {
  const [name, setName] = useState(currentName);
  const [email, setEmail] = useState(currentEmail);
  const [phone, setPhone] = useState(currentPhone);
  const [designation, setDesignation] = useState(currentDesignation);
  const [dob, setDob] = useState(currentDob);
  const [dom, setDom] = useState(currentDom);
  const [profession, setProfession] = useState(currentProfession);
  const [bio, setBio] = useState(currentBio);
  const [profilePic, setProfilePic] = useState(currentProfilePic);
  const { t } = useTranslation();

  // States to track flow
  const [showOtpView, setShowOtpView] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync state with props when modal opens
  useEffect(() => {
    if (visible) {
      setName(currentName);
      setEmail(currentEmail);
      setPhone(currentPhone);
      setDesignation(currentDesignation || '');
      setDob(currentDob || '');
      setDom(currentDom || '');
      setProfession(currentProfession || '');
      setBio(currentBio || '');
      setProfilePic(currentProfilePic || '');
      setShowOtpView(false);
      setOtpCode('');
      setLoading(false);
    }
  }, [visible, currentName, currentEmail, currentPhone, currentDesignation, currentDob, currentDom, currentProfession, currentBio, currentProfilePic]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('addPost.validationError'), t('editProfile.nameRequired'));
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      Alert.alert(t('addPost.validationError'), t('editProfile.invalidPhone'));
      return;
    }

    const payload = {
      name,
      email,
      phone,
      designation,
      dob,
      dom,
      profession,
      bio,
      profile_pic: profilePic,
    };

    // Check if phone number is updated
    const isPhoneChanged = phone.trim() !== currentPhone.trim();

    if (isPhoneChanged) {
      setLoading(true);
      try {
        await sendFirebaseOtp(phone);
        setLoading(false);
        setShowOtpView(true);
        Alert.alert(
          t('editProfile.otpSent'),
          t('editProfile.otpSentMessage', { phone }),
          [{ text: t('common.ok') }]
        );
      } catch {
        setLoading(false);
        Alert.alert(t('editProfile.otpFailed'), t('editProfile.otpFailedMessage'));
      }
    } else {
      // Phone is not changed, update other fields directly
      onUpdate(payload);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      await confirmFirebaseOtp(otpCode);
      setLoading(false);
      const payload = {
        name,
        email,
        phone,
        designation,
        dob,
        dom,
        profession,
        bio,
        profile_pic: profilePic,
      };
      onUpdate(payload);
      Alert.alert(
        t('editProfile.verifyUpdate'),
        t('editProfile.profileUpdated'),
      );
    } catch {
      setLoading(false);
      Alert.alert(t('editProfile.otpFailed'), t('editProfile.otpFailedMessage'));
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {showOtpView ? t('editProfile.verifyOtp') : t('editProfile.title')}
              </Text>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
                <X size={RFValue(14)} color={Colors.dark} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            {!showOtpView ? (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp('2%') }}>
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

                <InputField
                  label="Designation"
                  placeholder="Enter your designation"
                  value={designation}
                  onChangeText={setDesignation}
                  leftIcon={<Briefcase size={RFValue(12)} color={Colors.primary} />}
                />

                <InputField
                  label={t('editProfile.profession')}
                  placeholder={t('editProfile.professionPlaceholder')}
                  value={profession}
                  onChangeText={setProfession}
                  leftIcon={<Briefcase size={RFValue(12)} color={Colors.primary} />}
                />

                <InputField
                  label={t('editProfile.dob')}
                  placeholder={t('editProfile.dobPlaceholder')}
                  value={dob}
                  onChangeText={setDob}
                  leftIcon={<Calendar size={RFValue(12)} color={Colors.primary} />}
                />

                <InputField
                  label={t('editProfile.dom')}
                  placeholder={t('editProfile.dom')}
                  value={dom}
                  onChangeText={setDom}
                  leftIcon={<Calendar size={RFValue(12)} color={Colors.primary} />}
                />

                <InputField
                  label={t('editProfile.bio')}
                  placeholder={t('editProfile.bioPlaceholder')}
                  value={bio}
                  onChangeText={setBio}
                  leftIcon={<Info size={RFValue(12)} color={Colors.primary} />}
                />

                <InputField
                  label="Profile Picture URL"
                  placeholder="Enter image URL"
                  value={profilePic}
                  onChangeText={setProfilePic}
                  leftIcon={<ImageIcon size={RFValue(12)} color={Colors.primary} />}
                />

                <Text style={styles.noteText}>
                  {t('editProfile.phoneChangeNote')}
                </Text>

                <CustomButton
                  title={t('editProfile.saveChanges')}
                  loading={loading}
                  onPress={handleSave}
                  style={styles.saveBtn}
                />
              </ScrollView>
            ) : (
              <View style={styles.modalBody}>
                <Text style={styles.otpDescription}>
                  {t('editProfile.otpDescription')} <Text style={styles.boldText}>{phone}</Text>.
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
                    onPress={async () => {
                      try {
                        setLoading(true);
                        await resendFirebaseOtp(phone);
                        setLoading(false);
                        Alert.alert(t('editProfile.resent'), t('editProfile.resentMessage'));
                      } catch {
                        setLoading(false);
                        Alert.alert(t('editProfile.otpFailed'), t('editProfile.otpFailedMessage'));
                      }
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
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 24, 24, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoid: {
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: '90%',
  },
  modalContainer: {
    width: '100%',
    maxHeight: '100%',
    backgroundColor: Colors.white,
    borderRadius: wp('4%'),
    padding: wp('5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: hp('1.2%'),
    marginBottom: hp('1.5%'),
  },
  modalTitle: {
    fontSize: RFValue(13.5),
    fontWeight: '700',
    color: Colors.dark,
  },
  closeBtn: {
    padding: wp('1%'),
  },
  modalBody: {
    width: '100%',
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
    marginVertical: 0,
  },
  otpDescription: {
    fontSize: RFValue(9.5),
    color: Colors.dark,
    lineHeight: hp('1.8%'),
    marginBottom: hp('2%'),
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
