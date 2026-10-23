import React, {useEffect, useRef, useState} from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import AppImage from '../../../components/ui/AppImage';
import {radius, scale} from '../../../theme';
import {HomeBannerItem} from '../homeData';

interface AdSliderProps {
  banners: HomeBannerItem[];
  height?: number;
  autoPlay?: boolean;
  interval?: number;
  onPressItem?: (item: HomeBannerItem, index: number) => void;
}

export const AdSlider: React.FC<AdSliderProps> = ({
  banners,
  height = scale(165),
  autoPlay = true,
  interval = 4000,
  onPressItem,
}) => {
  const listRef = useRef<FlatList<HomeBannerItem>>(null);
  const indexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [width, setWidth] = useState(0);

  const goTo = (index: number) => {
    if (!width || banners.length < 2) {
      return;
    }
    const safeIndex = (index + banners.length) % banners.length;
    indexRef.current = safeIndex;
    setActiveIndex(safeIndex);
    listRef.current?.scrollToOffset({
      offset: safeIndex * width,
      animated: true,
    });
  };

  useEffect(() => {
    if (!autoPlay || !width || banners.length < 2) {
      return;
    }
    const timer = setInterval(() => {
      goTo(indexRef.current + 1);
    }, interval);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, width, banners.length, interval]);

  const handleMomentumEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (!width) {
      return;
    }
    const index = Math.max(
      0,
      Math.min(
        banners.length - 1,
        Math.round(event.nativeEvent.contentOffset.x / width),
      ),
    );
    indexRef.current = index;
    setActiveIndex(index);
  };

  if (!banners.length) {
    return null;
  }

  return (
    <View
      style={[styles.container, {height}]}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}>
      {width > 0 && (
        <FlatList
          ref={listRef}
          data={banners}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onMomentumScrollEnd={handleMomentumEnd}
          onScrollEndDrag={handleMomentumEnd}
          renderItem={({item, index}) => (
            <TouchableOpacity
              style={[styles.slide, {width, height}]}
              activeOpacity={0.92}
              onPress={() => onPressItem?.(item, index)}>
              <AppImage
                uri={item.image}
                style={styles.image}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        />
      )}

      {banners.length > 1 && (
        <View style={styles.dotsRow} pointerEvents="none">
          {banners.map((item, index) => (
            <View
              key={item.id}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#E8F2FA',
    shadowColor: '#0A3B74',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  slide: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dotsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: scale(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(5),
  },
  dot: {
    width: scale(5),
    height: scale(5),
    borderRadius: scale(3),
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  dotActive: {
    width: scale(16),
    backgroundColor: '#FFFFFF',
  },
});

export default AdSlider;
