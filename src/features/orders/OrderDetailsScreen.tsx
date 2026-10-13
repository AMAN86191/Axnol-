import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {Check, ChevronLeft, MoreVertical} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {OrdersStackParamList} from '../../navigation/types';
import AppImage from '../../components/ui/AppImage';
import {colors, fontSize, radius, scale, spacing, typography} from '../../theme';

type Route = RouteProp<OrdersStackParamList, 'OrderDetails'>;

export const OrderDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const route = useRoute<Route>();

  const order = {
    orderNo: '#AX0003',
    date: '18 Sep 2026, 10:30 AM',
    status: 'Delivered',
    image: 'product_drum',
    productName: 'Gear Oil AX-200',
    quantity: 20,
    unitPrice: 2250,
    productTotal: 45000,
    subtotal: 45000,
    gst: 8100,
    total: 53100,
    timeline: [
      {title: 'Order Placed', time: '18 Sep 2026, 10:30 AM'},
      {title: 'Approved', time: '18 Sep 2026, 12:15 PM'},
      {title: 'Processing', time: '19 Sep 2026, 09:00 AM'},
      {title: 'Dispatched', time: '20 Sep 2026, 04:20 PM'},
      {title: 'Delivered', time: '21 Sep 2026, 11:30 AM'},
    ],
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + spacing.sm}]}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <ChevronLeft size={scale(24)} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <TouchableOpacity style={styles.moreBtn} activeOpacity={0.7}>
          <MoreVertical size={scale(20)} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, {paddingBottom: insets.bottom + scale(60)}]}>
        
        {/* Top Order Card */}
        <View style={styles.topCard}>
          <View style={styles.topImgWrap}>
            <AppImage uri={order.image} style={styles.topImg} resizeMode="contain" />
          </View>
          <View style={styles.topInfo}>
            <Text style={styles.topOrderNo}>{order.orderNo}</Text>
            <Text style={styles.topDate}>{order.date}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
        </View>

        {/* Stepper / Timeline */}
        <View style={styles.timelineCard}>
          {order.timeline.map((step, index) => {
            const isLast = index === order.timeline.length - 1;
            return (
              <View key={step.title} style={styles.stepRow}>
                <View style={styles.stepIndicatorCol}>
                  <View style={styles.stepCheckCircle}>
                    <Check size={scale(12)} color="#FFFFFF" strokeWidth={3} />
                  </View>
                  {!isLast && <View style={styles.stepLine} />}
                </View>

                <View style={[styles.stepContent, !isLast && styles.stepContentSpaced]}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepTime}>{step.time}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Products Section */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeader}>Products</Text>
          <View style={styles.productCard}>
            <View style={styles.productImgWrap}>
              <AppImage uri={order.image} style={styles.productImg} resizeMode="contain" />
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{order.productName}</Text>
              <Text style={styles.productMeta}>
                Qty: {order.quantity} | ₹{order.unitPrice.toLocaleString('en-IN')}
              </Text>
            </View>
            <Text style={styles.productTotal}>
              ₹{order.productTotal.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* Order Summary Section */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeader}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                ₹{order.subtotal.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>GST (18%)</Text>
              <Text style={styles.summaryValue}>
                ₹{order.gst.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotalRow]}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>
                ₹{order.total.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  backBtn: {
    padding: scale(4),
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#0F172A',
  },
  moreBtn: {
    padding: scale(4),
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  topCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  topImgWrap: {
    width: scale(52),
    height: scale(52),
    borderRadius: radius.sm,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(4),
    marginRight: spacing.md,
  },
  topImg: {
    width: '100%',
    height: '100%',
  },
  topInfo: {
    flex: 1,
  },
  topOrderNo: {
    fontSize: scale(14),
    fontWeight: '700',
    color: '#0F172A',
  },
  topDate: {
    fontSize: scale(11),
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: spacing.md,
    paddingVertical: scale(4),
    borderRadius: radius.pill,
  },
  statusText: {
    fontSize: scale(11),
    fontWeight: '700',
    color: '#16A34A',
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  stepRow: {
    flexDirection: 'row',
  },
  stepIndicatorCol: {
    width: scale(24),
    alignItems: 'center',
  },
  stepCheckCircle: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#16A34A',
    marginVertical: 2,
  },
  stepContent: {
    flex: 1,
    paddingLeft: spacing.md,
  },
  stepContentSpaced: {
    paddingBottom: spacing.lg,
  },
  stepTitle: {
    fontSize: scale(13),
    fontWeight: '700',
    color: '#0F172A',
  },
  stepTime: {
    fontSize: scale(11),
    color: '#64748B',
    marginTop: 2,
  },
  sectionWrap: {
    gap: spacing.sm,
  },
  sectionHeader: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#0F172A',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  productImgWrap: {
    width: scale(52),
    height: scale(52),
    borderRadius: radius.sm,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(4),
    marginRight: spacing.md,
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: scale(13),
    fontWeight: '700',
    color: '#0F172A',
  },
  productMeta: {
    fontSize: scale(11),
    color: '#64748B',
    marginTop: 2,
  },
  productTotal: {
    fontSize: scale(13),
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: scale(13),
    color: '#64748B',
  },
  summaryValue: {
    fontSize: scale(13),
    fontWeight: '600',
    color: '#0F172A',
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  summaryTotalLabel: {
    fontSize: scale(14),
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryTotalValue: {
    fontSize: scale(16),
    fontWeight: '800',
    color: '#0F172A',
  },
});

export default OrderDetailsScreen;
