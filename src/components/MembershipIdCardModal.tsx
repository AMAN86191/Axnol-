import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Award } from 'lucide-react-native';
import Svg, { Rect } from 'react-native-svg';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';

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
  avatarUri = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300',
  memberId = 'GMT-8394-2026',
  designation = 'Gold Patron Member',
  since = 'Jan 2026',
}: MembershipIdCardModalProps) => {
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
          <View style={styles.idCard}>
            {/* Header inside Card */}
            <View style={styles.idCardHeader}>
              <Award size={RFValue(16)} color="#FF6F34" style={{ marginRight: wp('2%') }} />
              <View style={styles.idCardHeaderTitleCol}>
                <Text style={styles.idCardTrustName}>GAU MATA SEWA TRUST</Text>
                <Text style={styles.idCardSubHeader}>OFFICIAL MEMBERSHIP CARD</Text>
              </View>
            </View>

            {/* Card Body */}
            <View style={styles.idCardBody}>
              {/* Photo Col */}
              <View style={styles.idCardPhotoContainer}>
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.idCardAvatar}
                />
                <View style={styles.idCardStatusBadge}>
                  <Text style={styles.idCardStatusText}>ACTIVE</Text>
                </View>
              </View>

              {/* Details Col */}
              <View style={styles.idCardDetails}>
                <Text style={styles.idCardLabel}>MEMBER NAME</Text>
                <Text style={styles.idCardName} numberOfLines={1}>{profileName}</Text>

                <Text style={styles.idCardLabel}>MEMBERSHIP ID</Text>
                <Text style={styles.idCardValue}>{memberId}</Text>

                <Text style={styles.idCardLabel}>DESIGNATION</Text>
                <Text style={styles.idCardValue}>{designation}</Text>

                <View style={styles.idCardRow}>
                  <View style={{ marginRight: wp('4%') }}>
                    <Text style={styles.idCardLabel}>SINCE</Text>
                    <Text style={styles.idCardValue}>{since}</Text>
                  </View>
                  <View>
                    <Text style={styles.idCardLabel}>VERIFIED</Text>
                    <Text style={[styles.idCardValue, { color: '#10B981', fontWeight: 'bold' }]}>YES ✓</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Barcode/QR Code Footer */}
            <View style={styles.idCardFooter}>
              <View style={styles.barcodeWrapper}>
                <Svg width={wp('42%')} height={hp('2.8%')} viewBox="0 0 100 20">
                  <Rect x="0" y="0" width="2" height="20" fill="#111827" />
                  <Rect x="3" y="0" width="1" height="20" fill="#111827" />
                  <Rect x="5" y="0" width="4" height="20" fill="#111827" />
                  <Rect x="10" y="0" width="1" height="20" fill="#111827" />
                  <Rect x="12" y="0" width="2" height="20" fill="#111827" />
                  <Rect x="15" y="0" width="3" height="20" fill="#111827" />
                  <Rect x="19" y="0" width="1" height="20" fill="#111827" />
                  <Rect x="21" y="0" width="5" height="20" fill="#111827" />
                  <Rect x="27" y="0" width="2" height="20" fill="#111827" />
                  <Rect x="30" y="0" width="1" height="20" fill="#111827" />
                  <Rect x="32" y="0" width="3" height="20" fill="#111827" />
                  <Rect x="36" y="0" width="2" height="20" fill="#111827" />
                  <Rect x="39" y="0" width="4" height="20" fill="#111827" />
                  <Rect x="44" y="0" width="1" height="20" fill="#111827" />
                  <Rect x="46" y="0" width="2" height="20" fill="#111827" />
                  <Rect x="49" y="0" width="1" height="20" fill="#111827" />
                  <Rect x="51" y="0" width="3" height="20" fill="#111827" />
                  <Rect x="55" y="0" width="5" height="20" fill="#111827" />
                  <Rect x="61" y="0" width="2" height="20" fill="#111827" />
                  <Rect x="64" y="0" width="1" height="20" fill="#111827" />
                  <Rect x="66" y="0" width="3" height="20" fill="#111827" />
                  <Rect x="70" y="0" width="2" height="20" fill="#111827" />
                  <Rect x="73" y="0" width="4" height="20" fill="#111827" />
                  <Rect x="78" y="0" width="1" height="20" fill="#111827" />
                  <Rect x="80" y="0" width="3" height="20" fill="#111827" />
                  <Rect x="84" y="0" width="2" height="20" fill="#111827" />
                  <Rect x="87" y="0" width="1" height="20" fill="#111827" />
                  <Rect x="89" y="0" width="5" height="20" fill="#111827" />
                  <Rect x="95" y="0" width="2" height="20" fill="#111827" />
                  <Rect x="98" y="0" width="2" height="20" fill="#111827" />
                </Svg>
                <Text style={styles.barcodeText}>{memberId}</Text>
              </View>
              <View style={styles.idCardStamp}>
                <Text style={{ fontSize: RFValue(14) }}>🐄</Text>
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
              <Text style={styles.idCardCloseBtnText}>Close Card</Text>
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
  idCard: {
    width: wp('95%'),
    backgroundColor: '#FFFDF9',
    borderRadius: wp('4.5%'),
    padding: wp('4%'),
    borderWidth: 2,
    borderColor: '#CBB28C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    overflow: 'hidden',
  },
  idCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#FFE5DA',
    paddingBottom: hp('1.2%'),
    marginBottom: hp('1.5%'),
  },
  idCardHeaderTitleCol: {
    flex: 1,
  },
  idCardTrustName: {
    fontSize: RFValue(11.5),
    fontWeight: '800',
    color: '#806030',
    letterSpacing: 0.5,
  },
  idCardSubHeader: {
    fontSize: RFValue(7.2),
    fontWeight: '700',
    color: '#FF6F34',
    letterSpacing: 0.5,
    marginTop: hp('0.1%'),
  },
  idCardBody: {
    flexDirection: 'row',
    marginBottom: hp('1.8%'),
  },
  idCardPhotoContainer: {
    alignItems: 'center',
    marginRight: wp('4.5%'),
  },
  idCardAvatar: {
    width: wp('20%'),
    height: wp('20%'),
    borderRadius: wp('10%'),
    borderWidth: 1.8,
    borderColor: '#FF6F34',
  },
  idCardStatusBadge: {
    backgroundColor: '#10B981',
    borderRadius: wp('1%'),
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.3%'),
    marginTop: hp('0.8%'),
  },
  idCardStatusText: {
    color: '#FFF',
    fontSize: RFValue(7.2),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  idCardDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  idCardLabel: {
    fontSize: RFValue(6.8),
    color: '#9CA3AF',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: hp('0.1%'),
  },
  idCardName: {
    fontSize: RFValue(12.5),
    fontWeight: '800',
    color: '#111827',
    marginBottom: hp('0.8%'),
  },
  idCardValue: {
    fontSize: RFValue(9),
    color: '#374151',
    fontWeight: '700',
    marginBottom: hp('0.8%'),
  },
  idCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  idCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: hp('1%'),
  },
  barcodeWrapper: {
    alignItems: 'flex-start',
  },
  barcodeText: {
    fontSize: RFValue(7),
    color: '#6B7280',
    fontWeight: '600',
    letterSpacing: 1.5,
    marginTop: hp('0.3%'),
    paddingLeft: wp('1%'),
  },
  idCardStamp: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    borderWidth: 1.2,
    borderColor: 'rgba(255, 111, 52, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 111, 52, 0.05)',
  },
  idCardModalActions: {
    marginTop: hp('2.5%'),
    width: wp('80%'),
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
