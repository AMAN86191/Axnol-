import React, { useCallback, useEffect } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {
  RouteProp,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';
import {
  CalendarDays,
  ClipboardCheck,
  Clock,
  FileDown,
  MapPin,
  Package,
  PackageCheck,
  Truck,
  XCircle,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OrdersStackParamList } from '../../navigation/types';
import {Image} from 'react-native';
import { colors, radius, rfValue, scale, shadows, spacing } from '../../theme';
import CommonHeader from '../../components/ui/CommonHeader';
import OrderDetailsSkeleton from './components/OrderDetailsSkeleton';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchOrderDetailSlice } from '../../redux/OrderSlice';
import { invalidateRequests } from '../../api/requestCache';
import { OrderRecord } from '../../api/OrderProvider';
import { formatPrice } from '../../utils/formatPrice';
import {
  formatOrderDateTime,
  formatStatusLabel,
  getOrderAddress,
  getOrderErrorMessage,
  getOrderItemsTotal,
  getOrderQty,
  getStatusBadgeStyle,
  statusKey,
} from './orderUtils';
import {Download} from 'lucide-react-native';
import {downloadInvoice} from '../../utils/invoiceGenerator';
import Button from '../../components/ui/Button';

type Route = RouteProp<OrdersStackParamList, 'OrderDetails'>;

type TimelineState = 'completed' | 'current' | 'upcoming' | 'cancelled';

interface TimelineStepData {
  title: string;
  time: string;
  note: string;
  icon: LucideIcon;
  state: TimelineState;
}

interface TimelineStage {
  key: string;
  title: string;
  note: string;
  icon: LucideIcon;
}

const TIMELINE_STAGES: TimelineStage[] = [
  {
    key: 'pending',
    title: 'Order Pending',
    note: 'Order received and awaiting confirmation',
    icon: Clock,
  },
  {
    key: 'placed',
    title: 'Order Placed',
    note: 'Order confirmed and being prepared',
    icon: ClipboardCheck,
  },
  {
    key: 'shipped',
    title: 'Shipped',
    note: 'Order handed over to the delivery partner',
    icon: Truck,
  },
  {
    key: 'delivered',
    title: 'Delivered',
    note: 'Order delivered successfully',
    icon: PackageCheck,
  },
];

const STATUS_STAGE: Record<string, string> = {
  pending: 'pending',
  placed: 'placed',
  processing: 'placed',
  confirmed: 'placed',
  shipped: 'shipped',
  dispatched: 'shipped',
  delivered: 'delivered',
  completed: 'delivered',
  cancelled: 'cancelled',
};

const getOrderTimeline = (order: OrderRecord): TimelineStepData[] => {
  const status = statusKey(order.status);
  const currentStage = STATUS_STAGE[status] ?? 'pending';
  const createdAt = formatOrderDateTime(order.createdAt);
  const currentTime = formatOrderDateTime(
    order.updatedAt ?? order.createdAt,
  );

  if (currentStage === 'cancelled') {
    return [
      {
        ...TIMELINE_STAGES[0],
        time: createdAt,
        state: 'completed',
      },
      {
        title: 'Order Cancelled',
        note: 'Order was cancelled',
        icon: XCircle,
        time: currentTime,
        state: 'cancelled',
      },
    ];
  }

  const currentIndex = TIMELINE_STAGES.findIndex(
    stage => stage.key === currentStage,
  );

  return TIMELINE_STAGES.map((stage, index) => {
    const isCurrent = index === currentIndex;
    const isCompleted = index < currentIndex;

    return {
      ...stage,
      time: isCurrent
        ? currentTime
        : isCompleted
        ? index === 0
          ? createdAt
          : 'Completed'
        : 'Pending',
      note: isCompleted || isCurrent ? stage.note : 'Waiting for update',
      state: isCurrent ? 'current' : isCompleted ? 'completed' : 'upcoming',
    };
  });
};

interface TimelineStepProps {
  step: TimelineStepData;
  index: number;
  isLast: boolean;
}

const TimelineStep: React.FC<TimelineStepProps> = ({
  step,
  index,
  isLast,
}) => {
  const circleScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(scale(14));
  const lineScale = useSharedValue(0);
  const delay = 260 + index * 180;
  const isCurrent = step.state === 'current';
  const isCancelled = step.state === 'cancelled';
  const isUpcoming = step.state === 'upcoming';
  const isCompleted = step.state === 'completed';

  useEffect(() => {
    circleScale.value = withDelay(
      delay,
      withSpring(1, { damping: 11, stiffness: 160, mass: 0.7 }),
    );
    contentOpacity.value = withDelay(delay + 90, withTiming(1, { duration: 420 }));
    contentY.value = withDelay(
      delay + 90,
      withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );
    if (!isLast && isCompleted) {
      lineScale.value = withDelay(
        delay + 210,
        withTiming(1, { duration: 380, easing: Easing.inOut(Easing.ease) }),
      );
    }
  }, [
    circleScale,
    contentOpacity,
    contentY,
    lineScale,
    delay,
    isLast,
    isCompleted,
  ]);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
  }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));
  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: lineScale.value }],
  }));

  const Icon = step.icon;

  return (
    <View style={styles.stepRow}>
      <View style={styles.stepIndicatorCol}>
        <Animated.View
          style={[
            styles.stepCircle,
            isCurrent && styles.stepCircleCurrent,
            isUpcoming && styles.stepCircleUpcoming,
            isCancelled && styles.stepCircleCancelled,
            circleStyle,
          ]}>
          <Icon
            size={scale(13)}
            color={isUpcoming ? '#94A3B8' : '#FFFFFF'}
            strokeWidth={2.6}
          />
        </Animated.View>
        {!isLast && (
          <View style={styles.lineTrack}>
            <Animated.View style={[styles.lineFill, lineStyle]} />
          </View>
        )}
      </View>

      <Animated.View
        style={[
          styles.stepContent,
          !isLast && styles.stepContentSpaced,
          contentStyle,
        ]}>
        <View style={styles.stepTitleRow}>
          <Text
            style={[
              styles.stepTitle,
              isCurrent && styles.stepTitleCurrent,
              isUpcoming && styles.stepTitleUpcoming,
              isCancelled && styles.stepTitleCancelled,
            ]}>
            {step.title}
          </Text>
          {isCurrent && (
            <View style={styles.currentPill}>
              <Text style={styles.currentPillText}>CURRENT</Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.stepTime,
            isUpcoming && styles.stepTextUpcoming,
            isCancelled && styles.stepTimeCancelled,
          ]}>
          {step.time}
        </Text>
        <Text
          style={[
            styles.stepNote,
            isUpcoming && styles.stepTextUpcoming,
            isCancelled && styles.stepTimeCancelled,
          ]}>
          {step.note}
        </Text>
      </Animated.View>
    </View>
  );
};

export const OrderDetailsScreen: React.FC = () => {
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const orderId = route.params?.orderId;
  const order = useAppSelector(state => state.order.orderDetail);
  const loading = useAppSelector(state => state.order.orderDetailLoading);
  const error = useAppSelector(state => state.order.orderDetailError);

  const fetchOrder = useCallback(
    (force = false) => {
      if (!orderId) return Promise.resolve();
      if (force) {
        invalidateRequests(`/orders/${orderId}`);
      }
      return dispatch(fetchOrderDetailSlice(orderId))
        .unwrap()
        .catch(() => undefined);
    },
    [dispatch, orderId],
  );

  useFocusEffect(
    useCallback(() => {
      fetchOrder();
    }, [fetchOrder]),
  );

  if (loading && !order) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <CommonHeader title="Order Details" />
        <OrderDetailsSkeleton />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <CommonHeader title="Order Details" />
        <View style={styles.stateWrap}>
          <View style={styles.stateIcon}>
            <Package size={scale(30)} color={colors.primary} strokeWidth={1.8} />
          </View>
          <Text style={styles.stateTitle}>Could not load order</Text>
          <Text style={styles.stateText}>
            {error ? getOrderErrorMessage(error) : 'Order not found.'}
          </Text>
          {error ? (
            <TouchableOpacity
              style={styles.retryBtn}
              activeOpacity={0.85}
              onPress={() => {
                fetchOrder(true);
              }}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }

  const badge = getStatusBadgeStyle(order.status);
  const paymentBadge = getStatusBadgeStyle(order.paymentStatus);
  const timeline = getOrderTimeline(order);
  const subtotal = getOrderItemsTotal(order);
  const total = order.totalAmount || subtotal;
  const totalQty = getOrderQty(order);
  const address = getOrderAddress(order);
  const addressLines = [
    order.companyName,
    address,
    order.phone ? `Phone: ${order.phone}` : '',
  ].filter(Boolean);

  const handleDownloadInvoice = async () => {
    try {
      const result = await downloadInvoice(order);
      // if (result.success) {
      //   Alert.alert('Invoice Downloaded', 'Invoice saved successfully on this device.');
      // } else {
      //   Alert.alert('Error', 'Failed to download invoice. Please try again.');
      // }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to download invoice. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <CommonHeader title="Order Details" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + scale(80) },
        ]}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.heroDecorOne} />
          <View style={styles.heroDecorTwo} />

          <View style={styles.heroTopRow}>
            <Text style={styles.heroOrderNo}>{order.orderNumber}</Text>
            <View style={[styles.heroStatus, { backgroundColor: badge.bg }]}>
              <View
                style={[styles.heroStatusDot, { backgroundColor: badge.dot }]}
              />
              <Text style={[styles.heroStatusText, { color: badge.text }]}>
                {formatStatusLabel(order.status)}
              </Text>
            </View>
          </View>

          <View style={styles.heroMetaRow}>
            <CalendarDays
              size={scale(10.5)}
              color="rgba(255,255,255,0.8)"
              strokeWidth={2.2}
            />
            <Text style={styles.heroMetaText}>
              {formatOrderDateTime(order.createdAt)}
            </Text>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroBottomRow}>
            <View>
              <Text style={styles.heroTotalLabel}>Total Amount</Text>
              <Text style={styles.heroTotal}>{formatPrice(total)}</Text>
            </View>
            <View style={styles.heroItemsPill}>
              <Package size={scale(10.5)} color="#FFFFFF" strokeWidth={1.5} />
              <Text style={styles.heroItemsText}>
                {order.items.length} item{order.items.length === 1 ? '' : 's'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
          <View style={styles.panel}>
            <View style={styles.timelineBody}>
              {timeline.map((step, index) => (
                <TimelineStep
                  key={`${step.title}-${index}`}
                  step={step}
                  index={index}
                  isLast={index === timeline.length - 1}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          <View style={styles.panel}>
            {order.items.length === 0 ? (
              <Text style={styles.emptyItemsText}>No items in this order.</Text>
            ) : (
              order.items.map((item, index) => {
                const lineTotal =
                  item.lineTotal || item.unitPrice * item.qty;
                return (
                  <View
                    key={`${item.productId}-${item.rateChartId ?? index}`}
                    style={[styles.itemRow, index > 0 && styles.rowDivider]}>
                    <View style={styles.itemImgWrap}>
                      <Image
                        source={{uri: item.image}}
                        style={styles.itemImg}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.productName}
                      </Text>
                      <Text style={styles.itemMeta}>
                        Qty {item.qty}
                        {item.size ? ` • ${item.size}` : ''} •{' '}
                        {formatPrice(item.unitPrice)}/unit
                      </Text>
                    </View>
                    <Text style={styles.itemTotal}>
                      {formatPrice(lineTotal)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.panel}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items Subtotal</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Quantity</Text>
              <Text style={styles.summaryValue}>{totalQty}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment Status</Text>
              <Text
                style={[styles.summaryValue, { color: paymentBadge.text }]}>
                {formatStatusLabel(order.paymentStatus)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>
                {formatPrice(total)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.panel}>
            <View style={styles.addressRow}>
              <View style={styles.addressIcon}>
                <MapPin
                  size={scale(15)}
                  color={colors.primary}
                  strokeWidth={2.4}
                />
              </View>
              <Text style={styles.addressText}>
                {addressLines.length > 0
                  ? addressLines.join('\n')
                  : 'Address not available'}
              </Text>
            </View>
          </View>
        </View>

        {order.remark ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Remark</Text>
            <View style={styles.panel}>
              <Text style={styles.remarkText}>{order.remark}</Text>
            </View>
          </View>
        ) : null}
        <View style={{marginTop:scale(15)}}>

        <Button 
         title='Download Invoice'
         variant='navy'
         onPress={()=>handleDownloadInvoice()}
        //  iconRight={<FileDown color={'#fff'} size={rfValue(15)} />}
        />
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

  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },

  // Hero
  hero: {
    borderRadius: radius.xl,
    padding: scale(10),
    overflow: 'hidden',
    ...shadows.medium,
  },
  heroDecorOne: {
    position: 'absolute',
    top: -scale(50),
    right: -scale(40),
    width: scale(150),
    height: scale(150),
    borderRadius: scale(75),
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroDecorTwo: {
    position: 'absolute',
    bottom: -scale(60),
    left: -scale(40),
    width: scale(140),
    height: scale(140),
    borderRadius: scale(70),
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroOrderNo: {
    fontSize: scale(17),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  heroStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: radius.pill,
  },
  heroStatusDot: {
    width: scale(5),
    height: scale(5),
    borderRadius: scale(3),
  },
  heroStatusText: {
    fontSize: scale(10),
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginTop: scale(7),
  },
  heroMetaText: {
    fontSize: scale(10.5),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.82)',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginVertical: scale(10),
  },
  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  heroTotalLabel: {
    fontSize: scale(10.5),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
  },
  heroTotal: {
    fontSize: scale(20),
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: scale(2),
    letterSpacing: -0.3,
  },
  heroItemsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    paddingHorizontal: scale(10),
    paddingVertical: scale(5),
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  heroItemsText: {
    fontSize: scale(10.5),
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Open sections (no boxes)
  section: {
    // marginTop: scale(26),
  },
  sectionTitle: {
    fontSize: scale(11.5),
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#94A3B8',
    marginVertical: scale(10),
    marginLeft: scale(2),
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EEF4',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  // Timeline
  timelineBody: {
    paddingTop: scale(2),
  },
  stepRow: {
    flexDirection: 'row',
  },
  stepIndicatorCol: {
    width: scale(30),
    alignItems: 'center',
  },
  stepCircle: {
    width: scale(26),
    height: scale(26),
    borderRadius: scale(14),
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    ...shadows.small,
  },
  stepCircleCurrent: {
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: '#DCEAF7',
  },
  stepCircleUpcoming: {
    backgroundColor: '#E2E8F0',
  },
  stepCircleCancelled: {
    backgroundColor: '#DC2626',
    borderWidth: 3,
    borderColor: '#FEE2E2',
  },
  lineTrack: {
    width: scale(2),
    flex: 1,
    backgroundColor: '#E2ECF3',
    borderRadius: scale(2),
    overflow: 'hidden',
    marginVertical: scale(2),
  },
  lineFill: {
    width: scale(2),
    height: '100%',
    backgroundColor: '#16A34A',
    transformOrigin: 'top',
  },
  stepContent: {
    flex: 1,
    paddingLeft: spacing.md,
    paddingTop: scale(2),
  },
  stepContentSpaced: {
    paddingBottom: scale(20),
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  stepTitle: {
    fontSize: scale(12),
    fontWeight: '700',
    color: '#0F172A',
  },
  stepTitleCurrent: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  stepTitleUpcoming: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  stepTitleCancelled: {
    color: '#DC2626',
  },
  currentPill: {
    paddingHorizontal: scale(7),
    paddingVertical: scale(2),
    borderRadius: radius.pill,
    backgroundColor: '#EFF6FF',
  },
  currentPillText: {
    fontSize: scale(8.5),
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#0284C7',
  },
  stepTime: {
    fontSize: scale(10.5),
    fontWeight: '500',
    color: '#64748B',
    marginTop: scale(3),
  },
  stepNote: {
    fontSize: scale(10),
    color: '#94A3B8',
    marginTop: scale(2),
  },
  stepTextUpcoming: {
    color: '#CBD5E1',
  },
  stepTimeCancelled: {
    color: '#DC2626',
  },

  // Items
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: '#EDF1F6',
  },
  itemImgWrap: {
    width: scale(50),
    height: scale(50),
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(4),
    marginRight: spacing.md,
  },
  itemImg: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: scale(13),
    fontWeight: '700',
    color: '#0F172A',
  },
  itemMeta: {
    fontSize: scale(11),
    color: '#64748B',
    marginTop: scale(3),
  },
  itemTotal: {
    fontSize: scale(13.5),
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyItemsText: {
    fontSize: scale(12.5),
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scale(5),
  },
  summaryLabel: {
    fontSize: scale(12.5),
    color: '#64748B',
  },
  summaryValue: {
    fontSize: scale(13),
    fontWeight: '600',
    color: '#0F172A',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E7EDF3',
    marginVertical: scale(9),
  },
  summaryTotalLabel: {
    fontSize: scale(14),
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryTotalValue: {
    fontSize: scale(17),
    fontWeight: '800',
    color: colors.primary,
  },

  // Address
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(12),
  },
  addressIcon: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: '#EAF3FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressText: {
    flex: 1,
    fontSize: scale(12.5),
    lineHeight: scale(19),
    color: '#475569',
  },
  remarkText: {
    fontSize: scale(12.5),
    lineHeight: scale(19),
    color: '#475569',
  },

  // Loading / error state
  stateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  stateIcon: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  stateTitle: {
    fontSize: scale(16),
    fontWeight: '800',
    color: '#0F172A',
  },
  stateText: {
    marginTop: scale(6),
    fontSize: scale(12.5),
    lineHeight: scale(19),
    color: '#64748B',
    textAlign: 'center',
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
    fontSize: scale(12.5),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomBar: {
    // position: 'absolute',
    // left: 0,
    // right: 0,
    // bottom: 0,
    // backgroundColor: '#FFFFFF',
    // borderTopWidth: 1,
    // borderTopColor: '#E2E8F0',
    // paddingHorizontal: spacing.lg,
    // paddingTop: scale(10),
  },
  downloadBtn: {
    height: scale(48),
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  downloadBtnText: {
    fontSize: scale(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default OrderDetailsScreen;
