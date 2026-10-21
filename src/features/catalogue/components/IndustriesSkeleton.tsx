import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Skeleton from '../../../components/ui/Skeleton';
import { radius, scale, spacing } from '../../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2;

const IndustriesSkeleton: React.FC = () => (
  <View style={styles.container}>
    {/* Search bar */}
    <View style={styles.searchWrap}>
      <Skeleton height={scale(44)} borderRadius={radius.pill} />
    </View>

    {/* Industry cards */}
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}>
      {[0, 1, 2].map(row => (
        <View key={`row-${row}`} style={styles.row}>
          {[0, 1].map(col => (
            <View key={`card-${row}-${col}`} style={styles.card}>
              <Skeleton height={scale(110)} borderRadius={0} />
              <View style={styles.cardContent}>
                <Skeleton width="60%" height={scale(11)} />
                <Skeleton width={scale(20)} height={scale(20)} circle />
              </View>
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
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E3E8EF',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: scale(35),
  },
});

export default IndustriesSkeleton;
