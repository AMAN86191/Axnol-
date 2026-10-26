import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {WifiOff} from 'lucide-react-native';
import AppImage from '../../../components/ui/AppImage';
import Skeleton from '../../../components/ui/Skeleton';
import {scale} from '../../../theme';
import {IndustryItem} from '../homeData';
import HomeSectionHeader from './HomeSectionHeader';
import SectionEmptyState from './SectionEmptyState';

interface IndustriesSectionProps {
  industries: IndustryItem[];
  loading?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onSeeAll?: () => void;
  onSelect: (item: IndustryItem) => void;
}

const CIRCLE = scale(60);
const CARD_WIDTH = scale(84);
const SKELETON_COUNT = 4;

export const IndustriesSection: React.FC<IndustriesSectionProps> = ({
  industries,
  loading = false,
  errorMessage,
  onRetry,
  onSeeAll,
  onSelect,
}) => {
  const showError = !loading && industries.length === 0 && Boolean(errorMessage);
  const isEmpty = !loading && !showError && industries.length === 0;

  return (
    <>
      <HomeSectionHeader
        title="Industries"
        subtitle={
          showError
            ? 'Unable to load right now'
            : isEmpty
            ? 'Please check back later'
            : 'Solutions built for your sector'
        }
        onAction={isEmpty || showError ? undefined : onSeeAll}
      />

      {loading ? (
        <View style={styles.skeletonRow}>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <View key={`industry-skeleton-${index}`} style={styles.card}>
              <Skeleton width={CIRCLE} height={CIRCLE} circle />
              <Skeleton
                width={scale(50)}
                height={scale(9)}
                style={styles.skeletonTitle}
              />
            </View>
          ))}
        </View>
      ) : showError ? (
        <SectionEmptyState
          icon={WifiOff}
          message={errorMessage as string}
          actionLabel="Retry"
          onAction={onRetry}
        />
      ) : isEmpty ? (
        <SectionEmptyState message="No industries found at the moment" />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollPad}>
          {industries.map(ind => (
            <TouchableOpacity
              key={ind.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => onSelect(ind)}>
              {/* Round industry image */}
              <View style={styles.circleShadow}>
                <View style={styles.circle}>
                  <AppImage
                    uri={ind.image}
                    style={styles.cardImg}
                    resizeMode="cover"
                  />
                </View>
              </View>

              {/* Title below the image */}
              <Text style={styles.cardName} numberOfLines={1}>
                {ind.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  scrollPad: {
    gap: scale(10),
    paddingRight: scale(14),
    paddingTop: scale(4),
    paddingBottom: scale(4),
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: scale(10),
    paddingRight: scale(14),
    paddingTop: scale(4),
    paddingBottom: scale(4),
  },
  skeletonTitle: {
    marginTop: scale(8),
  },
  card: {
    width: CARD_WIDTH,
    alignItems: 'center',
  },
  circleShadow: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A3B74',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 7,
    elevation: 3,
  },
  circle: {
    width: '100%',
    height: '100%',
    borderRadius: CIRCLE / 2,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  cardImg: {
    width: '100%',
    height: '100%',
  },
  cardName: {
    fontSize: scale(11.5),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    textAlign: 'center',
    marginTop: scale(8),
  },
  cardLink: {
    fontSize: scale(9.5),
    fontWeight: '700',
    color: '#0284C7',
    marginTop: scale(1),
  },
});

export default IndustriesSection;
