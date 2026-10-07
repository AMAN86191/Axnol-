import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';
import { Users, MapPin } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { CommonHeader } from '../../components/CommonHeader';
import { Colors } from '../../theme/colors';
import useHomeStore from '../../zustand/useHomeStore';
import { PrimaryHeader } from '../../components/PrimaryHeader';

interface CommunityMember {
  id: string;
  name: string;
  city: string;
  state: string;
  profilePic: string;
  color: string;
}

const COMMUNITY_COLORS = ['#FF6F34', '#E07B00', '#8B5A2B', '#C2410C', '#B45309', '#9A3412', '#D97706', '#EA580C', '#A85D00', '#C15F3C'];

const getFullImageUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `https://gst.tambimotors.com/${path}`;
};

const CommunityMembersScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { communityMembersStore } = useHomeStore();
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMembers = async () => {
    try {
      const response = await communityMembersStore();
      console.log('Community members API response:', response);

      const apiMembers = response?.data || response?.members;
      if (Array.isArray(apiMembers)) {
        const mapped: CommunityMember[] = apiMembers.map((item: any, index: number) => ({
          id: String(item?.id ?? index),
          name: item?.name || 'Member',
          city: item?.user_profile?.city || '',
          state: item?.user_profile?.state || '',
          profilePic: getFullImageUrl(item?.user_profile?.profile_pic),
          color: COMMUNITY_COLORS[index % COMMUNITY_COLORS.length],
        }));
        setMembers(mapped);
      }
    } catch (error) {
      console.log('Error fetching community members:', error);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMembers();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: CommunityMember }) => {
    const initials = item.name
      .split(' ')
      .map(part => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const addressParts = [item.city, item.state].filter(Boolean);
    const address = addressParts.length > 0 ? addressParts.join(', ') : t('communityMembers.notAvailable');

    return (
      <View style={styles.memberCard}>
        <View style={[styles.avatarCircle, { backgroundColor: `${item.color}1A`, borderColor: `${item.color}55` }]}>
          {item.profilePic ? (
            <Image source={{ uri: item.profilePic }} style={styles.avatarImage} resizeMode="cover" />
          ) : (
            <Text style={[styles.avatarInitials, { color: item.color }]}>{initials}</Text>
          )}
        </View>

        <View style={styles.memberDetails}>
          <Text style={styles.memberName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.addressRow}>
            <MapPin size={RFValue(11)} color={Colors.gray} strokeWidth={2} />
            <Text style={styles.memberAddress} numberOfLines={1}>{address}</Text>
          </View>
        </View>

        <View style={styles.memberBadge}>
          <Users size={RFValue(11)} color="#FFF" strokeWidth={2.2} />
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{t('communityMembers.noMembers')}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
       <PrimaryHeader />

      {/* Info banner */}
      {/* <View style={styles.infoBanner}>
        <Search size={RFValue(16)} color={Colors.primary} strokeWidth={2} />
        <Text style={styles.infoBannerText}>{t('communityMembers.subtitle')}</Text>
      </View> */}
      <View style={{ height: hp('1%') }} />
      <FlatList
        data={members}
        keyExtractor={(item, index) => String(item?.id ?? index)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={renderEmpty}
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
    marginVertical: hp('1%'),
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
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
  emptyContainer: {
    alignItems: 'center',
    marginTop: hp('10%'),
  },
  emptyText: {
    fontSize: RFValue(12),
    color: Colors.gray,
  },
});

export default CommunityMembersScreen;