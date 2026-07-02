import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '../theme/colors';

interface AuthInputProps extends TextInputProps {
  label: string;
  icon: React.ReactNode;
  error?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({ label, icon, error, ...props }) => {
  return (
    <>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        <View style={styles.inputIconContainer}>
          {icon}
        </View>
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.lightGray}
          {...props}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </>
  );
};

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: RFValue(10),
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: hp('0.8%'),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: wp('2.5%'),
    height: hp('5%'),
    paddingHorizontal: wp('3%'),
    marginBottom: hp('0.5%'),
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputIconContainer: {
    marginRight: wp('2%'),
    opacity: 0.8,
  },
  input: {
    flex: 1,
    fontSize: RFValue(12),
    color: Colors.dark,
    paddingVertical: 0,
    fontWeight: '500',
  },
  errorText: {
    color: '#EF4444',
    fontSize: RFValue(9),
    marginLeft: wp('1%'),
    marginTop: hp('0.2%'),
    marginBottom: hp('1%'),
  },
});
