import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Skeleton from '../../../components/ui/Skeleton';
import { radius, scale, spacing } from '../../../theme';

const GridCardSkeleton: React.FC = () => (
  <View style={styles.gridCard}>
    <Skeleton height={scale(122)} borderRadius={scale(14)} />
    <Skeleton width="85%" height={scale(12)} style={styles.mt10} />
    <Skeleton width="50%" height={scale(9)} style={styles.mt8} />
    <Skeleton width="55%" height={scale(13)} style={styles.mt10} />
    <View style={styles.gridDivider} />
    <Skeleton height={scale(30)} borderRadius={radius.sm} />
  </View>
);

const ProductsSkeleton: React.FC = () => (
  <View style={styles.container}>
    {/* Search bar */}
    <Skeleton
      height={scale(40)}
      borderRadius={radius.pill}
      style={styles.searchBar}
    />

    {/* Category pills */}
    <View style={styles.filterRow}>
      {[scale(52), scale(88), scale(84), scale(104), scale(100), scale(88)].map(
        (w, i) => (
          <Skeleton key={`pill-${i}`} width={w} height={scale(30)} borderRadius={radius.pill} />
        ),
      )}
    </View>

    {/* Product grid */}
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.gridContainer}>
      {[0, 1, 2].map(row => (
        <View key={`row-${row}`} style={styles.gridRow}>
          {[0, 1].map(col => (
            <GridCardSkeleton key={`card-${row}-${col}`} />
          ))}
        </View>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchBar: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: scale(14),
    marginBottom: scale(4),
  },
  gridContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: scale(10),
  },
  gridRow: {
    flexDirection: 'row',
    gap: scale(10),
  },
  gridCard: {
    flex: 1,
    borderRadius: scale(18),
    borderWidth: 2,
    borderColor: '#E1E7EF',
    padding: scale(6),
    backgroundColor: '#FFFFFF',
  },
  gridDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: scale(10),
  },
  mt8: { marginTop: scale(8) },
  mt10: { marginTop: scale(10) },
});

export default ProductsSkeleton;
