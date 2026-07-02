import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '../theme/colors';

interface InputFieldProps extends TextInputProps {
  label: string;
  rightLabel?: string;
  onRightLabelPress?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  rightLabel,
  onRightLabelPress,
  leftIcon,
  rightIcon,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {rightLabel && (
          <TouchableOpacity onPress={onRightLabelPress} activeOpacity={0.7}>
            <Text style={styles.rightLabel}>{rightLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.inputWrapper}>
        {leftIcon && <View style={styles.iconWrapper}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.gray}
          {...props}
        />
        {rightIcon && <View style={styles.iconWrapper}>{rightIcon}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: hp('1.2%'),
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('0.8%'),
  },
  label: {
    fontSize: RFValue(11),
    fontWeight: '500',
    color: Colors.dark,
  },
  rightLabel: {
    fontSize: RFValue(11),
    fontWeight: '600',
    color: Colors.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: wp('2'),
    backgroundColor: Colors.white,
    paddingHorizontal: wp('3%'),
    height: hp('4.5%'),
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: wp('0.8%'),
  },
  input: {
    flex: 1,
    fontSize: RFValue(11),
    color: Colors.dark,
    paddingVertical: 0,
    height: '100%',
  },
});
