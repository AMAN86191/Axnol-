import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors } from '../../theme/colors';
import { RootStackParamList } from '../../navigation/types';
import useAuthStore from '../../zustand/useAuthStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LoginScreen'>;

const SplashScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const scaleValue = useRef(new Animated.Value(0.95)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const textSlideUp = useRef(new Animated.Value(30)).current;

  const { token } = useAuthStore();

  useEffect(() => {
    // Sequence animations
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(textSlideUp, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace(token ? 'MainDrawer' : 'LoginScreen');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation, scaleValue, opacityValue, logoScale, textSlideUp, token]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Full Screen Background Image */}
      <Image
        source={require('../../../assets/images/splash_bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Semi-transparent dark overlay for high readability of text and logo on top */}
      <View style={styles.darkOverlay} />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: opacityValue,
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          {/* Main Content */}
          <View style={styles.centerContainer}>


            {/* Animated Title Section */}
            <Animated.View
              style={[
                styles.animatedTitleContainer,
                {
                  transform: [{ translateY: textSlideUp }],
                }
              ]}
            >
              <Animated.View
                style={[
                  styles.logoContainer,
                  {
                    transform: [{ scale: logoScale }],
                  },
                ]}
              >
                <Image
                  source={require('../../../assets/images/logo/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </Animated.View>
              <Text style={styles.title}>
                {/* Gaumata Sewa Trust */}
                <Text style={styles.titleAccent}>Gaumata Sewa</Text> Trust
              </Text>

              <View style={styles.taglineContainer}>
                <View style={styles.decorativeLine} />
                <Text style={styles.subtitle}>Heritage & Compassion</Text>
                <View style={styles.decorativeLine} />
              </View>

              {/* Sanskrit Mantra */}
              <Text style={styles.sanskritText}>गो सेवा महासेवा</Text>
            </Animated.View>

            {/* Decorative Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <View style={styles.dividerDot} />
              <View style={styles.divider} />
            </View>

            {/* Subtle loading indicator */}
            <View style={styles.loadingContainer}>
              <View style={styles.loadingDot} />
              <View style={[styles.loadingDot, styles.loadingDotActive]} />
              <View style={styles.loadingDot} />
            </View>
          </View>


        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',

  },

  logoContainer: {
    width: wp('25%'),
    height: wp('25%'),
    borderRadius: wp('15%'),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('3%'),
    overflow: 'hidden',
  },

  logoImage: {
    width: '80%',
    height: '80%',
  },
  safeArea: {
    flex: 1,
    zIndex: 2,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    zIndex: 999
  },
  animatedTitleContainer: {
    alignItems: 'center',
  },
  logoCard: {
    width: wp('28%'),
    height: wp('28%'),
    borderRadius: wp('14%'),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('5%'),
    overflow: 'hidden',
  },
  logoInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: RFValue(17),
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: hp('1%'),
  },
  titleAccent: {
    color: '#FFD700', // Gold accent color
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('1%'),
  },
  decorativeLine: {
    width: wp('8%'),
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: wp('2%'),
  },
  subtitle: {
    fontSize: RFValue(11),
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 1,
  },
  sanskritText: {
    fontSize: RFValue(13),
    color: '#FFD700',
    fontWeight: '400',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: hp('1%'),
    letterSpacing: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('3%'),
    marginBottom: hp('1.5%'),
  },
  divider: {
    width: wp('12%'),
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD700',
    marginHorizontal: wp('2%'),
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('2%'),
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  loadingDotActive: {
    backgroundColor: '#FFD700',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: hp('4%'),
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 3,
  },
});