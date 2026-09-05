import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Award } from 'lucide-react-native';
import Svg, { Rect } from 'react-native-svg';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTranslation } from 'react-i18next';

interface MembershipIdCardModalProps {
  visible: boolean;
  onClose: () => void;
  profileName: string;
  avatarUri?: string;
  memberId?: string;
  designation?: string;
  since?: string;
}

export const MembershipIdCardModal = React.memo(({
  visible,
  onClose,
  profileName,
  avatarUri,
  memberId,
  designation,
  since,
}: MembershipIdCardModalProps) => {
  const { t } = useTranslation();
  const designationLabel = designation || t('idCard.goldPatron');
  const initials = (profileName || 'M').trim().charAt(0).toUpperCase();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.idCardOverlay}>
        <View style={styles.idCardContainer}>
            {/* ID Card Front */}
            <View style={styles.idCardOuter}>
              <View style={styles.idCardInner}>
                {/* Header inside Card */}
                <View style={styles.idCardHeader}>
                  <View style={styles.logoPlaceholder}>
                    <Image 
                      source={require('../../assets/images/logo/logo.png')} 
                      style={styles.headerLogoImage} 
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.idCardHeaderTitleCol}>
                    <Text style={styles.idCardTrustName}>{t('idCard.trustName', 'GAU MATA SEWA TRUST')}</Text>
                    <Text style={styles.idCardSubHeader}>{t('idCard.officialCard', 'OFFICIAL MEMBERSHIP CARD')}</Text>
                  </View>
                </View>

            {/* Card Body */}
            <View style={styles.idCardBody}>
              {/* Photo Col */}
              <View style={styles.idCardPhotoContainer}>
                {avatarUri ? (
                  <View style={styles.avatarWrapper}>
                    <Image
                      source={{ uri: avatarUri }}
                      style={styles.idCardAvatar}
                    />
                  </View>
                ) : (
                  <View style={[styles.avatarWrapper, { backgroundColor: '#FFF5F0', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: RFValue(16), fontWeight: '800', color: '#FF6F34' }}>{initials}</Text>
                  </View>
                )}
                <View style={styles.idCardStatusBadge}>
                  <Text style={styles.idCardStatusText}>{t('idCard.active')}</Text>
                </View>
              </View>

              {/* Details Col */}
              <View style={styles.idCardDetails}>
                <Text style={styles.idCardLabel}>{t('idCard.memberName', 'MEMBER NAME')}</Text>
                <Text style={styles.idCardName} numberOfLines={1}>{profileName}</Text>

                <Text style={styles.idCardLabel}>{t('idCard.membershipId', 'MEMBERSHIP ID')}</Text>
                <Text style={styles.idCardValueMono}>{memberId}</Text>

                <Text style={styles.idCardLabel}>{t('idCard.designation', 'DESIGNATION')}</Text>
                <Text style={styles.idCardValue}>{designationLabel}</Text>

                <View style={styles.idCardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.idCardLabel}>{t('idCard.since', 'SINCE')}</Text>
                    <Text style={styles.idCardValue}>{since}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.idCardLabel}>{t('idCard.verified', 'VERIFIED')}</Text>
                    <Text style={[styles.idCardValue, { color: '#00A86B' }]}>{t('idCard.yes', 'YES ✓')}</Text>
                  </View>
                </View>
              </View>
            </View>

            
                <View style={styles.dashedDivider} />

                {/* Footer */}
                <View style={styles.idCardFooter}>
                  <Text style={styles.footerMemberId}>{memberId}</Text>
                  <View style={styles.footerStamp}>
                    <Image 
                      source={require('../../assets/images/logo/logo.png')} 
                      style={styles.stampLogoImage} 
                      resizeMode="contain"
                    />
                  </View>
                </View>
              </View>
            </View>

          {/* Action Buttons */}
          <View style={styles.idCardModalActions}>
            <TouchableOpacity
              style={styles.idCardCloseBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.idCardCloseBtnText}>{t('idCard.closeCard')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  idCardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 24, 24, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('2%'),
  },
  idCardContainer: {
    width: '100%',
    alignItems: 'center',
  },
  idCardOuter: {
    width: wp('92%'),
    backgroundColor: '#FAFAF5',
    borderRadius: wp('4.5%'),
    padding: wp('1.5%'),
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  idCardInner: {
    borderWidth: 1,
    borderColor: '#EFEFEA',
    borderRadius: wp('3.5%'),
    padding: wp('3.5%'),
  },
  idCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: hp('1%'),
  },
  logoPlaceholder: {
    marginRight: wp('3%'),
    width: wp('10%'),
    height: wp('8%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogoImage: {
    width: '100%',
    height: '100%',
  },
  idCardHeaderTitleCol: {
    flex: 1,
  },
  idCardTrustName: {
    fontSize: RFValue(10.5),
    fontWeight: '800',
    color: '#3B291A',
    letterSpacing: 0.8,
  },
  idCardSubHeader: {
    fontSize: RFValue(5.5),
    fontWeight: '700',
    color: '#FF6F34',
    letterSpacing: 1.2,
    marginTop: hp('0.1%'),
  },
  idCardBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  idCardPhotoContainer: {
    alignItems: 'center',
    marginRight: wp('4%'),
    width: wp('18%'),
  },
  avatarWrapper: {
    width: wp('18%'),
    height: wp('18%'),
    borderRadius: wp('9%'),
    borderWidth: 2,
    borderColor: '#FF6F34',
    padding: 2,
    backgroundColor: '#FFF',
  },
  idCardAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: wp('9%'),
  },
  idCardStatusBadge: {
    backgroundColor: '#00A86B',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.3%'),
    marginTop: hp('0.5%'),
  },
  idCardStatusText: {
    color: '#FFF',
    fontSize: RFValue(6.5),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  idCardDetails: {
    flex: 1,
    paddingTop: hp('0.2%'),
  },
  idCardLabel: {
    fontSize: RFValue(6),
    color: '#89A0B0',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: hp('0.1%'),
  },
  idCardName: {
    fontSize: RFValue(12.5),
    fontWeight: '700',
    color: '#0B2046',
    fontFamily: 'serif',
    marginBottom: hp('0.8%'),
  },
  idCardValue: {
    fontSize: RFValue(8.5),
    color: '#0B2046',
    fontWeight: '700',
    marginBottom: hp('0.8%'),
  },
  idCardValueMono: {
    fontSize: RFValue(8.5),
    color: '#0B2046',
    fontWeight: '700',
    fontFamily: 'monospace',
    marginBottom: hp('0.8%'),
    letterSpacing: 0.5,
  },
  idCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dashedDivider: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#D0D7DF',
    marginVertical: hp('1.5%'),
    marginHorizontal: -wp('2%'),
  },
  idCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerMemberId: {
    fontSize: RFValue(7.5),
    fontWeight: '700',
    color: '#0B2046',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  footerStamp: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    borderWidth: 1,
    borderColor: '#FF6F34',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
  stampLogoImage: {
    width: '80%',
    height: '80%',
  },
  idCardModalActions: {
    marginTop: hp('1%'),
    width: wp('90%'),
  },
  idCardCloseBtn: {
    backgroundColor: '#FF6F34',
    height: hp('5%'),
    borderRadius: wp('3%'),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6F34',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  idCardCloseBtnText: {
    color: '#FFF',
    fontSize: RFValue(11.5),
    fontWeight: '700',
  },
});
