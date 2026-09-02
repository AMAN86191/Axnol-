import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';
import { Users, MapPin, Search } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { CommonHeader } from '../../components/CommonHeader';
import { Colors } from '../../theme/colors';

interface CommunityMember {
  id: string;
  name: string;
  address: string;
  color: string;
}

const DUMMY_MEMBERS: CommunityMember[] = [
  { id: '1', name: 'Ramesh Kumar', address: 'Vrindavan, Uttar Pradesh', color: '#FF6F34' },
  { id: '2', name: 'Sunita Devi', address: 'Mathura, Uttar Pradesh', color: '#E07B00' },
  { id: '3', name: 'Anil Sharma', address: 'Jaipur, Rajasthan', color: '#8B5A2B' },
  { id: '4', name: 'Mamta Patel', address: 'Gandhinagar, Gujarat', color: '#C2410C' },
  { id: '5', name: 'Vikram Singh', address: 'Indore, Madhya Pradesh', color: '#B45309' },
  { id: '6', name: 'Kavita Joshi', address: 'Pune, Maharashtra', color: '#9A3412' },
  { id: '7', name: 'Rohit Aggarwal', address: 'New Delhi, Delhi', color: '#D97706' },
  { id: '8', name: 'Priya Nair', address: 'Chennai, Tamil Nadu', color: '#EA580C' },
  { id: '9', name: 'Deepak Yadav', address: 'Lucknow, Uttar Pradesh', color: '#A85D00' },
  { id: '10', name: 'Neha Verma', address: 'Ahmedabad, Gujarat', color: '#C15F3C' },
];

const CommunityMembersScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const renderItem = ({ item, index }: { item: CommunityMember; index: number }) => {
    const initials = item.name
      .split(' ')
      .map(part => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();

    return (
      <View style={styles.memberCard}>
        <View style={[styles.avatarCircle, { backgroundColor: `${item.color}1A`, borderColor: `${item.color}55` }]}>
          <Text style={[styles.avatarInitials, { color: item.color }]}>{initials}</Text>
        </View>

        <View style={styles.memberDetails}>
          <Text style={styles.memberName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.addressRow}>
            <MapPin size={RFValue(11)} color={Colors.gray} strokeWidth={2} />
            <Text style={styles.memberAddress} numberOfLines={1}>{item.address}</Text>
          </View>
        </View>

        <View style={styles.memberBadge}>
          <Users size={RFValue(11)} color="#FFF" strokeWidth={2.2} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <CommonHeader title={t('communityMembers.title')} onBackPress={() => navigation.goBack()} />

      {/* Info banner */}
      <View style={styles.infoBanner}>
        <Search size={RFValue(16)} color={Colors.primary} strokeWidth={2} />
        <Text style={styles.infoBannerText}>{t('communityMembers.subtitle')}</Text>
      </View>

      <FlatList
        data={DUMMY_MEMBERS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.listCount}>
            {t('communityMembers.memberCount', { count: DUMMY_MEMBERS.length })}
          </Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp('4%'),
    marginTop: hp('1%'),
    backgroundColor: '#FFF4EC',
    borderRadius: wp('3%'),
    borderWidth: 1,
    borderColor: '#FFDCC8',
    padding: wp('3.5%'),
  },
  infoBannerText: {
    flex: 1,
    fontSize: RFValue(10.5),
    color: '#8A4B20',
    marginLeft: wp('2.5%'),
    lineHeight: hp('2%'),
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('5%'),
  },
  listCount: {
    fontSize: RFValue(11),
    color: Colors.gray,
    fontWeight: '700',
    marginTop: hp('2%'),
    marginBottom: hp('1%'),
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: wp('3.5%'),
    borderWidth: 1,
    borderColor: '#F3E5D8',
    padding: wp('3.5%'),
    marginBottom: hp('1.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1.5,
  },
  avatarCircle: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('7%'),
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: RFValue(14),
    fontWeight: '800',
  },
  memberDetails: {
    flex: 1,
    marginLeft: wp('3.5%'),
  },
  memberName: {
    fontSize: RFValue(11.5),
    fontWeight: '800',
    color: Colors.dark,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.4%'),
  },
  memberAddress: {
    fontSize: RFValue(10),
    color: Colors.gray,
    marginLeft: wp('1%'),
    fontWeight: '500',
  },
  memberBadge: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp('2%'),
  },
});

export default CommunityMembersScreen;