import React, {useRef, useState} from 'react';
import {
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../navigation/types';
import {colors, radius, scale, spacing, theme} from '../../theme';
import Button from '../../components/ui/Button';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

const DATA = [
  {
    id: '1',
    title: 'Axnol Lubetech — Solutions since 1959',
    subtitle:
      'Specialty lubricants, greases & base oils powering industries across India.',
    image: 'https://axnol.in/images/s1.jpg',
  },
  {
    id: '2',
    title: 'Find the Right Product',
    subtitle:
      'Browse industries, categories, subcategories & product details with technical specs.',
    image: 'https://axnol.in/images/s3.jpg',
  },
  {
    id: '3',
    title: 'Dealer Pricing & Orders',
    subtitle:
      'Request custom pricing, track approval & manage orders & invoices.',
    image: 'https://axnol.in/images/s7.jpg',
  },
  {
    id: '4',
    title: 'Stay Connected',
    subtitle:
      'Get notifications, access TDS documents & submit enquiries instantly.',
    image: 'https://axnol.in/images/s8.jpg',
  },
];

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [index, setIndex] = useState(0);
  const ref = useRef<FlatList>(null);
  const next = () => {
    if (index === DATA.length - 1) {
      navigation.replace('Login');
    } else {
      ref.current?.scrollToIndex({index: index + 1});
    }
  };
  const skip = () => navigation.replace('Login');
  return (
    <View style={styles.container}>
      <FlatList
        ref={ref}
        data={DATA}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => {
          const i = Math.round(
            e.nativeEvent.contentOffset.x /
              e.nativeEvent.layoutMeasurement.width,
          );
          setIndex(i);
        }}
        renderItem={({item}) => (
          <ImageBackground
            source={{uri: item.image}}
            style={styles.slide}
            resizeMode="cover">
            <View style={styles.overlay} />
            <View style={styles.content}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </ImageBackground>
        )}
        keyExtractor={item => item.id}
      />
      <View style={styles.footer}>
        <View style={styles.dots}>
          {DATA.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={skip} style={styles.skip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          <View style={{flex: 1, marginLeft: spacing.md}}>
            <Button
              title={index === DATA.length - 1 ? 'Get Started' : 'Next'}
              onPress={next}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  slide: {
    width: theme.SCREEN.width,
    height: '100%',
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7,24,44,0.55)',
  },
  content: {padding: spacing.xxl, paddingBottom: spacing.xxxl * 1.8},
  title: {
    ...theme.typography.bold,
    fontSize: theme.fontSize.xxxl,
    color: colors.textInverse,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.md,
    color: colors.primaryMuted,
    lineHeight: theme.fontSize.md * 1.5,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.xxl,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  dot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: scale(4),
  },
  dotActive: {width: scale(22), backgroundColor: colors.textInverse},
  actions: {flexDirection: 'row', alignItems: 'center'},
  skip: {paddingHorizontal: spacing.lg, paddingVertical: spacing.md},
  skipText: {
    ...theme.typography.medium,
    fontSize: theme.fontSize.md,
    color: colors.textInverse,
  },
});
export default OnboardingScreen;
