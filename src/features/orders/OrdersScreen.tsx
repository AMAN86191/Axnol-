import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  DrawerActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { CalendarDays, ChevronRight, Menu, Package } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'react-native';
import CommonHeader from '../../components/ui/CommonHeader';
import { colors, fontSize, radius, scale, spacing } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchOrdersSlice } from '../../redux/OrderSlice';
import { invalidateRequests } from '../../api/requestCache';
import { formatPrice } from '../../utils/formatPrice';
import OrdersSkeleton from './components/OrdersSkeleton';
import { useRefresh } from '../../hooks/useRefresh';
import {
  formatOrderDate,
  formatStatusLabel,
  getOrderErrorMessage,
  getOrderImage,
  getOrderProductLabel,
  getOrderQty,
  getStatusBadgeStyle,
  statusKey,
} from './orderUtils';

const ALL_FILTER = 'all';

const STATUS_FILTERS = [
  { key: ALL_FILTER, label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'placed', label: 'Placed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  // { key: 'cancelled', label: 'Cancelled' },
];

export const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const orders = useAppSelector(state => state.order.orders);
  const loading = useAppSelector(state => state.order.ordersLoading);
  const error = useAppSelector(state => state.order.ordersError);

  const [selectedFilter, setSelectedFilter] = useState(ALL_FILTER);

  const fetchOrders = useCallback(
    (force = false) => {
      if (force) {
        invalidateRequests('/orders');
      }
      return dispatch(fetchOrdersSlice()).unwrap().catch(() => undefined);
    },
    [dispatch],
  );

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders]),
  );

  const { refreshing, onRefresh } = useRefresh(() => fetchOrders(true));

  const counts = useMemo(() => {
    const map: Record<string, number> = { [ALL_FILTER]: orders.length };
    orders.forEach(order => {
      const key = statusKey(order.status);
      if (!key) return;
      map[key] = (map[key] ?? 0) + 1;
    });
    return map;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const list =
      selectedFilter === ALL_FILTER
        ? orders
        : orders.filter(order => statusKey(order.status) === selectedFilter);

    return [...list].sort((a, b) => {
      const ta = new Date(a.createdAt ?? 0).getTime();
      const tb = new Date(b.createdAt ?? 0).getTime();
      return tb - ta;
    });
  }, [orders, selectedFilter]);

  const selectedLabel =
    STATUS_FILTERS.find(filter => filter.key === selectedFilter)?.label ??
    'All';
  const errorMessage = error ? getOrderErrorMessage(error) : '';
  console.log('filteredOrders :', filteredOrders);
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <CommonHeader
        title="My Orders"
        showBack={false}
        left={
          <TouchableOpacity
            style={styles.headerBtn}
            activeOpacity={0.7}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Menu size={scale(22)} color="#1E293B" strokeWidth={2.2} />
          </TouchableOpacity>
        }
      />

      {loading && orders.length === 0 ? (
        <OrdersSkeleton />
      ) : (
        <>
          <View style={styles.filterBar}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={STATUS_FILTERS}
              keyExtractor={item => item.key}
              contentContainerStyle={styles.filterList}
              renderItem={({ item }) => {
                const active = item.key === selectedFilter;
                return (
                  <TouchableOpacity
                    style={[styles.filterPill, active && styles.filterPillActive]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedFilter(item.key)}>
                    <Text
                      style={[
                        styles.filterPillText,
                        active && styles.filterPillTextActive,
                      ]}>
                      {item.label}
                    </Text>
                    {Number(counts[item.key] ?? 0) > 0 && (
                      <View
                        style={[
                          styles.filterCount,
                          active && styles.filterCountActive,
                        ]}>
                        <Text
                          style={[
                            styles.filterCountText,
                            active && styles.filterCountTextActive,
                          ]}>
                          {counts[item.key]}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          <FlatList
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            data={filteredOrders}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={[
              styles.orderList,
              { paddingBottom: insets.bottom + scale(90) },
            ]}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              filteredOrders.length > 0 ? (
                <View style={styles.listMeta}>
                  <Text style={styles.listMetaTitle}>Recent Orders</Text>
                  <Text style={styles.listMetaCount}>
                    {filteredOrders.length}{' '}
                    {filteredOrders.length === 1 ? 'order' : 'orders'}
                  </Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIcon}>
                  <Package
                    size={scale(30)}
                    color={colors.primary}
                    strokeWidth={1.8}
                  />
                </View>
                <Text style={styles.emptyTitle}>
                  {error ? 'Could not load orders' : 'No orders found'}
                </Text>
                <Text style={styles.emptyText}>
                  {error
                    ? errorMessage
                    : selectedFilter === ALL_FILTER
                      ? "You don't have any orders yet."
                      : `You don't have any ${selectedLabel.toLowerCase()} orders yet.`}
                </Text>
                {error ? (
                  <TouchableOpacity
                    style={styles.retryBtn}
                    activeOpacity={0.85}
                    onPress={() => {
                      fetchOrders();
                    }}>
                    <Text style={styles.retryText}>Try Again</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            }
            renderItem={({ item }) => {
              const badge = getStatusBadgeStyle(item.status);
              const quantity = getOrderQty(item);

              return (
                <TouchableOpacity
                  style={styles.orderCard}
                  activeOpacity={0.85}
                  onPress={() =>
                    navigation.navigate('OrderDetails', {
                      orderId: String(item.id),
                    })
                  }>
                  <View style={styles.cardTop}>
                    <View style={styles.orderImgWrap}>
                      <Image
                        source={{ uri: getOrderImage(item) }}
                        style={styles.orderImg}
                        resizeMode="contain"
                      />
                    </View>

                    <View style={styles.orderContent}>
                      <Text style={styles.orderNo}>{item.orderNumber}</Text>
                      <Text style={styles.productName} numberOfLines={1}>
                        {getOrderProductLabel(item)}
                      </Text>
                      <Text style={styles.orderMeta}>
                        Qty {quantity} {quantity === 1 ? 'unit' : 'units'}
                      </Text>
                    </View>

                    <View style={styles.badgeColumn}>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: badge.bg },
                        ]}>
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: badge.dot },
                          ]}
                        />
                        <Text
                          style={[styles.statusText, { color: badge.text }]}>
                          {formatStatusLabel(item.status)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.cardBottom}>
                    <View style={styles.dateGroup}>
                      <CalendarDays
                        size={scale(14)}
                        color="#94A3B8"
                        strokeWidth={2.2}
                      />
                      <Text style={styles.orderDate}>
                        {formatOrderDate(item.createdAt)}
                      </Text>
                    </View>

                    <View style={styles.amountGroup}>
                      <Text style={styles.amountLabel}>Total</Text>
                      <Text style={styles.amountValue}>
                        {formatPrice(item.totalAmount)}
                      </Text>
                      <ChevronRight
                        size={scale(16)}
                        color="#CBD5E1"
                        strokeWidth={2.4}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBtn: {
    padding: scale(4),
  },
  filterBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  filterList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    paddingHorizontal: spacing.lg,
    paddingVertical: scale(7),
    borderRadius: radius.pill,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: colors.primary,
  },
  filterPillText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  filterCount: {
    minWidth: scale(18),
    height: scale(18),
    paddingHorizontal: scale(5),
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCountActive: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  filterCountText: {
    fontSize: scale(10),
    fontWeight: '800',
    color: '#94A3B8',
  },
  filterCountTextActive: {
    color: '#FFFFFF',
  },
  orderList: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scale(2),
  },
  listMetaTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  listMetaCount: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#94A3B8',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#E8EEF4',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderImgWrap: {
    width: scale(52),
    height: scale(52),
    borderRadius: radius.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(5),
    marginRight: spacing.md,
  },
  orderImg: {
    width: '100%',
    height: '100%',
  },
  orderContent: {
    flex: 1,
  },
  orderNo: {
    fontSize: scale(10),
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.3,
  },
  productName: {
    fontSize: scale(12.5),
    fontWeight: '700',
    color: '#0F172A',
    marginTop: scale(2),
  },
  orderMeta: {
    fontSize: scale(11.5),
    fontWeight: '500',
    color: '#64748B',
    marginTop: scale(3),
  },
  badgeColumn: {
    alignItems: 'flex-end',
    gap: scale(4),
    marginLeft: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    paddingHorizontal: spacing.sm,
    paddingVertical: scale(5),
    borderRadius: radius.pill,
  },
  statusDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
  },
  statusText: {
    fontSize: scale(10.5),
    fontWeight: '800',
  },
  paymentText: {
    fontSize: scale(9.5),
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#EEF2F6',
    marginVertical: spacing.md,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  orderDate: {
    fontSize: scale(11.5),
    fontWeight: '600',
    color: '#64748B',
  },
  amountGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  amountLabel: {
    fontSize: scale(11),
    fontWeight: '600',
    color: '#94A3B8',
  },
  amountValue: {
    fontSize: scale(14),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: scale(80),
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: scale(6),
  },
  retryBtn: {
    height: scale(38),
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default OrdersScreen;
