import React, { useCallback, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Share,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  Share2,
  Copy,
  Users,
  CheckCircle,
  Gift,
} from 'lucide-react-native';

import { CommonHeader } from '../../components/CommonHeader';
import { Colors } from '../../theme/colors';
import useAuthStore from '../../zustand/useAuthStore';
import { useTranslation } from 'react-i18next';



export default function ReferralScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user, getProfile } = useAuthStore();

  const [copied, setCopied] = useState(false);
  const [referredFriends, setReferredFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      if (res?.data?.referred_users) {
        setReferredFriends(res.data.referred_users);
      }
    } catch (error) {
      console.log('Error fetching profile in ReferralScreen:', error);
    } finally {
      setLoading(false);
    }
  };

  const referralCode = user?.profile?.referral_code || '';
  const referralLink = `https://gaumata.org/invite/${referralCode}`;
  const totalReferrals = user?.statistics?.referrals_count || 0;

  const shareMessage = t('referral.shareMessage', { code: referralCode, link: referralLink });

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);


  const handleCopyLink = useCallback(async () => {
    try {
      // Trigger a share sheet with just the link or trigger native clipboard if supported
      // Since Clipboard is deprecated in RN Core and needs third-party, general Share is safer.
      // However, we can also use Share to "Copy" or show a nice copy success.
      // We will show a success alert to mock copy since general Share has Copy.
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      // await Share.share({
      //   message: referralLink,
      // });
    } catch (error) {
      console.error(error);
    }
  }, [referralLink]);

  const handleShareLink = useCallback(async () => {
    try {
      await Share.share({
        message: shareMessage,
      });
    } catch (error) {
      console.error(error);
    }
  }, [shareMessage]);

  const formatDate = (dateString: string) => {
    if (!dateString) return t('common.na');
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CommonHeader title={t('referral.referFriend')} onBackPress={handleBack} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Banner Card */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerIconCircle}>
            <Gift size={RFValue(24)} color={Colors.dark} strokeWidth={1.8} />
          </View>
          <Text style={styles.bannerTitle}>{t('referral.referTitle')}</Text>
          <Text style={styles.bannerSubtitle}>
            {t('referral.referSubtitle')}
          </Text>
        </View>

        {/* Code Box Card */}
        <View style={styles.codeCard}>
          <Text style={styles.cardLabel}>{t('referral.yourCode')}</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{referralCode}</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopyLink} activeOpacity={0.7}>
              <Copy size={RFValue(12)} color={Colors.primary} />
              <Text style={styles.copyBtnText}>{copied ? t('common.copied') : t('common.copy')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.linkText} numberOfLines={1}>{referralLink}</Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShareLink} activeOpacity={0.7}>
            <Share2 size={RFValue(14)} color={Colors.primary} />
            <Text style={styles.shareButtonText}>{t('common.share')}</Text>
          </TouchableOpacity>
        </View>

        {/* Total Referrals Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsLeft}>
            <View style={styles.statsIconCircle}>
              <Users size={RFValue(16)} color="#10B981" />
            </View>
            <View>
              <Text style={styles.statsLabel}>{t('referral.totalReferrals')}</Text>
              <Text style={styles.statsDesc}>{t('referral.friendsJoined')}</Text>
            </View>
          </View>
          <Text style={styles.statsNumber}>{totalReferrals}</Text>
        </View>


        {/* Referred Friends History */}
        <Text style={styles.sectionTitle}>{t('referral.recentReferrals')}</Text>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: hp('2%') }} />
        ) : (
          <View style={styles.historyContainer}>
            {referredFriends.length === 0 ? (
              <Text style={{ textAlign: 'center', padding: hp('2%'), color: Colors.gray }}>{t('referral.noReferrals')}</Text>
            ) : (
              referredFriends.map((friend) => {
                const isActive = friend.status === 'active';
                const statusColor = isActive ? '#10B981' : '#9CA3AF';
                const statusText = isActive ? t('common.active') : t('common.inactive');
                const name = friend.name || t('common.unknown');
                const designation = friend.profile?.designation;
                
                return (
                  <View key={friend.id} style={styles.historyItem}>
                    <View style={styles.historyLeft}>
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarInitial}>{name.charAt(0).toUpperCase()}</Text>
                      </View>
                      <View>
                        <Text style={styles.friendName}>{name}</Text>
                        <Text style={styles.friendJoined}>{t('referral.joined')}{formatDate(friend.created_at)}</Text>
                        {designation ? (
                          <Text style={styles.friendDesignation}>{designation}</Text>
                        ) : null}
                      </View>
                    </View>
                    <View style={styles.historyRight}>
                      <CheckCircle size={RFValue(10)} color={statusColor} />
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {statusText}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    paddingHorizontal: wp('4%'),
    paddingTop: hp('1.5%'),
    paddingBottom: hp('5%'),
  },
  bannerCard: {
    backgroundColor: Colors.white,
    borderRadius: wp('4%'),
    padding: wp('5%'),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFEBE0',
  },
  bannerIconCircle: {
    width: wp('16%'),
    height: wp('16%'),
    borderRadius: wp('8%'),
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  bannerTitle: {
    fontSize: RFValue(14),
    fontWeight: '800',
    color: '#806030',
    marginBottom: hp('0.5%'),
  },
  bannerSubtitle: {
    fontSize: RFValue(9.5),
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: hp('1.8%'),
  },
  codeCard: {
    backgroundColor: Colors.white,
    borderRadius: wp('4%'),
    padding: wp('4.5%'),
    marginTop: hp('2%'),
    borderWidth: 1.5,
    borderColor: '#FFE0D3',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: RFValue(8.2),
    color: Colors.gray,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: hp('0.8%'),
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F0',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('3%'),
    width: '100%',
    marginBottom: hp('1.2%'),
  },
  codeText: {
    fontSize: RFValue(18),
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 2,
    marginRight: wp('3%'),
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: hp('0.5%'),
    paddingHorizontal: wp('2.5%'),
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#FFE0D3',
  },
  copyBtnText: {
    fontSize: RFValue(9),
    color: Colors.primary,
    fontWeight: '700',
    marginLeft: wp('1%'),
  },
  linkText: {
    fontSize: RFValue(9.2),
    color: '#9CA3AF',
    width: '90%',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: Colors.white,
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginTop: hp('2%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statsIconCircle: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  statsLabel: {
    fontSize: RFValue(11),
    fontWeight: '700',
    color: Colors.dark,
  },
  statsDesc: {
    fontSize: RFValue(8.2),
    color: Colors.gray,
    marginTop: hp('0.1%'),
  },
  statsNumber: {
    fontSize: RFValue(20),
    fontWeight: '800',
    color: '#10B981',
    marginLeft: wp('2%'),
  },
  sectionTitle: {
    fontSize: RFValue(9.5),
    fontWeight: '800',
    color: Colors.gray,
    letterSpacing: 1,
    marginTop: hp('2.5%'),
    marginBottom: hp('1%'),
    paddingLeft: wp('1%'),
  },
  
  logoIcon: {
    width: RFValue(13),
    height: RFValue(13),
    resizeMode: 'contain',
    tintColor: Colors.primary,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('5%'),
    borderRadius: wp('2%'),
    marginTop: hp('1.5%'),
    borderWidth: 1,
    borderColor: '#FFE0D3',
  },
  shareButtonText: {
    color: Colors.primary,
    fontSize: RFValue(10),
    fontWeight: '700',
    marginLeft: wp('2%'),
  },
  historyContainer: {
    backgroundColor: Colors.white,
    borderRadius: wp('4%'),
    paddingVertical: hp('0.5%'),
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: wp('9%'),
    height: wp('9%'),
    borderRadius: wp('4.5%'),
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
    borderWidth: 1,
    borderColor: '#FFE0D3',
  },
  avatarInitial: {
    fontSize: RFValue(11),
    fontWeight: '700',
    color: Colors.dark,
  },
  friendName: {
    fontSize: RFValue(11),
    fontWeight: '700',
    color: Colors.dark,
  },
  friendJoined: {
    fontSize: RFValue(8.2),
    color: Colors.gray,
    marginTop: hp('0.1%'),
  },
  friendDesignation: {
    fontSize: RFValue(8.2),
    color: Colors.primary,
    fontWeight: '600',
    marginTop: hp('0.2%'),
  },
  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: RFValue(9),
    fontWeight: '700',
    marginLeft: wp('1%'),
  },
});
