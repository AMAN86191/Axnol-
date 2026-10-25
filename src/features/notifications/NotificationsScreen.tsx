import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  Bell,
  BellOff,
  ChevronRight,
  FileText,
  LucideIcon,
  ReceiptText,
  Tag,
  User,
} from 'lucide-react-native';
import {
  documentsApi,
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useMarkReadMutation,
} from '../../api/services/documentsApi';
import {AppNotification} from '../../api/types';
import EmptyState from '../../components/ui/EmptyState';
import CommonHeader from '../../components/ui/CommonHeader';
import {toast} from '../../components/ui/ToastProvider';
import {useAppDispatch} from '../../store';
import {colors, fontSize, radius, scale, spacing, typography} from '../../theme';
import {useRefresh} from '../../hooks/useRefresh';

const ICONS: Record<AppNotification['type'], LucideIcon> = {
  account: User,
  pricing: Tag,
  order: ReceiptText,
  invoice: FileText,
  general: Bell,
};

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const {data, isLoading, refetch} = useGetNotificationsQuery();
  const {refreshing, onRefresh} = useRefresh(refetch);

  const [markAll, {isLoading: markingAll}] = useMarkAllReadMutation();
  const [markRead] = useMarkReadMutation();
  const notifications = data ?? [];
  const hasUnread = notifications.some(n => !n.read);

  const patchNotifications = (updater: (item: AppNotification) => void) => {
    dispatch(
      documentsApi.util.updateQueryData(
        'getNotifications',
        undefined,
        draft => {
          draft.forEach(updater);
        },
      ),
    );
  };

  const handleMarkAll = async () => {
    patchNotifications(item => {
      item.read = true;
    });
    try {
      await markAll().unwrap();
    } catch {
      toast.error(
        'Something Went Wrong',
        'Could not mark notifications as read.',
      );
      refetch();
    }
  };

  const handleMarkRead = (id: string) => {
    patchNotifications(item => {
      if (item.id === id) {
        item.read = true;
      }
    });
    markRead(id).catch(() => refetch());
  };

  const openNotification = (item: AppNotification) => {
    if (!item.read) {
      handleMarkRead(item.id);
    }

    switch (item.type) {
      case 'account':
        navigation.navigate('Profile', {
          screen: 'ProfileMain',
          initial: false,
        });
        break;
      case 'pricing':
        navigation.navigate('Profile', {
          screen: 'PricingRequests',
          initial: false,
        });
        break;
      case 'order':
        navigation.navigate('Orders', {
          screen: 'OrdersList',
          initial: false,
        });
        break;
      case 'invoice':
        navigation.navigate('Orders', {
          screen: 'Invoice',
          initial: false,
        });
        break;
      default:
        navigation.navigate('Profile', {
          screen: 'MyEnquiries',
          initial: false,
        });
    }
  };

  return (
    <View style={styles.container}>
      <CommonHeader
        title="Notifications"
        right={
          hasUnread ? (
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={8}
              disabled={markingAll}
              style={markingAll && styles.markReadDisabled}
              onPress={handleMarkAll}>
              <Text style={styles.markRead}>
                {markingAll ? 'Marking...' : 'Mark All Read'}
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          data={notifications}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon={BellOff}
              title="No notifications"
              subtitle="You are all caught up"
            />
          }
          renderItem={({item}) => {
            const Icon = ICONS[item.type] ?? Bell;
            return (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => openNotification(item)}
                style={[styles.card, !item.read && styles.unread]}>
                <View
                  style={[
                    styles.iconCircle,
                    !item.read && styles.iconCircleUnread,
                  ]}>
                  <Icon size={scale(18)} color={colors.primary} />
                </View>
                <View style={styles.body}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {!item.read ? <View style={styles.unreadDot} /> : null}
                  </View>
                  <Text style={styles.text} numberOfLines={2}>
                    {item.body}
                  </Text>
                  <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                </View>
                <View style={styles.chevronWrap}>
                  <ChevronRight
                    size={scale(15)}
                    color="#CBD5E1"
                    strokeWidth={2.4}
                  />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  loader: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  markRead: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  markReadDisabled: {opacity: 0.5},
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
  },
  unread: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    backgroundColor: colors.primaryLight,
  },
  iconCircle: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleUnread: {backgroundColor: colors.surface},
  body: {flex: 1},
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  title: {
    ...typography.semibold,
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  unreadDot: {
    width: scale(7),
    height: scale(7),
    borderRadius: scale(4),
    backgroundColor: colors.accent,
  },
  text: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: fontSize.xs * 1.5,
  },
  date: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  chevronWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NotificationsScreen;
