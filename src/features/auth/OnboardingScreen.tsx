import React, {useRef, useState} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AuthStackParamList} from '../../navigation/types';
import {
  colors,
  fontSize,
  radius,
  scale,
  SCREEN,
  spacing,
  typography,
} from '../../theme';
import Button from '../../components/ui/Button';
import AppImage from '../../components/ui/AppImage';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

const IMAGE_H = Math.round(SCREEN.height * 0.75);

const SLIDES = [
  {
    id: '1',
    title: 'Solution of Energy since 1959',
    subtitle:
      'Axnol Lubetech India Pvt. Ltd. — specialty lubricants & greases trusted across industries.',
    image: 'onboarding_1',
  },
  {
    id: '2',
    title: 'Explore the Catalogue',
    subtitle:
      'Browse products by industry, category and subcategory with full technical details and documents.',
    image: 'onboarding_2',
  },
  {
    id: '3',
    title: 'Dealer Pricing & Orders',
    subtitle:
      'Request custom dealer pricing, track approvals, orders and invoices — all in one app.',
    image: 'onboarding_3',
  },
];

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const ref = useRef<FlatList>(null);
  const isLast = index === SLIDES.length - 1;
  const next = () => {
    if (isLast) {
      navigation.replace('Login');
    } else {
      ref.current?.scrollToIndex({index: index + 1, animated: true});
    }
  };
  const skip = () => navigation.replace('Login');
  return (
    <View style={styles.container}>
      <View style={styles.imageArea}>
        <FlatList
          ref={ref}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          getItemLayout={(_, i) => ({
            length: SCREEN.width,
            offset: SCREEN.width * i,
            index: i,
          })}
          onMomentumScrollEnd={e => {
            const i = Math.round(
              e.nativeEvent.contentOffset.x /
                e.nativeEvent.layoutMeasurement.width,
            );
            setIndex(i);
          }}
          renderItem={({item}) => (
            <AppImage
              uri={item.image}
              resizeMode="stretch"
              style={{width: SCREEN.width, height: IMAGE_H}}
            />
          )}
        />
        <View style={[styles.skipWrap, {top: insets.top + spacing.sm}]}>
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={8}
            onPress={skip}
            style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.sheet, {paddingBottom: insets.bottom + spacing.xxl}]}>
        <View style={styles.content}>
          <Text style={styles.title}>{SLIDES[index].title}</Text>
          <Text style={styles.subtitle}>{SLIDES[index].subtitle}</Text>
        </View>
        <View style={styles.footer}>
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === index && styles.dotActive]}
              />
            ))}
          </View>
          <Button
            title={isLast ? 'Get Started' : 'Next'}
            onPress={next}
            fullWidth
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  imageArea: {height: IMAGE_H, backgroundColor: colors.primaryDark},
  skipWrap: {position: 'absolute', right: spacing.lg},
  skipBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(7, 24, 44, 0.45)',
  },
  skipText: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.textInverse,
  },
  sheet: {
    flex: 1,
    marginTop: -spacing.xl,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    justifyContent: 'space-between',
  },
  content: {flex: 1, paddingTop: spacing.sm},
  title: {
    ...typography.bold,
    fontSize: fontSize.xl,
    color: colors.text,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: fontSize.sm * 1.55,
  },
  footer: {gap: spacing.xl},
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: colors.surfaceAlt,
  },
  dotActive: {
    width: scale(24),
    backgroundColor: colors.accent,
    borderRadius: scale(4),
  },
});
export default OnboardingScreen;
