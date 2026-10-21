import React from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Skeleton from '../../../components/ui/Skeleton';
import { radius, scale, spacing } from '../../../theme';

const HomeSkeleton: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + scale(8),
            paddingBottom: insets.bottom + scale(85),
          },
        ]}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Skeleton width={scale(42)} height={scale(42)} circle />
          <View style={styles.headerTexts}>
            <Skeleton width="45%" height={scale(9)} />
            <Skeleton width="65%" height={scale(13)} style={styles.mt6} />
          </View>
          <Skeleton width={scale(38)} height={scale(38)} circle />
        </View>
        <Skeleton
          height={scale(46)}
          borderRadius={radius.pill}
          style={styles.mt16}
        />

        {/* Hero banner */}
        <Skeleton
          height={scale(150)}
          borderRadius={radius.xl}
          style={styles.mt20}
        />

        {/* Industries */}
        <Skeleton width={scale(120)} height={scale(14)} style={styles.mt24} />
        <View style={styles.row}>
          {[0, 1, 2, 3].map(i => (
            <View key={`ind-${i}`} style={styles.industryItem}>
              <Skeleton width={scale(62)} height={scale(62)} circle />
              <Skeleton width={scale(50)} height={scale(9)} style={styles.mt8} />
            </View>
          ))}
        </View>

        {/* Featured products */}
        <Skeleton width={scale(150)} height={scale(14)} style={styles.mt24} />
        <View style={styles.row}>
          {[0, 1].map(i => (
            <View key={`feat-${i}`} style={styles.card}>
              <Skeleton height={scale(108)} borderRadius={radius.md} />
              <Skeleton width="80%" height={scale(11)} style={styles.mt10} />
              <Skeleton width="50%" height={scale(9)} style={styles.mt6} />
              <Skeleton width="45%" height={scale(13)} style={styles.mt10} />
            </View>
          ))}
        </View>

        {/* Categories */}
        <Skeleton width={scale(130)} height={scale(14)} style={styles.mt24} />
        <View style={styles.row}>
          {[0, 1, 2, 3].map(i => (
            <View key={`cat-${i}`} style={styles.categoryItem}>
              <Skeleton height={scale(76)} borderRadius={radius.md} />
              <Skeleton width="70%" height={scale(9)} style={styles.mt8} />
            </View>
          ))}
        </View>

        {/* All products grid */}
        <Skeleton width={scale(140)} height={scale(14)} style={styles.mt24} />
        <View style={styles.gridRow}>
          {[0, 1].map(i => (
            <View key={`grid-${i}`} style={styles.gridCard}>
              <Skeleton height={scale(120)} borderRadius={radius.md} />
              <Skeleton width="85%" height={scale(11)} style={styles.mt10} />
              <Skeleton width="55%" height={scale(9)} style={styles.mt6} />
              <Skeleton width="45%" height={scale(13)} style={styles.mt10} />
            </View>
          ))}
        </View>
        <View style={styles.gridRow}>
          {[0, 1].map(i => (
            <View key={`grid2-${i}`} style={styles.gridCard}>
              <Skeleton height={scale(120)} borderRadius={radius.md} />
              <Skeleton width="85%" height={scale(11)} style={styles.mt10} />
              <Skeleton width="55%" height={scale(9)} style={styles.mt6} />
              <Skeleton width="45%" height={scale(13)} style={styles.mt10} />
            </View>
          ))}
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
  content: {
    paddingHorizontal: scale(14),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTexts: {
    flex: 1,
    marginLeft: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  industryItem: {
    alignItems: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing.md,
  },
  categoryItem: {
    flex: 1,
  },
  gridRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing.md,
  },
  mt6: { marginTop: scale(6) },
  mt8: { marginTop: scale(8) },
  mt10: { marginTop: scale(10) },
  mt16: { marginTop: scale(16) },
  mt20: { marginTop: scale(20) },
  mt24: { marginTop: scale(24) },
});

export default HomeSkeleton;
