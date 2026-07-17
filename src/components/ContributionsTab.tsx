import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { HeartHandshake } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';

export interface ContributionItem {
  id: string;
  title: string;
  category: string;
  amount: string;
  date: string;
  status: string;
  txnId: string;
}

interface ContributionsTabProps {
  contributions: ContributionItem[];
}

export const ContributionsTab = React.memo(({ contributions }: ContributionsTabProps) => {
  return (
    <View style={styles.contributionsList}>
      {contributions.map((item) => (
        <View key={item.id} style={styles.contributionCard}>
          <View style={styles.contributionLeft}>
            <View style={styles.contributionIconContainer}>
              <HeartHandshake size={RFValue(13)} color="#FF6F34" strokeWidth={2} />
            </View>
            <View style={styles.contributionDetails}>
              <Text style={styles.contributionTitle}>{item.title}</Text>
              <Text style={styles.contributionSub}>
                {item.category} • {item.date}
              </Text>
              {/* <Text style={styles.txnIdText}>{item.txnId}</Text> */}
            </View>
          </View>
          <View style={styles.contributionRight}>
            <Text style={styles.contributionAmount}>{item.amount}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: item.status === 'Completed' ? '#E6F4EA' : '#FFF3CD' }
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: item.status === 'Completed' ? '#137333' : '#B06000' }
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  contributionsList: {
    // paddingHorizontal: wp('2%'),
    marginTop: hp('1.5%'),
  },
  contributionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3.5%'),
    padding: wp('3.5%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('1.2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1.5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  contributionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: wp('2%'),
  },
  contributionIconContainer: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  contributionDetails: {
    flex: 1,
  },
  contributionTitle: {
    fontSize: RFValue(11),
    fontWeight: '700',
    color: '#111827',
    marginBottom: hp('0.2%'),
  },
  contributionSub: {
    fontSize: RFValue(8.2),
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: hp('0.2%'),
  },
  txnIdText: {
    fontSize: RFValue(7.5),
    color: '#9CA3AF',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '500',
  },
  contributionRight: {
    alignItems: 'flex-end',
  },
  contributionAmount: {
    fontSize: RFValue(12),
    fontWeight: '800',
    color: '#FF6F34',
    marginBottom: hp('0.5%'),
  },
  statusBadge: {
    paddingVertical: hp('0.3%'),
    paddingHorizontal: wp('2%'),
    borderRadius: wp('1%'),
  },
  statusText: {
    fontSize: RFValue(7.5),
    fontWeight: '700',
  },
});
