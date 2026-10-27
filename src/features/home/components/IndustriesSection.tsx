import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { WifiOff } from 'lucide-react-native';
import Skeleton from '../../../components/ui/Skeleton';
import { scale } from '../../../theme';
import { IndustryItem } from '../homeData';
import HomeSectionHeader from './HomeSectionHeader';
import SectionEmptyState from './SectionEmptyState';
import CachedImage from '../../../components/ui/CachedImage';

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
  const showError =
    !loading && industries.length === 0 && Boolean(errorMessage);
  const isEmpty = !loading && !showError && industries.length === 0;
  const [visibleIndustryIds, setVisibleIndustryIds] = useState<Set<string>>(
    () => new Set(),
  );
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });
  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      // Keep ids once seen, so an image that scrolled away isn't dropped and
      // loaded again when it comes back.
      setVisibleIndustryIds(prev => {
        const next = new Set(prev);
        viewableItems.forEach(token => {
          const id = (token.item as IndustryItem).id;
          if (id) {
            next.add(id);
          }
        });
        return next.size === prev.size ? prev : next;
      });
    },
    [],
  );

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
        <FlatList
          horizontal
          data={industries}
          keyExtractor={item => item.id}
          renderItem={({ item: ind }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => onSelect(ind)}
            >
              <View style={styles.circleShadow}>
                {visibleIndustryIds.has(ind.id) ? (
                  <CachedImage
                    uri={ind.image}
                    style={styles.circle}
                    resizeMode="cover"
                    fallback={
                      <View
                        style={[
                          styles.circle,
                          styles.fallbackCircle,
                          StyleSheet.absoluteFillObject,
                        ]}
                      >
                        <Text style={styles.fallbackText}>
                          {ind.name?.charAt(0)?.toUpperCase() || '?'}
                        </Text>
                      </View>
                    }
                  />
                ) : null}
              </View>
              <Text style={styles.cardName} numberOfLines={1}>
                {ind.name}
              </Text>
            </TouchableOpacity>
          )}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={3}
          updateCellsBatchingPeriod={40}
          getItemLayout={(_, index) => ({
            length: CARD_WIDTH + scale(10),
            offset: (CARD_WIDTH + scale(10)) * index,
            index,
          })}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig.current}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollPad}
        />
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
    shadowOffset: { width: 0, height: 4 },
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
  fallbackCircle: {
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: scale(18),
    fontWeight: '800',
    color: '#2563EB',
  },
  cardLink: {
    fontSize: scale(9.5),
    fontWeight: '700',
    color: '#0284C7',
    marginTop: scale(1),
  },
});

export default IndustriesSection;
