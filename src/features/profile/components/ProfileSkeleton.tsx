import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Skeleton from '../../../components/ui/Skeleton';
import { radius, scale, spacing } from '../../../theme';

const InfoRowSkeleton: React.FC = () => (
  <View style={styles.infoRow}>
    <Skeleton width={scale(96)} height={scale(11)} />
    <Skeleton width={scale(120)} height={scale(11)} />
  </View>
);

const MenuRowSkeleton: React.FC = () => (
  <View style={styles.menuRow}>
    <Skeleton width={scale(38)} height={scale(38)} borderRadius={scale(12)} />
    <View style={styles.menuTextWrap}>
      <Skeleton width="55%" height={scale(12)} />
      <Skeleton width="70%" height={scale(10)} style={styles.mt6} />
    </View>
    <Skeleton width={scale(16)} height={scale(16)} circle />
  </View>
);

const ProfileSkeleton: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + scale(14),
          paddingBottom: insets.bottom + scale(96),
        }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerTexts}>
            <Skeleton width={scale(110)} height={scale(10)} />
            <Skeleton width={scale(150)} height={scale(22)} style={styles.mt8} />
          </View>
          <Skeleton width={scale(72)} height={scale(34)} borderRadius={radius.pill} />
        </View>

        {/* Profile hero card */}
        <View style={styles.profileCard}>
          <Skeleton width={scale(88)} height={scale(88)} circle />
          <Skeleton width={scale(150)} height={scale(17)} style={styles.mt14} />
          <Skeleton width={scale(120)} height={scale(12)} style={styles.mt8} />
          <Skeleton width={scale(170)} height={scale(11)} style={styles.mt10} />
          <Skeleton width={scale(140)} height={scale(11)} style={styles.mt8} />
        </View>

        {/* Business Information */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Skeleton width={scale(38)} height={scale(38)} circle />
            <View style={styles.sectionHeaderTexts}>
              <Skeleton width="60%" height={scale(14)} />
              <Skeleton width="80%" height={scale(10)} style={styles.mt6} />
            </View>
          </View>
          <View style={styles.sectionDivider} />
          <InfoRowSkeleton />
          <InfoRowSkeleton />
          <InfoRowSkeleton />
        </View>

        {/* Support & Legal */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Skeleton width={scale(38)} height={scale(38)} circle />
            <View style={styles.sectionHeaderTexts}>
              <Skeleton width="55%" height={scale(14)} />
              <Skeleton width="70%" height={scale(10)} style={styles.mt6} />
            </View>
          </View>
          <View style={styles.sectionDivider} />
          <MenuRowSkeleton />
          <MenuRowSkeleton />
          <MenuRowSkeleton />
          <MenuRowSkeleton />
        </View>

        {/* Logout */}
        <Skeleton
          height={scale(50)}
          borderRadius={radius.md}
          style={styles.logout}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: scale(16),
  },
  headerTexts: {
    flex: 1,
  },
  profileCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: radius.xxl,
    paddingVertical: scale(22),
    paddingHorizontal: scale(18),
    borderWidth: 1.2,
    borderColor: 'rgba(203,213,225,0.6)',
    marginBottom: scale(18),
    alignItems: 'center',
  },
  sectionCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: radius.xl,
    paddingVertical: scale(15),
    paddingHorizontal: scale(13),
    borderWidth: 1.2,
    borderColor: 'rgba(203,213,225,0.5)',
    marginBottom: scale(16),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
  },
  sectionHeaderTexts: {
    flex: 1,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(203,213,225,0.5)',
    marginTop: scale(14),
    marginBottom: scale(4),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scale(13),
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(11),
  },
  menuTextWrap: {
    flex: 1,
    marginLeft: scale(13),
  },
  logout: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  mt6: { marginTop: scale(6) },
  mt8: { marginTop: scale(8) },
  mt10: { marginTop: scale(10) },
  mt14: { marginTop: scale(14) },
});

export default ProfileSkeleton;
