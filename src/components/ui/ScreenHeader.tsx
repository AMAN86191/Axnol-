import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ArrowLeft} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, fontSize, scale, spacing, typography} from '../../theme';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  right,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, {paddingTop: insets.top + spacing.sm}]}>
      <View style={styles.row}>
        <View style={styles.side}>
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              style={styles.backBtn}
              activeOpacity={0.7}
              hitSlop={12}>
              <ArrowLeft size={scale(22)} color={colors.text} strokeWidth={2.2} />
            </TouchableOpacity>
          ) : null}
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={[styles.side, styles.rightSide]}>{right}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  row: {flexDirection: 'row', alignItems: 'center'},
  side: {width: scale(40), justifyContent: 'center'},
  rightSide: {alignItems: 'flex-end'},
  backBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.bold,
    fontSize: fontSize.xl,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
});

export default ScreenHeader;
