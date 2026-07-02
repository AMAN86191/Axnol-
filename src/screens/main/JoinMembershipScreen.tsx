import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle,
  Leaf,
  MapPin,
  Building,
  Home,
  Camera,
  X,
  Calendar,
  FileText,
} from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Colors } from '../../theme/colors';
import { RootStackParamList } from '../../navigation/types';
import { PrimaryHeader } from '../../components/PrimaryHeader';
import { InputField } from '../../components/InputField';
import { CustomButton } from '../../components/CustomButton';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'JoinMembershipScreen'>;

const JoinMembershipScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [fullName, setFullName] = useState('Ananda Das');
  const [email, setEmail] = useState('ananda@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [agree, setAgree] = useState(false);

  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
  const [bio, setBio] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  const handleChoosePhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.5,
    });

    if (!result.didCancel && result.assets && result.assets.length > 0) {
      setProfilePhoto(result.assets[0].uri || null);
    }
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
          {/* Main Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Join the Mission</Text>
            <Text style={styles.cardSubtitle}>Create your member account to get started.</Text>

            {/* Profile Photo */}
            <View style={styles.photoContainer}>
              <TouchableOpacity style={styles.photoPicker} onPress={handleChoosePhoto} activeOpacity={0.8}>
                {profilePhoto ? (
                  <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Camera size={24} color={Colors.gray} />
                    <Text style={styles.photoText}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Full Name */}
            <InputField
              label="Full Name"
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              leftIcon={<User size={18} color={Colors.gray} strokeWidth={1.5} />}
            />

            {/* Email Address */}
            <InputField
              label="Email Address"
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color={Colors.gray} strokeWidth={1.5} />}
            />

            {/* Mobile Number */}
            <InputField
              label="Mobile Number"
              placeholder="Mobile Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              leftIcon={<Phone size={18} color={Colors.gray} strokeWidth={1.5} />}
            />

            {/* Date of Birth */}
            <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={1}>
              <View pointerEvents="none">
                <InputField
                  label="Date of Birth"
                  placeholder="DD/MM/YYYY"
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
              label="Description / Bio"
              placeholder="Tell us about yourself"
              value={bio}
              onChangeText={setBio}
              leftIcon={<FileText size={18} color={Colors.gray} strokeWidth={1.5} />}
            />



            {/* City */}
            <InputField
              label="City"
              placeholder="City"
              value={city}
              onChangeText={setCity}
              leftIcon={<Building size={18} color={Colors.gray} strokeWidth={1.5} />}
            />

            {/* Address */}
            <InputField
              label="Address"
              placeholder="Full Address"
              value={address}
              onChangeText={setAddress}
              leftIcon={<Home size={18} color={Colors.gray} strokeWidth={1.5} />}
            />
            {/* State & Pincode Row */}
            <View style={styles.rowContainer}>

              <View style={styles.halfWidth}>
                <InputField
                  label="Pincode"
                  placeholder="000000"
                  value={pincode}
                  onChangeText={setPincode}
                  keyboardType="numeric"
                  leftIcon={<MapPin size={18} color={Colors.gray} strokeWidth={1.5} />}
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="State"
                  placeholder="State"
                  value={state}
                  onChangeText={setState}
                  leftIcon={<MapPin size={18} color={Colors.gray} strokeWidth={1.5} />}
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
                I agree to the <Text style={styles.highlightText}>Terms & Conditions</Text>{' '}
                and <Text style={styles.highlightText}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* Action Button */}
            <CustomButton
              title="Join Membership"
              onPress={() => setModalVisible(true)}
            />


          </View>

          {/* Bottom Trust Badges */}
          <View style={styles.trustRow}>
            <View style={styles.trustItem}>
              <ShieldCheck size={22} color={Colors.gray} strokeWidth={1.5} />
              <Text style={styles.trustLabel}>SECURED</Text>
            </View>
            <View style={styles.trustItem}>
              <CheckCircle size={22} color={Colors.gray} strokeWidth={1.5} />
              <Text style={styles.trustLabel}>CERTIFIED</Text>
            </View>
            <View style={styles.trustItem}>
              <Leaf size={22} color={Colors.gray} strokeWidth={1.5} />
              <Text style={styles.trustLabel}>ORGANIC</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Membership Card Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
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

            <Text style={styles.modalTitle}>Membership Generated!</Text>

            {/* ID Card View */}
            <View style={styles.idCard}>
              <View style={styles.idHeader}>
                <Text style={styles.idHeaderText}>GAUMATA TRUST</Text>
                <Text style={styles.idHeaderSub}>Official Member</Text>
              </View>
              <View style={styles.idBody}>
                <View style={styles.idPhotoContainer}>
                  {profilePhoto ? (
                    <Image source={{ uri: profilePhoto }} style={styles.idPhoto} />
                  ) : (
                    <View style={styles.idPhotoPlaceholder}>
                      <User size={30} color="#CCC" />
                    </View>
                  )}
                </View>
                <View style={styles.idDetails}>
                  <Text style={styles.idName}>{fullName || 'N/A'}</Text>
                  <Text style={styles.idText}>ID: GT-{Math.floor(100000 + Math.random() * 900000)}</Text>
                  <Text style={styles.idText}>{phone || 'N/A'}</Text>
                  <Text style={styles.idText}>{city ? `${city}, ${state}` : 'N/A'}</Text>
                </View>
              </View>
              <View style={styles.idFooter}>
                <Text style={styles.idFooterText}>Valid for Lifetime</Text>
              </View>
            </View>

            <CustomButton
              title="Confirm & Auto Set"
              onPress={() => {
                setModalVisible(false);
              }}
              style={{ marginTop: hp('3%'), width: '100%' }}
            />
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
    // marginBottom: hp('3%'),
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('3%'),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EAEAEA',
  },
  dividerText: {
    fontSize: RFValue(10),
    fontWeight: '700',
    color: '#999',
    marginHorizontal: wp('3%'),
  },
  loginFooter: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: RFValue(12),
    color: Colors.gray,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: wp('90%'),
    backgroundColor: Colors.white,
    borderRadius: wp('5%'),
    padding: wp('3%'),
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: hp('1.5%'),
    right: wp('4%'),
    zIndex: 10,
  },
  modalTitle: {
    fontSize: RFValue(14),
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: hp('3%'),
    marginTop: hp('1%'),
  },
  idCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: wp('3%'),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 1,
  },
  idHeader: {
    backgroundColor: Colors.primary,
    paddingVertical: hp('1%'),
    alignItems: 'center',
  },
  idHeaderText: {
    color: '#FFF',
    fontSize: RFValue(11),
    fontWeight: '800',
    letterSpacing: 1,
  },
  idHeaderSub: {
    color: '#FFDDBB',
    fontSize: RFValue(8),
    fontWeight: '600',
  },
  idBody: {
    flexDirection: 'row',
    padding: wp('3%'),
    alignItems: 'center',
  },
  idPhotoContainer: {
    width: wp('20%'),
    height: wp('26%'),
    borderRadius: wp('2%'),
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('4%'),
  },
  idPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  idPhotoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  idDetails: {
    flex: 1,
  },
  idName: {
    fontSize: RFValue(12),
    fontWeight: '800',
    color: Colors.dark,
    marginBottom: hp('0.5%'),
  },
  idText: {
    fontSize: RFValue(9),
    color: Colors.gray,
    marginBottom: hp('0.3%'),
    fontWeight: '500',
  },
  idFooter: {
    backgroundColor: '#F9FAFB',
    paddingVertical: hp('1%'),
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
  },
  idFooterText: {
    fontSize: RFValue(8),
    color: Colors.gray,
    fontWeight: '600',
  },
});

export default JoinMembershipScreen;
