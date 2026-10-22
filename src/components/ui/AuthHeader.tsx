import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {ArrowLeft} from 'lucide-react-native';
import {colors, scale, spacing} from '../../theme';
import Logo from './Logo';

interface AuthHeaderProps {
  onBack?: () => void;
  right?: React.ReactNode;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({onBack, right}) => (
  <View style={styles.row}>
    {onBack ? (
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={onBack}
        activeOpacity={0.7}>
        <ArrowLeft size={scale(20)} color={colors.primary} />
      </TouchableOpacity>
    ) : (
      <View style={styles.iconBtn} />
    )}

    <Logo height={scale(42)} />

    <View style={[styles.iconBtn, styles.right]}>{right}</View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    height: scale(48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  iconBtn: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(21),
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    alignItems: 'flex-end',
  },
});

export default AuthHeader;
