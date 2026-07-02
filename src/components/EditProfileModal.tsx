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
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { X, User, Mail, Phone, KeyRound } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { InputField } from './InputField';
import { CustomButton } from './CustomButton';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  currentName: string;
  currentEmail: string;
  currentPhone: string;
  onUpdate: (name: string, email: string, phone: string) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  currentName,
  currentEmail,
  currentPhone,
  onUpdate,
}) => {
  const [name, setName] = useState(currentName);
  const [email, setEmail] = useState(currentEmail);
  const [phone, setPhone] = useState(currentPhone);

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
      setShowOtpView(false);
      setOtpCode('');
      setLoading(false);
    }
  }, [visible, currentName, currentEmail, currentPhone]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      Alert.alert('Validation Error', 'Please enter a valid phone number');
      return;
    }

    // Check if phone number is updated
    const isPhoneChanged = phone.trim() !== currentPhone.trim();

    if (isPhoneChanged) {
      setLoading(true);
      // Simulate sending OTP
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
      // Phone is not changed, update other fields directly
      onUpdate(name, email, phone);
      Alert.alert('Success 🎉', 'Profile updated successfully!', [{ text: 'OK', onPress: onClose }]);
    }
  };

  const handleVerifyOtp = () => {
    if (otpCode !== '123456') {
      Alert.alert('Verification Failed ❌', 'Invalid OTP code. Please enter the correct code: 123456');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onUpdate(name, email, phone);
      Alert.alert(
        'Verified Successfully! ✅',
        'Your phone number has been verified and profile updated.',
        [{ text: 'OK', onPress: onClose }]
      );
    }, 1200);
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
                {showOtpView ? 'Verify OTP' : 'Edit Profile'}
              </Text>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
                <X size={RFValue(14)} color={Colors.dark} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            {!showOtpView ? (
              <View style={styles.modalBody}>
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
              <View style={styles.modalBody}>
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
  },
  modalContainer: {
    width: '100%',
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
