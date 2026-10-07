import React, {useEffect} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../navigation/types';
import {colors, scale, verticalScale} from '../../theme';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Onboarding'), 1600);
    return () => clearTimeout(t);
  }, [navigation]);
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo.png')}
        resizeMode="contain"
        style={styles.logo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  logo: {width: scale(200), height: verticalScale(80)},
});
export default SplashScreen;
