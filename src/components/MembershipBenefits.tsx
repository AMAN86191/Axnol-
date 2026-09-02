import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Award, User as UserIcon, Check } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTranslation } from 'react-i18next';

interface MembershipBenefitsProps {
  isMember: boolean;
  onCertificatePress: () => void;
  onIdCardPress: () => void;
  onBecomeMemberPress: () => void;
  onDemoTogglePress: () => void;
}

export const MembershipBenefits = React.memo(({
  isMember,
  onCertificatePress,
  onIdCardPress,
  onBecomeMemberPress,
  onDemoTogglePress,
}: MembershipBenefitsProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.membershipCardContainer}>
      <Text style={styles.membershipSectionTitle}>{t('membership.membershipBenefits')}</Text>

      {isMember ? (
        <View style={styles.memberAccessCard}>
          <View style={styles.memberAccessHeader}>
            <View style={styles.statusBadgeGreen}>
              <Check size={RFValue(7.5)} color="#065F46" strokeWidth={4} style={{ marginRight: wp('1%') }} />
              <Text style={styles.statusBadgeTextGreen}>{t('membership.communityMember')}</Text>
            </View>
            {/* <TouchableOpacity onPress={onDemoTogglePress} style={styles.toggleMemberBtn}>
              <Text style={styles.toggleMemberText}>Demo Non-Member</Text>
            </TouchableOpacity> */}
          </View>

          <Text style={styles.memberAccessDesc}>
            {t('membership.thankYouMember')}
          </Text>

          <View style={styles.memberActionsRow}>
            <TouchableOpacity
              style={styles.memberActionBtn}
              onPress={onCertificatePress}
              activeOpacity={0.8}
            >
              <Award size={RFValue(12)} color="#FF6F34" style={{ marginRight: wp('1.5%') }} />
              <Text style={styles.memberActionBtnText}>{t('membership.viewCertificate')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.memberActionBtn, styles.memberActionBtnOutline]}
              onPress={onIdCardPress}
              activeOpacity={0.8}
            >
              <UserIcon size={RFValue(12)} color="#FF6F34" style={{ marginRight: wp('1.5%') }} />
              <Text style={[styles.memberActionBtnText, styles.memberActionBtnTextOutline]}>{t('membership.viewIdCard')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.nonMemberCard}>
          <View style={styles.nonMemberHeader}>
            <Text style={styles.nonMemberTitle}>{t('membership.supportAsMember')}</Text>
            <TouchableOpacity onPress={onDemoTogglePress} style={styles.toggleMemberBtn}>
              <Text style={styles.toggleMemberText}>Demo Member</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.nonMemberDesc}>
            {t('membership.joinDescription')}
          </Text>
          <TouchableOpacity
            style={styles.becomeMemberBtn}
            onPress={onBecomeMemberPress}
            activeOpacity={0.85}
          >
            <Text style={styles.becomeMemberBtnText}>{t('membership.becomeMember')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  membershipCardContainer: {
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
  },
  membershipSectionTitle: {
    fontSize: RFValue(11.5),
    fontWeight: '800',
    color: '#111827',
    marginBottom: hp('1%'),
  },
  memberAccessCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4.5%'),
    padding: wp('4%'),
    borderWidth: 1,
    borderColor: '#FFEBE0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 2,
  },
  memberAccessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('0.8%'),
  },
  statusBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 0.8,
    borderColor: '#A7F3D0',
    borderRadius: wp('1.5%'),
    paddingVertical: hp('0.4%'),
    paddingHorizontal: wp('2.5%'),
  },
  statusBadgeTextGreen: {
    fontSize: RFValue(8),
    color: '#065F46',
    fontWeight: '700',
    marginLeft: wp('1%'),
  },
  memberAccessDesc: {
    fontSize: RFValue(8.8),
    color: '#4B5563',
    lineHeight: hp('1.7%'),
    marginBottom: hp('1.5%'),
  },
  memberActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  memberActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F0',
    borderWidth: 1,
    borderColor: '#FFE0D3',
    borderRadius: wp('3.5%'),
    height: hp('4.2%'),
    marginRight: wp('2%'),
  },
  memberActionBtnOutline: {
    backgroundColor: '#FFFFFF',
    marginRight: 0,
    marginLeft: wp('2%'),
  },
  memberActionBtnText: {
    fontSize: RFValue(9.5),
    fontWeight: '700',
    color: '#FF6F34',
  },
  memberActionBtnTextOutline: {
    color: '#FF6F34',
  },
  nonMemberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4.5%'),
    padding: wp('4%'),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 2,
  },
  nonMemberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('0.8%'),
  },
  nonMemberTitle: {
    fontSize: RFValue(11.5),
    fontWeight: '800',
    color: '#111827',
  },
  nonMemberDesc: {
    fontSize: RFValue(8.8),
    color: '#6B7280',
    lineHeight: hp('1.7%'),
    marginBottom: hp('1.5%'),
  },
  becomeMemberBtn: {
    backgroundColor: '#FF6F34',
    borderRadius: wp('3.5%'),
    height: hp('4.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#FF6F34',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  becomeMemberBtnText: {
    color: '#FFFFFF',
    fontSize: RFValue(10.5),
    fontWeight: '700',
  },
  toggleMemberBtn: {
    paddingVertical: hp('0.2%'),
    paddingHorizontal: wp('2%'),
    borderRadius: wp('1%'),
    borderWidth: 1,
    borderColor: '#FF6F34',
    borderStyle: 'dashed',
  },
  toggleMemberText: {
    fontSize: RFValue(7.2),
    color: '#FF6F34',
    fontWeight: '700',
  },
});
