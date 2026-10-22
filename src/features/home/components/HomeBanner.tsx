import React, {useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {ArrowRight, Download} from 'lucide-react-native';
import AppImage from '../../../components/ui/AppImage';
import {scale} from '../../../theme';
import {HomeBannerItem} from '../homeData';

export type {HomeBannerItem};

const BROCHURE_URL = 'https://axnol.tambimotors.com/about';

interface HomeBannerProps {
  banners: HomeBannerItem[];
  height?: number;
  autoPlay?: boolean;
  buttonLabel?: string;
  downloadLabel?: string;
  showPrimaryButton?: boolean;
  showDownloadButton?: boolean;
  onPressItem?: (item: HomeBannerItem, index: number) => void;
  onPressButton?: (item: HomeBannerItem, index: number) => void;
  onPressDownload?: (item: HomeBannerItem, index: number) => void;
}

/** Words wrapped in *asterisks* render in accent blue. */
const renderHighlightedTitle = (title: string) => {
  const parts = title.split('*');
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <Text key={i} style={styles.titleHighlight}>
        {part}
      </Text>
    ) : (
      <Text key={i}>{part}</Text>
    ),
  );
};

export const HomeBanner: React.FC<HomeBannerProps> = ({
  banners,
  height = scale(160),
  autoPlay = true,
  buttonLabel = 'Explore Products',
  downloadLabel = 'Download',
  showPrimaryButton = true,
  showDownloadButton = true,
  onPressItem,
  onPressButton,
  onPressDownload,
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
    }, 4500);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, width, banners.length]);

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
      style={styles.container}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}>
      {width > 0 && (
        <FlatList
          ref={listRef}
          data={banners}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          keyExtractor={item => item.id}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onMomentumScrollEnd={handleMomentumEnd}
          onScrollEndDrag={handleMomentumEnd}
          renderItem={({item, index}) => (
            <View style={[styles.slide, {width, height}]}>
              {/* Realistic industrial background image (no baked-in text) */}
              <AppImage
                uri={item.image}
                style={styles.backgroundImage}
                resizeMode="cover"
              />

              {/* Full-banner tap layer, sits below the content so the CTA stays clickable */}
              <TouchableOpacity
                style={styles.bannerPressArea}
                activeOpacity={0.95}
                onPress={() => onPressItem?.(item, index)}
              />

              {/* Soft readability overlay for the left text zone */}
              <LinearGradient
                pointerEvents="none"
                colors={[
                  'rgba(241,247,252,0.97)',
                  'rgba(241,247,252,0.86)',
                  'rgba(241,247,252,0)',
                ]}
                locations={[0, 0.55, 1]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.readabilityOverlay}
              />

              {/* Left content panel (~58% width) */}
              <View style={styles.contentPanel} pointerEvents="box-none">
                <Text style={styles.tagline} numberOfLines={1}>
                  {item.tagline.toUpperCase()}
                </Text>

                <Text style={styles.title} numberOfLines={3}>
                  {renderHighlightedTitle(item.title)}
                </Text>

                <Text style={styles.description} numberOfLines={3}>
                  {item.description}
                </Text>

                {/* Common CTAs shared by every banner */}
                <View style={styles.buttonRow}>
                  {showPrimaryButton && (
                    <TouchableOpacity
                      style={styles.button}
                      activeOpacity={0.85}
                      onPress={() => onPressButton?.(item, index)}>
                      <Text style={styles.buttonText} numberOfLines={1}>
                        {buttonLabel}
                      </Text>
                      <ArrowRight
                        size={scale(11)}
                        color="#FFFFFF"
                        strokeWidth={2.8}
                      />
                    </TouchableOpacity>
                  )}

                  {showDownloadButton && (
                    <TouchableOpacity
                      style={styles.buttonOutline}
                      activeOpacity={0.85}
                      onPress={() =>
                        onPressDownload
                          ? onPressDownload(item, index)
                          : Linking.openURL(BROCHURE_URL).catch(() => {})
                      }>
                      <Download
                        size={scale(11)}
                        color="#0A4D8C"
                        strokeWidth={2.8}
                      />
                      <Text style={styles.buttonOutlineText} numberOfLines={1}>
                        {downloadLabel}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Pagination dots */}
      {banners.length > 1 && (
        <View style={styles.dotsRow}>
          {banners.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => goTo(index)}
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
    marginBottom: scale(12),
  },
  slide: {
    overflow: 'hidden',
    borderRadius: scale(16),
    backgroundColor: '#E8F2FA',
    shadowColor: '#0A3B74',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 2,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  bannerPressArea: {
    ...StyleSheet.absoluteFillObject,
  },
  readabilityOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '82%',
  },
  contentPanel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '72%',
    paddingHorizontal: scale(14),
    justifyContent: 'center',
  },
  tagline: {
    fontSize: scale(9),
    fontWeight: '800',
    letterSpacing: 1.3,
    color: '#64748B',
    marginBottom: scale(5),
  },
  title: {
    fontSize: scale(17),
    lineHeight: scale(21),
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: scale(5),
  },
  titleHighlight: {
    color: '#0284C7',
  },
  description: {
    fontSize: scale(10.5),
    lineHeight: scale(14.5),
    color: '#475569',
    marginBottom: scale(10),
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(5),
    height: scale(28),
    backgroundColor: '#0A4D8C',
    borderRadius: scale(999),
    paddingHorizontal: scale(10),
    shadowColor: '#0A4D8C',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.28,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: scale(10),
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: scale(8),
    marginTop: scale(2),
  },
  buttonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(5),
    height: scale(28),
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: scale(999),
    borderWidth: 1.3,
    borderColor: '#0A4D8C',
    paddingHorizontal: scale(10),
  },
  buttonOutlineText: {
    color: '#0A4D8C',
    fontSize: scale(10),
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(5),
    marginTop: scale(9),
  },
  dot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    width: scale(18),
    backgroundColor: '#0A3B74',
  },
});

export default HomeBanner;
