import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '../theme/colors';
import { FileText, Heart, Shield, Users } from 'lucide-react-native';

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
  //   <View style={styles.container}>
  //     <ScrollView
  //       horizontal
  //       showsHorizontalScrollIndicator={false}
  //       contentContainerStyle={styles.scrollContainer}
  //     >
  //       {actions.map((action) => (
  //         <TouchableOpacity
  //           key={action.id}
  //           style={styles.actionCardWrapper}
  //           activeOpacity={0.95}
  //           onPress={() => handlePress(action)}
  //         >
  //           <View style={[styles.actionCard, { backgroundColor: action.backgroundColor }]}>
  //             <View style={styles.iconCircle}>
  //               <Image
  //                 source={action.icon}
  //                 style={styles.iconImage}
  //                 resizeMode="contain"
  //               />
  //             </View>

  //             <View style={styles.cardContent}>
  //               <Text style={styles.cardTitle}>{action.title}</Text>
  //               <Text style={styles.cardSubtitle}>{action.subtitle}</Text>

  //               <View style={styles.learnMoreContainer}>
  //                 <Text style={styles.learnMoreText}>Learn More →</Text>
  //               </View>
  //             </View>
  //           </View>
  //         </TouchableOpacity>
  //       ))}
  //     </ScrollView>
  //   </View>
  // );

  //  <View style={styles.trustBadgesRow}>
  //             <View style={styles.trustBadgeItem}>
  //               <View style={[styles.trustIconWrapper, { backgroundColor: '#ECFDF5' }]}>
  //                 <Shield size={RFValue(12)} color="#10B981" />
  //               </View>
  //               <Text style={styles.trustBadgeTitle}>Secure Payment</Text>
  //               <Text style={styles.trustBadgeDesc}>256-bit SSL</Text>
  //             </View>
  // 
  //             <View style={styles.trustBadgeItem}>
  //               <View style={[styles.trustIconWrapper, { backgroundColor: '#FFF7ED' }]}>
  //                 <FileText size={RFValue(12)} color="#F97316" />
  //               </View>
  //               <Text style={styles.trustBadgeTitle}>80G Tax Benefit</Text>
  //               <Text style={styles.trustBadgeDesc}>Available</Text>
  //             </View>
  // 
  //             <View style={styles.trustBadgeItem}>
  //               <View style={[styles.trustIconWrapper, { backgroundColor: '#F5F3FF' }]}>
  //                 <Users size={RFValue(12)} color="#8B5CF6" />
  //               </View>
  //               <Text style={styles.trustBadgeTitle}>10,000+</Text>
  //               <Text style={styles.trustBadgeDesc}>Happy Donors</Text>
  //             </View>
  // 
  //             <View style={styles.trustBadgeItem}>
  //               <View style={[styles.trustIconWrapper, { backgroundColor: '#FDF2F8' }]}>
  //                 <Heart size={RFValue(12)} color="#EC4899" />
  //               </View>
  //               <Text style={styles.trustBadgeTitle}>100% Impact</Text>
  //               <Text style={styles.trustBadgeDesc}>Transparency</Text>
  //             </View>
  //           </View>

    <View style={styles.trustBadgesRow}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={[styles.trustBadgeItem, { backgroundColor: action.backgroundColor, borderWidth: 0 }]}
          activeOpacity={0.9}
          onPress={() => handlePress(action)}
        >
          <View style={[styles.trustIconWrapper, { backgroundColor: '#FFFFFF' }]}>
            <Image
              source={action.icon}
              style={styles.iconImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.trustBadgeTitle}>{action.title}</Text>
          <Text style={styles.trustBadgeDesc}>{action.subtitle}</Text>
          <View style={[styles.learnMoreContainer, { marginTop: hp('0.4%') }]}>
            <Text style={[styles.learnMoreText, { fontSize: RFValue(6.5) }]}>Learn More →</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: hp('0.5%'),
  },
  scrollContainer: {
    paddingLeft: wp('0.5%'),
    paddingRight: wp('3.5%'),
    paddingBottom: hp('1.5%'),
    paddingTop: hp('0.5%'),
  },
  actionCardWrapper: {
    width: wp('45%'),
    marginRight: wp('3%'),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  actionCard: {
    borderRadius: wp('4%'),
    paddingHorizontal: wp('4.5%'),
    paddingVertical: hp('1.5%'),
    alignItems: 'center', // Center components horizontally
    justifyContent: 'center',
  },
  iconCircle: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'), // Half of width to prevent Android shadow rendering bugs
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('0.8%'),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1.5,
        },
        shadowOpacity: 0.08,
        shadowRadius: 2.5,
      },
      android: {
        elevation: 1.5,
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
    fontSize: RFValue(11),
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: hp('0.2%'),
  },
  cardSubtitle: {
    color: '#666666',
    fontSize: RFValue(8.5),
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: hp('0.8%'),
  },
  learnMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnMoreText: {
    color: '#1E1E1E', // Dark bold text for "Learn More →" matching the image
    fontSize: RFValue(8.5),
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
 trustBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // paddingHorizontal: wp('4%'),
    // marginTop: hp('4%'),
    marginBottom: hp('2%'),
  },
  trustBadgeItem: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: Colors.white,
    marginHorizontal: wp('1%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  trustIconWrapper: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('0.8%'),
  },
  trustBadgeTitle: {
    fontSize: RFValue(7.5),
    fontWeight: '800',
    color: Colors.dark,
    textAlign: 'center',
    marginBottom: hp('0.2%'),
  },
  trustBadgeDesc: {
    fontSize: RFValue(7),
    color: Colors.gray,
    textAlign: 'center',
  },
});