import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '../theme/colors';

interface AuthButtonProps extends TouchableOpacityProps {
  title: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ 
  title, 
  leftIcon, 
  rightIcon, 
  loading, 
  loadingText = 'Sending...', 
  ...props 
}) => {
  return (
    <TouchableOpacity 
      style={styles.sendOtpBtn} 
      activeOpacity={0.8} 
      disabled={loading || props.disabled}
      {...props}
    >
      {leftIcon}
      <Text style={styles.sendOtpText}>{loading ? loadingText : title}</Text>
      {rightIcon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  sendOtpBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    height: hp('5%'),
    borderRadius: wp('2.5%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('1.5%'),
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  sendOtpText: {
    color: Colors.white,
    fontSize: RFValue(12),
    fontWeight: '700',
    marginHorizontal: wp('2%'),
  },
});
