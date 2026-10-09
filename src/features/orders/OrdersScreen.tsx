import React, {useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ReceiptText} from 'lucide-react-native';
import {useGetOrdersQuery} from '../../api/services/ordersApi';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ScreenHeader from '../../components/ui/ScreenHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import {colors, fontSize, radius, spacing, typography} from '../../theme';

const FILTERS = [
  'All',
  'Placed',
  'Confirmed',
  'Dispatched',
  'Delivered',
  'Cancelled',
];

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {data, isLoading} = useGetOrdersQuery();
  const [filter, setFilter] = useState('All');

  const orders = (data ?? []).filter(
    o => filter === 'All' || o.status === filter.toLowerCase(),
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="My Orders" />
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.chips}>
              {FILTERS.map(f => {
                const active = f === filter;
                return (
                  <TouchableOpacity
                    key={f}
                    activeOpacity={0.8}
                    onPress={() => setFilter(f)}
                    style={[styles.chip, active && styles.chipActive]}>
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon={ReceiptText}
              title={filter === 'All' ? 'No orders yet' : `No ${filter} orders`}
              subtitle={
                filter === 'All'
                  ? 'Orders appear here once an admin approves your request'
                  : undefined
              }
            />
          }
          renderItem={({item}) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('OrderDetails', {orderId: item.id})
              }>
              <Card>
                <View style={styles.row}>
                  <Text style={styles.orderNo}>{item.orderNo}</Text>
                  <StatusBadge status={item.status} />
                </View>
                <View style={[styles.row, styles.metaRow]}>
                  <Text style={styles.meta}>{formatDate(item.createdAt)}</Text>
                  <Text style={styles.meta}>{item.items.length} item(s)</Text>
                </View>
                <View style={[styles.row, styles.metaRow]}>
                  <Text style={styles.total}>
                    ₹{item.total.toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.view}>View Details ›</Text>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  loader: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  chipTextActive: {
    ...typography.semibold,
    color: colors.textInverse,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaRow: {marginTop: spacing.sm},
  orderNo: {
    ...typography.semibold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  meta: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  total: {
    ...typography.bold,
    fontSize: fontSize.lg,
    color: colors.primary,
  },
  view: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
});

export default OrdersScreen;
