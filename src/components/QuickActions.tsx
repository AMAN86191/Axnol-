import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTranslation } from 'react-i18next';

export const QuickActions = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const actions = [
    {
      id: 'donate',
      title: t('quickActions.donateNow'),
      icon: require('../../assets/images/logo/donate.png'),
      screen: 'DonateScreen',
      tint: '#FF6F34',
      rail: '#C2410C',
    },
    {
      id: 'membership',
      title: t('quickActions.joinMembership'),
      icon: require('../../assets/images/logo/membership.png'),
      screen: 'JoinMembershipScreen',
      tint: '#E07B00',
      rail: '#A85D00',
    },
    {
      id: 'event',
      title: t('quickActions.upcomingEvent'),
      icon: require('../../assets/images/logo/gift.png'),
      screen: 'GalleryScreen',
      tint: '#8B5A2B',
      rail: '#6E4521',
    },
  ];

  const handlePress = (action: any) => {
    if (action.screen) {
      navigation.navigate(action.screen);
    } else {
      Alert.alert(
        action.title,
        t('quickActions.comingSoon'),
        [
          {
            text: t('common.ok'),
            style: 'cancel',
          },
        ],
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        {actions.map((action) => (
          <View key={action.id} style={styles.cardWrapper}>

            {/* =========================================
                OUTER BOTTOM DEPTH / SHADOW
                This stays OUTSIDE the card
            ========================================== */}
            <View style={styles.cardShadow} />

            {/* =========================================
                MAIN CARD
            ========================================== */}
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => handlePress(action)}
            >
              {/* Inner glass surface */}
              <View style={styles.cardInner}>

                {/* Icon */}
                <View style={styles.iconContainer}>
                  <Image
                    source={action.icon}
                    style={styles.iconImage}
                    resizeMode="contain"
                  />
                </View>

                {/* Title */}
                <Text
                  style={[
                    styles.cardTitle,
                    {
                      color: action.tint,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {action.title}
                </Text>

              </View>

              {/* Bottom colored accent rail */}
              <View
                style={[
                  styles.accentRail,
                  {
                    backgroundColor: action.rail,
                  },
                ]}
              />
            </TouchableOpacity>

          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({

  // =========================================
  // MAIN CONTAINER
  // =========================================

  container: {
    width: '100%',
    marginBottom: hp('1%'),
  },

  // =========================================
  // THREE CARDS ROW
  // =========================================

  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    gap: wp('3%'),
  },

  // =========================================
  // CARD WRAPPER
  // Keeps shadow/depth OUTSIDE card
  // =========================================

  cardWrapper: {
    flex: 1,
    height: wp('29.5%'),
    position: 'relative',
  },

  // =========================================
  // OUTER BOTTOM 3D DEPTH
  // =========================================

  cardShadow: {
    position: 'absolute',

    left: 0,
    right: 0,
    bottom: 0,


  },

  // =========================================
  // MAIN CARD
  // NO ELEVATION
  // NO SHADOW
  // =========================================

  card: {
    position: 'absolute',

    top: 0,
    left: 0,
    right: 0,

    // Leaves space for bottom depth
    bottom: wp('1.8%'),

    borderRadius: wp('4.5%'),

    borderWidth: 1,

    borderColor: 'rgba(231, 226, 226, 0.85)',

    backgroundColor: 'rgba(255, 255, 255, 0.35)',

    overflow: 'hidden',
    // elevation: 0.5,
  },

  // =========================================
  // INNER WHITE / GLASS SURFACE
  // =========================================

  cardInner: {
    flex: 1,

    backgroundColor: 'rgba(255, 255, 255, 0.62)',

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: wp('1.5%'),

    borderRadius: wp('4.5%'),

    borderWidth: 1,

    borderColor: 'rgba(255, 255, 255, 0.95)',
  },

  // =========================================
  // ICON CONTAINER
  // =========================================

  iconContainer: {
    width: wp('11%'),
    height: wp('11%'),

    backgroundColor: 'rgba(255, 255, 255, 0.88)',

    borderRadius: wp('3%'),

    borderWidth: 1,

    borderColor: 'rgba(255, 255, 255, 0.95)',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: hp('0.9%'),
  },

  // =========================================
  // ICON IMAGE
  // =========================================

  iconImage: {
    width: '50%',
    height: '50%',
  },

  // =========================================
  // CARD TITLE
  // =========================================

  cardTitle: {
    fontSize: RFValue(8.6),

    fontWeight: '800',

    textAlign: 'center',

    paddingHorizontal: wp('0.5%'),

    includeFontPadding: false,
  },

  // =========================================
  // BOTTOM COLORED RAIL
  // =========================================

  accentRail: {
    position: 'absolute',

    bottom: hp('0.65%'),

    height: hp('0.55%'),

    width: '70%',

    alignSelf: 'center',

    borderRadius: wp('2%'),

    opacity: 0.95,
  },
});