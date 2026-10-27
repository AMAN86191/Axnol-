import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  ImageStyle,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRight,
  Car,
  Cog,
  Database,
  Factory,
  Flame,
  Gauge,
  Package,
  Truck,
  Zap,
} from 'lucide-react-native';
import { AuthStackParamList } from '../../navigation/types';
import { colors, scale } from '../../theme';
import {Image} from 'react-native';
import {resolveImage} from '../../assets/images';
import Logo from '../../components/ui/Logo';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

interface CategoryItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  color: string;
}

interface SlideItem {
  id: string;
  bgUri: string;
  /** Per-slide image style - edit each slide's CSS independently */
  imageStyle: ImageStyle;
  titleLine1: string;
  titleLine2: string;
  categories: CategoryItem[];
}

/**
 * Per-slide image CSS (edit each slide independently).
 * Slide 1: 941 x 1672 | Slide 2: 768 x 1376 | Slide 3: 768 x 1376
 */
const slideImageStyles = StyleSheet.create({
  slide1: {
    position: 'absolute',
    top: -scale(70),
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  slide2: {
    position: 'absolute',
    top: -scale(70),
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '110%',
  },
  slide3: {
    position: 'absolute',
    top: scale(65),
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '85%',
  },
});

const ONBOARDING_SLIDES: SlideItem[] = [
  {
    id: 'slide_1',
    bgUri: 'onboard_slide1_bg',
    imageStyle: slideImageStyles.slide1,
    titleLine1: 'A Complete Range of',
    titleLine2: 'Lubricants',
    categories: [
      { id: 'c1', title: 'Engine Oils', icon: Car, color: '#0084FF' },
      { id: 'c2', title: 'Gear Oils', icon: Cog, color: '#F59E0B' },
      { id: 'c3', title: 'Base Oils', icon: Database, color: '#0084FF' },
      // { id: 'c4', title: 'Speciality\nProducts', icon: FlaskConical, color: '#F59E0B' },
    ],
  },
  {
    id: 'slide_2',
    bgUri: 'onboard_slide2_bg',
    imageStyle: slideImageStyles.slide2,
    titleLine1: 'Excellence in Engine ',
    titleLine2: 'Care',
    categories: [
      // { id: 'c1', title: 'Wear\nGuard', icon: ShieldCheck, color: '#0084FF' },
      { id: 'c2', title: 'High Mileage', icon: Gauge, color: '#F59E0B' },
      { id: 'c3', title: 'Thermal Stability', icon: Flame, color: '#0084FF' },
      { id: 'c4', title: 'Smooth Drive', icon: Zap, color: '#F59E0B' },
    ],
  },
  {
    id: 'slide_3',
    bgUri: 'onboard_slide3_bg',
    imageStyle: slideImageStyles.slide3,
    titleLine1: 'A Nationwide Supply  ',
    titleLine2: 'Network',
    categories: [
      { id: 'c1', title: 'Refinery Direct', icon: Factory, color: '#0084FF' },
      { id: 'c2', title: 'Bulk Orders', icon: Package, color: '#F59E0B' },
      { id: 'c3', title: 'Express Dispatch', icon: Truck, color: '#0084FF' },
      // { id: 'c4', title: 'Certified\nQuality', icon: Award, color: '#F59E0B' },
    ],
  },
];

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<SlideItem>>(null);

  const goToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  const handleNext = useCallback(() => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      goToLogin();
    }
  }, [currentIndex, goToLogin]);

  const handleDotPress = useCallback((index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / width);
      setCurrentIndex(Math.max(0, Math.min(index, ONBOARDING_SLIDES.length - 1)));
    },
    [width],
  );

  const renderSlide = useCallback(
    ({ item }: { item: SlideItem }) => {
      return (
        <View style={{ width, height }}>
          {/* Hero Image - per-slide style (edit slideImageStyles above) */}
  <Image
    source={resolveImage(item.bgUri)}
    style={item.imageStyle}
    resizeMode="cover"
  />

          {/* Soft fade where image meets the top white area */}
          <LinearGradient
            colors={['rgba(245,247,250,1)', 'rgba(245,247,250,0)']}
            locations={[0, 1]}
            style={styles.topFade}
            pointerEvents="none"
          />

          {/* Top white/light background section */}
          <View style={styles.topSection}>
            {/* Logo */}
            <View style={styles.header}>

              <Logo showText={false} height={scale(60)} />

            </View>

            {/* Title */}
            <View style={styles.titleSection}>
              <Text style={styles.titleLine1}>{item.titleLine1}</Text>
              <Text style={styles.titleLine2}>{item.titleLine2}</Text>
            </View>
          </View>

          {/* Bottom Section - fades image out instead of hard cut */}
          <View style={styles.bottomSection}>
            <LinearGradient
              colors={[
                'rgba(245,247,250,0)',
                'rgba(245,247,250,0.9)',
                '#F5F7FA',
              ]}
              locations={[0, 0.4, 0.65]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />

            {/* Categories Row */}
            <View style={styles.categoriesRow}>
              {item.categories.map((cat, idx) => (
                <React.Fragment key={cat.id}>
                  {idx > 0 && <View style={styles.divider} />}
                  <View style={styles.categoryItem}>
                    <cat.icon
                      size={scale(23)}
                      color={cat.color}
                      strokeWidth={2}
                    />
                    <Text style={styles.categoryText}>{cat.title}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>

            {/* Bottom spacer for footer controls */}
            <View style={styles.bottomSpacer} />
          </View>
        </View>
      );
    },
    [width, height],
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* Horizontal Slides */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={renderSlide}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        bounces={false}
        scrollEventThrottle={16}
      />

      {/* Top-Right Skip Button */}
      <TouchableOpacity
        onPress={goToLogin}
        activeOpacity={0.7}
        hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
        style={[styles.skipButton, { top: insets.top + scale(14) }]}>
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>

      {/* Fixed Bottom Controls */}
      <View
        pointerEvents="box-none"
        style={[
          styles.footerControls,
          { paddingBottom: insets.bottom + scale(20) },
        ]}>
        {/* Pagination Dots */}
        <View style={styles.dotsContainer}>
          {ONBOARDING_SLIDES.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <TouchableOpacity
                key={slide.id}
                onPress={() => handleDotPress(idx)}
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                style={[
                  styles.dot,
                  isActive ? styles.dotActive : styles.dotInactive,
                ]}
              />
            );
          })}
        </View>

        {/* Circular Next Button */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.85}
          style={styles.nextButton}>
          <ArrowRight size={scale(20)} color="#FFFFFF" strokeWidth={2.6} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Light grey-blue background like the image
  },

  // Top section - white/light area with logo & title
  topSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingTop: scale(56),
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: scale(260),
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -scale(10),
  },
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: scale(20),
    // marginTop: scale(6),
  },
  titleLine1: {
    fontSize: scale(28),
    fontWeight: '800',
    color: '#0D1E3A',
    textAlign: 'center',
    letterSpacing: -0.2,
    lineHeight: scale(35),
    paddingTop: scale(25)
  },
  titleLine2: {
    fontSize: scale(28),
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginTop: scale(5),
    lineHeight: scale(30),
  },

  // Bottom section
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 3,
    paddingTop: scale(24),
  },
  categoriesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: scale(22),
  },
  categoryItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    height: scale(56),
    backgroundColor: '#C9D3E0',
    marginTop: scale(2),
  },
  categoryText: {
    fontSize: scale(11),
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: scale(10),
    lineHeight: scale(17),
  },
  bottomSpacer: {
    height: scale(96), // Space for footer controls
  },

  // Skip button
  skipButton: {
    position: 'absolute',
    right: scale(20),
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
    zIndex: 20,
  },
  skipButtonText: {
    fontSize: scale(14),
    fontWeight: '700',
    color: '#0F172A',
    opacity: 0.75,
  },

  // Footer controls
  footerControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(26),
    zIndex: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  dot: {
    height: scale(7),
    borderRadius: scale(7),
  },
  dotActive: {
    width: scale(9),
    height: scale(9),
    borderRadius: scale(5),
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: '#BFDBFE',
    opacity: 0.8,
  },
  nextButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(28),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
});

export default OnboardingScreen;