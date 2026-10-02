import React, { useCallback } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Share } from 'react-native';
import { Pencil, Mail, Phone, BadgeCheck, Briefcase, Calendar, MapPin, Building, Home, Globe, Share2, Heart } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTranslation } from 'react-i18next';
import { Colors } from '../theme/colors';

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
  partnerName?: string;
  profession?: string;
  referralCode?: string;
  country?: string;
  city?: string;
  state?: string;
  pincode?: string;
  address?: string;
  area?: string;
}

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
  partnerName,
  profession,
  referralCode,
  country,
  city,
  state,
  pincode,
  address,
  area,
}: ProfileHeaderProps) => {
  const { t } = useTranslation();

  const handleShareReferral = useCallback(async (code: string) => {
    try {
      const referralLink = 'https://play.google.com/store/apps/details?id=gst.gaumatatrust.com';
      const shareMessage = t('referral.shareMessage', { code, link: referralLink });
      await Share.share({ message: shareMessage });
    } catch (error) {
      console.error(error);
    }
  }, [t]);

  const detailsData = [
    { key: 'profession', icon: Briefcase, label: t('publicProfile.profession'), value: profession },
    { key: 'dob', icon: Calendar, label: 'DOB', value: dob },
    { key: 'dom', icon: Calendar, label: 'DOM', value: dom },
    { key: 'partnerName', icon: Heart, label: t('publicProfile.partnerName'), value: partnerName },
    { key: 'city', icon: Building, label: t('publicProfile.location'), value: city },
    { key: 'state', icon: MapPin, label: '', value: state },
    { key: 'pincode', icon: MapPin, label: '', value: pincode },
    { key: 'country', icon: Globe, label: '', value: country },
    { key: 'address', icon: Home, label: '', value: address, fullWidth: true },
    { key: 'area', icon: MapPin, label: t('publicProfile.area'), value: area },
    { key: 'referralCode', icon: Share2, label: t('referral.yourCode'), value: referralCode, fullWidth: true, shareable: true },
  ].filter(d => !!d.value);

  return (
    <>
      {/* Cover Image */}
      <View style={styles.coverWrapper}>
        <Image
          source={require('../../assets/images/gaushala.png')}
          style={styles.coverImage}
          resizeMode="cover"
        />
        <View style={styles.coverGradient} />
      </View>

      <View style={styles.card}>
        {/* Avatar + Info Row */}
        <View style={styles.topSection}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarFrame}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitials}>
                    {profileName ? profileName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={onCameraPress} activeOpacity={0.8}>
              <Pencil size={RFValue(7)} color={Colors.white} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Name + Badges */}
          <View style={styles.infoCol}>
            <View style={styles.nameRow}>
              <Text style={styles.nameText} numberOfLines={1}>{profileName}</Text>
              <BadgeCheck size={RFValue(14)} color={Colors.primary} fill={Colors.primary} strokeWidth={0} style={{ marginLeft: wp('1%') }} />
            </View>

            <Text style={styles.designationText}>{designation || t('common.user')}</Text>

            <View style={styles.badgeRow}>
              {membership ? (
                <View style={[styles.chip, styles.chipGold]}>
                  <Text style={styles.chipTextGold}>{membership.charAt(0).toUpperCase() + membership.slice(1)}</Text>
                </View>
              ) : null}
            </View>

            {/* Meta row: ID + Since */}
            <View style={styles.metaRow}>
              {uid ? (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>{t('drawer.id')}</Text>
                  <Text style={styles.metaValue}>{uid}</Text>
                </View>
              ) : null}
              {uid && joinDate ? <View style={styles.metaDot} /> : null}
              {joinDate ? (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>{t('drawer.since')}</Text>
                  <Text style={styles.metaValue}>
                    {new Date(joinDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Bio */}
        {bio ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('publicProfile.bio')}</Text>
            <Text style={styles.bioText}>{bio}</Text>
          </View>
        ) : null}

        {/* Details Grid */}
        {detailsData.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('publicProfile.about')}</Text>
            <View style={styles.detailsGrid}>
              {detailsData.map(d => {
                const IconComp = d.icon;
                return (
                  <View key={d.key} style={[styles.detailCard, d.fullWidth && styles.detailCardFull]}>
                    <View style={styles.detailIconCircle}>
                      <IconComp size={RFValue(9)} color={Colors.primary} />
                    </View>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailLabel}>{d.label || d.key}</Text>
                      <Text style={styles.detailValue} numberOfLines={2}>{d.value}</Text>
                    </View>
                    {d.shareable ? (
                      <TouchableOpacity
                        style={styles.shareIconBtn}
                        onPress={() => d.value ? handleShareReferral(d.value) : null}
                        activeOpacity={0.7}
                      >
                        <Share2 size={RFValue(10)} color={Colors.primary} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Contact Buttons */}
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactBtn} onPress={onEmailPress} activeOpacity={0.7}>
            <Mail size={RFValue(11)} color={Colors.primary} />
            <Text style={styles.contactBtnText} numberOfLines={1}>{profileEmail}</Text>
          </TouchableOpacity>
          <View style={styles.contactSep} />
          <TouchableOpacity style={styles.contactBtn} onPress={onPhonePress} activeOpacity={0.7}>
            <Phone size={RFValue(11)} color={Colors.primary} />
            <Text style={styles.contactBtnText} numberOfLines={1}>{profilePhone}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  coverWrapper: {
    height: hp('18%'),
    width: '100%',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    marginTop: -hp('5%'),
    marginHorizontal: wp('3%'),
    paddingHorizontal: wp('4%'),
    paddingTop: wp('4%'),
    paddingBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
  },

  /* ---- Top: Avatar + Info ---- */
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarWrap: {
    position: 'relative',
    marginRight: wp('4%'),
  },
  avatarFrame: {
    width: wp('22%'),
    height: wp('22%'),
    borderRadius: wp('11%'),
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: wp('11%'),
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: wp('11%'),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#FFF',
    fontSize: RFValue(18),
    fontWeight: '800',
    letterSpacing: 1,
  },
  editBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: wp('6.5%'),
    height: wp('6.5%'),
    borderRadius: wp('3.25%'),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  /* ---- Info Column ---- */
  infoCol: {
    flex: 1,
    paddingTop: hp('0.2%'),
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: RFValue(14),
    fontWeight: '800',
    color: '#111827',
    flexShrink: 1,
  },
  designationText: {
    fontSize: RFValue(9),
    color: '#6B7280',
    fontWeight: '500',
    marginTop: hp('0.15%'),
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: hp('0.5%'),
    gap: wp('1.5%'),
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('0.25%'),
    paddingHorizontal: wp('2%'),
    borderRadius: wp('1.2%'),
  },
  chipGold: {
    backgroundColor: '#FFFBEB',
    borderWidth: 0.6,
    borderColor: '#FDE68A',
  },
  chipTextGold: {
    fontSize: RFValue(8),
    fontWeight: '700',
    color: '#B45309',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.6%'),
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1%'),
  },
  metaLabel: {
    fontSize: RFValue(7.5),
    fontWeight: '500',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
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

  /* ---- Sections ---- */
  section: {
    marginTop: hp('1.5%'),
    paddingTop: hp('1.2%'),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  sectionLabel: {
    fontSize: RFValue(7.5),
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: hp('0.6%'),
  },
  bioText: {
    fontSize: RFValue(9.5),
    color: '#374151',
    lineHeight: RFValue(14),
    fontWeight: '400',
  },

  /* ---- Details Grid ---- */
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp('2%'),
  },
  detailCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: wp('2.5%'),
    paddingVertical: hp('0.8%'),
    paddingHorizontal: wp('2.5%'),
  },
  detailCardFull: {
    width: '100%',
  },
  detailIconCircle: {
    width: wp('7%'),
    height: wp('7%'),
    borderRadius: wp('3.5%'),
    backgroundColor: '#FFF2EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('2%'),
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: RFValue(7),
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 1,
  },
  detailValue: {
    fontSize: RFValue(9),
    fontWeight: '700',
    color: '#1F2937',
  },
  shareIconBtn: {
    padding: wp('1.2%'),
    marginLeft: wp('1%'),
    borderRadius: wp('1.2%'),
    backgroundColor: '#FFF2EB',
  },

  /* ---- Contact ---- */
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('1.5%'),
    paddingTop: hp('1.2%'),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    gap: wp('2%'),
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: wp('2.5%'),
    paddingVertical: hp('1%'),
    gap: wp('1.5%'),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
  },
  contactBtnText: {
    fontSize: RFValue(8.5),
    fontWeight: '600',
    color: '#374151',
    flexShrink: 1,
  },
  contactSep: {
    width: 0,
  },
});
