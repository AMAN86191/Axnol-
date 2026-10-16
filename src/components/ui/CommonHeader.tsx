import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ChevronLeft} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, fontSize, scale, spacing} from '../../theme';

interface CommonHeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  right?: React.ReactNode;
  left?: React.ReactNode;
  centered?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  titleColor?: string;
  iconColor?: string;
  topInsetExtra?: number;
}

export const CommonHeader: React.FC<CommonHeaderProps> = ({
  title,
  onBack,
  showBack = true,
  right,
  left,
  centered = true,
  backgroundColor = '#FFFFFF',
  borderColor = '#F1F5F9',
  titleColor = '#0F172A',
  iconColor = '#0F172A',
  topInsetExtra = scale(6),
}) => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const handleBack = onBack ?? (() => navigation.goBack());

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + topInsetExtra,
          backgroundColor,
          borderBottomColor: borderColor,
        },
      ]}>
      <View style={styles.side}>
        {left ??
          (showBack ? (
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              onPress={handleBack}>
              <ChevronLeft size={scale(24)} color={iconColor} />
            </TouchableOpacity>
          ) : null)}
      </View>

      <Text
        style={[
          styles.title,
          centered && styles.titleCentered,
          {color: titleColor},
        ]}
        numberOfLines={1}>
        {title}
      </Text>

      <View style={[styles.side, styles.sideRight]}>{right}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: scale(32),
  },
  sideRight: {
    justifyContent: 'flex-end',
    gap: scale(4),
  },
  iconBtn: {
    padding: scale(4),
  },
  title: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  titleCentered: {
    textAlign: 'center',
  },
});

export default CommonHeader;
