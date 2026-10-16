import React, {useState} from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ArrowUpDown} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AppImage from '../../components/ui/AppImage';
import CommonHeader from '../../components/ui/CommonHeader';
import {fontSize, radius, scale, spacing} from '../../theme';

const FILTER_TABS = ['All', 'Pending', 'Processing', 'Delivered', 'Canceled'];

const MOCK_ORDERS = [
  {
    id: 'ord1',
    orderNo: '#AX0001',
    productName: 'Engine Oil AX-1000',
    quantity: 10,
    amount: 24000,
    date: '25 Sep 2026',
    status: 'Pending',
    image: 'product_drum',
  },
  {
    id: 'ord2',
    orderNo: '#AX0002',
    productName: 'Hydraulic Oil AX-300',
    quantity: 5,
    amount: 18500,
    date: '22 Sep 2026',
    status: 'Processing',
    image: 'product_drum',
  },
  {
    id: 'ord3',
    orderNo: '#AX0003',
    productName: 'Gear Oil AX-200',
    quantity: 20,
    amount: 45000,
    date: '18 Sep 2026',
    status: 'Delivered',
    image: 'product_drum',
  },
  {
    id: 'ord4',
    orderNo: '#AX0004',
    productName: 'Compressor Oil AX-400',
    quantity: 2,
    amount: 12000,
    date: '10 Sep 2026',
    status: 'Canceled',
    image: 'product_drum',
  },
];

export const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filteredOrders = MOCK_ORDERS.filter(o => {
    if (selectedFilter === 'All') return true;
    return o.status.toLowerCase() === selectedFilter.toLowerCase();
  });

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Pending':
        return {bg: '#FEF3C7', text: '#D97706'};
      case 'Processing':
        return {bg: '#DBEAFE', text: '#2563EB'};
      case 'Delivered':
        return {bg: '#DCFCE7', text: '#16A34A'};
      case 'Canceled':
        return {bg: '#FEE2E2', text: '#DC2626'};
      default:
        return {bg: '#F1F5F9', text: '#64748B'};
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <CommonHeader
        title="My Orders"
        right={
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
            <ArrowUpDown size={scale(20)} color="#0F172A" />
          </TouchableOpacity>
        }
      />

      {/* Horizontal Filter Tabs */}
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
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.orderList, {paddingBottom: insets.bottom + scale(80)}]}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => {
          const badge = getStatusBadgeStyle(item.status);
          return (
            <TouchableOpacity
              style={styles.orderCard}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('OrderDetails', {orderId: item.id})
              }>
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
                <Text style={styles.orderMeta}>
                  Qty: {item.quantity} | ₹{item.amount.toLocaleString('en-IN')}
                </Text>
                <Text style={styles.orderDate}>{item.date}</Text>
              </View>

              <View style={[styles.statusBadge, {backgroundColor: badge.bg}]}>
                <Text style={[styles.statusText, {color: badge.text}]}>
                  {item.status}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  filterBtn: {
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
    paddingHorizontal: spacing.md,
    paddingVertical: scale(6),
    borderRadius: radius.pill,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: '#0284C7',
  },
  filterPillText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  orderList: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  orderImgWrap: {
    width: scale(56),
    height: scale(56),
    borderRadius: radius.sm,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(4),
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
    fontSize: scale(13),
    fontWeight: '700',
    color: '#0F172A',
  },
  productName: {
    fontSize: scale(12),
    color: '#475569',
    marginTop: 2,
  },
  orderMeta: {
    fontSize: scale(12),
    fontWeight: '500',
    color: '#64748B',
    marginTop: 4,
  },
  orderDate: {
    fontSize: scale(11),
    color: '#94A3B8',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: scale(4),
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: scale(11),
    fontWeight: '700',
  },
});

export default OrdersScreen;
