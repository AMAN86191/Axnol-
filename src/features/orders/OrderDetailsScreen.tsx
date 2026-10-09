import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {ReceiptText} from 'lucide-react-native';
import {useGetOrderByIdQuery} from '../../api/services/ordersApi';
import {OrdersStackParamList} from '../../navigation/types';
import AppImage from '../../components/ui/AppImage';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ScreenHeader from '../../components/ui/ScreenHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import {colors, fontSize, radius, scale, spacing, typography} from '../../theme';

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const OrderDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProp<OrdersStackParamList, 'OrderDetails'>>();
  const navigation = useNavigation<any>();
  const {data: order, isLoading, isError} = useGetOrderByIdQuery(
    route.params.orderId,
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Order Details" onBack={() => navigation.goBack()} />
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </View>
    );
  }

  if (isError || !order) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Order Details" onBack={() => navigation.goBack()} />
        <EmptyState
          icon={ReceiptText}
          title="Order not found"
          subtitle="This order could not be loaded right now."
        />
      </View>
    );
  }

  const latestIndex = order.timeline.length - 1;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Order Details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.rowBetween}>
            <Text style={styles.orderNo}>{order.orderNo}</Text>
            <StatusBadge status={order.status} />
          </View>
          <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
          <Text style={styles.address}>{order.shippingAddress}</Text>
          <View style={styles.amountBlock}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Subtotal</Text>
              <Text style={styles.amountValue}>
                ₹{order.subtotal.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Tax (GST)</Text>
              <Text style={styles.amountValue}>
                ₹{order.tax.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ₹{order.total.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </Card>

        {order.timeline.length > 0 ? (
          <Card>
            <SectionHeader title="Order Status" />
            {order.timeline.map((entry, index) => (
              <View key={`${entry.status}-${entry.date}`} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.dot,
                      index === latestIndex ? styles.dotActive : styles.dotPast,
                    ]}
                  />
                  {index < latestIndex ? <View style={styles.line} /> : null}
                </View>
                <View style={styles.timelineBody}>
                  <Text style={styles.timelineLabel}>{entry.label}</Text>
                  <Text style={styles.timelineDate}>
                    {formatDate(entry.date)}
                  </Text>
                  {entry.note ? (
                    <Text style={styles.timelineNote}>{entry.note}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </Card>
        ) : null}

        <Card>
          <SectionHeader title={`Items (${order.items.length})`} />
          {order.items.map((item, index) => (
            <View
              key={`${item.productId}-${index}`}
              style={styles.itemRow}>
              <AppImage uri={item.image} style={styles.itemImg} />
              <View style={styles.itemBody}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemMeta}>
                  {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}
                </Text>
              </View>
              <Text style={styles.itemAmount}>
                ₹
                {(item.quantity * item.unitPrice).toLocaleString('en-IN')}
              </Text>
            </View>
          ))}
        </Card>

        <Button
          title="View Invoice"
          onPress={() => navigation.navigate('Invoice', {orderId: order.id})}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  loader: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderNo: {
    ...typography.bold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  date: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  address: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: fontSize.sm * 1.5,
  },
  amountBlock: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountLabel: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  amountValue: {
    ...typography.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.xs,
  },
  totalLabel: {
    ...typography.semibold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  totalValue: {
    ...typography.bold,
    fontSize: fontSize.lg,
    color: colors.primary,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timelineLeft: {
    width: scale(14),
    alignItems: 'center',
  },
  dot: {
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    marginTop: scale(3),
  },
  dotActive: {backgroundColor: colors.primary},
  dotPast: {backgroundColor: colors.primaryMuted},
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.primaryMuted,
    marginVertical: spacing.xs,
  },
  timelineBody: {flex: 1, paddingBottom: spacing.lg},
  timelineLabel: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  timelineDate: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  timelineNote: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: fontSize.xs * 1.5,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  itemImg: {
    width: scale(52),
    height: scale(52),
    borderRadius: radius.sm,
  },
  itemBody: {flex: 1},
  itemName: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: fontSize.sm * 1.4,
  },
  itemMeta: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemAmount: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
});

export default OrderDetailsScreen;
