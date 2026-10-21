import React, { useEffect } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import {
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  ClipboardCheck,
  Home,
  MapPin,
  Package,
  PackageCheck,
  Truck,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OrdersStackParamList } from '../../navigation/types';
import AppImage from '../../components/ui/AppImage';
import { colors, radius, scale, shadows, spacing } from '../../theme';
import CommonHeader from '../../components/ui/CommonHeader';
import { useSimulatedLoading } from '../../hooks/useSimulatedLoading';
import OrderDetailsSkeleton from './components/OrderDetailsSkeleton';

type Route = RouteProp<OrdersStackParamList, 'OrderDetails'>;

interface TimelineStepData {
  title: string;
  time: string;
  note: string;
  icon: LucideIcon;
}

interface OrderItemData {
  name: string;
  quantity: number;
  unitPrice: number;
  image: string;
}

const ORDER = {
  orderNo: 'AX0003',
  date: '18 Sep 2026, 10:30 AM',
  status: 'Delivered',
  items: [
    {
      name: 'Gear Oil AX-200',
      quantity: 20,
      unitPrice: 2250,
      image: 'product_cutting',
    },
  ] as OrderItemData[],
  subtotal: 45000,
  gst: 8100,
  total: 53100,
  shippingAddress:
    'Sharma Auto Traders, Plot 12, Industrial Area Phase II, Jaipur, Rajasthan - 302013',
  timeline: [
    {
      title: 'Order Placed',
      time: '18 Sep 2026, 10:30 AM',
      note: 'Order received by Axnol',
      icon: ClipboardCheck,
    },
    {
      title: 'Processing',
      time: '19 Sep 2026, 09:00 AM',
      note: 'Stock allocated & packed',
      icon: PackageCheck,
    },
    {
      title: 'Dispatched',
      time: '20 Sep 2026, 04:20 PM',
      note: 'Shipped from Jaipur depot',
      icon: Truck,
    },
    {
      title: 'Delivered',
      time: '21 Sep 2026, 11:30 AM',
      note: 'Signed for by recipient',
      icon: Home,
    },
  ] as TimelineStepData[],
};

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Delivered: { bg: '#DCFCE7', text: '#16A34A', dot: '#16A34A' },
  Dispatched: { bg: '#E0E7FF', text: '#4F46E5', dot: '#4F46E5' },
  Processing: { bg: '#DBEAFE', text: '#2563EB', dot: '#2563EB' },
  Placed: { bg: '#FEF3C7', text: '#D97706', dot: '#D97706' },
  Canceled: { bg: '#FEE2E2', text: '#DC2626', dot: '#DC2626' },
};

const statusStyle = (status: string) =>
  STATUS_STYLES[status] ?? { bg: '#F1F5F9', text: '#64748B', dot: '#64748B' };

const formatMoney = (value: number) => `₹${value.toLocaleString('en-IN')}`;

interface TimelineStepProps {
  step: TimelineStepData;
  index: number;
  isLast: boolean;
  isCurrent: boolean;
}

const TimelineStep: React.FC<TimelineStepProps> = ({
  step,
  index,
  isLast,
  isCurrent,
}) => {
  const circleScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(scale(14));
  const lineScale = useSharedValue(0);
  const delay = 260 + index * 240;

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
    if (!isLast) {
      lineScale.value = withDelay(
        delay + 210,
        withTiming(1, { duration: 380, easing: Easing.inOut(Easing.ease) }),
      );
    }
  }, [circleScale, contentOpacity, contentY, lineScale, delay, isLast]);

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
            circleStyle,
          ]}>
          <Icon size={scale(13)} color="#FFFFFF" strokeWidth={2.6} />
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
          <Text style={styles.stepTitle}>{step.title}</Text>
          {isCurrent && (
            <View style={styles.currentPill}>
              <Text style={styles.currentPillText}>CURRENT</Text>
            </View>
          )}
        </View>
        <Text style={styles.stepTime}>{step.time}</Text>
        <Text style={styles.stepNote}>{step.note}</Text>
      </Animated.View>
    </View>
  );
};

export const OrderDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  useRoute<Route>();
  const loading = useSimulatedLoading();

  const order = ORDER;
  const badge = statusStyle(order.status);
  const currentIndex = order.timeline.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <CommonHeader title='Order Details' />
      {loading ? (
        <OrderDetailsSkeleton />
      ) : (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + scale(48) },
        ]}>
        {/* Status hero */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.heroDecorOne} />
          <View style={styles.heroDecorTwo} />

          <View style={styles.heroTopRow}>
            <Text style={styles.heroOrderNo}>{order.orderNo}</Text>
            <View style={[styles.heroStatus, { backgroundColor: badge.bg }]}>
              <View
                style={[styles.heroStatusDot, { backgroundColor: badge.dot }]}
              />
              <Text style={[styles.heroStatusText, { color: badge.text }]}>
                {order.status}
              </Text>
            </View>
          </View>

          <View style={styles.heroMetaRow}>
            <CalendarDays
              size={scale(10.5)}
              color="rgba(255,255,255,0.8)"
              strokeWidth={2.2}
            />
            <Text style={styles.heroMetaText}>{order.date}</Text>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroBottomRow}>
            <View>
              <Text style={styles.heroTotalLabel}>Total Amount</Text>
              <Text style={styles.heroTotal}>{formatMoney(order.total)}</Text>
            </View>
            <View style={styles.heroItemsPill}>
              <Package size={scale(10.5)} color="#FFFFFF" strokeWidth={1.5} />
              <Text style={styles.heroItemsText}>
                {order.items.length} item{order.items.length > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
          <View style={styles.panel}>
            <View style={styles.timelineBody}>
              {order.timeline.map((step, index) => (
                <TimelineStep
                  key={step.title}
                  step={step}
                  index={index}
                  isLast={index === order.timeline.length - 1}
                  isCurrent={index === currentIndex}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          <View style={styles.panel}>
            {order.items.map((item, index) => (
              <View
                key={item.name}
                style={[styles.itemRow, index > 0 && styles.rowDivider]}>
                <View style={styles.itemImgWrap}>
                  <AppImage
                    uri={item.image}
                    style={styles.itemImg}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemMeta}>
                    Qty {item.quantity} • {formatMoney(item.unitPrice)}/unit
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  {formatMoney(item.quantity * item.unitPrice)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.panel}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {formatMoney(order.subtotal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>GST (18%)</Text>
              <Text style={styles.summaryValue}>{formatMoney(order.gst)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>
                {formatMoney(order.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery Address */}
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
              <Text style={styles.addressText}>{order.shippingAddress}</Text>
            </View>
          </View>
        </View>

      
      </ScrollView>
      )}
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

  // Items
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingVertical: scale(8),
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
  }
});

export default OrderDetailsScreen;
