import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Users, FileText } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';

interface ProfileStatsProps {
  postsCount: number;
}

export const ProfileStats = React.memo(({ postsCount }: ProfileStatsProps) => {
  return (
    <View style={styles.statsRow}>
      {/* Total Impact Orange Card */}
      <View style={styles.impactCard}>
        <Text style={styles.impactLabel}>Total Impact 🍃</Text>
        <Text style={styles.impactValue}>₹1.2L</Text>
        <Text style={styles.impactSub}>Total Donations</Text>
      </View>

      {/* Referrals Mini Card */}
      <View style={styles.miniStatCard}>
        <View style={styles.miniStatIconCircle}>
          <Users size={RFValue(12)} color="#FF6F34" strokeWidth={2} />
        </View>
        <Text style={styles.miniStatValue}>24</Text>
        <Text style={styles.miniStatLabel}>Referrals</Text>
        <Text style={styles.miniStatSub}>Invites</Text>
      </View>

      {/* Posts Mini Card */}
      <View style={styles.miniStatCard}>
        <View style={styles.miniStatIconCircle}>
          <FileText size={RFValue(12)} color="#FF6F34" strokeWidth={2} />
        </View>
        <Text style={styles.miniStatValue}>{postsCount}</Text>
        <Text style={styles.miniStatLabel}>Posts</Text>
        <Text style={styles.miniStatSub}>Published</Text>
      </View>

      {/* Likes Mini Card */}
      <View style={styles.miniStatCard}>
        <View style={styles.miniStatIconCircle}>
          <Users size={RFValue(12)} color="#FF6F34" strokeWidth={2} />
        </View>
        <Text style={styles.miniStatValue}>1.2K</Text>
        <Text style={styles.miniStatLabel}>Likes</Text>
        <Text style={styles.miniStatSub}>Received</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
  },
  impactCard: {
    width: wp('31%'),
    backgroundColor: '#FF6F34',
    borderRadius: wp('3.5%'),
    padding: wp('3%'),
    justifyContent: 'center',
    shadowColor: '#FF6F34',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  impactLabel: {
    fontSize: RFValue(8.2),
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: hp('0.3%'),
  },
  impactValue: {
    fontSize: RFValue(19),
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: hp('0.2%'),
  },
  impactSub: {
    fontSize: RFValue(8.2),
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
  },
  miniStatCard: {
    width: wp('19%'),
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3.5%'),
    padding: wp('2.5%'),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1.5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  miniStatIconCircle: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
  },
  miniStatValue: {
    fontSize: RFValue(12.5),
    fontWeight: '800',
    color: '#1F2937',
  },
  miniStatLabel: {
    fontSize: RFValue(7.5),
    color: '#1F2937',
    fontWeight: '700',
    marginTop: hp('0.1%'),
  },
  miniStatSub: {
    fontSize: RFValue(7.2),
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
