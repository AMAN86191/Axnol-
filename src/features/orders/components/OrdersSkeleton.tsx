import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Skeleton from '../../../components/ui/Skeleton';
import { radius, scale, spacing } from '../../../theme';

const OrderCardSkeleton: React.FC = () => (
  <View style={styles.card}>
    <View style={styles.cardTop}>
      <Skeleton width={scale(52)} height={scale(52)} borderRadius={radius.md} />
      <View style={styles.cardContent}>
        <Skeleton width={scale(70)} height={scale(9)} />
        <Skeleton width="80%" height={scale(13)} style={styles.mt8} />
        <Skeleton width={scale(80)} height={scale(10)} style={styles.mt8} />
      </View>
      <Skeleton width={scale(72)} height={scale(24)} borderRadius={radius.pill} />
    </View>

    <View style={styles.divider} />

    <View style={styles.cardBottom}>
      <Skeleton width={scale(96)} height={scale(11)} />
      <Skeleton width={scale(88)} height={scale(13)} />
    </View>
  </View>
);

const OrdersSkeleton: React.FC = () => (
  <View style={styles.container}>
    {/* Filter tabs */}
    <View style={styles.filterBar}>
      <View style={styles.filterRow}>
        {[scale(58), scale(84), scale(96), scale(92), scale(88)].map((w, i) => (
          <Skeleton key={`filter-${i}`} width={w} height={scale(32)} borderRadius={radius.pill} />
        ))}
      </View>
    </View>

    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.list}>
      <View style={styles.metaRow}>
        <Skeleton width={scale(120)} height={scale(13)} />
        <Skeleton width={scale(52)} height={scale(11)} />
      </View>
      {[0, 1, 2, 3].map(i => (
        <OrderCardSkeleton key={`order-${i}`} />
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  filterBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scale(2),
  },
  card: {
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
  cardContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEF2F6',
    marginVertical: spacing.md,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mt8: { marginTop: scale(8) },
});

export default OrdersSkeleton;
