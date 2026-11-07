import React from 'react';
import {
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import CachedImage from './CachedImage';
import { scale, spacing } from '../../theme';

/** Product photos bundled with the app, for screens without their own. */
export const DEFAULT_HERO_IMAGES: ImageSourcePropType[] = [
  require('../../../assets/axnol/industry/hero_products.webp'),
  require('../../../assets/axnol/industry/hero_oil.webp'),
];

/** Photos for the Products screen: night-road scene in front, product tub behind. */
export const PRODUCT_HERO_IMAGES: ImageSourcePropType[] = [
  require('../../../assets/axnol/industry/hero_road.webp'),
  require('../../../assets/axnol/industry/hero_bucket.webp'),
];

type HeroImage = string | ImageSourcePropType;

interface PageHeroProps {
  title: string;
  /** Small spaced-out line under the title, e.g. "SOURCING HUB". */
  subtitle?: string;
  /** Up to three photos (urls or require()d files) shown in a row on the right. */
  images?: Array<HeroImage | null | undefined>;
}

// Where each photo sits: the first is the raised front card, the rest tuck
// behind it, tilted. Same look for one, two or three photos.
const SLOTS: ViewStyle[] = [
  {
    right: scale(52),
    top: scale(26),
    width: scale(50),
    height: scale(68),
    borderRadius: scale(8),
    borderWidth: 2.5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  {
    right: scale(12),
    top: scale(36),
    width: scale(44),
    height: scale(60),
    borderRadius: scale(7),
    borderWidth: 2,
    transform: [{ rotate: '7deg' }],
  },
  {
    right: scale(92),
    top: scale(36),
    width: scale(44),
    height: scale(60),
    borderRadius: scale(7),
    borderWidth: 2,
    transform: [{ rotate: '-7deg' }],
  },
];

const HERO_HEIGHT = scale(120);

/**
 * Top banner shared by the catalogue screens: bold title, subtitle and a stack
 * of photos. Pass the text and images that match the screen it sits on.
 */
export const PageHero: React.FC<PageHeroProps> = ({
  title,
  subtitle,
  images = [],
}) => {
  const photos = images.filter(Boolean).slice(0, 3) as HeroImage[];

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <LinearGradient
          colors={['#FFFFFF', '#EEF4F1']}
          start={{ x: 0, y: 0.4 }}
          end={{ x: 1, y: 0.6 }}
          style={StyleSheet.absoluteFill}
        />
        <Svg
          style={StyleSheet.absoluteFill}
          viewBox="0 0 357 120"
          preserveAspectRatio="none"
        >
          {[0, 1, 2, 3, 4].map(i => (
            <Path
              key={i}
              d={`M120 ${14 + i * 9} C190 ${2 + i * 9} 230 ${30 + i * 9} 357 ${
                10 + i * 9
              }`}
              stroke="#CBD8E4"
              strokeOpacity={0.45}
              strokeWidth={0.8}
              fill="none"
            />
          ))}
        </Svg>

        <View style={styles.text}>
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={styles.subtitle}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}>
              {subtitle.toUpperCase()}
            </Text>
          ) : null}
        </View>

        <View style={styles.photos} pointerEvents="none">
          {/* Back cards first so the raised front card paints on top. */}
          {[...photos].reverse().map((source, reversed) => {
            const index = photos.length - 1 - reversed;
            return (
              <View key={index} style={[styles.photo, SLOTS[index]]}>
                {typeof source === 'string' ? (
                  <CachedImage uri={source} style={styles.photoImg} />
                ) : (
                  <CachedImage source={source} style={styles.photoImg} />
                )}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: scale(12),
    paddingBottom: scale(12),
  },
  card: {
    height: HERO_HEIGHT,
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: '#E3EAE7',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  text: {
    paddingLeft: scale(16),
    width: '54%',
  },
  title: {
    fontSize: scale(26),
    fontWeight: '800',
    color: '#0B0F14',
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: scale(12),
    fontSize: scale(10.5),
    fontWeight: '800',
    color: '#0B0F14',
    letterSpacing: scale(2.2),
  },
  photos: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '44%',
  },
  photo: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: '#DDE5EC',
    borderColor: '#FFFFFF',
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
});

export default PageHero;
