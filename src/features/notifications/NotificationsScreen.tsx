import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bell, BellOff, ChevronRight, FileText, ReceiptText, Tag, User } from 'lucide-react-native';
import CommonHeader from '../../components/ui/CommonHeader';
import EmptyState from '../../components/ui/EmptyState';
import { colors, fontSize, radius, scale, spacing, typography } from '../../theme';

type Notification = {
  id: string;
  type: 'account' | 'pricing' | 'order' | 'invoice';
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
};

const DUMMY_NOTIFICATIONS: Notification[] = [
  // {
  //   id: '1',
  //   type: 'order',
  //   title: 'Order Placed',
  //   body: 'Your order #ORD-12345 has been placed successfully.',
  //   createdAt: Date.now() - 3600000,
  //   read: false,
  // },
  // {
  //   id: '2',
  //   type: 'invoice',
  //   title: 'Invoice Generated',
  //   body: 'Invoice for order #ORD-12344 is ready to download.',
  //   createdAt: Date.now() - 86400000,
  //   read: true,
  // },
  // {
  //   id: '3',
  //   type: 'pricing',
  //   title: 'Price Update',
  //   body: 'New pricing available for selected products.',
  //   createdAt: Date.now() - 172800000,
  //   read: false,
  // },
  // {
  //   id: '4',
  //   type: 'account',
  //   title: 'Profile Updated',
  //   body: 'Your account details have been updated.',
  //   createdAt: Date.now() - 259200000,
  //   read: true,
  // },
];

const ICONS = {
  account: User,
  pricing: Tag,
  order: ReceiptText,
  invoice: FileText,
};

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const NotificationsScreen: React.FC = () => {
  const notifications = DUMMY_NOTIFICATIONS;

  return (
    <View style={styles.container}>
      <CommonHeader title="Notifications" />
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
        renderItem={({ item }) => {
          const Icon = ICONS[item.type as keyof typeof ICONS] ?? Bell;
          return (
            <TouchableOpacity
              activeOpacity={0.85}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  iconCircleUnread: { backgroundColor: colors.surface },
  body: { flex: 1 },
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
