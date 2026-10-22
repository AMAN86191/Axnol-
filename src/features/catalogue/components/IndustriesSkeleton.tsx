import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Skeleton from '../../../components/ui/Skeleton';
import { radius, scale, spacing } from '../../../theme';

const IndustriesSkeleton: React.FC = () => (
  <View style={styles.container}>
    {/* Search bar */}
    <View style={styles.searchWrap}>
      <Skeleton height={scale(44)} borderRadius={radius.pill} />
    </View>

    {/* Industry cards */}
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    >
      {[0, 1].map(row => (
        <View key={`row-${row}`} style={styles.row}>
          {[0, 1, 2].map(col => (
            <View key={`tile-${row}-${col}`} style={styles.tile}>
              <Skeleton height={scale(78)} borderRadius={radius.md} />
              <Skeleton width="60%" height={scale(10)} style={styles.title} />
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  searchWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    marginTop: scale(8),
    marginBottom: scale(2),
  },
});

export default IndustriesSkeleton;
