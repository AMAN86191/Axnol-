import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '../theme/colors';

interface CommonHeaderProps {
  title?: string;
  onBackPress?: () => void;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  headerStyle?: any;
  titleStyle?: any;
}

export const CommonHeader = ({
  title,
  onBackPress,
  leftElement,
  rightElement,
  headerStyle,
  titleStyle,
}: CommonHeaderProps) => {
  return (
    <View style={[styles.headerContainer, headerStyle]}>
      {/* Left side */}
      <View style={styles.leftContainer}>
        {leftElement ? (
          leftElement
        ) : onBackPress ? (
          <TouchableOpacity onPress={onBackPress} activeOpacity={0.7} style={styles.backButton}>
            <ArrowLeft size={RFValue(13)} color={Colors.dark} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Center Title */}
      {title && (
        <View style={styles.titleContainer}>
          <Text style={[styles.headerTitle, titleStyle]} numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}

      {/* Right side */}
      <View style={styles.rightContainer}>
        {rightElement ? rightElement : <View style={styles.emptyRight} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('2%'),
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: wp('12%'),
    zIndex: 1,
  },
  backButton: {
    padding: wp('1%'),
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: RFValue(14),
    fontWeight: '700',
    color: Colors.dark,
    textAlign: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: wp('12%'),
    zIndex: 1,
  },
  emptyRight: {
    width: wp('6%'),
  },
});
