import React, {useRef, useState} from 'react';
import {
  FlatList,
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
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArrowRight, ChevronRight, Sparkles} from 'lucide-react-native';
import {AuthStackParamList} from '../../navigation/types';
import {
  colors,
  fontSize,
  radius,
  scale,
  shadows,
  spacing,
  typography,
} from '../../theme';
import AppImage from '../../components/ui/AppImage';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

const BRAND_GRADIENT: string[] = [colors.primary, colors.primaryDark];
const SCRIM: string[] = [
  'rgba(6,20,38,0.80)',
  'rgba(6,20,38,0)',
  'rgba(6,20,38,0.20)',
  'rgba(6,20,38,0.96)',
];

const SLIDES = [
  {
    key: 'hero',
    image: 'onboarding_barrel_ai',
    badge: 'Axnol Lubetech',
    eyebrow: 'PREMIUM LUBRICANTS',
    title: 'Advanced Lubricants for Every Industry',
    subtitle:
      'High performance, reliable and innovative lubricant solutions built to keep your equipment running.',
  },
  {
    key: 'performance',
    image: 'onboarding_apps_ai',
    badge: 'Engineered to Perform',
    eyebrow: 'MAXIMUM PROTECTION',
    title: 'Built for the Toughest Jobs',
    subtitle:
      'Superior additives and quality base oils deliver less friction, less wear and more uptime.',
  },
  {
    key: 'trust',
    image: 'auth_hero_oil',
    badge: 'Trusted Since 1959',
    eyebrow: 'QUALITY ASSURED',
    title: 'Performance You Can Rely On',
    subtitle:
      'Six decades of expertise, global standards and a commitment to total customer satisfaction.',
  },
] as const;

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const {width, height} = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const ref = useRef<FlatList>(null);

  const goToWelcome = () => navigation.navigate('Welcome');

  const next = () => {
    if (index < SLIDES.length - 1) {
      ref.current?.scrollToIndex({index: index + 1, animated: true});
    } else {
      goToWelcome();
    }
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(
      e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width,
    );
    setIndex(i);
  };

  const contentBottom = insets.bottom + scale(120);

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <FlatList
        ref={ref}
        style={StyleSheet.absoluteFill}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.key}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={({item}) => (
          <View style={{width, height}}>
            <AppImage uri={item.image} style={styles.image} />
            <LinearGradient
              colors={SCRIM}
              locations={[0, 0.28, 0.5, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.content, {paddingBottom: contentBottom}]}>
              <View style={styles.badge}>
                <Sparkles size={scale(13)} color={colors.textInverse} />
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
              <Text style={styles.eyebrow}>{item.eyebrow}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      <View style={[styles.header, {paddingTop: insets.top + spacing.sm}]}>
        <AppImage uri="logo" resizeMode="contain" style={styles.headerLogo} />
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={goToWelcome}
          activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip</Text>
          <ChevronRight size={scale(15)} color={colors.textInverse} />
        </TouchableOpacity>
      </View>

      <View
        style={[styles.footer, {paddingBottom: insets.bottom + spacing.lg}]}>
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View
              key={s.key}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>
        <TouchableOpacity activeOpacity={0.85} onPress={next}>
          <LinearGradient
            colors={BRAND_GRADIENT}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.nextBtn}>
            <ArrowRight size={scale(24)} color={colors.textInverse} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  content: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    bottom: 0,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: scale(6),
    marginBottom: spacing.lg,
  },
  badgeText: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    color: colors.textInverse,
  },
  eyebrow: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    color: colors.accent,
    letterSpacing: 1.6,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.bold,
    fontSize: fontSize.xxl,
    color: colors.textInverse,
    lineHeight: fontSize.xxl * 1.22,
  },
  subtitle: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.82)',
    lineHeight: fontSize.sm * 1.5,
    marginTop: spacing.sm,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  headerLogo: {
    width: scale(120),
    height: scale(40),
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(2),
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: scale(6),
  },
  skipText: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.textInverse,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(4),
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dotActive: {
    width: scale(15),
    backgroundColor: colors.textInverse,
  },
  nextBtn: {
    width: scale(45),
    height: scale(45),
    borderRadius: scale(27),
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
});

export default OnboardingScreen;
