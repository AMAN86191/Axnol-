import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors, scale} from '../../../theme';
import {CategoryItem} from '../homeData';
import AppImage from '../../../components/ui/AppImage';
import Skeleton from '../../../components/ui/Skeleton';
import {WifiOff} from 'lucide-react-native';
import HomeSectionHeader from './HomeSectionHeader';
import SectionEmptyState from './SectionEmptyState';

interface CategoriesSectionProps {
  categories: CategoryItem[];
  loading?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onSeeAll?: () => void;
  onSelect: (category: CategoryItem) => void;
}

const SKELETON_COUNT = 4;

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  categories,
  loading = false,
  errorMessage,
  onRetry,
  onSeeAll,
  onSelect,
}) => {
  const showError = !loading && categories.length === 0 && Boolean(errorMessage);
  const isEmpty = !loading && !showError && categories.length === 0;

  return (
    <>
      <HomeSectionHeader
        title="Categories"
        subtitle={
          showError
            ? 'Unable to load right now'
            : isEmpty
            ? 'Please check back later'
            : 'Browse our product range'
        }
        onAction={isEmpty || showError ? undefined : onSeeAll}
      />

      {loading ? (
        <View style={styles.skeletonRow}>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <View key={`category-skeleton-${index}`} style={styles.item}>
              <Skeleton width={CIRCLE} height={CIRCLE} circle />
              <Skeleton
                width={scale(54)}
                height={scale(9)}
                style={styles.skeletonTitle}
              />
              <Skeleton
                width={scale(38)}
                height={scale(9)}
                style={styles.skeletonSubtitle}
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
        <SectionEmptyState message="No categories found at the moment" />
      ) : (
        <FlatList
          horizontal
          data={categories}
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listPad}
          renderItem={({item}) => {
            return (
              <TouchableOpacity
                style={styles.item}
                activeOpacity={0.85}
                onPress={() => onSelect(item)}>
                <View style={styles.circle}>
                  <AppImage
                    uri={item.image}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>

                <Text style={styles.name} numberOfLines={2}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </>
  );
};

const CIRCLE = scale(56);

const styles = StyleSheet.create({
  listPad: {
    gap: scale(14),
    paddingTop: scale(4),
    paddingBottom: scale(4),
    paddingRight: scale(6),
  },
  item: {
    width: scale(74),
    alignItems: 'center',
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: scale(14),
    paddingTop: scale(4),
    paddingBottom: scale(4),
    paddingRight: scale(6),
  },
  skeletonTitle: {
    marginTop: scale(8),
  },
  skeletonSubtitle: {
    marginTop: scale(4),
  },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    borderWidth: 1,
    borderColor: '#D5E7F8',
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: scale(10.5),
    fontWeight: '800',
    color: '#0F172A',
    // letterSpacing: -0.1,
    textAlign: 'center',
    // lineHeight: scale(13.5),
    marginTop: scale(8),
    minHeight: scale(27),
  },

});

export default CategoriesSection;
