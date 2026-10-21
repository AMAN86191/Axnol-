import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Skeleton from '../../../components/ui/Skeleton';
import { radius, scale, spacing } from '../../../theme';

const TimelineStepSkeleton: React.FC<{ isLast?: boolean }> = ({ isLast }) => (
  <View style={styles.stepRow}>
    <View style={styles.stepIndicatorCol}>
      <Skeleton width={scale(26)} height={scale(26)} circle />
      {!isLast && <Skeleton width={scale(2)} height={scale(46)} borderRadius={scale(2)} style={styles.mt4} />}
    </View>
    <View style={styles.stepContent}>
      <Skeleton width={scale(90)} height={scale(12)} />
      <Skeleton width={scale(120)} height={scale(10)} style={styles.mt8} />
      <Skeleton width={scale(100)} height={scale(9)} style={styles.mt6} />
    </View>
  </View>
);

const OrderDetailsSkeleton: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + scale(48) },
      ]}>
      {/* Status hero */}
      <Skeleton height={scale(140)} borderRadius={radius.xl} />

      {/* Timeline */}
      <Skeleton width={scale(130)} height={scale(12)} style={styles.sectionTitle} />
      <View style={styles.panel}>
        <TimelineStepSkeleton />
        <TimelineStepSkeleton />
        <TimelineStepSkeleton />
        <TimelineStepSkeleton isLast />
      </View>

      {/* Items */}
      <Skeleton width={scale(60)} height={scale(12)} style={styles.sectionTitle} />
      <View style={styles.panel}>
        <View style={styles.itemRow}>
          <Skeleton width={scale(50)} height={scale(50)} borderRadius={radius.md} />
          <View style={styles.itemInfo}>
            <Skeleton width="70%" height={scale(12)} />
            <Skeleton width="55%" height={scale(10)} style={styles.mt8} />
          </View>
          <Skeleton width={scale(64)} height={scale(13)} />
        </View>
      </View>

      {/* Payment summary */}
      <Skeleton width={scale(140)} height={scale(12)} style={styles.sectionTitle} />
      <View style={styles.panel}>
        <View style={styles.summaryRow}>
          <Skeleton width={scale(70)} height={scale(12)} />
          <Skeleton width={scale(70)} height={scale(12)} />
        </View>
        <View style={styles.summaryRow}>
          <Skeleton width={scale(60)} height={scale(12)} />
          <Skeleton width={scale(60)} height={scale(12)} />
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Skeleton width={scale(56)} height={scale(14)} />
          <Skeleton width={scale(90)} height={scale(16)} />
        </View>
      </View>

      {/* Delivery address */}
      <Skeleton width={scale(130)} height={scale(12)} style={styles.sectionTitle} />
      <View style={styles.panel}>
        <View style={styles.addressRow}>
          <Skeleton width={scale(34)} height={scale(34)} circle />
          <View style={styles.addressText}>
            <Skeleton width="100%" height={scale(11)} />
            <Skeleton width="85%" height={scale(11)} style={styles.mt6} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    marginTop: scale(20),
    marginBottom: scale(10),
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
  stepRow: {
    flexDirection: 'row',
  },
  stepIndicatorCol: {
    width: scale(30),
    alignItems: 'center',
  },
  stepContent: {
    flex: 1,
    paddingLeft: spacing.md,
    paddingBottom: scale(20),
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scale(5),
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E7EDF3',
    marginVertical: scale(9),
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(12),
  },
  addressText: {
    flex: 1,
  },
  mt4: { marginTop: scale(4) },
  mt6: { marginTop: scale(6) },
  mt8: { marginTop: scale(8) },
});

export default OrderDetailsSkeleton;
