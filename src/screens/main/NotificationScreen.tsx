import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { BellRing, Bell, ChevronRight } from 'lucide-react-native';
import { CommonHeader } from '../../components/CommonHeader';
import { Colors } from '../../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import useHomeStore from '../../zustand/useHomeStore';
import {
  NotificationDetailsModal,
  NotificationDetailData,
} from '../../components/NotificationDetailsModal';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  payload?: {
    event_id?: string | number;
    screen?: string;
    event_date?: string;
    event_time?: string;
    [key: string]: any;
  };
}

const formatTime = (value: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) {
    if (diffDay === 1) return 'Yesterday';
    return `${diffDay}d ago`;
  }
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const NotificationScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { getNotificationsStore } = useHomeStore();
  const [filter, setFilter] = useState<'All' | 'Unread' | 'Read'>('All');
  const [notificationsData, setNotificationsData] = useState<NotificationItem[]>([]);
  const [selected, setSelected] = useState<NotificationDetailData | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getNotificationsStore();
        console.log('Notifications API response:', response);

        const items = response?.notifications || response?.data || [];
        if (Array.isArray(items)) {
          const mapped: NotificationItem[] = items.map((item: any, index: number) => ({
            id: String(item?.id ?? index),
            title: item?.title || item?.heading || '',
            description: item?.body || item?.description || item?.message || '',
            time: item?.created_at || item?.time || item?.createdAt || '',
            read: !!item?.is_read || !!item?.read,
            payload: item?.payload,
          }));
          setNotificationsData(mapped);
        }
      } catch (error) {
        console.log('Error fetching notifications:', error);
      }
    };
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotificationsData((prev) => prev.map((n) => ({ ...n, read: true })));
    setFilter('All');
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotificationsData((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const openNotification = useCallback(
    (item: NotificationItem) => {
      if (!item.read) {
        markAsRead(item.id);
        setNotificationsData((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
        );
      }
      setSelected(item);
    },
    [markAsRead],
  );

  const closeModal = useCallback(() => setSelected(null), []);

  const filteredNotifications = notificationsData.filter((notif) => {
    if (filter === 'Unread') return !notif.read;
    if (filter === 'Read') return notif.read;
    return true; // 'All'
  });

  const renderItem = ({ item }: { item: NotificationItem }) => {
    return (
      <TouchableOpacity
        style={[styles.card, !item.read && styles.cardUnread]}
        activeOpacity={0.6}
        onPress={() => openNotification(item)}
      >
        {!item.read && <View style={styles.cardAccent} />}

        <View style={[styles.iconDot, !item.read && styles.iconDotUnread]}>
          <Bell size={RFValue(14)} color={!item.read ? Colors.primary : '#B6BFC9'} strokeWidth={2} />
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.cardTitle, !item.read && styles.cardTitleUnread]} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.cardDescription} numberOfLines={1}>
            {item.description}
          </Text>
          <Text style={styles.cardTime}>{formatTime(item.time)}</Text>
        </View>

        <View style={styles.chevronWrap}>
          <ChevronRight size={RFValue(14)} color="#C4CBD3" strokeWidth={2.2} />
        </View>
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
          {(['All', 'Unread', 'Read'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterTab, filter === type && styles.activeFilterTab]}
              onPress={() => setFilter(type)}
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
            <BellRing size={RFValue(38)} color="#C4CBD3" />
            <Text style={styles.emptyText}>
              {t('notifications.noNotifications', { filter: filter.toLowerCase() })}
            </Text>
          </View>
        }
      />

      <NotificationDetailsModal
        visible={selected !== null}
        data={selected}
        onClose={closeModal}
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
    paddingVertical: hp('1.2%'),
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filterTabsWrapper: {
    flexDirection: 'row',
  },
  readAllButton: {
    paddingVertical: hp('0.6%'),
    paddingHorizontal: wp('2.5%'),
  },
  readAllText: {
    fontSize: RFValue(10),
    color: Colors.primary,
    fontWeight: '700',
  },
  filterTab: {
    paddingVertical: hp('0.7%'),
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
    paddingHorizontal: wp('3%'),
    paddingTop: hp('1.5%'),
    paddingBottom: hp('4%'),
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: wp('3%'),
    padding: wp('3%'),
    paddingRight: wp('2.5%'),
    marginBottom: hp('1.4%'),
    borderWidth: 1,
    borderColor: '#EDEDED',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1.5,
  },
  cardUnread: {
    backgroundColor: '#FFFDFB',
    borderColor: '#F0D9CE',
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: wp('1%'),
    backgroundColor: Colors.primary,
    borderTopLeftRadius: wp('3%'),
    borderBottomLeftRadius: wp('3%'),
  },
  iconDot: {
    width: wp('9%'),
    height: wp('9%'),
    borderRadius: wp('2.5%'),
    backgroundColor: '#F1F3F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  iconDotUnread: {
    backgroundColor: '#FFF1E9',
  },
  cardBody: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: RFValue(12),
    fontWeight: '600',
    color: '#6B7280',
    flex: 1,
    marginRight: wp('1%'),
  },
  cardTitleUnread: {
    color: '#111827',
    fontWeight: '800',
  },
  cardDescription: {
    fontSize: RFValue(10),
    color: '#6B7280',
    lineHeight: hp('1.9%'),
    marginTop: hp('0.3%'),
  },
  cardTime: {
    fontSize: RFValue(9),
    color: '#9CA3AF',
    marginTop: hp('0.7%'),
  },
  chevronWrap: {
    marginLeft: wp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    width: wp('2%'),
    height: wp('2%'),
    borderRadius: wp('1%'),
    backgroundColor: Colors.primary,
    marginTop: hp('0.3%'),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('10%'),
  },
  emptyText: {
    fontSize: RFValue(12),
    color: '#9CA3AF',
    marginTop: hp('1.5%'),
  },
});

export default NotificationScreen;
