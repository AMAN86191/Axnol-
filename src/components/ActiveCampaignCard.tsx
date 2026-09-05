import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTranslation } from 'react-i18next';
import { ProgressCircle } from './ProgressCircle';

interface ActiveCampaignCardProps {
  onDonatePress: () => void;
}

export const ActiveCampaignCard = React.memo(({ onDonatePress }: ActiveCampaignCardProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.campaignCard}>
      <View style={styles.campaignLeftContainer}>
        <Text style={styles.campaignTag}>{t('campaign.activeCampaign')}</Text>
        <Text style={styles.campaignTitle}>{t('campaign.feedCows')}</Text>
        <Text style={styles.campaignDesc}>
          {t('campaign.feedDesc')}
        </Text>
        <TouchableOpacity
          style={styles.donateAgainBtn}
          onPress={onDonatePress}
          activeOpacity={0.85}
        >
          <Text style={styles.donateAgainText}>{t('campaign.makeDonation')}</Text>
          <ArrowRight size={RFValue(9.5)} color="#FFF" strokeWidth={2.5} style={{ marginLeft: wp('1%') }} />
        </TouchableOpacity>
      </View>

      {/* Goal Progress ring in center */}
      {/* <View style={styles.campaignProgress}>
        <ProgressCircle percent={75} />
        <Text style={styles.progressGoalText}>Goal Progress</Text>
      </View> */}

      {/* Calf image on right */}
      <Image
        source={require('../../assets/images/calf.png')}
        style={styles.campaignImage}
        resizeMode="cover"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  campaignCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4.5%'),
    marginHorizontal: wp('4%'),
    marginTop: hp('1%'),
    padding: wp('3%'),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  campaignLeftContainer: {
    flex: 1,
    paddingRight: wp('1%'),
  },
  campaignTag: {
    fontSize: RFValue(8.2),
    color: '#9CA3AF',
    fontWeight: '700',
    marginBottom: hp('0.3%'),
  },
  campaignTitle: {
    fontSize: RFValue(13.5),
    fontWeight: '800',
    color: '#111827',
    marginBottom: hp('0.4%'),
  },
  campaignDesc: {
    fontSize: RFValue(8.5),
    color: '#6B7280',
    lineHeight: hp('1.6%'),
    marginBottom: hp('1.2%'),
    width: wp('50%'),
  },
  donateAgainBtn: {
    backgroundColor: '#FF6F34',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('0.8%'),
    paddingHorizontal: wp('3.5%'),
    borderRadius: wp('5%'),
    alignSelf: 'flex-start',
  },
  donateAgainText: {
    color: '#FFFFFF',
    fontSize: RFValue(9.5),
    fontWeight: '700',
  },
  campaignProgress: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: wp('2.5%'),
  },
  progressGoalText: {
    fontSize: RFValue(7.2),
    color: '#6B7280',
    fontWeight: '700',
    marginTop: hp('0.6%'),
  },
  campaignImage: {
    width: wp('30%'),
    height: hp('12%'),
    borderRadius: wp('2%'),
  },
});
