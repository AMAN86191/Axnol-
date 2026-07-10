import React, { useState, useEffect, useRef } from 'react';
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

const SLIDES: SlideItem[] = [
  {
    id: '1',
    title: 'Together, we create\na kinder tomorrow',
    subtitle: 'Support cows. Support life.',
    image: require('../../assets/images/banner_1.png'),
    badge: '',
    buttonText: 'Donate Now',
    targetScreen: 'DonateScreen',
  },
  {
    id: '2',
    title: 'Daily Grass Contribution',
    subtitle: 'Support feed for 450+ cows in the sanctuary.',
    image: require('../../assets/images/banner_2.png'),
    badge: '',
    buttonText: 'Contribute',
    targetScreen: 'DonateScreen',
  }
];

interface BannerSliderProps {
  onPressBanner?: (item: SlideItem) => void;
}

export const BannerSlider: React.FC<BannerSliderProps> = ({ onPressBanner }) => {
  const flatListRef = useRef<FlatList>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const navigation = useNavigation<any>();

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
                <Text style={styles.eventTitleNormal}>Together, we create</Text>
                <Text style={styles.eventTitleItalic}>a kinder tomorrow</Text>
              </View>
            ) : (
              <Text style={styles.eventTitle}>{item.title}</Text>
            )}
            <Text style={styles.eventSubtitle}>{item.subtitle}</Text>
          </View>
          {item.buttonText ? (
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.85}
              onPress={() => handlePress(item)}
            >
              <Text style={styles.actionButtonText}>{item.buttonText}</Text>
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
      {/* Pagination indicators on top of the list */}
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
    height: hp('20%'),
    borderRadius: wp('3%'),
    overflow: 'hidden',
    marginBottom: hp('2%'),
    position: 'relative',
    backgroundColor: '#000',
  },
  slideContainer: {
    width: wp('96%'),
    height: hp('20%'),
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    backgroundColor: 'rgba(20, 24, 24, 0.35)', // Premium gradient overlay
    justifyContent: 'flex-end',
    padding: wp('4%'),
    paddingBottom: hp('2.5%'),
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  eventBadge: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.4%'),
    borderRadius: wp('1%'),
    marginBottom: hp('0.8%'),
  },
  eventBadgeText: {
    color: Colors.white,
    fontSize: RFValue(9),
    fontWeight: '700',
  },
  eventTitle: {
    color: Colors.white,
    fontSize: RFValue(12),
    fontWeight: '700',
    marginBottom: hp('0.4%'),
  },
  eventSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: RFValue(9.5),
    fontWeight: '500',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: hp('1.5%'),
    alignSelf: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 3,
  },
  dotActive: { 
    backgroundColor: Colors.white,
    width: 14,
  },
  bannerTextContainer: {
    marginBottom: hp('0.5%'),
  },
  eventTitleNormal: {
    color: Colors.white,
    fontSize: RFValue(17),
    fontWeight: '700',
  },
  eventTitleItalic: {
    color: '#ff9f43',
    fontSize: RFValue(19),
    fontWeight: '700',
    fontStyle: 'italic',
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
    backgroundColor: 'rgba(255, 111, 52, 0.12)',
    // backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: hp('0.8%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('4%'),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary, // Orange shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: RFValue(10.5),
    fontWeight: '700',
  },
});
