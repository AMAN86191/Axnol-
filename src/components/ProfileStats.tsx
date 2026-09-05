import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Users, FileText, Heart, Share2 } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTranslation } from 'react-i18next';

interface ProfileStatsProps {
  postsCount: number;
  referralsCount?: number;
  likesCount?: number;
}

const statCards = (t: any) => [
  { icon: Share2, tint: '#FF6F34', label: t('profile.referrals'), sub: t('profile.invites') },
  { icon: FileText, tint: '#C2410C', label: t('profile.posts'), sub: t('profile.published') },
  { icon: Heart, tint: '#B45309', label: t('profile.likes'), sub: t('profile.received') },
];

export const ProfileStats = React.memo(({ postsCount, referralsCount = 0, likesCount = 0 }: ProfileStatsProps) => {
  const { t } = useTranslation();
  const values = [referralsCount, postsCount, likesCount];

  return (
    <View style={styles.statsRow}>
      {statCards(t).map((card, index) => {
        const Icon = card.icon;
        return (
          <View key={index} style={styles.miniStatCard}>
            <View style={[styles.miniStatIconCircle, { backgroundColor: `${card.tint}1A` }]}>
              <Icon size={RFValue(12)} color={card.tint} strokeWidth={2.2} />
            </View>
            <Text style={[styles.miniStatValue, { color: card.tint }]}>{values[index]}</Text>
            <Text style={styles.miniStatLabel}>{card.label}</Text>
            <Text style={styles.miniStatSub}>{card.sub}</Text>
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp('2.5%'),
    marginHorizontal: wp('4%'),
    marginTop: hp('1.2%'),
  },
  miniStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3.5%'),
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('1.2%'),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6F34',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#FBE3D6',
  },
  miniStatIconCircle: {
    width: wp('7%'),
    height: wp('7%'),
    borderRadius: wp('4.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('0.7%'),
  },
  miniStatValue: {
    fontSize: RFValue(14),
    fontWeight: '800',
    color: '#B45309',
  },
  miniStatLabel: {
    fontSize: RFValue(7.8),
    color: '#6B4A2F',
    fontWeight: '700',
    marginTop: hp('0.15%'),
  },
  miniStatSub: {
    fontSize: RFValue(7.2),
    color: '#B08968',
    fontWeight: '500',
  },
});
