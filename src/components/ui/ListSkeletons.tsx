import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import Skeleton from './Skeleton';
import {colors, radius, scale, spacing} from '../../theme';

/** Three-column image cards, like the Categories screen. */
export const CategoryGridSkeleton: React.FC<{rows?: number}> = ({rows = 4}) => (
  <View style={styles.grid}>
    {Array.from({length: rows}).map((_, row) => (
      <View key={`row-${row}`} style={styles.gridRow}>
        {[0, 1, 2].map(col => (
          <View key={`card-${row}-${col}`} style={styles.gridCard}>
            <Skeleton height={scale(95)} borderRadius={0} />
            <View style={styles.gridBody}>
              <Skeleton width="80%" height={scale(10)} />
            </View>
          </View>
        ))}
      </View>
    ))}
  </View>
);

/** A row of pill-shaped filter chips. */
export const ChipRowSkeleton: React.FC<{count?: number}> = ({count = 4}) => (
  <ScrollView
    horizontal
    scrollEnabled={false}
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.chipRow}>
    {Array.from({length: count}).map((_, i) => (
      <Skeleton
        key={i}
        width={scale(i === 0 ? 48 : 78)}
        height={scale(32)}
        borderRadius={radius.pill}
      />
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  gridCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  gridBody: {
    padding: spacing.sm,
    minHeight: scale(36),
    justifyContent: 'center',
  },
  chipRow: {
    gap: scale(7),
    paddingRight: spacing.lg,
  },
});
