import React, { useCallback } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Share } from 'react-native';
import { Pencil, Mail, Phone, BadgeCheck, Briefcase, Calendar, MapPin, Building, Home, Globe, Hash, Share2, Heart, HeartHandshake, User } from 'lucide-react-native';
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
  membership?: string;
  bio?: string;
  onCameraPress: () => void;
  onEmailPress: () => void;
  onPhonePress: () => void;
  tier: any;
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

type IconType = React.ComponentType<any>;

type DetailTile = {
  key: string;
  icon: IconType;
  label: string;
  value: string;
  fullWidth?: boolean;
  onPress?: () => void;
};

const SectionHeading = ({ icon: Icon, title }: { icon: IconType; title: string }) => (
  <View style={styles.catHeading}>
    <View style={styles.catHeadingIcon}>
      <Icon size={RFValue(10)} color={Colors.primary} strokeWidth={2.4} />
    </View>
    <Text style={styles.catHeadingText}>{title}</Text>
  </View>
);

const DetailItem = ({ icon: Icon, label, value, fullWidth, onPress }: DetailTile) => {
  const inner = (
    <>
      <View style={styles.tileIcon}>
        <Icon size={RFValue(9)} color={Colors.primary} strokeWidth={2.2} />
      </View>
      <View style={styles.tileBody}>
        <Text style={styles.tileLabel} numberOfLines={1}>{label}</Text>
        <Text style={styles.tileValue} numberOfLines={2}>{value}</Text>
      </View>
    </>
  );

  const box = [styles.tile, fullWidth && styles.tileFull];

  if (onPress) {
    return (
      <TouchableOpacity style={box} onPress={onPress} activeOpacity={0.7}>
        {inner}
      </TouchableOpacity>
    );
  }
  return <View style={box}>{inner}</View>;
};

export const ProfileHeader = React.memo(({
  profileName,
  profileEmail,
  profilePhone,
  avatarUri = '',
  uid,
  joinDate,
  membership,
  bio,
  onCameraPress,
  onEmailPress,
  onPhonePress,
  tier,
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

  const naLabel = t('common.na');
  const clean = (v?: string) => (v && v !== naLabel ? v : undefined);

  const buildTiles = (list: Array<Omit<DetailTile, 'value'> & { value?: string }>): DetailTile[] =>
    list
      .filter((i): i is Omit<DetailTile, 'value'> & { value: string } => !!clean(i.value))
      .map(i => ({ ...i, value: i.value }));

  const personalItems = buildTiles([
    { key: 'profession', icon: Briefcase, label: t('publicProfile.profession'), value: profession },
    { key: 'dob', icon: Calendar, label: t('publicProfile.dateOfBirth'), value: dob },
    { key: 'dom', icon: HeartHandshake, label: t('publicProfile.dateOfMarriage'), value: dom },
    { key: 'partnerName', icon: Heart, label: t('publicProfile.partnerName'), value: partnerName },
  ]);

  const addressItems = buildTiles([
    { key: 'city', icon: Building, label: t('publicProfile.location'), value: city },
    { key: 'state', icon: MapPin, label: t('publicProfile.state'), value: state },
    { key: 'pincode', icon: Hash, label: t('publicProfile.pincode'), value: pincode },
    { key: 'country', icon: Globe, label: t('publicProfile.country'), value: country },
  ]);

  const addressFullItems = buildTiles([
    { key: 'address', icon: Home, label: t('publicProfile.address'), value: address, fullWidth: true },
    { key: 'area', icon: MapPin, label: t('publicProfile.area'), value: area, fullWidth: true },
  ]);

  const contactItems = buildTiles([
    { key: 'email', icon: Mail, label: t('publicProfile.email'), value: profileEmail, fullWidth: true, onPress: onEmailPress },
    { key: 'phone', icon: Phone, label: t('publicProfile.phone'), value: profilePhone, fullWidth: true, onPress: onPhonePress },
  ]);

  const referralValue = clean(referralCode) || '';

  const hasDetails =
    personalItems.length + addressItems.length + addressFullItems.length + contactItems.length > 0 ||
    !!referralValue;

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

            {/* <Text style={styles.membershipText}>{membership || t('common.user')}</Text> */}

            <View style={styles.badgeRow}>
              {tier ? (
                <View style={[styles.chip, styles.chipGold]}>
                  <Text style={styles.chipTextGold}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</Text>
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

        {/* Details Section */}
        {hasDetails ? (
          <View style={styles.section}>
            {personalItems.length > 0 ? (
              <View style={styles.catCard}>
                <SectionHeading icon={User} title={t('publicProfile.personalDetails')} />
                <View style={styles.tileGrid}>
                  {personalItems.map(({ key, ...rest }) => <DetailItem key={key} {...rest} />)}
                </View>
              </View>
            ) : null}

            {addressItems.length > 0 || addressFullItems.length > 0 ? (
              <View style={styles.catCard}>
                <SectionHeading icon={MapPin} title={t('publicProfile.addressDetails')} />
                <View style={styles.tileGrid}>
                  {addressItems.map(({ key, ...rest }) => <DetailItem key={key} {...rest} />)}
                  {addressFullItems.map(({ key, ...rest }) => <DetailItem key={key} {...rest} />)}
                </View>
              </View>
            ) : null}

            {referralValue ? (
              <View style={styles.catCard}>
                <SectionHeading icon={Share2} title={t('publicProfile.referralDetails')} />
                <View style={[styles.tile,{ width: '100%',}]}>
                  <View style={styles.tileIcon}>
                    <Share2 size={RFValue(9)} color={Colors.primary} strokeWidth={2.2} />
                  </View>
                  <View style={styles.tileBody}>
                    <Text style={styles.tileLabel}>{t('referral.yourCode')}</Text>
                    <Text style={styles.tileValue}>{referralValue}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.shareBtn}
                    onPress={() => handleShareReferral(referralValue)}
                    activeOpacity={0.8}
                  >
                    <Share2 size={RFValue(8.5)} color="#FFF" strokeWidth={2.4} />
                    <Text style={styles.shareBtnText}>{t('common.share')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {contactItems.length > 0 ? (
              <View style={styles.catCard}>
                <SectionHeading icon={Mail} title={t('publicProfile.contactInfo')} />
                <View style={styles.tileGrid}>
                  {contactItems.map(({ key, ...rest }) => <DetailItem key={key} {...rest} />)}
                </View>
              </View>
            ) : null}
          </View>
        ) : null}
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
    // ...StyleSheet.absoluteFillObject,
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
    shadowRadius: 1,
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
  membershipText: {
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

  /* ---- Details: Category Cards ---- */
  catCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3.5%'),
    padding: wp('3.5%'),
    marginTop: hp('1.6%'),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  catHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.1%'),
  },
  catHeadingIcon: {
    width: wp('5.5%'),
    height: wp('5.5%'),
    borderRadius: wp('2.75%'),
    backgroundColor: '#FFF2EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('1.8%'),
  },
  catHeadingText: {
    fontSize: RFValue(8.5),
    fontWeight: '800',
    color: Colors.dark,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  /* ---- Details: Item Tiles ---- */
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp('2%'),
  },
  tile: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: wp('2.5%'),
    paddingVertical: hp('0.9%'),
    paddingHorizontal: wp('2.2%'),
    minHeight: hp('5%'),
  },
  tileFull: {
    width: '100%',
  },
  tileIcon: {
    width: wp('7.5%'),
    height: wp('7.5%'),
    borderRadius: wp('3.75%'),
    backgroundColor: '#FFF2EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('2%'),
  },
  tileBody: {
    flex: 1,
  },
  tileLabel: {
    fontSize: RFValue(6.8),
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 1,
  },
  tileValue: {
    fontSize: RFValue(8.8),
    fontWeight: '700',
    color: '#1F2937',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1%'),
    backgroundColor: Colors.primary,
    paddingVertical: hp('0.65%'),
    paddingHorizontal: wp('3%'),
    borderRadius: wp('2%'),
    marginLeft: wp('2%'),
  },
  shareBtnText: {
    color: '#FFF',
    fontSize: RFValue(8),
    fontWeight: '800',
  },
});
