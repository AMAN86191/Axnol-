import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart } from 'lucide-react-native';

interface LoginHeroSectionProps {
  title: string;
  subtitle: string;
  showHeart?: boolean;
}

export const LoginHeroSection: React.FC<LoginHeroSectionProps> = ({ title, subtitle, showHeart = false }) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <View style={styles.topImageContainer}>
        <Image
          source={require('../../assets/images/login_hero.jpeg')}
          style={styles.topImage}
        />
      </View>

      <View style={[styles.absoluteSafeArea, { paddingTop: Math.max(insets.top, hp('4%')) }]}>
        <View style={styles.headerRow}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>{title}</Text>
            <View style={styles.backRow}>
              <Text style={styles.backText}>{subtitle}</Text>
              {showHeart && <Heart size={RFValue(18)} color="#E85D04" fill="#E85D04" style={{ marginLeft: wp('2%') }} />}
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  topImageContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: hp('42%'),
  },
  topImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    // top: hp('-2%'),
  },
  absoluteSafeArea: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 10,
    paddingHorizontal: wp('5%'),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: RFValue(28),
    fontWeight: '800',
    color: '#3F3D3C',
    lineHeight: hp('4.2%'),
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: RFValue(28),
    fontWeight: '800',
    color: '#E85D04',
    lineHeight: hp('4.2%'),
  },
});
