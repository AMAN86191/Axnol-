import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Menu } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';

export const PrimaryHeader = () => {
  const navigation = useNavigation();

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <View style={styles.container}>
        <View style={styles.headerCard}>

          {/* Left Section */}
          <View style={styles.leftSection}>
            <TouchableOpacity
              style={styles.menuButton}
              activeOpacity={0.8}
              onPress={() => (navigation as any).openDrawer()}
            >
              <Menu size={RFValue(16)} color="#EA580C" strokeWidth={2.5} />
            </TouchableOpacity>

            <View style={styles.textContainer}>
              <Text style={styles.welcomeText}>Namaste 🙏</Text>
              <Text style={styles.subText}>
                गौ सेवा, जन कल्याण
              </Text>
            </View>
          </View>

          {/* Center Logo & Bell */}
          <View style={styles.centerSection} pointerEvents="box-none">

            {/* <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => (navigation as any).navigate('NotificationScreen')}
            >
              <Bell size={RFValue(16)} color="#0F172A" />
            </TouchableOpacity> */}
          </View>

          {/* Right Cow Banner */}
          <View style={styles.rightImageContainer}>
            <Image
              source={require('../../assets/images/banner_1.png')}
              style={styles.cowImage}
              resizeMode="cover"
            />
            {/* White overlay */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.7)' }]} />
            {/* Seamless Fade */}
            <LinearGradient
              colors={['#FFFFFF', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.imageFade}
            />
            <View style={styles.logoWrapper}>
              <Image
                source={require('../../assets/images/logo/tranprant_logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp('2%'),
    paddingTop: hp('1%'),
    paddingBottom: hp('0.7%'),
    backgroundColor: '#F8FAFC',
  },

  headerCard: {
    height: hp('8%'),
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    overflow: 'hidden',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
  },


  /* Left Section */

  leftSection: {
    width: wp('35%'),
    paddingLeft: wp('4%'),
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },

  menuButton: {
    width: wp('9%'),
    height: wp('9%'),
    borderRadius: wp('2%'),
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },

  textContainer: {
    justifyContent: 'center',
  },

  welcomeText: {
    fontSize: RFValue(14),
    fontWeight: '800',
    color: '#064E3B',
  },

  subText: {
    fontSize: RFValue(9),
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },

  /* Center Logo */

  centerSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    pointerEvents: 'box-none',
  },

  logoWrapper: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },

  logo: {
    width: wp('25%'),
    height: hp('8%'),
  },

  notificationButton: {
    marginLeft: wp('2%'),
    padding: wp('1.5%'),
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: wp('5%'),
  },

  /* Right Image */

  rightImageContainer: {
    position: 'absolute',
    right: 0,
    width: wp('35%'),
    height: '100%',
    zIndex: 1,
  },

  cowImage: {
    width: '100%',
    height: '100%',
  },

  imageFade: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: wp('12%'),
    zIndex: 2,
  },
});