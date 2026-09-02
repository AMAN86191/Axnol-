import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Share } from 'react-native';
import { Pencil, Award, Check, Mail, Phone, BadgeCheck } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTranslation } from 'react-i18next';
import { Colors } from '../theme/colors';
import { Share2 } from 'lucide-react-native';

interface ProfileHeaderProps {
  profileName: string;
  profileEmail: string;
  profilePhone: string;
  avatarUri?: string;
  uid?: string;
  joinDate?: string;
  designation?: string;
  bio?: string;
  onCameraPress: () => void;
  onEmailPress: () => void;
  onPhonePress: () => void;
  membership: any;
  dob?: string;
  dom?: string;
  profession?: string;
  referralCode?: string;
  country?: string;
}

const VerifiedBadge = () => (
  <View style={styles.verifiedBadgeContainer}>
    <BadgeCheck size={RFValue(15)} color="#FFF" fill="#FF6F34" />
  </View>
);

export const ProfileHeader = React.memo(({
  profileName,
  profileEmail,
  profilePhone,
  avatarUri = '',
  uid,
  joinDate,
  designation,
  bio,
  onCameraPress,
  onEmailPress,
  onPhonePress,
  membership,
  dob,
  dom,
  profession,
  referralCode,
  country,
}: ProfileHeaderProps) => {
  const { t } = useTranslation();

  const handleShareReferral = async (code: string) => {
    try {
      await Share.share({
        message: `Join me on Gaumata Trust! Use my referral code: ${code}`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <>
      {/* Background Pasture Image & Header Actions */}
      <View style={styles.headerImageWrapper}>
        <Image
          source={require('../../assets/images/gaushala.png')}
          style={styles.headerBgImage}
          resizeMode="cover"
        />
      </View>

      {/* Profile Details Overlay Card */}
      <View style={styles.profileDetailsCard}>
        <View style={styles.profileTopRow}>
          {/* Double ring circular avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarOuterRing}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={[styles.avatarImage, { backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ color: '#FFF', fontSize: RFValue(20), fontWeight: '800' }}>
                    {profileName ? profileName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.cameraBtn} onPress={onCameraPress} activeOpacity={0.85}>
              <Pencil size={RFValue(8.5)} color={Colors.white} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* Name, Badge and Bio */}
          <View style={styles.userDetails}>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{profileName}</Text>
              <VerifiedBadge />
            </View>


            <Text style={styles.designationText}>{designation || t('common.user')}</Text>

            {membership ? (
              <View style={styles.statusRowBadgesHeader}>
                <View style={styles.patronBadge}>
                  <Award size={RFValue(8)} color="#D97706" strokeWidth={2} />
                  <Text style={styles.patronBadgeText}>
                    {membership.charAt(0).toUpperCase() + membership.slice(1)}
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>{t('drawer.id')}: </Text>
              <Text style={styles.metaValue}>{uid || t('common.na')}</Text>
              <View style={styles.metaDot} />
              <Text style={styles.metaLabel}>{t('drawer.since')}: </Text>
              <Text style={styles.metaValue}>{joinDate ? new Date(joinDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : t('common.na')}</Text>
            </View>

            <Text style={[styles.bioText, { marginTop: hp('0.6%') }]}>
              {bio || 'No bio available.'}
            </Text>
          </View>
        </View>

        {/* Extra Details row */}
        {(profession || dob || dom || country || referralCode) ? (
          <View style={styles.extraDetailsContainer}>
            {profession ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Profession: </Text>
                <Text style={styles.detailValue}>{profession}</Text>
              </View>
            ) : null}
            {dob ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>DOB: </Text>
                <Text style={styles.detailValue}>{dob}</Text>
              </View>
            ) : null}
            {dom ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>DOM: </Text>
                <Text style={styles.detailValue}>{dom}</Text>
              </View>
            ) : null}
            {country ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Country: </Text>
                <Text style={styles.detailValue}>{country}</Text>
              </View>
            ) : null}
            {referralCode ? (
              <View style={[styles.detailRow, { width: '100%' }]}>
                <Text style={styles.detailLabel}>Referral Code: </Text>
                <View style={styles.referralCodeContainer}>
                  <Text style={styles.detailValue}>{referralCode}</Text>
                  <TouchableOpacity onPress={() => handleShareReferral(referralCode)} style={styles.shareBtn}>
                    <Share2 size={RFValue(12)} color="#FF6F34" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Contact Details row */}
        <View style={styles.contactContainer}>
          <TouchableOpacity style={styles.contactItem} onPress={onEmailPress} activeOpacity={0.7}>
            <Mail size={RFValue(10.5)} color="#555555" strokeWidth={1.8} style={styles.contactIcon} />
            <Text style={styles.contactText}>{profileEmail}</Text>
          </TouchableOpacity>
          <View style={styles.contactDivider} />
          <TouchableOpacity style={styles.contactItem} onPress={onPhonePress} activeOpacity={0.7}>
            <Phone size={RFValue(10.5)} color="#555555" strokeWidth={1.8} style={styles.contactIcon} />
            <Text style={styles.contactText}>{profilePhone}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  headerImageWrapper: {
    height: hp('24%'),
    width: '100%',
    position: 'relative',
  },
  headerBgImage: {
    width: '100%',
    height: '100%',
  },
  profileDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('5%'),
    marginTop: -hp('6%'),
    marginHorizontal: wp('4%'),
    padding: wp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: wp('4%'),
  },
  avatarOuterRing: {
    width: wp('21%'),
    height: wp('21%'),
    borderRadius: wp('10.5%'),
    borderWidth: 2,
    borderColor: '#FF6F34',
    padding: 2,
    backgroundColor: '#FFF',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: wp('10%'),
  },
  cameraBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: wp('7%'),
    height: wp('7%'),
    borderRadius: wp('3.5%'),
    backgroundColor: '#FF6F34',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  userDetails: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('0.3%'),
  },
  userName: {
    fontSize: RFValue(15),
    fontWeight: '800',
    color: '#111827',
    marginRight: wp('0.5%'),
  },
  verifiedBadgeContainer: {
    // marginLeft: wp('1%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  designationText: {
    fontSize: RFValue(9.5),
    color: '#FF6F34',
    fontWeight: '700',
    marginTop: hp('0.2%'),
    marginBottom: hp('0.4%'),
  },
  statusRowBadgesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('0.8%'),
  },
  patronBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F2',
    borderWidth: 0.8,
    borderColor: '#FFEBE0',
    borderRadius: wp('1%'),
    paddingVertical: hp('0.3%'),
    paddingHorizontal: wp('2%'),
    alignSelf: 'flex-start',
    marginBottom: hp('0.8%'),
  },
  patronBadgeText: {
    fontSize: RFValue(9),
    color: '#D97706',
    fontWeight: '700',
    marginLeft: wp('1%'),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.5%'),
  },
  metaLabel: {
    fontSize: RFValue(8),
    fontWeight: '600',
    color: '#9CA3AF',
  },
  metaValue: {
    fontSize: RFValue(8),
    fontWeight: '700',
    color: '#4B5563',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D1D5DB',
    marginHorizontal: wp('2%'),
  },
  bioText: {
    fontSize: RFValue(9),
    color: '#4B5563',
    lineHeight: hp('1.8%'),
    fontWeight: '400',
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: hp('1.5%'),
    paddingTop: hp('1.2%'),
  },
  contactItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactIcon: {
    marginRight: wp('1.5%'),
  },
  contactText: {
    fontSize: RFValue(9.5),
    color: '#1F2937',
    fontWeight: '700',
  },
  contactDivider: {
    width: 1,
    height: hp('1.8%'),
    backgroundColor: '#E5E7EB',
  },
  extraDetailsContainer: {
    marginTop: hp('1.5%'),
    paddingTop: hp('1%'),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: hp('0.8%'),
  },
  detailLabel: {
    fontSize: RFValue(9),
    fontWeight: '600',
    color: '#6B7280',
  },
  detailValue: {
    fontSize: RFValue(9),
    fontWeight: '700',
    color: '#1F2937',
    flexShrink: 1,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareBtn: {
    marginLeft: wp('2%'),
    padding: wp('1%'),
  },
});
