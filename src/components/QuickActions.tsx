import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '../theme/colors';

export const QuickActions = () => {
  const navigation = useNavigation<any>();

  const actions = [
    {
      id: 'donate',
      title: 'Donate Now',
      subtitle: 'Support our cows',
      icon: require('../../assets/images/logo/donate.png'),
      backgroundColor: '#f8dfcfff', // Soft warm peach
      screen: 'DonateScreen',
    },
    {
      id: 'membership',
      title: 'Join Membership',
      subtitle: 'Monthly support',
      icon: require('../../assets/images/logo/membership.png'),
      backgroundColor: '#faf5d3ff', // Soft warm yellow
      screen: 'JoinMembershipScreen',
    },
    {
      id: 'sponsor',
      title: 'Sponsor a Cow',
      subtitle: '₹500/month',
      icon: require('../../assets/images/logo/cow.png'),
      backgroundColor: '#dceefbff', // Soft light blue
      screen: null,
    },
    {
      id: 'honor',
      title: 'Give in Honor',
      subtitle: 'Dedicate a gift',
      icon: require('../../assets/images/logo/gift.png'),
      backgroundColor: '#ede1f8ff', // Soft light purple
      screen: null,
    },
  ];

  const handlePress = (action: any) => {
    if (action.screen) {
      navigation.navigate(action.screen);
    } else {
      Alert.alert(
        action.title,
        `This feature is coming soon! You'll be able to ${action.title.toLowerCase()} very soon.`,
        [
          { text: 'Notify Me', onPress: () => console.log('Notify me pressed') },
          { text: 'OK', style: 'cancel' },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.quickActionsList}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionCardWrapper}
            activeOpacity={0.95}
            onPress={() => handlePress(action)}
          >
            <View style={[styles.actionCard, { backgroundColor: action.backgroundColor }]}>
              <View style={styles.iconCircle}>
                <Image
                  source={action.icon}
                  style={styles.iconImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{action.title}</Text>
                <Text style={styles.cardSubtitle}>{action.subtitle}</Text>

                <View style={styles.learnMoreContainer}>
                  <Text style={styles.learnMoreText}>Learn More →</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  quickActionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCardWrapper: {
    width: '48%',
    marginBottom: hp('1.5%'),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 30,
      },
    }),
  },
  actionCard: {
    borderRadius: wp('4%'),
    padding: wp('4%'),
    alignItems: 'center', // Center components horizontally
    justifyContent: 'center',
    minHeight: hp('17%'), // Optimized balanced height for layout alignment
    //  elevation:2,
  },
  iconCircle: {
    width: wp('11%'),
    height: wp('11%'),
    borderRadius: wp('5.5%'), // Half of width (wp('11%') / 2) to prevent Android shadow rendering bugs
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('1%'),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconImage: {
    width: '56%',
    height: '56%',
  },
  cardContent: {
    alignItems: 'center',
    width: '100%',
  },
  cardTitle: {
    color: '#1E1E1E',
    fontSize: RFValue(11.5),
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: hp('0.3%'),
  },
  cardSubtitle: {
    color: '#666666',
    fontSize: RFValue(9),
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: hp('1.2%'),
  },
  learnMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnMoreText: {
    color: '#1E1E1E', // Dark bold text for "Learn More →" matching the image
    fontSize: RFValue(9),
    fontWeight: '800',
  },
  impactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginTop: hp('1%'),
    shadowColor: Colors.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  impactStat: {
    alignItems: 'center',
    flex: 1,
  },
  impactNumber: {
    fontSize: RFValue(18),
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: hp('0.3%'),
  },
  impactLabel: {
    fontSize: RFValue(10),
    color: Colors.gray,
    fontWeight: '500',
  },
  impactDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.border,
  },
});