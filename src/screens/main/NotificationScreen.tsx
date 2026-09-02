import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Bell } from 'lucide-react-native';
import { CommonHeader } from '../../components/CommonHeader';
import { Colors } from '../../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const NotificationScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [filter, setFilter] = useState<'All' | 'Unread' | 'Read'>('All');
  const [notificationsData, setNotificationsData] = useState([
    {
      id: '1',
      title: t('notifications.newEvent'),
      description: t('notifications.newEventMessage'),
      time: t('notifications.twoHoursAgo'),
      type: 'info',
      read: false,
    },
    {
      id: '2',
      title: t('notifications.donationReceived'),
      description: t('notifications.donationReceivedMessage'),
      time: t('notifications.yesterday'),
      type: 'success',
      read: true,
    },
    {
      id: '3',
      title: t('notifications.membershipExpiring'),
      description: t('notifications.membershipExpiringMessage'),
      time: t('notifications.threeDaysAgo'),
      type: 'warning',
      read: true,
    },
  ]);

  const markAllAsRead = useCallback(() => {
    setNotificationsData((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const filteredNotifications = notificationsData.filter((notif) => {
    if (filter === 'Unread') return !notif.read;
    if (filter === 'Read') return notif.read;
    return true; // 'All'
  });

  const renderItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.read && styles.unreadCard]}
        activeOpacity={0.7}
      >
        <View style={styles.textContainer}>
          <Text style={[styles.title, !item.read && styles.unreadTitle]}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  return (
    <SafeAreaView style={styles.safeArea}>
      <CommonHeader title={t('notifications.title')} onBackPress={handleBack} />

      <View style={styles.filterContainer}>
        <View style={styles.filterTabsWrapper}>
          {['All', 'Unread', 'Read'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterTab, filter === type && styles.activeFilterTab]}
              onPress={() => setFilter(type as any)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, filter === type && styles.activeFilterText]}>
                {t(type === 'All' ? 'common.all' : type === 'Unread' ? 'notifications.unread' : 'notifications.read')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.readAllButton} onPress={markAllAsRead} activeOpacity={0.7}>
          <Text style={styles.readAllText}>{t('notifications.readAll')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bell size={RFValue(40)} color={Colors.gray} style={{ opacity: 0.5 }} />
            <Text style={styles.emptyText}>{t('notifications.noNotifications', { filter: filter.toLowerCase() })}</Text>
          </View>
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1.5%'),
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  filterTabsWrapper: {
    flexDirection: 'row',
  },
  readAllButton: {
    paddingVertical: hp('0.5%'),
    paddingHorizontal: wp('2%'),
  },
  readAllText: {
    fontSize: RFValue(10),
    color: Colors.primary,
    fontWeight: '700',
  },
  filterTab: {
    paddingVertical: hp('0.8%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('4%'),
    marginRight: wp('2%'),
    backgroundColor: '#F5F5F5',
  },
  activeFilterTab: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: RFValue(10),
    color: Colors.gray,
    fontWeight: '600',
  },
  activeFilterText: {
    color: Colors.white,
  },
  listContainer: {
    paddingHorizontal: wp('2%'),
    paddingTop: hp('1.5%'),
    flexGrow: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: wp('2%'),
    borderRadius: wp('2%'),
    marginBottom: hp('1.5%'),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  unreadCard: {
    backgroundColor: '#FFF',
  },

  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: RFValue(10),
    fontWeight: '500',
    color: Colors.dark,
    marginBottom: hp('0.3%'),
  },
  unreadTitle: {
    fontWeight: '700',
    color: Colors.primary,
  },
  description: {
    fontSize: RFValue(10),
    color: Colors.gray,
    marginBottom: hp('0.5%'),
    lineHeight: hp('1.8%'),
  },
  timeText: {
    fontSize: RFValue(8.5),
    color: '#9CA3AF',
  },
  unreadDot: {
    width: wp('2.5%'),
    height: wp('2.5%'),
    borderRadius: wp('1.25%'),
    backgroundColor: Colors.primary,
    marginLeft: wp('2%'),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('10%'),
  },
  emptyText: {
    fontSize: RFValue(12),
    color: Colors.gray,
    marginTop: hp('2%'),
  },
});

export default NotificationScreen;
