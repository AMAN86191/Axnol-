import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';

export const QuickActions = () => {
  const navigation = useNavigation<any>();

  const actions = [
    {
      id: 'donate',
      title: 'Donate Now',
      icon: require('../../assets/images/logo/donate.png'),
      screen: 'DonateScreen',
    },
    {
      id: 'membership',
      title: 'Join Membership',
      icon: require('../../assets/images/logo/membership.png'),
      screen: 'JoinMembershipScreen',
    },
    {
      id: 'event',
      title: 'Upcoming Event',
      icon: require('../../assets/images/logo/gift.png'),
      screen: 'UpcomingEventsScreen',
    },

  ];

  const handlePress = (action: any) => {
    if (action.screen) {

      navigation.navigate(action.screen);
    } else {
      Alert.alert(
        action.title,
        `This feature is coming soon!`,
        [
          { text: 'OK', style: 'cancel' },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => handlePress(action)}
          >
            <View style={styles.iconContainer}>
              <Image
                source={action.icon}
                style={styles.iconImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.cardTitle}>{action.title}</Text>


          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: hp('1%'),
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // paddingHorizontal: wp('4%'),
    // paddingVertical: hp('0.5%'),
    width: '100%',
    gap: wp('3%'),
  },
  card: {
    width: wp('29%'),
    height: wp('30%'),
    backgroundColor: '#F3F4F6', // Light frosted look
    borderRadius: wp('4%'),
    padding: wp('2%'),
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFFFFF', // To simulate glassmorphism edge
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconContainer: {
    width: wp('10.5%'),
    height: wp('10.5%'),
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('1%'),
    marginBottom: hp('1.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  iconImage: {
    width: '50%',
    height: '50%',
  },
  cardTitle: {
    fontSize: RFValue(9),
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    paddingHorizontal: wp('1%'),
  },
});