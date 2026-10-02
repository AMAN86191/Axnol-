import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../theme/colors';

export interface SlideItem {
  id: string;
  title: string;
  subtitle: string;
  image: any;
  badge: string;
  buttonText?: string;
  targetScreen?: string;
}

interface BannerSliderProps {
  onPressBanner?: (item: SlideItem) => void;
}

export const BannerSlider: React.FC<BannerSliderProps> = ({ onPressBanner }) => {
  const flatListRef = useRef<FlatList>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const SLIDES: SlideItem[] = useMemo(() => [
    {
      id: '1',
      title: `${t('banner.slide1Title1')}\n${t('banner.slide1Title2')}`,
      subtitle: t('banner.slide1Subtitle'),
      image: require('../../assets/images/banner_1.png'),
      badge: '',
      buttonText: t('banner.slide1Button'),
      targetScreen: 'DonateScreen',
    },
    {
      id: '2',
      title: t('banner.slide2Title'),
      subtitle: t('banner.slide2Subtitle'),
      image: require('../../assets/images/banner_2.png'),
      badge: '',
      buttonText: t('banner.slide2Button'),
      targetScreen: 'DonateScreen',
    }
  ], [t]);

  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = activeSlideIndex + 1;
      if (nextIndex >= SLIDES.length) {
        nextIndex = 0;
      }
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveSlideIndex(nextIndex);
    }, 4000); // auto-play every 4 seconds

    return () => clearInterval(interval);
  }, [activeSlideIndex]);

  const handleScroll = (event: any) => {
    const slideWidth = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const activeIndex = Math.floor((offset + 10) / slideWidth);
    if (activeIndex !== activeSlideIndex && activeIndex >= 0 && activeIndex < SLIDES.length) {
      setActiveSlideIndex(activeIndex);
    }
  };

  const handlePress = (item: SlideItem) => {
    if (onPressBanner) {
      onPressBanner(item);
    } else if (item.targetScreen) {
      navigation.navigate(item.targetScreen);
    }
  };

  const renderSlideItem = ({ item }: { item: SlideItem }) => (
    <View style={styles.slideContainer}>
      <Image
        source={item.image}
        style={styles.bannerImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.55)']}
        style={styles.bannerGradient}
      />
      <View style={styles.bannerOverlay}>
        {item.badge ? (
          <View style={styles.eventBadge}>
            <Text style={styles.eventBadgeText}>{item.badge}</Text>
          </View>
        ) : null}
        <View style={styles.contentRow}>
          <View style={styles.textContainer}>
            {item.id === '1' ? (
              <View style={styles.bannerTextContainer}>
                <Text style={styles.eventTitleNormal}>{t('banner.slide1Title1')}</Text>
                <Text style={styles.eventTitleItalic}>{t('banner.slide1Title2')}</Text>
              </View>
            ) : (
              <Text style={styles.eventTitle}>{item.title}</Text>
            )}
            <Text style={styles.eventSubtitle}>{item.subtitle}</Text>
          </View>
          {item.buttonText ? (
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.9}
              onPress={() => handlePress(item)}
            >
              <LinearGradient
                colors={['#ffa04d', Colors.primary, '#e8540f']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionButtonGradient}
              >
                <Text style={styles.actionButtonText}>{item.buttonText}</Text>
                {/* <View style={styles.btnArrow}>
                  <Text style={styles.btnArrowText}>→</Text>
                </View> */}
              </LinearGradient>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.bannerCard}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlideItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: wp('96%'),
          offset: wp('96%') * index,
          index,
        })}
      />
      {/* Pagination indicators */}
      <View style={styles.pagination}>
        {SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeSlideIndex === index && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerCard: {
    width: wp('96%'),
    height: hp('19%'),
    borderRadius: wp('4.2%'),
    overflow: 'hidden',
    marginBottom: hp('2%'),
    position: 'relative',
    backgroundColor: '#000',
    // shadow
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  slideContainer: {
    width: wp('96%'),
    height: hp('19%'),
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  bannerOverlay: {
    justifyContent: 'flex-end',
    padding: wp('4.5%'),
    paddingBottom: hp('2%'),
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  eventBadge: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('3%'),
    marginBottom: hp('1%'),
  },
  eventBadgeText: {
    color: Colors.white,
    fontSize: RFValue(8.5),
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  eventTitle: {
    color: Colors.white,
    fontSize: RFValue(14),
    fontWeight: '800',
    marginBottom: hp('0.5%'),
    letterSpacing: 0.3,
  },
  eventSubtitle: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: RFValue(10),
    fontWeight: '500',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: hp('1.2%'),
    alignSelf: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: Colors.white,
    width: 18,
  },
  bannerTextContainer: {
    marginBottom: hp('0.5%'),
  },
  eventTitleNormal: {
    color: Colors.white,
    fontSize: RFValue(17),
    fontWeight: '800',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  eventTitleItalic: {
    color: '#ffb703',
    fontSize: RFValue(19),
    fontWeight: '800',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
  },
  textContainer: {
    flex: 1,
    marginRight: wp('3%'),
  },
  actionButton: {
    borderRadius: wp('4%'),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('0.9%'),
    paddingHorizontal: wp('3.5%'),
    borderRadius: wp('4%'),
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: RFValue(10.5),
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  btnArrow: {
    marginLeft: wp('1.5%'),
    width: wp('5%'),
    height: wp('5%'),
    borderRadius: wp('2.5%'),
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnArrowText: {
    color: Colors.white,
    fontSize: RFValue(9),
    fontWeight: '800',
    lineHeight: RFValue(11),
  },
});
