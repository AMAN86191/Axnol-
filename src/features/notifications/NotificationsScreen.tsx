import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Bell,
  BellOff,
  FileText,
  LucideIcon,
  ReceiptText,
  Tag,
  User,
} from 'lucide-react-native';
import {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
} from '../../api/services/documentsApi';
import {AppNotification} from '../../api/types';
import EmptyState from '../../components/ui/EmptyState';
import ScreenHeader from '../../components/ui/ScreenHeader';
import {colors, fontSize, radius, scale, spacing, typography} from '../../theme';

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
  const {data, isLoading} = useGetNotificationsQuery();
  const [markAll] = useMarkAllReadMutation();
  const notifications = data ?? [];
  const hasUnread = notifications.some(n => !n.read);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Notifications"
        right={
          hasUnread ? (
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={8}
              onPress={() => markAll()}>
              <Text style={styles.markRead}>Mark All Read</Text>
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
              <View style={[styles.card, !item.read && styles.unread]}>
                <View
                  style={[
                    styles.iconCircle,
                    !item.read && styles.iconCircleUnread,
                  ]}>
                  <Icon size={scale(18)} color={colors.primary} />
                </View>
                <View style={styles.body}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.text} numberOfLines={2}>
                    {item.body}
                  </Text>
                  <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                </View>
              </View>
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
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
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
  title: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.text,
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
});

export default NotificationsScreen;
