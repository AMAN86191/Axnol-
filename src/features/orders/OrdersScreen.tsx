import React, {useMemo, useState} from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import {DrawerActions, useNavigation} from '@react-navigation/native';
import {
  ArrowUpDown,
  CalendarDays,
  ChevronRight,
  Menu,
  Package,
} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AppImage from '../../components/ui/AppImage';
import CommonHeader from '../../components/ui/CommonHeader';
import {colors, fontSize, radius, scale, spacing} from '../../theme';
import {useSimulatedLoading} from '../../hooks/useSimulatedLoading';
import OrdersSkeleton from './components/OrdersSkeleton';
import {useRefresh} from '../../hooks/useRefresh';

const FILTER_TABS = ['All', 'Pending', 'Processing', 'Delivered', 'Canceled'];

const MOCK_ORDERS = [
  {
    id: 'ord1',
    orderNo: 'AX0001',
    productName: 'Engine Oil AX-1000',
    quantity: 10,
    amount: 24000,
    date: '25 Sep 2026',
    status: 'Pending',
    image: 'product_cutting',
  },
  {
    id: 'ord2',
    orderNo: 'AX0002',
    productName: 'Hydraulic Oil AX-300',
    quantity: 5,
    amount: 18500,
    date: '22 Sep 2026',
    status: 'Processing',
    image: 'product_cutting',
  },
  {
    id: 'ord3',
    orderNo: 'AX0003',
    productName: 'Gear Oil AX-200',
    quantity: 20,
    amount: 45000,
    date: '18 Sep 2026',
    status: 'Delivered',
    image: 'product_cutting',
  },
  {
    id: 'ord4',
    orderNo: 'AX0004',
    productName: 'Compressor Oil AX-400',
    quantity: 2,
    amount: 12000,
    date: '10 Sep 2026',
    status: 'Canceled',
    image: 'product_cutting',
  },
];

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case 'Pending':
      return {bg: '#FEF3C7', text: '#D97706', dot: '#F59E0B'};
    case 'Processing':
      return {bg: '#DBEAFE', text: '#2563EB', dot: '#3B82F6'};
    case 'Delivered':
      return {bg: '#DCFCE7', text: '#16A34A', dot: '#22C55E'};
    case 'Canceled':
      return {bg: '#FEE2E2', text: '#DC2626', dot: '#EF4444'};
    default:
      return {bg: '#F1F5F9', text: '#64748B', dot: '#94A3B8'};
  }
};

const formatMoney = (value: number) =>
  `₹${value.toLocaleString('en-IN')}`;

export const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const {refreshing, onRefresh} = useRefresh();

  const [selectedFilter, setSelectedFilter] = useState('All');
  const [newestFirst, setNewestFirst] = useState(true);
  const loading = useSimulatedLoading();

  const counts = useMemo(() => {
    const map: Record<string, number> = {All: MOCK_ORDERS.length};
    MOCK_ORDERS.forEach(o => {
      map[o.status] = (map[o.status] ?? 0) + 1;
    });
    return map;
  }, []);

  const filteredOrders = useMemo(() => {
    const list = MOCK_ORDERS.filter(o => {
      if (selectedFilter === 'All') return true;
      return o.status.toLowerCase() === selectedFilter.toLowerCase();
    });
    return [...list].sort((a, b) => {
      const ta = new Date(a.date).getTime();
      const tb = new Date(b.date).getTime();
      return newestFirst ? tb - ta : ta - tb;
    });
  }, [selectedFilter, newestFirst]);

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

      {/* Horizontal Filter Tabs */}
      {loading ? (
        <OrdersSkeleton />
      ) : (
        <>
      <View style={styles.filterBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_TABS}
          keyExtractor={item => item}
          contentContainerStyle={styles.filterList}
          renderItem={({item}) => {
            const active = item === selectedFilter;
            return (
              <TouchableOpacity
                style={[styles.filterPill, active && styles.filterPillActive]}
                activeOpacity={0.8}
                onPress={() => setSelectedFilter(item)}>
                <Text
                  style={[
                    styles.filterPillText,
                    active && styles.filterPillTextActive,
                  ]}>
                  {item}
                </Text>
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
                    {counts[item] ?? 0}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Orders List */}
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
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.orderList,
          {paddingBottom: insets.bottom + scale(90)},
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
              <Package size={scale(30)} color={colors.primary} strokeWidth={1.8} />
            </View>
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptyText}>
              You don&apos;t have any {selectedFilter.toLowerCase()} orders yet.
            </Text>
          </View>
        }
        renderItem={({item}) => {
          const badge = getStatusBadgeStyle(item.status);
          return (
            <TouchableOpacity
              style={styles.orderCard}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('OrderDetails', {orderId: item.id})
              }>
              <View style={styles.cardTop}>
                <View style={styles.orderImgWrap}>
                  <AppImage
                    uri={item.image}
                    style={styles.orderImg}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.orderContent}>
                  <Text style={styles.orderNo}>{item.orderNo}</Text>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.productName}
                  </Text>
                  <Text style={styles.orderMeta}>Qty {item.quantity} units</Text>
                </View>

                <View style={[styles.statusBadge, {backgroundColor: badge.bg}]}>
                  <View
                    style={[styles.statusDot, {backgroundColor: badge.dot}]}
                  />
                  <Text style={[styles.statusText, {color: badge.text}]}>
                    {item.status}
                  </Text>
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
                  <Text style={styles.orderDate}>{item.date}</Text>
                </View>

                <View style={styles.amountGroup}>
                  <Text style={styles.amountLabel}>Total</Text>
                  <Text style={styles.amountValue}>{formatMoney(item.amount)}</Text>
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
    fontSize: scale(11),
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.3,
  },
  productName: {
    fontSize: scale(13.5),
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    paddingHorizontal: spacing.sm,
    paddingVertical: scale(5),
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    marginLeft: spacing.sm,
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
});

export default OrdersScreen;
