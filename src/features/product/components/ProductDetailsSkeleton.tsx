import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Skeleton from '../../../components/ui/Skeleton';
import { radius, scale, spacing } from '../../../theme';

const ProductDetailsSkeleton: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + scale(105) },
      ]}>
      {/* Image gallery */}
      <View style={styles.heroWrap}>
        <Skeleton width={scale(200)} height={scale(200)} borderRadius={radius.lg} />
      </View>
      <View style={styles.dotsRow}>
        <Skeleton width={scale(16)} height={scale(7)} borderRadius={radius.pill} />
        <Skeleton width={scale(7)} height={scale(7)} circle />
        <Skeleton width={scale(7)} height={scale(7)} circle />
      </View>

      {/* Basic info */}
      <View style={styles.body}>
        <Skeleton width="70%" height={scale(18)} />
        <Skeleton width="50%" height={scale(12)} style={styles.mt10} />

        {/* Tags */}
        <View style={styles.tagsRow}>
          {[scale(70), scale(80), scale(96)].map((w, i) => (
            <Skeleton key={`tag-${i}`} width={w} height={scale(24)} borderRadius={radius.pill} />
          ))}
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <Skeleton width={scale(72)} height={scale(14)} />
          <Skeleton width={scale(96)} height={scale(14)} />
        </View>

        {/* Description */}
        <Skeleton width="100%" height={scale(12)} />
        <Skeleton width="100%" height={scale(12)} style={styles.mt8} />
        <Skeleton width="75%" height={scale(12)} style={styles.mt8} />
        <Skeleton height={scale(40)} borderRadius={radius.md} style={styles.mt16} />

        {/* Pack sizes */}
        <Skeleton width={scale(140)} height={scale(14)} style={styles.mt24} />
        <View style={styles.packRow}>
          {[0, 1, 2, 3].map(i => (
            <Skeleton key={`pack-${i}`} width={scale(64)} height={scale(40)} borderRadius={radius.md} />
          ))}
        </View>

        {/* Quantity */}
        <View style={styles.qtySection}>
          <View style={styles.qtyInfo}>
            <Skeleton width={scale(80)} height={scale(13)} />
            <Skeleton width={scale(110)} height={scale(11)} style={styles.mt8} />
          </View>
          <Skeleton width={scale(130)} height={scale(44)} borderRadius={radius.md} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: spacing.xs,
  },
  heroWrap: {
    height: scale(200),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    paddingVertical: scale(8),
  },
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F1F5F9',
    paddingBottom: scale(10),
    marginBottom: spacing.lg,
  },
  packRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: scale(9),
  },
  qtySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  qtyInfo: {
    flex: 1,
  },
  mt8: { marginTop: scale(8) },
  mt10: { marginTop: scale(10) },
  mt16: { marginTop: scale(16) },
  mt24: { marginTop: scale(24) },
});

export default ProductDetailsSkeleton;
