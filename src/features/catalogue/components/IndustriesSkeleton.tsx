import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Skeleton from '../../../components/ui/Skeleton';
import { scale, spacing } from '../../../theme';

/** Placeholder with the same layout as the Industries screen. */
const IndustriesSkeleton: React.FC = () => {
  return (
    <ScrollView
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.content, { paddingTop: scale(12) }]}
    >
      <Skeleton height={scale(120)} borderRadius={scale(14)} />
      <View style={styles.grid}>
        {[0, 1, 2].map(row => (
          <View key={`row-${row}`} style={styles.row}>
            {[0, 1, 2].map(col => (
              <View key={`tile-${row}-${col}`} style={styles.tile}>
                <Skeleton height={scale(82)} borderRadius={scale(5)} />
                <Skeleton width="70%" height={scale(10)} style={styles.title} />
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
  },
  grid: {
    marginTop: scale(12),
    gap: scale(9),
  },
  row: {
    flexDirection: 'row',
    gap: scale(9),
  },
  tile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: scale(8),
    padding: scale(5),
  },
  title: {
    marginTop: scale(14),
    marginBottom: scale(14),
  },
});

export default IndustriesSkeleton;
