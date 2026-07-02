import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '../theme/colors';

interface SocialButtonProps extends TouchableOpacityProps {
  title: string;
  icon: React.ReactNode;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  title,
  icon,
  style,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      activeOpacity={0.8}
      {...props}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={[styles.text]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: hp('6%'),
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: wp('2.5%'),
    backgroundColor: Colors.white,
    paddingHorizontal: wp('4%'),
    flex: 1,
    marginHorizontal: wp('1.5%'),
  },
  iconContainer: {
    marginRight: wp('2%'),
  },
  text: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: Colors.dark,
  },
});
